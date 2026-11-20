# Vice Heat — GTA VI Cover Art Studio

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/agungvg/gta6-cover-art-eni-r2/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/agungvg/gta6-cover-art-eni-r2/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Vice Heat turns your own photos into a Vice City sunset poster: seven slanted-panel layouts, six grades that re-colour the whole poster, a three-step editor with face-aware crops, per-panel controls and Look sliders, and one-click PNG export in 1080×1080, 1080×1350 and 1920×1080. Everything runs offline in the browser — photos never leave your machine.

## Run it locally

```sh
python3 -m http.server 8080 --directory app
```

Then open <http://localhost:8080> in desktop Chrome.

## How it works

- **1 · Add photos** — the six-member demo cast is painted procedurally on canvas, or drop in your own photos (file picker, drag-and-drop, paste). Click a photo to place it, drag it onto a panel, Shift-drag to swap panels.
- **2 · Caption** — title, script subtitle, tagline, press quote, outlet and volume. The chrome title is drawn with striped gradients; the script subtitle overlaps it in neon.
- **3 · Export PNG** — the live preview and the export share one draw function, so what you see is what the PNG holds. Export one size or all three at once.

Every cover carries the full poster furniture: a five-star press quote with a named outlet, a volume badge, a tagline strip, COMING SOON, a two-line billing block, a procedural barcode, a gold starburst seal, and a slanted role tag on every panel.

## Layouts & grades

Layouts: Hero Mosaic, Hero + Three, Six Grid, Diagonal Trio, Seven Mosaic, Twin Titans, Crossfire.
Grades: Sunset, Neon Night, Golden Hour, Tropic Teal, Heatwave, Ultraviolet — each re-grades the photos, the title stripes, the frame, the seal and the procedural background (skyline, retro grid or palms).

## Entry

Built for the [gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun, account @lyso.

Optional: earn referral rewards, a second way to make money — [join make.fun with my referral link](https://make.fun/r/p9r33tb4).

## License

MIT — see [LICENSE](LICENSE). Fonts are SIL Open Font License (Anton, Bebas Neue, Pacifico; see `app/fonts/OFL*.txt`). No Rockstar Games logo, artwork or font is used anywhere.
