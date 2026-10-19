'use strict';

/* A small WebGL mesh renderer for the illustrated hero. No CDN or runtime
 * dependency. Artwork, geometry, limits and wind regions live in layers.json.
 * HTML and the original <picture> stay usable throughout loading/failure. */
(() => {
  const clamp = (v, low = 0, high = 1) => Math.max(low, Math.min(high, v));
  const smooth = (low, high, value) => { const n = clamp((value - low) / (high - low)); return n * n * (3 - 2 * n); };
  const wrap = (value, range) => ((value % range) + range) % range;
  function seededRandom(seed) {
    return () => {seed=(seed+0x6D2B79F5)|0;let n=Math.imul(seed^(seed>>>15),1|seed);n^=n+Math.imul(n^(n>>>7),61|n);return ((n^(n>>>14))>>>0)/4294967296;};
  }
  // Random weather, continuous motion. Each segment eases into a new regime,
  // then holds it briefly. Integrating speed keeps all phases continuous when
  // weather changes and makes seeking/previewing exactly reproducible.
  function createWind(seed) {
    const random=seededRandom(seed),segments=[];
    let end=0,strength=.55,speed=.75,phase=0;
    function integral(segment,elapsed) {
      const t=Math.min(elapsed,segment.transition),s=t/segment.transition;
      return segment.fromSpeed*t+(segment.speed-segment.fromSpeed)*segment.transition*(s*s*s-.5*s*s*s*s)
        +Math.max(0,elapsed-segment.transition)*segment.speed;
    }
    function sample(seconds) {
      const time=Math.max(0,seconds);
      while(!segments.length||end<=time) {
        const regime=Math.floor(random()*4),next=[.12,.48,.88,1.40][regime]+random()*.18;
        const duration=5+random()*7,transition=1.8+random()*1.4;
        const segment={start:end,end:end+duration,transition,fromStrength:strength,strength:next,fromSpeed:speed,speed:.25+next*.95,phase};
        segments.push(segment);phase+=integral(segment,duration);end+=duration;strength=next;speed=segment.speed;
      }
      let low=0,high=segments.length-1;
      while(low<high){const mid=(low+high)>>1;if(segments[mid].end<=time)low=mid+1;else high=mid;}
      const segment=segments[low],elapsed=time-segment.start,ease=smooth(0,segment.transition,elapsed);
      const currentStrength=segment.fromStrength+(segment.strength-segment.fromStrength)*ease;
      return {strength:currentStrength,speed:segment.fromSpeed+(segment.speed-segment.fromSpeed)*ease,
        phase:segment.phase+integral(segment,elapsed),regime:currentStrength<.35?'calm':currentStrength<.75?'mild':currentStrength<1.2?'breezy':'gust'};
    }
    return {sample};
  }
  // Bend the silhouette as a connected figure. The bottom 8% stays pinned to
  // its supporting rock; cloth has its own independent, much stronger mask.
  const poseWeight = v => smooth(.08,.95,1-v);
  const bodyPose = (time,wind) => ({x:-wind.strength*.65+Math.sin(time*.82)*.65+Math.sin(wind.phase*.75)*.45,y:Math.sin(time*1.65)*.32});
  const vertexSource = `
    precision highp float;
    attribute vec2 aUV;
    attribute vec3 aWind;
    attribute float aRestY;
    attribute float aPose;
    uniform vec4 uRect;
    uniform vec2 uView;
    uniform vec2 uOffset;
    uniform vec2 uPointer;
    uniform float uScale;
    uniform float uDepth;
    uniform float uAmplitude;
    uniform float uStrength;
    uniform vec2 uPose;
    uniform mediump vec4 uPhase;
    uniform mediump float uRamp;
    uniform float uFlutter;
    varying mediump vec2 vUV;
    varying mediump vec2 vWorld;
    uniform vec2 uFrame;
    void main() {
      vec2 p = uRect.xy + aUV * uRect.zw;
      p.y += aRestY;
      float phase = aWind.z;
      // Increasing time + increasing x makes gusts travel right to left.
      float gust = .56 + .27*sin(uPhase.x + phase) + .17*sin(uPhase.y + phase*1.7);
      float flutter = sin(uPhase.z + phase*2.0) * aWind.y * .10 * uFlutter;
      float bend = (gust * aWind.x + flutter) * uAmplitude * uRamp * uStrength;
      p.x -= bend;
      p.y += sin(uPhase.w + phase) * bend * .19;
      p += uPose * aPose * uRamp;
      p -= uPointer * uDepth * .5;
      vec2 screen = p * uScale + uOffset;
      gl_Position = vec4(screen.x/uView.x*2.0-1.0, 1.0-screen.y/uView.y*2.0, 0, 1);
      vUV = aUV;
      vWorld = (uRect.xy + aUV*uRect.zw)/uFrame;
    }`;
  const fragmentSource = `
    precision mediump float;
    uniform sampler2D uImage;
    uniform mediump vec3 uLight;
    uniform float uDesktop;
    uniform mediump float uRamp;
    uniform float uBackground;
    uniform vec2 uSun;
    uniform vec2 uRiver;
    varying mediump vec2 vUV;
    varying mediump vec2 vWorld;
    void main() {
      vec4 color = texture2D(uImage, vUV);
      if (uBackground > .5) {
        vec2 d = (vWorld-uSun)*vec2(1.0, .8);
        float sun = exp(-dot(d,d)*190.0);
        vec2 r = (vWorld-uRiver)*vec2(2.0, 1.0);
        float water = exp(-dot(r,r)*210.0);
        float warm = smoothstep(.05,.25,color.r-color.b);
        float light = .016*sin(uLight.x)*sun;
        light += .025*sin(vWorld.y*450.0-uLight.y)*water*warm;
        // Bright water pixels flow downward inside narrow waterfall regions.
        vec2 f=abs(vWorld-vec2(.95,.585))/vec2(.012,.045);
        vec2 g=abs(vWorld-vec2(.895,.755))/vec2(.008,.035);
        vec2 h=abs(vWorld-vec2(.94,.80))/vec2(.010,.028);
        vec2 j=abs(vWorld-vec2(.73,.705))/vec2(.004,.012);
        float falls=(1.0-smoothstep(.65,1.0,max(f.x,f.y))) + (1.0-smoothstep(.65,1.0,max(g.x,g.y)));
        falls+=(1.0-smoothstep(.65,1.0,max(h.x,h.y))) + (1.0-smoothstep(.65,1.0,max(j.x,j.y)));
        light += .04*sin(vWorld.y*800.0-uLight.z)*falls*uDesktop*smoothstep(.10,.30,min(color.r,color.b));
        color.rgb *= 1.0 + light*uRamp;
      }
      gl_FragColor = color;
    }`;

  function windWeight(mask, x, y) {
    if (!mask) return [0, 0, 0];
    let weight = 0;
    if (mask.kind === 'cloth') {
      weight = Math.pow(clamp((mask.anchorX-x)/mask.reach), 1.35);
      weight *= smooth(mask.top, mask.top+16, y) * (1-smooth(mask.bottom-32, mask.bottom, y));
    } else if (mask.kind === 'grass') {
      let root = mask.roots.at(-1)[1];
      for (let i=1; i<mask.roots.length; i++) {
        const a=mask.roots[i-1], b=mask.roots[i];
        if (x<=b[0]) { root=a[1]+(b[1]-a[1])*clamp((x-a[0])/(b[0]-a[0])); break; }
      }
      weight = Math.pow(clamp((root-y)/mask.reach), 1.5);
      // The central rock supporting the feet remains rigid.
      weight *= 1 - smooth(560,700,x)*(1-smooth(920,1010,x))*smooth(780,805,y);
    } else if (mask.kind === 'maple') {
      weight = Math.pow(clamp((x-mask.anchorX)/mask.reach), 1.2) * (1-smooth(mask.bottom-45,mask.bottom,y));
    }
    return [weight, weight*weight, x*.009+y*.004];
  }

  function compile(gl, type, source) {
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
      const message=gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(message);
    }
    return shader;
  }
  function program(gl) {
    const vertex=compile(gl,gl.VERTEX_SHADER,vertexSource), fragment=compile(gl,gl.FRAGMENT_SHADER,fragmentSource);
    const result=gl.createProgram(); gl.attachShader(result,vertex); gl.attachShader(result,fragment); gl.linkProgram(result);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if (!gl.getProgramParameter(result,gl.LINK_STATUS)) { const message=gl.getProgramInfoLog(result);gl.deleteProgram(result);throw new Error('Scene shader linking failed: '+message); }
    return result;
  }
  async function loadImage(file, signal) {
    const image=new Image(); image.decoding='async';
    await new Promise((resolve,reject)=>{
      const abort=()=>{image.src='';reject(new DOMException('Scene load cancelled','AbortError'));};
      if(signal.aborted) {abort();return;}
      signal.addEventListener('abort',abort,{once:true});
      image.onload=()=>{signal.removeEventListener('abort',abort);resolve();};
      image.onerror=()=>{signal.removeEventListener('abort',abort);reject(new Error('Scene image failed: '+file));};
      image.src=file;
    });
    return image;
  }

  class LayerRenderer {
    constructor(canvas) {
      this.canvas=canvas;
      this.gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
      if (!this.gl) throw new Error('WebGL unavailable');
      this.layers=[]; this.textureBytes=0;
    }
    release() {
      const gl=this.gl;
      if(!gl.isContextLost()) {
        for(const layer of this.layers) {gl.deleteTexture(layer.texture);gl.deleteBuffer(layer.vertices);gl.deleteBuffer(layer.indices);}
        if(this.program)gl.deleteProgram(this.program);
      }
      this.layers=[];this.textureBytes=0;this.program=null;
    }
    build(config, manifest, images) {
      this.release();
      this.config=config; const gl=this.gl;
      this.program=program(gl); gl.useProgram(this.program);
      this.uniforms={};
      for(const name of ['Rect','View','Offset','Pointer','Scale','Depth','Amplitude','Strength','Pose','Phase','Light','Desktop','Ramp','Flutter','Frame','Background','Sun','River','Image']) this.uniforms[name]=gl.getUniformLocation(this.program,'u'+name);
      this.uv=gl.getAttribLocation(this.program,'aUV');this.wind=gl.getAttribLocation(this.program,'aWind');this.restY=gl.getAttribLocation(this.program,'aRestY');
      this.pose=gl.getAttribLocation(this.program,'aPose');
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.DEPTH_TEST);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
      try {
        config.layers.forEach((layer,index)=>{
          const image=images[index], cols=layer.windAmount?64:1, rows=layer.windAmount?48:1;
          const values=[],indices=[];
          for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++) {
            const u=x/cols,v=y/rows,px=layer.rect[0]+u*layer.rect[2],py=layer.rect[1]+v*layer.rect[3];
            const warp=layer.restWarp;
            const restY=warp?warp.lift*Math.exp(-Math.pow((px-warp.centerX)/warp.width,2))*Math.pow(1-v,warp.falloff):0;
            values.push(u,v,...windWeight(manifest.maskDefinitions[layer.mask],px,py+restY),restY,layer.mask?.includes('cloth')?poseWeight(v):0);
          }
          for(let y=0;y<rows;y++)for(let x=0;x<cols;x++) {
            const i=y*(cols+1)+x;
            indices.push(i,i+1,i+cols+1,i+1,i+cols+2,i+cols+1);
          }
          const resource={...layer,texture:gl.createTexture(),vertices:gl.createBuffer(),indices:gl.createBuffer(),count:indices.length};
          this.layers.push(resource); // Register before allocation so failure cleanup is complete.
          gl.bindTexture(gl.TEXTURE_2D,resource.texture);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
          gl.bindBuffer(gl.ARRAY_BUFFER,resource.vertices);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,resource.indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
          this.textureBytes+=image.naturalWidth*image.naturalHeight*4;
        });
        const error=gl.getError();
        if(error!==gl.NO_ERROR)throw new Error('Scene allocation failed: '+error);
      } catch(error) {this.release();throw error;}
    }
    draw(time, layout, pointer, effects, mobile, wind) {
      const gl=this.gl,U=this.uniforms;
      gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(this.program);
      gl.uniform2f(U.View,layout.width,layout.height);gl.uniform2f(U.Offset,layout.x,layout.y);gl.uniform1f(U.Scale,layout.scale);
      gl.uniform2fv(U.Frame,this.config.size);gl.uniform2f(U.Pointer,pointer.x,pointer.y);
      // Wrapped angles retain smooth precision after hours of continuous use.
      const angle=frequency=>(time*frequency)%(Math.PI*2);
      const windAngle=frequency=>(wind.phase*frequency)%(Math.PI*2),pose=bodyPose(time,wind);
      gl.uniform4f(U.Phase,windAngle(1.5),windAngle(3.2),windAngle(7),windAngle(2.1));
      gl.uniform1f(U.Strength,wind.strength);gl.uniform2f(U.Pose,pose.x,pose.y);
      gl.uniform3f(U.Light,angle(.72),angle(3),angle(32));gl.uniform1f(U.Desktop,mobile?0:1);
      gl.uniform1f(U.Ramp,smooth(0,2.5,time));gl.uniform1f(U.Flutter,mobile?0:1);
      gl.uniform2fv(U.Sun,effects.sun);gl.uniform2fv(U.River,effects.river);gl.uniform1i(U.Image,0);
      gl.enableVertexAttribArray(this.uv);gl.enableVertexAttribArray(this.wind);gl.enableVertexAttribArray(this.restY);gl.enableVertexAttribArray(this.pose);
      for(const layer of this.layers) {
        gl.uniform4fv(U.Rect,layer.rect);gl.uniform1f(U.Depth,mobile?0:layer.depth);gl.uniform1f(U.Amplitude,layer.windAmount);
        gl.uniform1f(U.Background,layer.id==='valley'||layer.id==='mobile-base'?1:0);
        gl.bindBuffer(gl.ARRAY_BUFFER,layer.vertices);gl.vertexAttribPointer(this.uv,2,gl.FLOAT,false,28,0);gl.vertexAttribPointer(this.wind,3,gl.FLOAT,false,28,8);gl.vertexAttribPointer(this.restY,1,gl.FLOAT,false,28,20);gl.vertexAttribPointer(this.pose,1,gl.FLOAT,false,28,24);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,layer.indices);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,layer.texture);
        gl.drawElements(gl.TRIANGLES,layer.count,gl.UNSIGNED_SHORT,0);
      }
    }
  }

  window.createKageScene = function({host,sceneCanvas,atmosphereCanvas,isHome,isPaused}) {
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'), narrow=matchMedia('(max-width:620px)'), fine=matchMedia('(pointer:fine)');
    const ctx=atmosphereCanvas.getContext('2d');
    let manifest=null,renderer=null,loading=null,aborter=null,variant=null,failed=false,visible=true,pageActive=true,ready=false,contextLost=false;
    let frame=0,last=0,lastDraw=0,time=0,particles=[],layout=null,qualityDpr=1.5,lockedTime=null;
    const seed=crypto.getRandomValues(new Uint32Array(1))[0],weather=createWind(seed);
    let wind=weather.sample(0);
    const target={x:0,y:0},pointer={x:0,y:0};
    const stats={frames:0,sceneFrames:0,status:'static',lastError:null,drawMs:[],loadCount:0};
    const mode=()=>narrow.matches?'mobile':'desktop';
    const status=value=>{if(stats.status!==value){stats.status=value;host.dataset.sceneState=value;}};
    const shouldRun=()=>pageActive&&visible&&!document.hidden&&isHome()&&!isPaused()&&!reduced.matches&&!failed&&!contextLost;

    function resize() {
      const box=sceneCanvas.getBoundingClientRect();
      if(!box.width||!box.height||!manifest||!variant)return;
      const mobile=variant==='mobile',config=manifest[variant];
      const dpr=Math.min(devicePixelRatio||1,mobile?manifest.limits.mobileDpr:qualityDpr);
      const width=Math.round(box.width*dpr),height=Math.round(box.height*dpr);
      if(sceneCanvas.width!==width||sceneCanvas.height!==height) {sceneCanvas.width=width;sceneCanvas.height=height;}
      // The effect canvas spans the whole flowing mobile hero, not just the art.
      const effectsBox=host.getBoundingClientRect();
      if(ctx) {atmosphereCanvas.width=Math.round(effectsBox.width*dpr);atmosphereCanvas.height=Math.round(effectsBox.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
      const scale=Math.max(box.width/config.size[0],box.height/config.size[1])*config.overscan;
      layout={width:box.width,height:box.height,scale,x:(box.width-config.size[0]*scale)*config.anchor[0],y:(box.height-config.size[1]*scale)*config.anchor[1]};
      const random=seededRandom(seed+(mobile?1:0));
      particles=Array.from({length:mobile?20:45},(_,index)=>({x:random()*(effectsBox.width+64),y:random()*(effectsBox.height+64),
        size:2+random()*(index%4===0?5:2.5),speed:.6+random()*.9,fall:7+random()*12,phase:random()*6.28,rotation:random()*6,
        maple:index%3!==0,color:['#db3448','#ab1730','#ef6867','#78243a'][index%4]}));
    }
    function project(x,y) {return [x*manifest[variant].size[0]*layout.scale+layout.x,y*manifest[variant].size[1]*layout.scale+layout.y];}
    function drawEffects() {
      if(!ctx||!layout)return;
      const width=host.clientWidth,height=host.clientHeight,mobile=variant==='mobile',ramp=smooth(0,2.5,time),effect=manifest.effects[variant];
      ctx.clearRect(0,0,width,height);
      // Thin drifting mist over the river. Keep the text-side calm.
      const [fx,fy]=project(.78,effect.fogY);
      const fogWidth=layout.width*.50, fogHeight=layout.height*.055;
      for(let i=0;i<2;i++) {
        const drift=Math.sin(wind.phase*.10+i*2)*layout.width*.06;
        ctx.save();ctx.translate(fx+drift,fy+i*fogHeight);ctx.scale(fogWidth,fogHeight);
        const gradient=ctx.createRadialGradient(0,0,0,0,0,1);
        gradient.addColorStop(0,`rgba(174,128,145,${.045*ramp})`);gradient.addColorStop(1,'rgba(174,128,145,0)');
        ctx.fillStyle=gradient;ctx.fillRect(-1,-1,2,2);ctx.restore();
      }
      // Faint air currents make strong gusts visible without covering the copy.
      ctx.lineWidth=.7;ctx.strokeStyle='#e7b6b2';
      for(let i=0;i<(mobile?2:5);i++) {
        const life=wrap(wind.phase*.16+i*.227,1),envelope=Math.sin(life*Math.PI)**2;
        const [x,y]=project(1.1-life*.52,.25+i*.075);
        ctx.globalAlpha=.075*envelope*smooth(.5,1.5,wind.strength)*ramp;
        const length=(55+wind.strength*35)*layout.scale;
        ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-length*.35,y-8,x-length*.65,y+12,x-length,y+4);ctx.stroke();
      }
      for(const p of particles) {
        // Analytic paths depend on the shared clock, so pause and preview freeze
        // every leaf too. Wrap beyond the viewport; never teleport on-screen.
        const x=wrap(p.x-wind.phase*36*p.speed+Math.sin(time*.7+p.phase)*9,width+64)-32;
        const y=wrap(p.y+time*p.fall+Math.sin(wind.phase*.9+p.phase)*(10+wind.strength*8),height+64)-32;
        const copyFade=mobile?1:.35+.65*smooth(width*.3,width*.65,x);
        ctx.save();ctx.translate(x,y);ctx.rotate(p.rotation+time*.24+wind.phase*.65*p.speed);
        ctx.scale(p.size,p.size*(.28+.72*Math.abs(Math.cos(wind.phase*1.2+p.phase))));
        ctx.globalAlpha=(.24+p.speed*.16)*ramp*copyFade;ctx.fillStyle=p.color;ctx.beginPath();
        if(p.maple) {
          ctx.moveTo(0,.8);ctx.lineTo(-.28,.3);ctx.lineTo(-1,.12);ctx.lineTo(-.55,-.16);ctx.lineTo(-.72,-.72);ctx.lineTo(-.22,-.48);
          ctx.lineTo(0,-1.2);ctx.lineTo(.25,-.48);ctx.lineTo(.78,-.72);ctx.lineTo(.58,-.1);ctx.lineTo(1,.15);ctx.lineTo(.28,.34);ctx.closePath();
        } else {ctx.moveTo(-1,0);ctx.quadraticCurveTo(0,-1.2,1,0);ctx.quadraticCurveTo(0,.7,-1,0);}
        ctx.fill();ctx.strokeStyle=p.color;ctx.lineWidth=.12;ctx.beginPath();ctx.moveTo(0,.3);ctx.lineTo(.14,1.15);ctx.stroke();ctx.restore();
      }
      // Distant birds: small silhouettes, slow right-to-left flight.
      ctx.strokeStyle='#190e19';ctx.lineWidth=1;ctx.globalAlpha=.65*ramp;
      for(let i=0;i<(mobile?4:10);i++) {
        const x=.66+((i*.057-time*.0018+10)% .45),y=.18+(i%4)*.027+Math.sin(time*.14+i)*.006;
        const [bx,by]=project(x,y),span=(2.5+i%3)*Math.min(layout.scale,1.5),flap=Math.sin(time*1.8+i)*span*.28;
        ctx.beginPath();ctx.moveTo(bx-span,by+flap);ctx.quadraticCurveTo(bx-span*.5,by-span*.45,bx,by);ctx.quadraticCurveTo(bx+span*.5,by-span*.45,bx+span,by+flap);ctx.stroke();
      }
      ctx.globalAlpha=1;
      // Short, infrequent katana glint, with a full fade before each loop reset.
      const cycle=(time%9)/9,glint=Math.max(0,1-Math.abs(cycle-.5)*18)*.36*ramp;
      if(glint>0) {
        const [a,b]=effect.blade, t=clamp((cycle-.44)/.12),p=project(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);
        const config=manifest[variant],character=config.layers.at(-1),v=( (a[1]+(b[1]-a[1])*t)*config.size[1]-character.rect[1])/character.rect[3];
        const pose=bodyPose(time,wind),weight=poseWeight(v)*ramp;
        p[0]+=(pose.x*weight-pointer.x*character.depth*.5)*layout.scale;p[1]+=(pose.y*weight-pointer.y*character.depth*.5)*layout.scale;
        ctx.strokeStyle=`rgba(255,207,184,${glint})`;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(p[0]-2,p[1]-3);ctx.lineTo(p[0]+2,p[1]+3);ctx.stroke();
      }
    }
    function draw(dt) {
      if(!ready||!layout||!renderer)return;
      const start=performance.now(),mobile=variant==='mobile';
      wind=weather.sample(time);
      renderer.draw(time,layout,pointer,manifest.effects[variant],mobile,wind);drawEffects();stats.frames++;stats.sceneFrames++;
      stats.drawMs.push(performance.now()-start);if(stats.drawMs.length>120)stats.drawMs.shift();
      // Reduce fill cost when rendering itself is consistently expensive.
      if(stats.drawMs.length===120&&stats.frames%120===0&&qualityDpr>1&&stats.drawMs.reduce((a,b)=>a+b,0)/120>22){qualityDpr=1;resize();}
    }
    function tick(now) {
      frame=0;
      if(!shouldRun()||!ready)return;
      const fps=variant==='mobile'?manifest.limits.mobileFps:manifest.limits.desktopFps;
      if(now-lastDraw>=1000/fps-1) {
        const dt=Math.min((now-last)/1000,.05);last=now;lastDraw=now;
        if(lockedTime===null)time+=dt;
        const ease=1-Math.exp(-5*dt);pointer.x+=(target.x-pointer.x)*ease;pointer.y+=(target.y-pointer.y)*ease;
        draw(dt);
      }
      frame=requestAnimationFrame(tick);
    }
    function stop() {if(frame)cancelAnimationFrame(frame);frame=0;last=0;lastDraw=0;}
    function hideScene() {sceneCanvas.classList.remove('scene-ready');ctx?.clearRect(0,0,host.clientWidth,host.clientHeight);}
    async function load() {
      if(loading)return;
      const requested=mode();
      aborter=new AbortController();const signal=aborter.signal;
      const task=(async()=>{
        status('loading');hideScene();ready=false;
        renderer ||= new LayerRenderer(sceneCanvas);
        if(!manifest){const response=await fetch('assets/layers/layers.json',{signal});if(!response.ok)throw new Error('Scene manifest unavailable');manifest=await response.json();}
        const config=manifest[requested];
        const images=await Promise.all(config.layers.map(layer=>loadImage(layer.file,signal)));
        if(signal.aborted||contextLost||mode()!==requested)return;
        renderer.build(config,manifest,images);variant=requested;ready=true;failed=false;stats.loadCount++;
        time=0;pointer.x=pointer.y=target.x=target.y=0;resize();draw(0);
        if(!reduced.matches&&isHome()){sceneCanvas.classList.add('scene-ready');}
      })();
      loading=task;
      try {await task;}
      catch(error) {
        if(error.name!=='AbortError') {failed=true;stats.lastError=error.message;renderer?.release();hideScene();status('fallback');}
      } finally {if(loading===task)loading=null;update();}
    }
    function update() {
      const button=host.querySelector('.motion-toggle'),paused=isPaused();
      button.setAttribute('aria-pressed',String(paused));button.setAttribute('aria-label',paused?'Resume ambient motion':'Pause ambient motion');
      host.querySelector('.motion-label').textContent=paused?'RESUME MOTION':'PAUSE MOTION';
      if(reduced.matches){stop();hideScene();status('reduced-motion');return;}
      if(ready&&variant!==mode()) {stop();ready=false;hideScene();aborter?.abort();}
      if(!isHome()||document.hidden||!visible||!pageActive){stop();status('suspended');return;}
      if(paused){stop();status('paused');return;}
      if(failed||contextLost){stop();status(contextLost?'context-lost':'fallback');return;}
      if(!ready){if(!loading)void load();return;}
      sceneCanvas.classList.add('scene-ready');status('running');
      if(!frame){last=performance.now();lastDraw=0;frame=requestAnimationFrame(tick);}
    }
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();});intersection.observe(host);
    const resizeObserver=new ResizeObserver(()=>{resize();update();});resizeObserver.observe(host);
    const onPointer=event=>{if(!fine.matches||narrow.matches||!shouldRun()||!ready)return;const rect=host.getBoundingClientRect();target.x=clamp(event.clientX/rect.width-.5,-.5,.5)*2;target.y=clamp((event.clientY-rect.top)/rect.height-.5,-.5,.5)*2;};
    const resetPointer=()=>{target.x=target.y=0;};
    host.addEventListener('pointermove',onPointer,{passive:true});host.addEventListener('pointerleave',resetPointer);
    document.addEventListener('visibilitychange',update);
    reduced.addEventListener('change',update);narrow.addEventListener('change',()=>{aborter?.abort();failed=false;update();});fine.addEventListener('change',()=>{resetPointer();update();});
    window.addEventListener('pagehide',()=>{pageActive=false;update();});window.addEventListener('pageshow',()=>{pageActive=true;update();});
    sceneCanvas.addEventListener('webglcontextlost',event=>{event.preventDefault();contextLost=true;ready=false;stop();hideScene();status('context-lost');});
    sceneCanvas.addEventListener('webglcontextrestored',()=>{contextLost=false;failed=false;renderer=null;variant=null;update();});
    return Object.freeze({
      update,
      inspect:()=>({status:stats.status,variant,ready,frames:stats.frames,sceneFrames:stats.sceneFrames,loadCount:stats.loadCount,
        activeLoop:Boolean(frame),time,paused:isPaused(),reducedMotion:reduced.matches,pointer:{...pointer},
        wind:{...wind,seed},leafCount:particles.length,bodyPose:bodyPose(time,wind),
        textureBytes:renderer?.textureBytes||0,backBufferBytes:sceneCanvas.width*sceneCanvas.height*4,
        layerCount:renderer?.layers.length||0,lastError:stats.lastError,meanDrawMs:stats.drawMs.length?stats.drawMs.reduce((a,b)=>a+b,0)/stats.drawMs.length:0}),
      // Deterministic preview for artwork/motion inspection, without changing preferences.
      previewAt:seconds=>{if(!ready)return false;stop();lockedTime=Math.max(0,Number(seconds)||0);time=lockedTime;pointer.x=pointer.y=0;target.x=target.y=0;draw(0);status('preview');return true;},
      resume:()=>{lockedTime=null;update();},
      inspectMask:(name,x,y)=>windWeight(manifest?.maskDefinitions[name],x,y),
      inspectPose:v=>poseWeight(v),
      inspectWind:seconds=>weather.sample(Math.max(0,Number(seconds)||0)),
    });
  };
})();
