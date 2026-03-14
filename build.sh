#!/bin/bash
set -e

VERSION=$(cat VERSION | tr -d '[:space:]')
LDFLAGS="-s -w"
mkdir -p dist

echo "=== Building Morgen $VERSION ==="

echo "[1/5] macOS arm64..."
CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -ldflags="$LDFLAGS" -trimpath -o morgen-arm64
echo "[2/5] macOS amd64..."
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -ldflags="$LDFLAGS" -trimpath -o morgen-amd64

echo "[3/5] Linux amd64..."
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="$LDFLAGS" -trimpath -o dist/morgen-linux-amd64
echo "[4/5] Linux arm64..."
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags="$LDFLAGS" -trimpath -o dist/morgen-linux-arm64

echo "[5/5] Windows amd64..."
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="$LDFLAGS" -trimpath -o dist/morgen-windows-amd64.exe

echo ""
echo "=== Creating Morgen.app (macOS universal) ==="

if [ ! -f morgen-amd64 ] || [ ! -f morgen-arm64 ]; then
  echo "  ✗ Missing architecture binary, cannot create universal binary"
  exit 1
fi

lipo -create -output morgen morgen-amd64 morgen-arm64

cp morgen-arm64 dist/morgen-darwin-arm64
cp morgen-amd64 dist/morgen-darwin-amd64
rm morgen-arm64 morgen-amd64

rm -rf Morgen.app
mkdir -p Morgen.app/Contents/MacOS
mkdir -p Morgen.app/Contents/Resources

cp morgen Morgen.app/Contents/MacOS/morgen
chmod +x Morgen.app/Contents/MacOS/morgen
rm morgen

if [ -f static/favicon.png ]; then
  echo "Generating app icon from favicon.png..."
  mkdir -p icon.iconset
  sips -z 16 16     static/favicon.png --out icon.iconset/icon_16x16.png      2>/dev/null
  sips -z 32 32     static/favicon.png --out icon.iconset/icon_16x16@2x.png   2>/dev/null
  sips -z 32 32     static/favicon.png --out icon.iconset/icon_32x32.png      2>/dev/null
  sips -z 64 64     static/favicon.png --out icon.iconset/icon_32x32@2x.png   2>/dev/null
  sips -z 128 128   static/favicon.png --out icon.iconset/icon_128x128.png    2>/dev/null
  sips -z 256 256   static/favicon.png --out icon.iconset/icon_128x128@2x.png 2>/dev/null
  sips -z 256 256   static/favicon.png --out icon.iconset/icon_256x256.png    2>/dev/null
  sips -z 512 512   static/favicon.png --out icon.iconset/icon_256x256@2x.png 2>/dev/null
  sips -z 512 512   static/favicon.png --out icon.iconset/icon_512x512.png    2>/dev/null
  sips -z 1024 1024 static/favicon.png --out icon.iconset/icon_512x512@2x.png 2>/dev/null
  iconutil -c icns icon.iconset -o Morgen.app/Contents/Resources/AppIcon.icns
  rm -rf icon.iconset
  echo "  ✓ AppIcon.icns generated"
else
  echo "  ⚠ static/favicon.png not found"
fi

cat > Morgen.app/Contents/Info.plist << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>Morgen</string>
    <key>CFBundleDisplayName</key>
    <string>Morgen</string>
    <key>CFBundleIdentifier</key>
    <string>ch.conceptuel.morgen</string>
    <key>CFBundleVersion</key>
    <string>${VERSION}</string>
    <key>CFBundleShortVersionString</key>
    <string>${VERSION}</string>
    <key>CFBundleExecutable</key>
    <string>morgen</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSHumanReadableCopyright</key>
    <string>© 2026 Conceptuel</string>
</dict>
</plist>
PLIST

echo "Ad-hoc signing..."
codesign --force -s - Morgen.app/Contents/MacOS/morgen 2>/dev/null
codesign --force -s - Morgen.app 2>/dev/null
echo "  ✓ Signed"

xattr -cr Morgen.app 2>/dev/null || true

codesign --verify --deep --strict Morgen.app 2>/dev/null && echo "  ✓ Valid" || echo "  ⚠ Verification warning (expected for ad-hoc)"

if command -v upx &>/dev/null; then
  echo ""
  echo "=== Compressing dist/ binaries with UPX ==="
  for f in dist/morgen-*; do
    echo "  UPX: $(basename $f)"
    upx --best --quiet "$f" 2>/dev/null || echo "    (skipped)"
  done
fi

echo ""
echo "=== Packaging for distribution ==="

rm -f dist/Morgen-macOS.zip
zip -r -q dist/Morgen-macOS.zip Morgen.app
echo "  ✓ dist/Morgen-macOS.zip"

cd dist
tar czf morgen-linux-amd64.tar.gz morgen-linux-amd64
tar czf morgen-linux-arm64.tar.gz morgen-linux-arm64
cd ..
echo "  ✓ dist/morgen-linux-amd64.tar.gz"
echo "  ✓ dist/morgen-linux-arm64.tar.gz"

echo ""
echo "=== Done (v${VERSION}) ==="
echo ""
echo "Ready to distribute:"
echo ""
ls -lh dist/Morgen-macOS.zip dist/morgen-linux-amd64.tar.gz dist/morgen-linux-arm64.tar.gz dist/morgen-windows-amd64.exe 2>/dev/null | awk '{print "  "$5" "$NF}'
echo ""
echo "=== Install locally ==="
echo "  cp -r Morgen.app /Applications/"
echo ""
echo "=== Share with others (macOS Sequoia / Tahoe) ==="
echo "  Tell them to run: xattr -cr /Applications/Morgen.app"
