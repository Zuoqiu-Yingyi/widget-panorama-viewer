import{AbstractAdapter as e,CONSTANTS as t,PSVError as n,_ as r,d as i,h as a,s as o,t as s,utils as c}from"./index.module-BW5p_jE8.js";function l({src:e,withCredentials:t,muted:n,autoplay:r}){let i=document.createElement(`video`);return i.crossOrigin=t?`use-credentials`:`anonymous`,i.loop=!0,i.playsInline=!0,i.autoplay=r,i.muted=n,i.preload=`metadata`,e instanceof MediaStream?i.srcObject=e:i.src=e,i}var u=class extends e{constructor(e){super(e)}init(){super.init(),this.viewer.needsContinuousUpdate(!0)}destroy(){this.__removeVideo(),super.destroy()}supportsPreload(){return!1}supportsTransition(){return!1}async loadTexture(e){if(typeof e!=`object`||!e.source)return Promise.reject(new n(`Invalid panorama configuration, are you using the right adapter?`));if(!this.viewer.getPlugin(`video`))return Promise.reject(new n(`Video adapters require VideoPlugin to be loaded too.`));let t=e.source instanceof HTMLVideoElement?e.source:l({src:e.source,withCredentials:this.viewer.config.withCredentials(e.source),muted:!0,autoplay:!1});return await this.__videoLoadPromise(t),{panorama:e,texture:new r(t)}}switchVideo(e){let t,n,r=!this.config.autoplay,i=this.config.muted,a=1;this.video&&({currentTime:t,duration:n,paused:r,muted:i,volume:a}=this.video),this.__removeVideo(),this.video=e.image,this.video.duration===n&&(this.video.currentTime=t),this.video.muted=i,this.video.volume=a,r||this.video.play()}setTextureOpacity(){}disposeTexture({texture:e}){e.dispose()}disposeMesh(e){e.geometry.dispose(),e.material.dispose()}__removeVideo(){this.video&&(this.video.pause(),this.video.remove(),delete this.video)}__videoLoadPromise(e){return new Promise((t,n)=>{let r=()=>{this.video&&e.duration===this.video.duration&&(e.currentTime=this.video.currentTime),t(),e.removeEventListener(`loadedmetadata`,r)},i=t=>{n(t),e.removeEventListener(`error`,i)};e.addEventListener(`loadedmetadata`,r),e.addEventListener(`error`,i)})}};u.supportsDownload=!1;var d=`// shamelessly copied from https://github.com/videojs/videojs-vr/blob/main/src/plugin.js

varying vec2 vUv;
uniform sampler2D map;
uniform bool equiangular;
uniform float contCorrect;
uniform vec2 faceWH;
uniform vec2 vidWH;

const float PI = 3.1415926535897932384626433832795;

void main() {
    vec2 corner = vUv - mod(vUv, faceWH) + vec2(0, contCorrect / vidWH.y);
    vec2 faceWHadj = faceWH - vec2(0, contCorrect * 2. / vidWH.y);
    vec2 p = (vUv - corner) / faceWHadj - .5;
    vec2 q = equiangular ? 2. / PI * atan(2. * p) + .5 : p + .5;
    vec2 eUv = corner + q * faceWHadj;
    gl_FragColor = texture2D(map, eUv);
}
`,f=`varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix *  modelViewMatrix * vec4( position, 1.0 );
}
`,p=c.getConfigParser({autoplay:!1,muted:!1}),m=class e extends u{static withConfig(t){return[e,t]}constructor(e,t){super(e),this.config=p(t)}async loadTexture(e){let{texture:t}=await super.loadTexture(e);return{panorama:e,texture:t,panoData:{isCubemap:!0,equiangular:e.equiangular??!0}}}createMesh(e){let n=t.SPHERE_RADIUS*2,r=new s(n,n,n).scale(1,1,-1).toNonIndexed();this.__setUVs(r);let c=new i({uniforms:{map:{value:null},equiangular:{value:e.equiangular},contCorrect:{value:1},faceWH:{value:new a(1/3,1/2)},vidWH:{value:new a(1,1)}},vertexShader:f,fragmentShader:d,depthTest:!1,depthWrite:!1});return new o(r,c)}setTexture(e,{texture:t}){let n=t.image,r=e.material.uniforms;r.map.value=t,r.vidWH.value.set(n.videoWidth,n.videoHeight),this.switchVideo(t)}__setUVs(e){e.clearGroups();let t=e.getAttribute(`uv`),n=1/3,r=2/3,i=1/2;t.setXY(0,0,1),t.setXY(1,0,i),t.setXY(2,n,1),t.setXY(3,0,i),t.setXY(4,n,i),t.setXY(5,n,1),t.setXY(6,r,1),t.setXY(7,r,i),t.setXY(8,1,1),t.setXY(9,r,i),t.setXY(10,1,i),t.setXY(11,1,1),t.setXY(12,1,i),t.setXY(13,r,i),t.setXY(14,1,0),t.setXY(15,r,i),t.setXY(16,r,0),t.setXY(17,1,0),t.setXY(18,n,i),t.setXY(19,0,i),t.setXY(20,n,0),t.setXY(21,0,i),t.setXY(22,0,0),t.setXY(23,n,0),t.setXY(24,r,i),t.setXY(25,n,i),t.setXY(26,r,0),t.setXY(27,n,i),t.setXY(28,n,0),t.setXY(29,r,0),t.setXY(30,n,1),t.setXY(31,n,i),t.setXY(32,r,1),t.setXY(33,n,i),t.setXY(34,r,i),t.setXY(35,r,1)}};m.id=`cubemap-video`,m.VERSION=`5.15.0`;var h=m;export{h as CubemapVideoAdapter};