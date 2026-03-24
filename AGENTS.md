# Repository Guidelines

## Project Structure & Module Organization
This repository contains the source for a Pelican-based static site.

- `content/`: Markdown pages/posts, images, and static extras copied to the site.
- `themes/haru/`: Custom theme templates and static assets.
- `pelicanconf.py`: Development/default site settings (`output/develop/`).
- `publishconf.py`: Production overrides (`output/publish/`).
- `output/`: Generated static site artifacts.
- `.github/workflows/deploy_to_pages.yml`: CI build and GitHub Pages deploy flow.

Primary workflow uses source content/config, not hand-editing files in `output/`.

## Branch and Deploy Model
- The `src` branch is the source-of-truth branch for authored content, theme changes, and configuration.
- GitHub Pages output is deployed to `gh-pages` from generated files in `output/publish/`.
- Always change source files in this repository (`content/`, `themes/`, config) and never hand-edit deployed artifacts.
- Deployment behavior is defined in `.github/workflows/deploy_to_pages.yml`.

## Build, Test, and Development Commands
- `make sync`: Install dependencies from `uv.lock` and `package-lock.json`.
- `make sync-upgrade`: Upgrade dependencies and sync the local environment for both Python and Node tooling.
- `make lock`: Refresh `uv.lock` and `package-lock.json`.
- `make build`: Build a development site into `output/develop/`.
- `make build-prod`: Build production output into `output/publish/` (same command CI uses).
- `make serve`: Run local dev server with live rebuilds.
- `make seo-check`: Run generated-output SEO validation checks.
- `make check`: Run the local pre-PR validation flow.
- `make clean`: Clean the local output/ directory.

Use `make sync` for reproducible local and CI parity across Python and Node dependencies. Use `make sync-upgrade` and `make lock` only when intentionally updating dependency versions.

## Coding Style & Naming Conventions
- Python config files follow PEP 8 style: 4-space indentation, `UPPER_CASE` config constants.
- Content files use Pelican metadata headers (`Title`, `Date`, `Summary`, etc.) at the top of Markdown files.
- Keep theme edits localized: templates in `themes/haru/templates/`, styling in `themes/haru/static/style.css`.
- Theme CSS is minified through `webassets` with the `rcssmin` filter.
- Prefer descriptive, human-readable article filenames; keep page slugs stable once published.

## Pelican-First Rule
- Prefer built-in functionality from Pelican core, Pelican plugins, Markdown, Markdown extensions, and Pelican templating logic before adding custom scripts or glue code.
- Minimize client-side JavaScript when possible, especially for DOM manipulation; prefer solving problems during static site generation or with a Pelican plugin whenever feasible.
- If external installs, package additions, or user-run setup commands are needed, ask the user to run them instead of writing unnecessary substitute code.
- Use custom code only when native functionality is insufficient for the requirement.
- Active plugin behavior is sourced from `pelicanconf.py` (`PLUGINS`) and dependency declarations in `pyproject.toml`.
- Current plugins and purpose:
  - `neighbors`: Provides previous/next article navigation.
  - `sitemap`: Generates `sitemap.xml`.
  - `webassets`: Handles asset processing and minification.
  - `share_post`: Provides social sharing metadata/helpers.
  - `series`: Supports article series ordering and linking.
  - `readtime`: Adds estimated reading time metadata.
  - `extract_toc`: Extracts generated Markdown TOCs into `article.toc` for template-controlled placement.
- References:
  - https://getpelican.com/
  - https://docs.getpelican.com/en/latest/
  - https://github.com/getpelican/pelican

## Content Authoring Conventions
- Article metadata requirements:
  - Required: `Title`, `Date`, `Summary` (enforced by `scripts/check_seo_output.py`).
  - Recommended: `Category`, `Tags`.
  - Optional: `Slug` (set explicitly when URL stability matters across title changes).
- Page metadata recommendations:
  - Recommended: `Title`, `Slug`, `Summary`.
  - Use `Status: hidden` for intentionally hidden pages.
- Slug and date conventions:
  - If `Slug` is omitted, Pelican derives one from title/filename.
  - Keep slugs stable once published.
  - Use valid, consistently formatted `Date` metadata.
- Draft behavior:
  - Development builds include drafts (`WITH_DRAFTS = True` in `pelicanconf.py`).
  - Production builds exclude drafts (`WITH_DRAFTS = False` in `publishconf.py`).
- Asset conventions:
  - Keep shared images in `content/images`.
  - Keep static passthrough assets in `content/extra`.
  - Use markdown links consistent with the existing repository path conventions.
  - Do not author content directly in `output/`.

