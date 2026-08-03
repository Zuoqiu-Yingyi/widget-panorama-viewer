import{AbstractAdapter as e,CONSTANTS as t,PSVError as n,_ as r,d as i,f as a,s as o,utils as s}from"./index.module-BW5p_jE8.js";var c=`varying vec3 vPos;
uniform sampler2D map;
uniform float opacity;

const float PI = 3.1415926535897932384626433832795;
const float C = 0.946; // Calibration factor for dual-fisheye disc mapping

void main() {
    vec3 dir = normalize(vPos);
    float r = sqrt(dir.x * dir.x + dir.y * dir.y);

    vec2 uv;
    if (dir.z > 0.0) {
        // Front hemisphere -> left half of the texture, centered at (0.25, 0.5)
        float correction = r > 0.0 ? acos(dir.z) / r * (2.0 / PI) : 1.0;
        uv.x = -dir.x * (C / 4.0) * correction + 0.25;
        uv.y =  dir.y * (C / 2.0) * correction + 0.5;
    } else {
        // Back hemisphere -> right half of the texture, centered at (0.75, 0.5)
        float correction = r > 0.0 ? acos(-dir.z) / r * (2.0 / PI) : 1.0;
        uv.x =  dir.x * (C / 4.0) * correction + 0.75;
        uv.y =  dir.y * (C / 2.0) * correction + 0.5;
    }

    gl_FragColor = texture2D(map, uv);
    gl_FragColor.a *= opacity;
}
`,l=`varying vec3 vPos;

void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,u=class r extends e{static withConfig(e){return[r,e]}constructor(e){super(e)}supportsTransition(){return!0}supportsPreload(){return!0}async loadTexture(e,t){if(typeof e!=`string`&&(typeof e!=`object`||!e.path))return Promise.reject(new n(`Invalid panorama url, are you using the right adapter?`));let r;r=typeof e==`string`?{path:e}:{...e};let i=await this.viewer.textureLoader.loadImage(r.path,t?e=>this.viewer.textureLoader.dispatchProgress(e):null,r.path);return{panorama:e,texture:s.createSizedTexture(i)}}createMesh(){let e=new a(t.SPHERE_RADIUS,32,16).scale(-1,1,1);e.rotateX(-Math.PI/2),e.rotateY(Math.PI);let n=new i({uniforms:{map:{value:null},opacity:{value:1}},vertexShader:l,fragmentShader:c,depthTest:!1,depthWrite:!1,transparent:!0});return new o(e,n)}setTexture(e,t){e.material.uniforms.map.value=t.texture}setTextureOpacity(e,t){e.material.uniforms.opacity.value=t}disposeTexture({texture:e}){e.dispose()}disposeMesh(e){e.geometry.dispose(),e.material.dispose()}};u.id=`dual-fisheye`,u.VERSION=`5.15.0`,u.supportsDownload=!0;var d=u;function f({src:e,withCredentials:t,muted:n,autoplay:r}){let i=document.createElement(`video`);return i.crossOrigin=t?`use-credentials`:`anonymous`,i.loop=!0,i.playsInline=!0,i.autoplay=r,i.muted=n,i.preload=`metadata`,e instanceof MediaStream?i.srcObject=e:i.src=e,i}var p=class extends e{constructor(e){super(e)}init(){super.init(),this.viewer.needsContinuousUpdate(!0)}destroy(){this.__removeVideo(),super.destroy()}supportsPreload(){return!1}supportsTransition(){return!1}async loadTexture(e){if(typeof e!=`object`||!e.source)return Promise.reject(new n(`Invalid panorama configuration, are you using the right adapter?`));if(!this.viewer.getPlugin(`video`))return Promise.reject(new n(`Video adapters require VideoPlugin to be loaded too.`));let t=e.source instanceof HTMLVideoElement?e.source:f({src:e.source,withCredentials:this.viewer.config.withCredentials(e.source),muted:!0,autoplay:!1});return await this.__videoLoadPromise(t),{panorama:e,texture:new r(t)}}switchVideo(e){let t,n,r=!this.config.autoplay,i=this.config.muted,a=1;this.video&&({currentTime:t,duration:n,paused:r,muted:i,volume:a}=this.video),this.__removeVideo(),this.video=e.image,this.video.duration===n&&(this.video.currentTime=t),this.video.muted=i,this.video.volume=a,r||this.video.play()}setTextureOpacity(){}disposeTexture({texture:e}){e.dispose()}disposeMesh(e){e.geometry.dispose(),e.material.dispose()}__removeVideo(){this.video&&(this.video.pause(),this.video.remove(),delete this.video)}__videoLoadPromise(e){return new Promise((t,n)=>{let r=()=>{this.video&&e.duration===this.video.duration&&(e.currentTime=this.video.currentTime),t(),e.removeEventListener(`loadedmetadata`,r)},i=t=>{n(t),e.removeEventListener(`error`,i)};e.addEventListener(`loadedmetadata`,r),e.addEventListener(`error`,i)})}};p.supportsDownload=!1;var m=s.getConfigParser({autoplay:!1,muted:!1}),h=class e extends p{static withConfig(t){return[e,t]}constructor(e,t){super(e),this.config=m(t),this.adapter=new d(this.viewer)}destroy(){this.adapter.destroy(),delete this.adapter,super.destroy()}createMesh(){return this.adapter.createMesh()}setTexture(e,{texture:t}){e.material.uniforms.map.value=t,this.switchVideo(t)}};h.id=`dual-fisheye-video`,h.VERSION=`5.15.0`;var g=h;export{d as DualFisheyeAdapter,g as DualFisheyeVideoAdapter};