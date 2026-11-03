import { C } from "./model.mjs";
import { LEFT, RIGHT, SIZES } from "./section.mjs";

// The steel's own light, in the drawing's camera: the metal in the cut plane glows by its temperature, a cooler
// skin grows in from the sand walls as it freezes, the sand beside it takes a warm tint, and the stream from the
// lip is a cream core in an orange skin. One blackbody table serves the shader and the no-WebGL fallback.
export const INK_STOPS = [[560, [0.45, 0.09, 0.05]], [680, [0.56, 0.07, 0.04]], [780, [0.78, 0.1, 0.03]], [950, [0.95, 0.38, 0.06]], [1150, [1, 0.78, 0.12]], [1300, [1, 0.9, 0.55]], [1450, [1, 0.95, 0.8]], [1600, [1, 0.97, 0.9]]];
const f = (v) => (Number.isInteger(v) ? v.toFixed(1) : String(+v.toFixed(3)));
const v2 = (list) => list.map(([x, z]) => `vec2(${f(x)},${f(z)})`);
const ramp = INK_STOPS.map(([t, c], i) => (i === 0 ? `vec3 c=vec3(${c.map(f)});` : `c=mix(c,vec3(${c.map(f)}),smoothstep(${f(INK_STOPS[i - 1][0])},${f(t)},T));`)).join("\n  ");
const poly = (name, pts) => `float ${name}(vec2 p){
  vec2 v[${pts.length + 1}];
  ${v2([...pts, pts[0]]).map((s, i) => `v[${i}]=${s};`).join("")}
  float d=dot(p-v[0],p-v[0]),s=1.;
  for(int i=0;i<${pts.length};i++){
    vec2 a=v[i+1],b=v[i],e=b-a,w=p-a,q=w-e*clamp(dot(w,e)/dot(e,e),0.,1.);
    d=min(d,dot(q,q));
    bvec3 c=bvec3(p.y>=a.y,p.y<b.y,e.x*w.y>e.y*w.x);
    if(all(c)||all(not(c)))s=-s;
  }
  return s*sqrt(d);
}`;
const z = SIZES;
export const GLOW = `
uniform float uLight;
uniform vec4 uFill;   // runner front x, runner level, ingate level, casting level
uniform vec4 uFill2;  // riser level, basin level, sprue width, has steel
uniform vec4 uTemp;   // casting, riser, gating temperature, ladle temperature
uniform vec4 uFrz;    // freezing: casting, riser and gating solid fraction, overall fade
uniform vec3 uS[12];  // the stream: screen points (figure units) and radii
uniform float uFlow;
uniform vec2 uSpill;  // the puddle spilt on the cope round the cup: radius, temperature
uniform vec2 uPipe;   // the riser's pipe: depth, radius of the liquid core
${poly("sdL", LEFT)}
${poly("sdR", RIGHT)}
vec3 rampOf(float T){
  ${ramp}
  return c;
}
float coverOf(float T){return smoothstep(560.,820.,T);}
vec4 inkFor(vec3 seen,float cover){vec3 ab=1.-seen;float a=max(max(ab.r,max(ab.g,ab.b)),cover);return vec4(vec3(a)-ab,a);}
vec4 glowOf(float T,float a){vec3 e=rampOf(T)*smoothstep(520.,700.,T)*(0.75+0.15*smoothstep(760.,1500.,T));float Tp=T-180.*smoothstep(900.,1300.,T);return mix(vec4(e*a,max(e.r,max(e.g,e.b))*a),inkFor(rampOf(Tp),0.92*coverOf(T))*a,uLight);}
vec4 over(vec4 t,vec4 u){return t+u*(1.-t.a);}
bool filled(vec2 p){
  if(uFill2.w<.001&&uFill2.y<${f(C.BASIN.z0 + 0.02)})return false;
  if(p.y>${f(C.BASIN.z0 - 0.5)}&&p.x<${f(z.xs + z.br + 1.)})return p.y<uFill2.y;
  if(p.x<${f(z.xs + z.rt + 1.)}&&p.y>${f(C.SPRUE.z0 - 0.5)})return abs(p.x-(${f(z.xs)}))<${f(z.rt)}*uFill2.z;
  if(uFill2.w<.001)return false;
  if(p.y<${f(C.RUN.z1 + 0.5)}&&p.x<${f(C.RUN.x1 + 0.5)})return p.x<uFill.x&&p.y<uFill.y+(uFill.y>=${f(C.RUN.z1)}?.5:0.);
  if(p.x<${f(C.GATE.x1 + 0.5)}&&p.y<${f(z.z0)})return p.y<uFill.z;
  if(p.y>${f(z.z1)}&&p.x>${f(z.rx0 - 1)}){
    float u=(p.x-${f(C.RISER.x)})/max(uPipe.y,.01);
    return p.y<uFill2.x-uPipe.x*max(0.,1.-u*u);
  }
  return p.y<uFill.w;
}
void main(){
  vec2 vb=viewOf(gl_FragCoord.xy);
  float px=pixelOf();
  vec3 q=onWallY(vb,0.);
  vec2 p=q.xz;
  float sd=min(sdL(p),sdR(p));
  vec4 col=vec4(0.);
  // The steel in the cut, ending at the inner edge of the cavity's stroke.
  float inside=1.-smoothstep(-.26-.7*px,-.26+.7*px,sd);
  if(inside>0.&&filled(p)){
    bool gate=p.x<${f(C.GATE.x1 + 0.5)}&&p.y<${f(z.z0)}||p.x<${f(z.xs + z.br + 1.)};
    bool riser=p.y>${f(z.z1)}&&p.x>${f(z.rx0 - 1)};
    float fs=gate?uFrz.z:riser?uFrz.y:uFrz.x, T0=gate?uTemp.z:riser?uTemp.y:uTemp.x, wm=gate?2.4:riser?8.:4.5;
    float w=-sd, shell=wm*fs;
    float T=mix(T0-(110.+190.*fs)*smoothstep(700.,1400.,T0),T0,smoothstep(0.,shell+2.4,w));
    col=glowOf(T,inside);
  }
  // The sand beside hot steel takes a warm tint, inside the cut face only.
  float face=window(p.x,${f(C.FL.x0)},${f(C.FL.x1)},.4)*window(p.y,${f(C.Z.board)},${f(C.Z.top)},.4);
  float heat=smoothstep(700.,1550.,max(uTemp.x,uTemp.z))*uFill2.w;
  float tint=exp(-max(sd,0.)/5.)*step(.26,sd)*face*heat*.5;
  vec4 warm=mix(vec4(vec3(1.,.36,.08)*tint*.5,tint*.5),vec4(vec3(.98,.55,.2)*tint*.55,tint*.55),uLight);
  col=over(col,warm*(1.-col.a));
  // Steel spilt over the cup's rim runs down it and lies in a thin sheet on the cope's top, behind the cup
  // where the cup stands in front of it: the ray back from the sheet to the viewer is tested against the cup.
  if(uSpill.x>.01){
    vec3 t=onFloor(vb,${f(C.Z.top)});
    float r=length(t.xy-vec2(${f(z.xs)},0.)), on=window(t.x,${f(C.FL.x0)},${f(C.FL.x1)},.3)*window(t.y,${f(C.FL.y0)},-.3,.3);
    vec3 w=towardViewer();
    vec2 o=t.xy-vec2(${f(z.xs)},0.);
    float a2=dot(w.xy,w.xy),b2=dot(o,w.xy),c2=dot(o,o)-${f(C.CUP.rim * C.CUP.rim)};
    float disc=b2*b2-a2*c2,hide=0.;
    if(disc>0.){float s0=(-b2-sqrt(disc))/a2,s1=(-b2+sqrt(disc))/a2;vec3 h=t+w*s0,e=t+w*s1;hide=step(0.,s0)*step(h.z,${f(C.Z.cup)})*step(min(h.y,e.y),0.);}
    float sheet=(1.-smoothstep(uSpill.x-.6,uSpill.x+.6,r))*smoothstep(${f(C.CUP.r)},${f(C.CUP.r + 0.6)},r)*on*(1.-hide);
    col=over(glowOf(uSpill.y-80.*smoothstep(0.,uSpill.x,r),sheet),col);
  }
  // The stream from the lip, in the figure's own screen units.
  if(uFlow>.001){
    vec2 v=vb;
    float best=1e3,rad=0.;
    for(int i=0;i<11;i++){
      vec2 a=uS[i].xy,b=uS[i+1].xy,e=b-a;
      float h=clamp(dot(v-a,e)/max(dot(e,e),1e-4),0.,1.);
      float d=length(v-a-e*h);
      if(d<best){best=d;rad=mix(uS[i].z,uS[i+1].z,h);}
    }
    float pxv=uView.x/uCanvas.x;
    float body=1.-smoothstep(rad-.7*pxv,rad+.7*pxv,best);
    float core=1.-smoothstep(0.,rad,best);
    vec4 s=glowOf(uTemp.w-260.*(1.-core),body*uFlow);
    col=over(s,col);
  }
  col*=uFrz.w;
  float n=(hash12(gl_FragCoord.xy+fract(uTime*.61)*91.)-.5)/255.;
  col=max(col+n*smoothstep(0.,1.5/255.,col.a),0.);
  col.rgb=min(col.rgb,vec3(col.a));
  gl_FragColor=col;
}`;
