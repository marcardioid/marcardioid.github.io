SHELL := /bin/bash

UV ?= uv
PELICAN := $(UV) run --no-project pelican
PYTHON ?= python3
SEO_CHECK := scripts/check_seo_output.py

.PHONY: help sync sync-upgrade lock build build-prod serve check seo-check clean

help:
	@echo "Available targets:"
	@echo "  make sync          Install dependencies from uv.lock"
	@echo "  make sync-upgrade  Upgrade dependencies and sync environment"
	@echo "  make lock          Refresh uv.lock"
	@echo "  make build         Build development output"
	@echo "  make build-prod    Build production output"
	@echo "  make serve         Run local autoreload server"
	@echo "  make check         Sync and run production build"
	@echo "  make clean         Remove generated output directories"

sync:
	$(UV) sync --frozen --no-install-project

sync-upgrade:
	$(UV) lock --upgrade
	$(UV) sync --no-install-project

lock:
	$(UV) lock

build:
	$(PELICAN) content

build-prod:
	$(PELICAN) content -s publishconf.py

serve:
	$(PELICAN) content --listen --autoreload

seo-check:
	$(PYTHON) $(SEO_CHECK) output/publish

clean:
	rm -rf output/develop output/publish

check: sync clean build-prod seo-check
