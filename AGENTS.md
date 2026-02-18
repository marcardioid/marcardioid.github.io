# Repository Guidelines

## Project Structure & Module Organization
This repository contains the source for a Pelican-based static site.

- `content/`: Markdown pages/posts, images, and static extras copied to the site.
- `themes/pneumatic/`: Custom theme templates and static assets.
- `pelicanconf.py`: Development/default site settings (`output/develop/`).
- `publishconf.py`: Production overrides (`output/publish/`).
- `output/`: Generated static site artifacts.
- `.github/workflows/deploy_to_pages.yml`: CI build and GitHub Pages deploy flow.

Primary workflow uses source content/config, not hand-editing files in `output/`.

## Build, Test, and Development Commands
- `make sync`: Install dependencies from `pyproject.toml`/`uv.lock`.
- `make build`: Build a development site into `output/develop/`.
- `make build-prod`: Build production output into `output/publish/` (same command CI uses).
- `make serve`: Run local dev server with live rebuilds.
- `make seo-check`: Run generated-output SEO validation checks.
- `make check`: Run the local pre-PR validation flow.
- `make clean`: Clean the local output/ directory.

## Coding Style & Naming Conventions
- Python config files follow PEP 8 style: 4-space indentation, `UPPER_CASE` config constants.
- Content files use Pelican metadata headers (`Title`, `Date`, `Summary`, etc.) at the top of Markdown files.
- Keep theme edits localized: templates in `themes/pneumatic/templates/`, styling in `themes/pneumatic/static/style.css`.
- Prefer descriptive, human-readable article filenames; keep page slugs stable once published.

## Pelican-First Rule
- Prefer built-in functionality from Pelican core, Pelican plugins, Markdown, Markdown extensions, and Pelican templating logic before adding custom scripts or glue code.
- Use custom code only when native functionality is insufficient for the requirement.
- References:
  - https://getpelican.com/
  - https://docs.getpelican.com/en/latest/
  - https://github.com/getpelican/pelican

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
