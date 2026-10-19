"""Browser checks for the scene lifecycle, localized motion, and fallbacks.

Requires local preview :8000, geckodriver :4444, and Python websockets.
Artifacts remain in ignored output/qa/. Uses a disposable Firefox profile.
"""
import argparse
import base64
import json
import time
import urllib.request
from pathlib import Path
from websockets.sync.client import connect

OUT = Path(__file__).resolve().parent.parent / 'output/qa'
OUT.mkdir(parents=True, exist_ok=True)
parser=argparse.ArgumentParser()
parser.add_argument('--case',choices=['active','reduced','no-webgl','missing','all'],default='all')
args=parser.parse_args()
results={}


def http(method,path,data=None):
    body=None if data is None else json.dumps(data).encode()
    req=urllib.request.Request('http://127.0.0.1:4444'+path,data=body,method=method,headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=60) as response:return json.load(response)['value']
    except urllib.error.HTTPError as error:
        raise RuntimeError(error.read().decode()) from error


class Browser:
    def __init__(self,case):
        prefs={'ui.prefersReducedMotion':1 if case=='reduced' else 0,
               'webgl.force-enabled':True,'webgl.disabled':case=='no-webgl',
               'gfx.webrender.software':True,'browser.newtabpage.enabled':False}
        result=http('POST','/session',{'capabilities':{'alwaysMatch':{'browserName':'firefox','webSocketUrl':True,
                    'moz:firefoxOptions':{'binary':'/usr/bin/firefox','args':['-headless'],'prefs':prefs}}}})
        self.base='/session/'+result['sessionId'];self.ws=connect(result['capabilities']['webSocketUrl'],proxy=None);self.sequence=0
        self.version=result['capabilities']['browserVersion'];self.checks=[]
    def cmd(self,method,path,data=None):return http(method,self.base+path,data)
    def js(self,code,*args):return self.cmd('POST','/execute/sync',{'script':code,'args':list(args)})
    def bidi(self,method,params):
        self.sequence+=1;self.ws.send(json.dumps({'id':self.sequence,'method':method,'params':params}))
        while True:
            result=json.loads(self.ws.recv(timeout=30))
            if result.get('id')==self.sequence:
                if result.get('type')=='error':raise RuntimeError(result)
                return result['result']
    def viewport(self,w,h):
        context=self.bidi('browsingContext.getTree',{})['contexts'][0]['context']
        self.bidi('browsingContext.setViewport',{'context':context,'viewport':{'width':w,'height':h},'devicePixelRatio':1})
    def wait(self,expression,seconds=15):
        deadline=time.monotonic()+seconds
        while time.monotonic()<deadline:
            if self.js('return !!('+expression+')'):return
            time.sleep(.1)
        raise AssertionError('Timed out: '+expression+'; diagnostics: '+str(self.js('return window.KageScene?.inspect()')))
    def check(self,name,expression):
        assert self.js('return !!('+expression+')'),name
        self.checks.append(name);print('PASS:',name,flush=True)
    def screenshot(self,name):
        time.sleep(.7)
        (OUT/(name+'.png')).write_bytes(base64.b64decode(self.cmd('GET','/screenshot')))
    def close(self):
        self.ws.close();self.cmd('DELETE','')