## Testing Guidelines
There is no separate unit test suite in this repo. Validation is build-based:

- Run `make check` before opening a PR.
- Check generated pages in `output/develop/` for broken links, missing assets, and metadata issues.
- For content changes, verify front matter fields render as expected on index/archive pages.

## Local Browser Checks
- Build the same output CI deploys with `make build`.
- Prefer `make build` over `make build-prod` as the prod target includes live links, content that may not load in the sandbox.
- Serve the generated site with `python -m http.server --directory output/develop 8000`.
- Prefer `http://localhost:...` over `http://127.0.0.1:...` for local browsing to avoid CORS issues with the default `SITEURL = "http://localhost:8000"` in `pelicanconf.py`.
- If the port is already in use, switch to another free port such as `8001`, rebuild with a matching `SITEURL` override, and use the matching localhost URL.
- Do not edit `pelicanconf.py` just to change the port; pass a Pelican override instead, for example: `UV_CACHE_DIR=/tmp/uv-cache uv run pelican content -e SITEURL='"http://localhost:8001"'`.
- For manual browser validation, prefer testing the served output rather than opening files directly from `output/develop/`.

## Playwright And `playwright-cli`
- Prefer Playwright-managed Chromium over system Chrome. Install it with `npx playwright install chromium`.
- In sandboxed sessions, set `HOME=/tmp/pw-home` and `XDG_CACHE_HOME=/tmp/pw-cache` before Playwright commands so browser binaries and cache files are writable.
- When setting up a local HTTP server or browsing the local site with Playwright, prefer `localhost` over `127.0.0.1` to avoid CORS issues with Pelican's default `SITEURL`.
- When taking screenshots of the homepage or `/toys`, wait `3000ms` before capturing so deferred JS has loaded and toy intro animations have completed.
- When capturing animation state, take screenshots in small increments rather than only at the start and end. Use roughly `250ms` steps unless the specific animation calls for something tighter.
- Verified on March 17, 2026: `playwright-cli --version` reports `1.59.0-alpha-1771104257000`, `npx playwright --version` reports `1.58.2`, and `npx playwright install chromium` downloaded Playwright Chromium `chromium-1208`.
- `playwright-cli` is useful for interactive inspection and element-driven actions. Typical flow:
  - `HOME=/tmp/pw-home XDG_CACHE_HOME=/tmp/pw-cache playwright-cli open --browser=chromium http://localhost:8000/`
  - `HOME=/tmp/pw-home XDG_CACHE_HOME=/tmp/pw-cache playwright-cli snapshot`
  - `HOME=/tmp/pw-home XDG_CACHE_HOME=/tmp/pw-cache playwright-cli click e3`
  - `HOME=/tmp/pw-home XDG_CACHE_HOME=/tmp/pw-cache playwright-cli screenshot --filename=/tmp/homepage.png`
  - `HOME=/tmp/pw-home XDG_CACHE_HOME=/tmp/pw-cache playwright-cli close`
- If `playwright-cli` cannot resolve its browser install and falls back to missing system Chrome, use `npx playwright` for one-shot captures, for example `HOME=/tmp/pw-home XDG_CACHE_HOME=/tmp/pw-cache npx playwright screenshot --browser=chromium http://localhost:8000/ /tmp/homepage.png`.

## Lighthouse Run Profile (Performance Work)
Use this exact profile for repeatable homepage measurements:

- Build: `make build`
- Serve output: `python -m http.server --directory output/develop 8000`
- Browser: Chrome Incognito
- DevTools -> Lighthouse settings:
  - Mode: `Navigation`
  - Device: `Mobile`
  - Categories: `Performance`
  - Throttling: `Simulated` (default Lighthouse mobile profile)
  - `Clear storage` enabled before each run
- URL: `http://localhost:8000/`
- Runs: 3 cold runs, keep median values
- Record: FCP, LCP, CLS, TBT, transfer size

GitHub Pages caching constraint:

- Deployment target is GitHub Pages from `output/publish/` for Production, `output/develop/` for testing with localhost.
- Cache headers are platform-managed, so custom long-lived `Cache-Control` per asset cannot be configured from this repository alone.

## Commit & Pull Request Guidelines
- Follow the existing history style: short, imperative commit subjects (for example, `Update avatar`, `Fix dependency config`).
- Keep commits focused on one logical change (content, theme, or config).
- PRs should include:
  - What changed and why.
  - Any local verification commands run.
  - Screenshots for visible theme/layout updates.
- If deployment behavior changes, reference `.github/workflows/deploy_to_pages.yml` impacts in the PR description.
