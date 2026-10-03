# Third-party notices

The book content and the site code written for this repository are BASIS material. The parts listed below come from third parties and keep their own licences.

## webforJ documentation

- Source: `webforj/webforj-documentation`
- Licence: MIT, Copyright (c) 2022 webforJ
- Licence text: [LICENSES/webforJ-MIT.txt](LICENSES/webforJ-MIT.txt)

Copied or adapted files:

- The SCSS partials under `docs/src/css/` and `docs/src/css/mixins/` that carry the header line `Copied from webforj/webforj-documentation`
- `docs/src/theme/prism-dwc-theme.js`
- `docs/static/js/dwc-theme-switcher.js`
- `docs/static/js/link-decorator.js`
- `.vale.ini`
- `.editorconfig`
- `.github/.styles/BASIS/` (rules, renamed from the `webforJ` style)
- `.github/.styles/config/vocabularies/BASIS/` (vocabulary files cannot carry a header and are covered by this entry)
- The structure of `CONTRIBUTING.md` is adapted from webforJ

The header audit of the remaining site files (`docs/src/css/_print.scss`, `docs/src/css/_book-icons.scss`, `docs/src/plugins/mermaid-elk-stub.js`, `docs/src/clientModules/link-decorator.js`, `docs/src/data/books.js`, `docs/src/data/book-icons-css.js`, `docs/src/pages/index.js`) found no copied code, so they carry no header.

## Google style for Vale

- Source: `errata-ai/Google`
- Licence: MIT, Copyright (c) 2018 - 2019 Joseph Kato
- Licence text: [LICENSES/errata-ai-Google-MIT.txt](LICENSES/errata-ai-Google-MIT.txt)

`.github/.styles/Google/` is vendored unmodified. It is covered by directory because the YAML, JSON and TXT files there carry no header.

## DWC UI stylesheet

`docs/static/css/dwc-ui.css` is an unmodified snapshot of `https://cdn.webforj.com/next/dwc-ui.css`, fetched 2026-10-03 for self-hosting. It is distributed by webforJ and BASIS International.

## Fonts

Inter and JetBrains Mono come from the npm packages `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono`. Both are licensed under the SIL Open Font License 1.1 and are bundled into the built site. The licence texts ship in those npm packages.

## npm dependencies

Dependencies are installed from the npm registry under their own licences, as recorded in `docs/package-lock.json`. They are not redistributed in this repository.
