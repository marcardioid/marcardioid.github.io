from pathlib import Path

try:
    from pelican.plugins.webassets.vendor.webassets.exceptions import FilterError
    from pelican.plugins.webassets.vendor.webassets.filter import ExternalTool, register_filter
except ImportError:
    from webassets.exceptions import FilterError
    from webassets.filter import ExternalTool, register_filter


class SVGO(ExternalTool):
    name = "svgo"
    options = {"binary": "SVGO_BIN"}
    max_debug_level = None

    def setup(self):
        super().setup()

        package_root = Path(__file__).resolve().parent
        repo_root = package_root.parent
        self.config_path = str(package_root / "svgo.config.mjs")
        if self.binary:
            return

        for candidate in (
            repo_root / "node_modules/.bin/svgo",
            repo_root / "node_modules/.bin/svgo.cmd",
        ):
            if candidate.exists():
                self.binary = str(candidate)
                return

        raise FilterError(
            "svgo: svgo binary not found. Run `make sync` or set SVGO_BIN."
        )

    def open(self, out, source_path, **kwargs):
        self.subprocess(
            [
                self.binary,
                "--quiet",
                "--config",
                self.config_path,
                "--input",
                source_path,
                "--output",
                "{output}",
            ],
            out,
        )


register_filter(SVGO)
