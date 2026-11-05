# HeroClix Interactive Rules — GitHub Pages

Upload the contents of this folder to the root of a GitHub Pages repository. No build step or server component is required.

## November 5 update

- Scalable symbol font in `assets/fonts/heroclix-symbols.ttf`, with character mapping in `glyph-map.json`. Built from source graphics and the supplied combat-symbol images. Embedded rule graphics render as inline font glyphs (text characters), not floating images.
- Fixed source-layout placement specifically for the standard combat symbols (1.3a) and standard characters (1.10) examples.
- PAC Front/Back switch no longer creates a redundant Back button on the reverse-side landing page.
- PAC map-terrain items expand in place and read the original text from the corresponding entries of the comprehensive-rule database. Text is not copied into separate terrain data fields.
- Inherent PAC abilities are nine separate source-positioned entries with each description under its own heading.
- Cache-busting query strings for CSS/JS/data to help deploy changes to browsers with cached assets.

## Fidelity note

Original comprehensive-rule and PAC textual source data are kept in `data.json`. The special symbol-only passages use explicit display assembly to put glyphs at their original positions. The underlying source text is retained without editorial rewrites. This is not a claim of full visual character-by-character verification across every PDF section; the remaining extracted PAC reverse-side panels can contain interleaved columns and missing image-only glyphs. No PDF files or page screenshots are shipped.

## Deployment

In GitHub → Settings → Pages, select Deploy from a branch, `main`, `/(root)`. For updates, replace the project files and commit/push.
