# marcsleegers.com

This repository contains both the static files and the source files used to generate [marcsleegers.com]. 
It is generated with [Pelican], and tested and deployed with GitHub Actions.
The site's theme is a heavily modified version of the beautiful [Pneumatic].
Dependency management is done with [uv], and local/CI commands are exposed through `make`.

The repository contains two distinct branches: the [`src`] branch contains the source files that Pelican uses to generate the static files which are automatically pushed to the [`gh-pages`] branch.

Code is licensed under the [MIT License] and articles under a [Creative Commons Attribution 4.0 International License].

## Local development

```bash
make sync
make build
make serve
```

For a production-style build:

```bash
make build-prod
```

## CI and Deploy Flow

- Pull requests targeting `src` run the `✅ Validate` workflow.
- Pushes to `src` run the `🚀 Deploy to GitHub Pages` workflow.


[marcsleegers.com]: https://marcsleegers.com
[Pelican]: https://getpelican.com
[Pneumatic]: https://github.com/iKevinY/pneumatic
[uv]: https://docs.astral.sh/uv/
[`src`]: https://github.com/marcardioid/marcsleegers.com/tree/src
[`gh-pages`]: https://github.com/marcardioid/marcsleegers.com/tree/gh-pages
[MIT License]: https://github.com/marcardioid/marcsleegers.com/blob/src/LICENSE
[Creative Commons Attribution 4.0 International License]: http://creativecommons.org/licenses/by/4.0/
