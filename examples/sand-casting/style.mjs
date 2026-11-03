// Page styles: the cavities and the core in their own tones, the steel's fallback glow, and the layered stage.
export const CSS = `
.iso{--sc-void:#cfcbc4;--sc-core:#dad5cc;--sc-bar:#c4c4c6;--sc-mouth:#3a302a;--sc-facing:#e8e6e1;--sc-sleeve:#f1efe9}
.iso[data-theme="dark"],.iso:not([data-theme]){--sc-void:#070707;--sc-core:#262626;--sc-bar:#2a2a2a;--sc-mouth:#050505;--sc-facing:#1a1a1a;--sc-sleeve:#323232}
.sc-sleevecut{fill:var(--sc-sleeve);stroke:none}
.sc-facing{fill:none;stroke:var(--sc-facing);stroke-width:5;stroke-linejoin:round}
.sc-void{fill:var(--sc-void);stroke:none}
.sc-hole{stroke:var(--anatomy-mid);stroke-width:var(--anatomy-weight)}
.sc-core{fill:var(--sc-core);stroke:none}
.sc-bar{fill:var(--sc-bar);stroke:none}
.sc-cavity{fill:none;stroke:var(--anatomy-mid);stroke-width:var(--anatomy-weight);stroke-linejoin:round}
.sc-metal{fill:var(--anatomy-face);stroke:none}
.sc-hot{stroke:none;mix-blend-mode:normal}
.sc-stage[data-gl] .sc-hot,.sc-stage[data-gl] [data-part="stream-fb"],.sc-stage[data-gl] [data-part="spill-fb"]{display:none}
.sc-mouth{fill:var(--sc-mouth);stroke:var(--anatomy-mid);stroke-width:var(--anatomy-weight)}
.sc-rim-back{fill:var(--anatomy-shade-0)}
.sc-rim[data-lit]>.iso-line{stroke:var(--anatomy-lit)}
.sc-mesh{fill:var(--anatomy-shade-1);stroke:none}
.sc-stage{position:relative;touch-action:pan-y;overflow:hidden}
.sc-stage>svg,.sc-stage>canvas{display:block;width:100%;height:auto}
.sc-stage>.sc-layer{position:absolute;inset:0;height:100%!important;pointer-events:none}
.iso[data-theme="dark"] .sc-stage>canvas,.iso:not([data-theme]) .sc-stage>canvas{mix-blend-mode:screen}
.sc-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
.sc-stage[data-grab]{cursor:grabbing}
.sc-said{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
