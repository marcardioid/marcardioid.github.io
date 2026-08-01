SHELL := /bin/bash

.DEFAULT_GOAL := help

UV ?= uv
NPM ?= npm
PELICAN := $(UV) run pelican
SEO_CHECK := scripts/check_seo_output.py

.PHONY: help sync sync-upgrade lock build build-prod serve check seo-check clean

help:
	@echo "Available targets:"
	@echo "  make sync          Install dependencies from uv.lock and package-lock.json"
	@echo "  make sync-upgrade  Upgrade dependencies and sync both environments"
	@echo "  make lock          Refresh uv.lock and package-lock.json"
	@echo "  make build         Build development output"
	@echo "  make build-prod    Build production output"
	@echo "  make serve         Run local autoreload server"
	@echo "  make check         Sync and run production build"
	@echo "  make clean         Remove generated output directories"

sync:
	$(UV) sync --frozen --no-install-project
	$(NPM) ci

sync-upgrade:
	$(UV) lock --upgrade
	$(UV) sync --no-install-project
	$(NPM) update

lock:
	$(UV) lock
	$(NPM) install --package-lock-only

build:
	$(PELICAN) content

build-prod:
	$(PELICAN) content -s publishconf.py

serve:
	$(PELICAN) content --listen --autoreload

seo-check:
	$(UV) run python $(SEO_CHECK) output/publish --content-dir content/writing

clean:
	rm -rf output/develop output/publish

check: sync clean build-prod seo-check