cases=['active','reduced','no-webgl','missing'] if args.case=='all' else [args.case]
for case in cases:
    browser=Browser(case);b=browser
    try:
        b.viewport(1586,992)
        if case=='active':
            # Model a desktop mouse independently of headless OS input devices.
            b.bidi('script.addPreloadScript',{'functionDeclaration':'''() => {
              const native=window.matchMedia;
              window.matchMedia=query=>{const result=native.call(window,query);
                if(query==='(pointer:fine)')Object.defineProperty(result,'matches',{get:()=>true});
                return result;};
              // Stable weather fixtures; production still chooses a new seed.
              const random=crypto.getRandomValues.bind(crypto);
              crypto.getRandomValues=array=>{if(array instanceof Uint32Array && array.length===1){array[0]=0x4b414745;return array;}return random(array);};
            }'''})
        if case=='missing':
            b.bidi('script.addPreloadScript',{'functionDeclaration':'''() => {
              const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
              Object.defineProperty(HTMLImageElement.prototype,'src',{configurable:true,get:descriptor.get,set(value){
                descriptor.set.call(this,value.includes('/layers/runtime/ronin.webp')?'assets/layers/runtime/missing-for-qa.webp':value);
              }});
            }'''})
        b.cmd('POST','/url',{'url':'http://127.0.0.1:8000/#home'})
        b.wait('window.KageScene && document.querySelector(".hero-art img").complete')
        if case=='active':
            b.wait('KageScene.inspect().status === "running" || KageScene.inspect().status === "fallback"')
            info=b.js('return KageScene.inspect()')
            assert info['status']=='running','WebGL scene did not start: '+str(info)
            b.check('Four desktop layers render','KageScene.inspect().layerCount === 4')
            b.check('No WebGL errors','document.querySelector("#hero-scene").getContext("webgl").getError() === 0')
            b.check('Ronin torso wind weight is zero','KageScene.inspectMask("cloth",850,620)[0] === 0')
            b.check('Ronin hat wind weight is zero','KageScene.inspectMask("cloth",830,450)[0] === 0')
            b.check('Cloth tips have localized wind','KageScene.inspectMask("cloth",660,600)[0] > .5')
            b.check('Lower ground remains anchored','KageScene.inspectMask("grass",300,940)[0] === 0')
            b.check('Layer textures plus color buffer fit budget','KageScene.inspect().textureBytes + KageScene.inspect().backBufferBytes < 250000000')
            b.check('Silhouette feet stay pinned while the upper body can sway','KageScene.inspectPose(1) === 0 && KageScene.inspectPose(.95) === 0 && KageScene.inspectPose(.05) === 1')
            b.js('window.__weatherSamples=Array.from({length:721},(_,i)=>({t:i*.25,...KageScene.inspectWind(i*.25)}))')
            b.check('Random weather includes calm, mild, breezy and gust conditions','new Set(__weatherSamples.map(w=>w.regime)).size === 4')
            b.check('Gusts vary leaf speed by more than threefold','Math.max(...__weatherSamples.map(w=>w.speed)) > Math.min(...__weatherSamples.map(w=>w.speed))*3')
            b.check('Wind transitions are smooth and strength remains bounded','__weatherSamples.every((w,i)=>w.strength >= .12 && w.strength <= 1.58 && (!i || Math.abs(w.strength-__weatherSamples[i-1].strength)<.31))')
            b.check('Wind phase stays continuous across every weather boundary','Array.from({length:18001},(_,i)=>{const t=i*.01,w=KageScene.inspectWind(t),next=KageScene.inspectWind(t+.001);return Math.abs((next.phase-w.phase)/.001-w.speed)<.002}).every(Boolean)')
            b.check('Random weather has irregular change intervals','new Set(__weatherSamples.filter((w,i)=>i && w.regime!==__weatherSamples[i-1].regime).map((w,i,a)=>i?Math.round((w.t-a[i-1].t)*4):0)).size > 3')
            b.check('Weather seeks reproduce the same state','JSON.stringify(KageScene.inspectWind(37.25)) === JSON.stringify(KageScene.inspectWind(37.25))')
            b.js('window.__calmTime=__weatherSamples.reduce((a,b)=>a.strength<b.strength?a:b).t;window.__gustTime=__weatherSamples.reduce((a,b)=>a.strength>b.strength?a:b).t;KageScene.previewAt(__calmTime)');b.screenshot('animated-calm')
            b.js('KageScene.previewAt(__gustTime)');b.screenshot('animated-gust')
            b.check('Desktop leaf budget is bounded','KageScene.inspect().leafCount === 45')
            b.js('KageScene.previewAt(11);window.__leafFrame=document.querySelector("#atmosphere").toDataURL();window.__pose=KageScene.inspect().bodyPose;KageScene.previewAt(29)')
            b.check('Silhouette motion changes naturally and remains subtle','Math.abs(KageScene.inspect().bodyPose.x-__pose.x)>.01 && Math.abs(KageScene.inspect().bodyPose.x)<2.2 && Math.abs(KageScene.inspect().bodyPose.y)<.33')
            b.js('KageScene.previewAt(11)')
            b.check('Leaf tumbling and paths reproduce when seeking backward','document.querySelector("#atmosphere").toDataURL() === __leafFrame')
            b.js('KageScene.previewAt(0)');b.screenshot('animated-rest')
            b.js('KageScene.previewAt(4)');b.screenshot('animated-wind-4s')
            b.js('KageScene.previewAt(8)');b.screenshot('animated-wind-8s')
            b.js('KageScene.resume()');before=b.js('return KageScene.inspect().frames');time.sleep(.5)
            b.check('Animation advances through real frames',f'KageScene.inspect().frames > {before}+3')
            b.js('document.querySelector("#landing").dispatchEvent(new PointerEvent("pointermove",{clientX:1450,clientY:550,bubbles:true}))')
            b.wait('KageScene.inspect().pointer.x > .15')
            b.check('Fine-pointer depth follows desktop input','KageScene.inspect().pointer.x > .15')
            b.js('document.querySelector("#landing").dispatchEvent(new PointerEvent("pointerleave"))')
            b.wait('Math.abs(KageScene.inspect().pointer.x) < .02')
            b.js('KageScene.previewAt(21600)');b.check('Long-running phase values render without GL errors','document.querySelector("#hero-scene").getContext("webgl").getError() === 0');b.js('KageScene.resume()')
            b.js('document.querySelector("[data-action=motion]").click();window.__frozenWeather=JSON.stringify(KageScene.inspect().wind)');frozen=b.js('return KageScene.inspect().frames');time.sleep(.2)
            b.check('Pause stops the complete scene',f'!KageScene.inspect().activeLoop && KageScene.inspect().frames === {frozen}')
            b.check('Pause freezes randomized wind as well as leaves','JSON.stringify(KageScene.inspect().wind) === __frozenWeather')
            b.js('document.querySelector("[data-action=motion]").click()');b.wait('KageScene.inspect().activeLoop')
            b.js('location.hash="learn"');b.wait('document.body.dataset.route === "learn"')
            b.check('Other routes stop the animation','!KageScene.inspect().activeLoop')
            b.js('location.hash="home"');b.wait('KageScene.inspect().activeLoop')
            b.js('const spacer=document.createElement("div");spacer.id="qa-spacer";spacer.style.height="1500px";document.body.append(spacer);window.scrollTo(0,1200)')
            b.wait('!KageScene.inspect().activeLoop')
            b.check('Offscreen hero suspends rendering','KageScene.inspect().status === "suspended"')
            b.js('document.querySelector("#qa-spacer").remove();window.scrollTo(0,0)');b.wait('KageScene.inspect().activeLoop')
            context=b.bidi('browsingContext.getTree',{})['contexts'][0]['context']
            old=b.cmd('GET','/window');new=b.cmd('POST','/window/new',{'type':'tab'})['handle']
            b.cmd('POST','/window',{'handle':new});time.sleep(.3)
            hidden=b.bidi('script.evaluate',{'expression':'JSON.stringify({hidden:document.hidden,loop:KageScene.inspect().activeLoop})','target':{'context':context},'awaitPromise':False})
            hidden=json.loads(hidden['result']['value'])
            assert hidden['hidden'] and not hidden['loop'],'Inactive tab still rendering: '+str(hidden)
            b.checks.append('Inactive tab suspends rendering');print('PASS: Inactive tab suspends rendering',flush=True)
            b.cmd('POST','/window',{'handle':old});b.wait('KageScene.inspect().activeLoop')
            b.js('window.__qaLoss=document.querySelector("#hero-scene").getContext("webgl").getExtension("WEBGL_lose_context");__qaLoss.loseContext()')
            b.wait('KageScene.inspect().status === "context-lost"')
            b.check('Context loss reveals static artwork','!document.querySelector("#hero-scene").classList.contains("scene-ready") && !KageScene.inspect().activeLoop')
            b.js('__qaLoss.restoreContext()');b.wait('KageScene.inspect().status === "running"')
            b.check('Context restoration rebuilds resources','KageScene.inspect().ready && KageScene.inspect().layerCount === 4')
            b.viewport(390,844);b.wait('KageScene.inspect().variant === "mobile" && KageScene.inspect().ready')
            b.check('Mobile uses its own two-layer composition','KageScene.inspect().layerCount === 2')
            b.check('Mobile has a smaller leaf budget and shares variable wind','KageScene.inspect().leafCount === 20 && KageScene.inspect().wind.speed > 0')
            b.check('Phone pointer parallax is disabled','KageScene.inspect().pointer.x === 0 && KageScene.inspect().pointer.y === 0')
            before=b.js('return KageScene.inspect().frames');time.sleep(1)
            delta=b.js('return KageScene.inspect().frames')-before
            assert 2<=delta<=35,'Unexpected mobile frame count: '+str(delta)
            b.checks.append('Mobile rendering is capped near 30 fps');print('PASS: Mobile rendering is capped near 30 fps',flush=True)
            b.js('KageScene.previewAt(5)');b.screenshot('animated-mobile')
            b.check('Mobile layout has no horizontal overflow','document.documentElement.scrollWidth <= innerWidth')
            b.viewport(1586,992);b.wait('KageScene.inspect().variant === "desktop" && KageScene.inspect().ready')
            b.check('Resize restores the desktop layer set','KageScene.inspect().layerCount === 4')
        elif case=='reduced':
            b.check('Reduced motion uses the static scene','KageScene.inspect().reducedMotion && !KageScene.inspect().activeLoop')
            b.check('Reduced motion skips layer loading','KageScene.inspect().loadCount === 0 && KageScene.inspect().layerCount === 0')
            b.check('Static artwork and HTML remain visible','!document.querySelector("#landing").hidden && document.querySelector(".hero-art img").naturalWidth > 0')
            b.screenshot('scene-reduced-motion')
        else:
            b.wait('KageScene.inspect().status === "fallback"')
            b.check(case+' stops its rendering loop','!KageScene.inspect().activeLoop')
            b.check(case+' retains static artwork','document.querySelector(".hero-art img").naturalWidth > 0 && !document.querySelector("#hero-scene").classList.contains("scene-ready")')
            b.js('document.querySelector(".hero-actions .button-primary").click()');b.wait('document.body.dataset.route === "learn"')
            b.check(case+' keeps navigation usable','document.querySelectorAll(".trail-node[data-lesson]").length === 3')
        results[case]={'browser':b.version,'checks':b.checks,'diagnostics':b.js('return KageScene.inspect()')}
        (OUT/f'animation-{case}-results.json').write_text(json.dumps(results[case],indent=2)+'\n')
    finally:b.close()
print('Animation checks passed:',sum(len(r['checks']) for r in results.values()),flush=True)
