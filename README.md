# HeroClix Interactive Rules – mobile / desktop

Static GitHub Pages site. Extract the changed-files ZIP into your repository root and overwrite existing files, then commit and push.

This update includes:
- PAC reverse-side detail navigation and a compact Front/Back toggle.
- Separate keyphrase entries instead of the PDF's interleaved columns.
- PAC power markers rendered as correctly colored dial-style X markers.
- Improved Ability symbols freshly cropped from the actual PAC.
- Inline graphics from the rulebook placed with source coordinate checks, including vehicles and dice results.
- Portable PNG glyph artwork; no embedded PDFs, page screenshots, or font files.
- An icon-placement audit covering all 107 pages (`ICON-AUDIT.md`).

Rules are kept in `data.json`. Terrain panels reuse the same rule entries rather than copying their content.

**Accuracy note:** this was a source-coordinate and extraction-text audit, with two manual repairs, not a comprehensive pixel-by-pixel visual comparison of every rule page. Some vector-only icons and text-extraction abnormalities remain possible. The source PDFs remain authoritative.
