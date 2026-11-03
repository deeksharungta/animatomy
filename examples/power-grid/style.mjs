// The figure's own CSS: cavity tones for the cut-open machines, the fallback light, and the layered stage.
export const CSS = `
.pg-void{fill:var(--pg-void);stroke:none}
.iso[data-theme="light"] .pg-cavity{--anatomy-paper:#8e8a84;--anatomy-face:#8e8a84;--anatomy-top:#a29e97;--anatomy-shade-0:#7a7671;--anatomy-shade-1:#85817b;--anatomy-shade-2:#908c86;--anatomy-shade-3:#9b9790;--anatomy-hi:#3a3835;--anatomy-mid:#4a4743;--anatomy-lo:#5d5a55;--anatomy-faint:#6f6b66}
.iso[data-theme="dark"] .pg-cavity{--anatomy-paper:inherit;--anatomy-face:inherit;--anatomy-top:inherit}
.pg-rim{fill:none;stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.iso{--pg-void:#060606;--pg-oil:#1a1408;--pg-lamp:#f2a43a;--pg-arc:#9c8cff}
.iso[data-theme="light"]{--pg-void:#5b5853;--pg-oil:#6e6656;--pg-lamp:#e8962a;--pg-arc:#6a58e8}
.pg-oil{fill:var(--pg-oil)}
.pg-fb-lamp{fill:var(--pg-lamp)}
.pg-fb-arc{fill:var(--pg-arc);opacity:.85}
.pg-fb-air{fill:none;stroke:var(--pg-arc);stroke-linecap:round;stroke-linejoin:round}
.iso[data-theme="light"] .pg-fb-lamp{mix-blend-mode:multiply}
.pg-stage[data-gl] .pg-fb{display:none}
.pg-stage{position:relative;touch-action:pan-y;overflow:hidden}
.pg-stage>svg,.pg-stage>canvas{display:block;width:100%;height:auto}
.pg-stage>.pg-layer{position:absolute;inset:0;height:100%!important;pointer-events:none}
.iso[data-theme="dark"] .pg-stage>canvas,.iso:not([data-theme]) .pg-stage>canvas{mix-blend-mode:screen}
.pg-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
@media (max-width:480px){.iso-plate-corner[data-corner="readout"]{font-size:9px;letter-spacing:0}}
.pg-said{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
