# Contributing to Morgen

Thanks for your interest in contributing. Here's how to get started.

## Run locally

```bash
git clone https://github.com/by-conceptuel/morgen.git
cd morgen
go build -o morgen && ./morgen
```

Opens at `localhost:9210`.

## Project structure

```
main.go              Go server, single file, all assets embedded
static/
  index.html         Main dashboard
  setup.html         First-run setup wizard
  config.js          App configuration and localStorage keys
  app.js             State management and user actions
  render.js          DOM rendering (main panel + sidebar)
  weather.js         Weather API, moon phase, icon mapping
  watch.js           Analog clock (SVG + requestAnimationFrame)
  modals.js          Modal dialogs for editing links/status/subs
  status.js          Site uptime checker
  utils.js           Helpers, escaping, date formatting, inline SVG icons
  style.css          All styles
  icons/             Meteocons SVGs (MIT, by Bas Milius)
build.sh             Cross-platform build script
```

## Code style

- Plain JavaScript, no frameworks, no build step
- All JS uses `var` and ES5 syntax (no modules, no classes)
- CSS uses custom properties defined in `:root`
- Go code is a single file with zero external dependencies

## Pull requests

- One feature or fix per PR
- Test on at least one platform (macOS, Linux, or Windows)
- Keep PRs small and focused
- Run `go build` before submitting to make sure it compiles

## Reporting issues

Open an issue with:
- What you expected
- What happened
- Your OS and browser

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
The Conceptuel and Morgen names and logos are not covered by the MIT license. See [LICENSE](LICENSE) for details.
