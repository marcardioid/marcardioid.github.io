SHELL := /bin/bash

UV ?= uv
PELICAN := $(UV) run --no-project pelican

.PHONY: help sync sync-upgrade lock build build-prod serve check clean

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

check: sync build-prod

clean:
	rm -rf output/develop output/publish
