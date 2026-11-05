# HeroClix mobile-first rules reference

Static GitHub Pages site. Upload the entire extracted contents to the repository root and enable Settings → Pages → Deploy from a branch → main / root.

## Navigation
- Rules: Chapters → Sections → numbered rules, with Back at each level.
- PAC: Front grouped by Speed / Attack / Defense / Damage; reverse-side reference panels and terrain links.
- Search filters the full text of all entries. Results link to individual rules/abilities.
- Internal references link between named powers and numbered rules.

## Source and fidelity
Rule wording is loaded from `data.json` extracted from the user-provided 2026 Comprehensive Rules and 2022 PAC. Extracted graphics are preserved in `assets/inline/`, with larger user-supplied symbol images in `assets/combat/`. No PDF page images or original PDFs are packaged. Graphics positions are estimated from PDF layout and may need manual correction, and embedded text may have PDF extraction imperfections. This build is not certified word-for-word against visual originals. Do not modify rule text casually.

## Local test
`python -m http.server 8000` and visit `http://localhost:8000`.
