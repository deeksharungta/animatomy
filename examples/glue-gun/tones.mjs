// The stage's CSS and the material token sets: every part stays in the kit's greys, only darker or cooler, and in
// dark each set falls back to near the kit's own dark tones.
const set = (sel, [paper, face, top, s0, s1, s2, s3]) => `${sel}{--anatomy-paper:${paper};--anatomy-face:${face};--anatomy-top:${top};--anatomy-shade-0:${s0};--anatomy-shade-1:${s1};--anatomy-shade-2:${s2};--anatomy-shade-3:${s3}}`;
const dark = (sel) => `.iso[data-theme="dark"] ${sel},.iso:not([data-theme]) ${sel}`;
const LIGHT = {
  ".gg-in": ["#e6e6e2", "#ebebe7", "#eeeeea", "#d2d2cd", "#d9d9d4", "#dfdfdb", "#e5e5e1"],
  ".gg-alu": ["#f1f2f3", "#f6f7f8", "#fafbfc", "#d8dadd", "#e0e2e5", "#e8eaec", "#eff0f2"],
  ".gg-brass": ["#ecebe7", "#f1f0ec", "#f5f4f0", "#d3d1cb", "#dad8d2", "#e1dfd9", "#e8e6e0"],
  ".gg-rubber": ["#dedede", "#e3e3e3", "#e7e7e7", "#c6c6c6", "#cdcdcd", "#d4d4d4", "#dadada"],
  ".gg-stone": ["#d9d8d4", "#dfded9", "#e3e2dd", "#c4c3be", "#cbcac5", "#d2d1cc", "#d7d6d1"],
  ".gg-steel": ["#f4f5f6", "#fafbfc", "#ffffff", "#dcdee0", "#e4e6e8", "#eceef0", "#f2f3f5"],
};
const DARK = {
  ".gg-in": ["#0c0c0c", "#101010", "#121212", "#090909", "#0b0b0b", "#0d0d0d", "#0f0f0f"],
  ".gg-alu": ["#1a1b1d", "#202124", "#232427", "#141517", "#17181a", "#1a1b1d", "#1d1e20"],
  ".gg-brass": ["#191816", "#1e1d1b", "#21201e", "#131210", "#161513", "#191816", "#1c1b19"],
  ".gg-rubber": ["#101010", "#141414", "#161616", "#0b0b0b", "#0d0d0d", "#0f0f0f", "#121212"],
  ".gg-stone": ["#121211", "#161615", "#181817", "#0d0d0c", "#0f0f0e", "#111110", "#141413"],
  ".gg-steel": ["#1c1d1f", "#222326", "#25262a", "#16171a", "#191a1d", "#1c1d20", "#1f2023"],
};
export const TONES = Object.entries(LIGHT).map(([s, v]) => set(s, v)).join("") + Object.entries(DARK).map(([s, v]) => set(dark(s), v)).join("") + `
.gg-stage{position:relative;touch-action:pan-y;overflow:hidden}
.gg-stage>svg,.gg-stage>canvas{display:block;width:100%;height:auto}
.gg-stage>.gg-layer{position:absolute;inset:0;height:100%!important;pointer-events:none}
.iso[data-theme="dark"] .gg-stage>canvas,.iso:not([data-theme]) .gg-stage>canvas{mix-blend-mode:screen}
.gg-vent{fill:var(--anatomy-shade-0);opacity:.5}
.gg-stage:not([data-gl]) [data-part=stones][data-on] .iso-solid{--anatomy-paper:#f3d77a;--anatomy-face:#f6de8c;--anatomy-top:#f8e49c;--anatomy-shade-3:#f0d270}
.gg-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}`;
