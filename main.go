package main

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"runtime"
	"sync"
	"syscall"
	"time"
)

//go:embed static
var staticFiles embed.FS

type CheckRequest struct {
	URLs []string `json:"urls"`
}

type CheckResult struct {
	URL    string `json:"url"`
	Status string `json:"status"`
	Code   int    `json:"code,omitempty"`
	Error  string `json:"error,omitempty"`
}

func checkURL(url string) CheckResult {
	client := &http.Client{
		Timeout: 8 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return fmt.Errorf("too many redirects")
			}
			return nil
		},
	}
	req, err := http.NewRequest("HEAD", url, nil)
	if err != nil {
		return CheckResult{URL: url, Status: "down", Error: err.Error()}
	}
	req.Header.Set("User-Agent", "Morgen/1.0")
	resp, err := client.Do(req)
	if err != nil {
		req2, _ := http.NewRequest("GET", url, nil)
		req2.Header.Set("User-Agent", "Morgen/1.0")
		resp2, err2 := client.Do(req2)
		if err2 != nil {
			return CheckResult{URL: url, Status: "down", Error: err.Error()}
		}
		io.Copy(io.Discard, resp2.Body)
		resp2.Body.Close()
		return CheckResult{URL: url, Status: "up", Code: resp2.StatusCode}
	}
	io.Copy(io.Discard, resp.Body)
	resp.Body.Close()
	return CheckResult{URL: url, Status: "up", Code: resp.StatusCode}
}

const maxCheckURLs = 50

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Security-Policy",
			"default-src 'self'; "+
				"script-src 'self' 'unsafe-inline'; "+
				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "+
				"font-src 'self' https://fonts.gstatic.com; "+
				"img-src 'self' data:; "+
				"connect-src 'self' https://api.open-meteo.com")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		next.ServeHTTP(w, r)
	})
}

func handleCheck(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(200)
		return
	}
	if r.Method != "POST" {
		http.Error(w, "POST only", 405)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB limit

	var req CheckRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad json", 400)
		return
	}
	if len(req.URLs) > maxCheckURLs {
		http.Error(w, "too many urls", 400)
		return
	}

	results := make(map[string]CheckResult)
	var mu sync.Mutex
	var wg sync.WaitGroup
	for _, url := range req.URLs {
		wg.Add(1)
		go func(u string) {
			defer wg.Done()
			res := checkURL(u)
			mu.Lock()
			results[u] = res
			mu.Unlock()
		}(url)
	}
	wg.Wait()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(results)
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "linux":
		cmd = exec.Command("xdg-open", url)
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	default:
		return
	}
	cmd.Start()
}

func hasSetupCookie(r *http.Request) bool {
	c, err := r.Cookie("morgen_setup")
	return err == nil && c.Value == "1"
}

func listenStable(preferred int) (net.Listener, int) {
	ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", preferred))
	if err == nil {
		return ln, preferred
	}
	for p := preferred + 1; p < preferred+10; p++ {
		ln, err = net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", p))
		if err == nil {
			return ln, p
		}
	}
	ln, _ = net.Listen("tcp", "127.0.0.1:0")
	return ln, ln.Addr().(*net.TCPAddr).Port
}

func main() {
	staticFS, err := fs.Sub(staticFiles, "static")
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
	fileServer := http.FileServer(http.FS(staticFS))

	mux := http.NewServeMux()
	mux.HandleFunc("/api/check", handleCheck)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" && !hasSetupCookie(r) {
			http.Redirect(w, r, "/setup.html", http.StatusTemporaryRedirect)
			return
		}
		fileServer.ServeHTTP(w, r)
	})

	ln, port := listenStable(9210)
	server := &http.Server{Handler: securityHeaders(mux)}

	go func() {
		sig := make(chan os.Signal, 1)
		signal.Notify(sig, syscall.SIGINT, syscall.SIGTERM)
		<-sig
		fmt.Println("\nShutting down...")
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		server.Shutdown(ctx)
	}()

	url := fmt.Sprintf("http://localhost:%d", port)
	fmt.Printf("Morgen running at %s\n", url)

	go func() {
		time.Sleep(200 * time.Millisecond)
		openBrowser(url)
	}()

	if err := server.Serve(ln); err != http.ErrServerClosed {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
}
