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
- `make sync`: Install dependencies from `pyproject.toml`/`uv.lock`.
- `make sync-upgrade`: Upgrade dependencies and sync the local environment.
- `make lock`: Refresh `uv.lock`.
- `make build`: Build a development site into `output/develop/`.
- `make build-prod`: Build production output into `output/publish/` (same command CI uses).
- `make serve`: Run local dev server with live rebuilds.
- `make seo-check`: Run generated-output SEO validation checks.
- `make check`: Run the local pre-PR validation flow.
- `make clean`: Clean the local output/ directory.

Use `make sync` for reproducible local and CI parity. Use `make sync-upgrade` and `make lock` only when intentionally updating dependency versions.

## Coding Style & Naming Conventions
- Python config files follow PEP 8 style: 4-space indentation, `UPPER_CASE` config constants.
- Content files use Pelican metadata headers (`Title`, `Date`, `Summary`, etc.) at the top of Markdown files.
- Keep theme edits localized: templates in `themes/haru/templates/`, styling in `themes/haru/static/style.css`.
- Prefer descriptive, human-readable article filenames; keep page slugs stable once published.

## Pelican-First Rule
- Prefer built-in functionality from Pelican core, Pelican plugins, Markdown, Markdown extensions, and Pelican templating logic before adding custom scripts or glue code.
- Use custom code only when native functionality is insufficient for the requirement.
- Active plugin behavior is sourced from `pelicanconf.py` (`PLUGINS`) and dependency declarations in `pyproject.toml`.
- Current plugins and purpose:
  - `neighbors`: Provides previous/next article navigation.
  - `sitemap`: Generates `sitemap.xml`.
  - `webassets`: Handles asset processing and minification.
  - `share_post`: Provides social sharing metadata/helpers.
  - `series`: Supports article series ordering and linking.
  - `readtime`: Adds estimated reading time metadata.
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
- Check generated pages in `output/publish/` for broken links, missing assets, and metadata issues.
- For content changes, verify front matter fields render as expected on index/archive pages.

## Commit & Pull Request Guidelines
- Follow the existing history style: short, imperative commit subjects (for example, `Update avatar`, `Fix dependency config`).
- Keep commits focused on one logical change (content, theme, or config).
- PRs should include:
  - What changed and why.
  - Any local verification commands run.
  - Screenshots for visible theme/layout updates.
- If deployment behavior changes, reference `.github/workflows/deploy_to_pages.yml` impacts in the PR description.
