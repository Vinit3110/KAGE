"""Local Firefox smoke checks through geckodriver's W3C WebDriver endpoint.

Start the local preview on :8000 and geckodriver on :4444 before running.
Requires the Python websockets package for exact viewport sizing. Browser state is disposable.
"""
import argparse
import base64
import json
import sys
import time
import urllib.request
from pathlib import Path
from websockets.sync.client import connect

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'output/qa'
OUT.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument('--capture-only', action='store_true')
parser.add_argument('--motion-only', action='store_true')
args = parser.parse_args()


def request(method, path, data=None):
    body = None if data is None else json.dumps(data).encode()
    req = urllib.request.Request('http://127.0.0.1:4444' + path, data=body,
                                 method=method, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=90) as response:
        return json.load(response)['value']


session = request('POST', '/session', {'capabilities': {'alwaysMatch': {
    'browserName': 'firefox', 'webSocketUrl': True,
    'moz:firefoxOptions': {'binary': '/usr/bin/firefox', 'args': ['-headless'],
                           'prefs': {'ui.prefersReducedMotion': 0 if args.motion_only else 1}},
}}})
sid = session['sessionId']
base = '/session/' + sid
checks = []
websocket = connect(session['capabilities']['webSocketUrl'], proxy=None)
command_id = 0


def bidi(method, params):
    global command_id
    command_id += 1
    websocket.send(json.dumps({'id': command_id, 'method': method, 'params': params}))
    while True:
        response = json.loads(websocket.recv(timeout=30))
        if response.get('id') == command_id:
            if response.get('type') == 'error':
                raise RuntimeError(response)
            return response['result']


def js(script, *arguments):
    return request('POST', base + '/execute/sync', {'script': script, 'args': list(arguments)})


def wait_for(script, seconds=10):
    end = time.monotonic() + seconds
    while time.monotonic() < end:
        if js('return !!(' + script + ')'):
            return
        time.sleep(.1)
    raise AssertionError('Timed out: ' + script)


def navigate(route):
    request('POST', base + '/url', {'url': 'http://127.0.0.1:8000/#' + route})
    wait_for(f'document.body.dataset.route === {json.dumps(route)}')
    request('POST', base + '/execute/async', {'script':
        'const done=arguments[arguments.length-1]; document.fonts.ready.then(()=>Promise.all([...document.images].filter(i=>i.offsetParent!==null).map(i=>i.decode().catch(()=>{})))).then(()=>done(true));', 'args': []})


def click(selector):
    element = request('POST', base + '/element', {'using': 'css selector', 'value': selector})
    element_id = element['element-6066-11e4-a52e-4f735466cecf']
    request('POST', base + '/element/' + element_id + '/click', {})


def type_value(selector, value):
    element = request('POST', base + '/element', {'using': 'css selector', 'value': selector})
    element_id = element['element-6066-11e4-a52e-4f735466cecf']
    request('POST', base + '/element/' + element_id + '/clear', {})
    request('POST', base + '/element/' + element_id + '/value', {'text': value})


def check(name, expression):
    assert js('return !!(' + expression + ')'), name
    checks.append(name)
    print('PASS:', name, flush=True)


def viewport(width, height):
    context = bidi('browsingContext.getTree', {})['contexts'][0]['context']
    bidi('browsingContext.setViewport', {'context': context,
         'viewport': {'width': width, 'height': height}, 'devicePixelRatio': 1})
    wait_for(f'innerWidth === {width} && innerHeight === {height}')


def screenshot(name):
    time.sleep(.25)
    data = request('GET', base + '/screenshot')
    (OUT / f'{name}.png').write_bytes(base64.b64decode(data))


try:
    viewport(1586, 992)
    navigate('home')
    if args.motion_only:
        wait_for('window.KageScene && KageScene.inspect().status === "running"')
        first = js('return document.querySelector("#atmosphere").toDataURL()')
        time.sleep(.3)
        check('Ambient particles animate when allowed', 'document.querySelector("#atmosphere").toDataURL() !== '+json.dumps(first))
        click('[data-action="motion"]')
        check('Pause motion control updates its state', 'document.querySelector(".motion-toggle").getAttribute("aria-pressed") === "true"')
        check('Pausing stops the full scene loop', '!KageScene.inspect().activeLoop')
        click('[data-action="motion"]')
        navigate('profile')
        check('Changing route suspends the scene', '!KageScene.inspect().activeLoop && KageScene.inspect().status === "suspended"')
        (OUT/'motion-results.json').write_text(json.dumps({'checks':checks},indent=2)+'\n')
        sys.exit(0)
    screenshot('landing-desktop')
    check('Landing artwork loaded', 'document.querySelector(".hero-art img").naturalWidth > 0')
    check('No horizontal overflow on desktop landing', 'document.documentElement.scrollWidth <= innerWidth')
    check('Fonts loaded locally', 'document.fonts.check("700 92px Cormorant")')
    check('Reduced motion leaves the particle canvas clear', '!document.querySelector("#atmosphere").getContext("2d").getImageData(0,0,1586,992).data.some((v,i)=>i%4===3&&v!==0)')
    if not args.capture_only:
        click('.hero-actions .button-primary')
        wait_for('document.body.dataset.route === "learn"')
        check('Journey CTA opens learning map', 'document.querySelectorAll("[data-lesson]").length === 3')
        click('[data-view="list"]')
        check('Accessible list view works', 'document.querySelectorAll(".list-lesson").length === 3')
        click('[data-lesson="sqli"]')
        check('Lesson dialog opens', 'document.querySelector("#modal").open')
        click('[data-lesson-stage="1"]')
        type_value('#experiment-input', "' OR '1'='1' --")
        click('#experiment-form button[type="submit"]')
        check('SQL simulation returns explanation', 'document.querySelector("#experiment-result").textContent.includes("PARAMETERIZED VERSION")')
        click('[data-lesson-stage="3"]')
        click('input[name="answer"][value="0"]')
        click('#assessment-form button')
        check('Wrong answer does not award completion', 'JSON.parse(localStorage.getItem("kage-dojo-v1") || "{}").completed?.length !== 1')
        click('input[name="answer"][value="1"]')
        click('#assessment-form button')
        check('Correct answer saves real completion', 'JSON.parse(localStorage.getItem("kage-dojo-v1")).completed.includes("sqli")')
        click('[data-action="close-modal"]')
        navigate('profile')
        check('Profile reflects completion', 'document.querySelector(".profile-stats strong").textContent === "1"')
        navigate('notes')
        click('[data-action="new-note"]')
        type_value('#note-title', 'A safe text sink')
        type_value('#note-body', '<img src=x onerror="window.__injected=true"> stays text.')
        click('#note-form button[type="submit"]')
        check('Note saved and displayed', 'document.querySelector(".note-card").textContent.includes("A safe text sink")')
        check('Note content remains inert text', '!window.__injected && !document.querySelector(".note-card img")')
        type_value('#note-search', 'unmatched-search')
        check('Note filtering works', 'document.querySelectorAll(".note-card").length === 0')
        click('[data-action="clear-notes-filter"]')
        click('.note-card')
        type_value('#note-title', 'Safe output context')
        click('#note-form button[type="submit"]')
        check('Editing a note updates it', 'document.querySelector(".note-card h2").textContent === "Safe output context"')
        request('POST', base + '/refresh', {})
        wait_for('document.querySelector(".note-card")')
        check('Notes persist across reload', 'document.querySelector(".note-card h2").textContent === "Safe output context"')
        click('[data-action="search"]')
        type_value('#global-search', 'Cross-Site')
        check('Global search finds lessons', 'document.querySelector("#search-results").textContent.includes("Cross-Site Scripting")')
        click('#search-results [data-lesson="xss"]')
        click('[data-lesson-stage="1"]')
        type_value('#experiment-input', '<img src=x onerror="window.__injected=true">')
        click('#experiment-form button[type="submit"]')
        check('XSS experiment does not execute input', '!window.__injected && document.querySelector("#experiment-result").textContent.includes("SAFE TEXT OUTPUT") && !document.querySelector("#experiment-result img")')
        click('[data-action="close-modal"]')
        navigate('practice')
        click('[data-filter="access"]')
        check('Arena filter selects relevant challenge', 'document.querySelectorAll(".challenge-card").length === 1 && document.querySelector(".challenge-card").textContent.includes("Hidden Ledger")')
        click('.challenge-card button')
        type_value('#experiment-input', '102')
        click('#experiment-form button[type="submit"]')
        check('Access-control simulation explains denied ownership', 'document.querySelector("#experiment-result").textContent.includes("no accessible record")')
        click('[data-action="close-modal"]')
        navigate('analyse')
        check('Analysis preview does not claim a scan ran', 'document.querySelector(".forge-status").textContent.includes("No scan has run")')
        navigate('notes')
        click('.note-card')
        click('[data-delete-note]')
        check('Note deletion asks for confirmation', 'document.querySelector("#modal-title").textContent.includes("Delete")')
        click('[data-confirm-delete]')
        check('Confirmed deletion removes note', 'document.querySelectorAll(".note-card").length === 0')

    # Capture clean initial-state screenshots after exercising the workflows.
    js('localStorage.removeItem("kage-dojo-v1")')
    request('POST', base + '/refresh', {})

    for current in ['learn', 'practice', 'analyse', 'notes', 'profile']:
        navigate(current)
        screenshot(current+'-desktop')
        check(current+' has no horizontal overflow', 'document.documentElement.scrollWidth <= innerWidth')
    viewport(390, 844)
    navigate('home')
    screenshot('landing-mobile')
    check('Mobile artwork selected', 'document.querySelector(".hero-art img").currentSrc.includes("crimson-mobile")')
    check('Mobile landing fits horizontally', 'document.documentElement.scrollWidth <= innerWidth')
    if not args.capture_only:
        click('.menu-toggle')
        check('Mobile navigation opens', '!document.querySelector("#mobile-nav").hidden && document.querySelector(".menu-toggle").getAttribute("aria-expanded") === "true"')
        click('#mobile-nav a[href="#learn"]')
        wait_for('document.body.dataset.route === "learn"')
        check('Mobile navigation closes after selection', 'document.querySelector("#mobile-nav").hidden')
    for current in ['learn', 'practice', 'analyse', 'notes', 'profile']:
        navigate(current)
        screenshot(current+'-mobile')
        check(current+' fits horizontally on mobile', 'document.documentElement.scrollWidth <= innerWidth')
    viewport(1366, 768)
    navigate('home')
    screenshot('landing-laptop')
    check('Laptop landing fits horizontally', 'document.documentElement.scrollWidth <= innerWidth')
    for width,height in [(320,740),(390,844),(620,900),(768,1024),(2560,1080)]:
        viewport(width,height)
        navigate('home')
        check(f'Landing at {width}px has no clipped headline', '(()=>{const title=document.querySelector(".hero-copy h1");return [...title.children].every(el=>{const r=document.createRange();r.selectNodeContents(el);return r.getBoundingClientRect().right <= innerWidth})})()')
        check(f'Landing at {width}px has separated actions and feature strip', 'document.querySelector(".hero-actions").getBoundingClientRect().bottom + 10 <= document.querySelector(".feature-strip").getBoundingClientRect().top')
    viewport(390,844)
    navigate('home')
    context = bidi('browsingContext.getTree', {})['contexts'][0]['context']
    full = bidi('browsingContext.captureScreenshot', {'context':context,'origin':'document'})
    (OUT/'landing-mobile-full.png').write_bytes(base64.b64decode(full['data']))
    sizes = js('return {width:innerWidth,height:innerHeight,fonts:document.fonts.status}')
    (OUT/('layout-results.json' if args.capture_only else 'results.json')).write_text(json.dumps({'browser':session.get('capabilities',{}).get('browserVersion'), 'checks':checks, 'last_viewport':sizes},indent=2)+'\n')
    print(f'{len(checks)} checks passed. Screenshots: {OUT}',flush=True)
finally:
    websocket.close()
    request('DELETE',base)
