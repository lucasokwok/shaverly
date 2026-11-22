// Node 22+; Chrome/Chromium must already be running with a dedicated debugging profile.
// No packages are installed. This operates on a test tab, not on application code.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://127.0.0.1:8000/prototypes/landing-page/';
const endpoint = process.argv[3] || 'http://127.0.0.1:9223';
const artifacts = process.argv[4] || '/tmp/shaverly-v03-checks';
await fs.mkdir(artifacts, { recursive: true });
const tabs = await (await fetch(`${endpoint}/json`)).json();
const tab = tabs.find(t => t.type === 'page');
assert.ok(tab, 'Open a dedicated test tab first');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map(), exceptions = [], requests = [], paused = [], startupScripts = [];
const summary = { viewports: [], fallbacks: [], exceptions, diagnostics: [] };
ws.addEventListener('message', ({ data }) => {
  const m = JSON.parse(data);
  if (pending.has(m.id)) {
    const [resolve, reject] = pending.get(m.id); pending.delete(m.id);
    m.error ? reject(Error(JSON.stringify(m.error))) : resolve(m.result);
  }
  if (m.method === 'Runtime.exceptionThrown') exceptions.push(m.params.exceptionDetails);
  if (m.method === 'Network.requestWillBeSent') requests.push(m.params.request.url);
  if (m.method === 'Fetch.requestPaused') paused.push(m.params.requestId);
});
function call(method, params = {}) {
  return new Promise((resolve, reject) => { pending.set(++id, [resolve, reject]); ws.send(JSON.stringify({ id, method, params })); }).then(result => {
    if (method === 'Page.addScriptToEvaluateOnNewDocument') startupScripts.push(result.identifier);
    return result;
  });
}
async function evaluate(expression) {
  const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  assert.ok(!r.exceptionDetails, JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function screenshot(name, full = false) {
  const params = { format: 'png' };
  if (full) {
    const { contentSize } = await call('Page.getLayoutMetrics');
    params.captureBeyondViewport = true;
    params.clip = { x: 0, y: 0, width: contentSize.width, height: contentSize.height, scale: 1 };
  }
  const { data } = await call('Page.captureScreenshot', params);
  await fs.writeFile(`${artifacts}/${name}.png`, Buffer.from(data, 'base64'));
}
async function load(expected = 'ready', suffix = '?debug=1') {
  await call('Page.navigate', { url: 'about:blank' });
  requests.length = 0;
  const navigation = await call('Page.navigate', { url: base + suffix });
  assert.ok(!navigation.errorText, `HTTP server unavailable: ${navigation.errorText}`);
  for (let i = 0; i < 120; i++) {
    const state = await evaluate('document.documentElement?.dataset.introState');
    if (state === expected) { await sleep(450); return; }
    if (state && state !== 'loading' && state !== 'ready') assert.equal(state, expected);
    await sleep(100);
  }
  throw Error(`Timeout waiting for ${expected}`);
}
const snapshot = () => evaluate('shaverlyDebug.snapshot()');
async function seek(progress) {
  const end = (await snapshot()).scrollEnd;
  await evaluate(`scrollTo(0,${end * progress})`);
  await sleep(100);
}
async function assertStatic(reason) {
  const state = await evaluate(`({reason:document.documentElement?.dataset.introState,canvas:document.querySelectorAll('canvas').length,pins:document.querySelectorAll('.pin-spacer').length,visible:getComputedStyle(document.querySelector('h1')).visibility,debug:!!window.shaverlyDebug})`);
  assert.equal(state.reason, reason); assert.equal(state.canvas, 0); assert.equal(state.pins, 0);
  assert.equal(state.visible, 'visible'); assert.equal(state.debug, false);
  summary.fallbacks.push(reason);
}
try {
  await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
  await call('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.localVitals={cls:0,lcp:null,longTasks:0};
    new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)localVitals.cls+=e.value})).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(l=>{localVitals.lcp=l.getEntries().at(-1)?.startTime}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(l=>{localVitals.longTasks+=l.getEntries().length}).observe({type:'longtask',buffered:true});
  ` });
  for (const [width, height] of [[320,740],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080]]) {
    const mobile = width <= 430;
    await call('Emulation.setTouchEmulationEnabled', { enabled: mobile });
    await call('Emulation.setDeviceMetricsOverride', { width, height, mobile, deviceScaleFactor: 2 });
    await load();
    const start = await snapshot();
    assert.ok(start.meshes > 0 && start.triangles === 2816);
    assert.ok(start.dpr <= (mobile ? 1.25 : 1.5));
    const page = await evaluate(`({width:document.documentElement.clientWidth,overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,heroLinks:document.querySelectorAll('.hero a').length,missingImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length})`);
    assert.equal(page.overflow, false); assert.equal(page.h1, 1); assert.equal(page.heroLinks, 0); assert.equal(page.missingImages, 0);
    assert.ok(Math.abs(start.model.x - page.width / 2) < 1 && Math.abs(start.model.y - height / 2) < 1);
    const idleBefore = start.renderCount; await sleep(150); assert.equal((await snapshot()).renderCount, idleBefore);
    for (const progress of [0,.35,.62,.68,.76,1]) {
      await seek(progress);
      const state = await snapshot();
      assert.ok(Math.abs(state.progress - progress) < .003);
      if (progress >= .62) {
        assert.ok(Math.hypot(state.model.x-state.target.x,state.model.y-state.target.y) < .1);
        assert.ok(Math.abs(state.scale-state.targetScale) < .1);
      }
      if ([390,1440].includes(width)) await screenshot(`${width}-${progress}`);
    }
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('h1')).opacity`), '1');
    await seek(0); const reversed = await snapshot();
    assert.equal(reversed.travel, 0); assert.equal(reversed.opacity, 1); assert.equal(reversed.tint, 0);
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('h1')).visibility`), 'hidden');
    // Refresh without resizing must not allocate another GPU drawing buffer.
    const beforeRefresh = (await snapshot()).bufferResizes;
    await evaluate("dispatchEvent(new Event('resize'))"); await sleep(350);
    assert.equal((await snapshot()).bufferResizes, beforeRefresh);
    await seek(1.5); const outside = (await snapshot()).renderCount; await sleep(150);
    assert.equal((await snapshot()).renderCount, outside);
    const nav = await evaluate(`Array.from(document.querySelectorAll('.header a')).map(a=>({top:a.getBoundingClientRect().top,height:a.getBoundingClientRect().height}))`);
    assert.ok(nav.every(n=>n.height>=44));
    if (mobile) assert.ok(nav[0].top<=nav[2].top && nav[1].top<=nav[2].top);
    summary.viewports.push({width,height,dpr:start.dpr,centering:true,docking:true,reverse:true,idleRenders:0});
    summary.diagnostics.push({width,...await evaluate('localVitals')});
    console.log(`PASS viewport ${width} × ${height}`);
  }
  // Resize during docking, then change orientation and seek again.
  await call('Emulation.setDeviceMetricsOverride', { width:1440,height:900,mobile:false,deviceScaleFactor:1 });
  await load(); await seek(.65);
  for (const [width,height] of [[390,844],[844,390]]) {
    await call('Emulation.setDeviceMetricsOverride', {width,height,mobile:false,deviceScaleFactor:1});
    await sleep(400); await seek(.65); const state=await snapshot();
    assert.ok(Math.hypot(state.model.x-state.target.x,state.model.y-state.target.y)<.1);
    await screenshot(`resize-${width}`);
  }
  // Keyboard skip and focus. Separate navigations avoid same-document fragment state.
  await load();
  for(let i=0;i<2;i++) {
    await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  }
  assert.equal(await evaluate('document.activeElement.textContent'), 'Pular abertura');
  assert.equal(await evaluate('getComputedStyle(document.activeElement).outlineStyle'), 'solid');
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await sleep(100); await assertStatic('skipped'); assert.equal(await evaluate('document.activeElement.id'), 'hero-title');
  // Existing navigation and actual button visual feedback.
  await evaluate(`document.querySelector('.header a[href="#demonstracao"]').click()`); await sleep(100);
  assert.equal(await evaluate('location.hash'), '#demonstracao');
  await evaluate(`document.querySelector('#proposta .button').scrollIntoView({block:'center'})`);
  const button = await evaluate(`(()=>{const e=document.querySelector('#proposta .button'),r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,bg:getComputedStyle(e).backgroundColor}})()`);
  await call('Input.dispatchMouseEvent',{type:'mouseMoved',x:button.x,y:button.y}); await sleep(200);
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('#proposta .button')).backgroundColor`), button.bg);
  await screenshot('button-hover');
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x:button.x,y:button.y,button:'left',clickCount:1}); await sleep(120);
  assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('#proposta .button')).transform`), 'none');
  await call('Input.dispatchMouseEvent',{type:'mouseReleased',x:button.x,y:button.y,button:'left',clickCount:1});
  await evaluate(`document.querySelector('.header a').focus()`);
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  assert.equal(await evaluate('document.activeElement.textContent'), 'Por dentro do Shaverly');
  await evaluate(`document.querySelector('.schedule-region').scrollLeft=100`);
  const sticky=await evaluate(`({column:document.querySelector('.schedule tbody th').getBoundingClientRect().left,region:document.querySelector('.schedule-region').getBoundingClientRect().left})`);
  assert.ok(Math.abs(sticky.column-sticky.region)<2);

  // Reduced motion: both a live preference change and initial load with zero 3D requests.
  await load(); await seek(.5);
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]}); await sleep(100);
  await assertStatic('reduced-motion'); await load('reduced-motion'); await assertStatic('reduced-motion');
  assert.equal(requests.filter(u=>/mustache|jsdelivr/.test(u)).length,0);
  await screenshot('reduced-motion');
  await call('Emulation.setEmulatedMedia',{features:[]});
  for(const pattern of ['*mustache.glb','*gsap@3.13.0*']) {
    await call('Network.setBlockedURLs',{urls:[pattern]}); await load('load-error'); await assertStatic('load-error');
  }
  await call('Network.setBlockedURLs',{urls:[]});
  const {identifier}=await call('Page.addScriptToEvaluateOnNewDocument',{source:`const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args)};`});
  await load('load-error'); await assertStatic('load-error'); await call('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  await load(); await evaluate(`document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()`); await sleep(100); await assertStatic('webgl-context-lost');
  // A cancelled GLB request resolving later must not overwrite the skipped state.
  await call('Fetch.enable',{patterns:[{urlPattern:'*mustache.glb',requestStage:'Request'}]});
  await call('Page.navigate',{url:'about:blank'});await call('Page.navigate',{url:base+'?debug=1'});
  for(let i=0;i<100 && !paused.length;i++)await sleep(100);
  assert.ok(paused.length); await evaluate(`document.querySelector('.skip-intro').click()`); await assertStatic('skipped');
  for(const requestId of paused.splice(0))await call('Fetch.failRequest',{requestId,errorReason:'Failed'});
  await call('Fetch.disable');await sleep(150);await assertStatic('skipped');
  // The watchdog must also recover a request that stalls rather than failing immediately.
  await call('Fetch.enable',{patterns:[{urlPattern:'*mustache.glb',requestStage:'Request'}]});
  await load('load-timeout'); await assertStatic('load-timeout');
  for(const requestId of paused.splice(0))await call('Fetch.failRequest',{requestId,errorReason:'Failed'});
  await call('Fetch.disable');await sleep(150);await assertStatic('load-timeout');
  const failedRender=await call('Page.addScriptToEvaluateOnNewDocument',{source:`WebGL2RenderingContext.prototype.drawElements=function(){throw new Error('Simulated render failure')}`});
  await load('render-error');await assertStatic('render-error');
  await call('Page.removeScriptToEvaluateOnNewDocument',{identifier:failedRender.identifier});
  await load('static','#demonstracao'); await assertStatic('static');
  await call('Emulation.setScriptExecutionDisabled',{value:true});
  await call('Page.navigate',{url:'about:blank'});await call('Page.navigate',{url:base});await sleep(300);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('h1')).visibility`), 'visible');
  const ax = await call('Accessibility.getFullAXTree');
  assert.ok(ax.nodes.some(n=>n.role?.value==='heading'&&n.name?.value==='Seu negócio no ritmo certo.'));
  await screenshot('no-js',true);await call('Emulation.setScriptExecutionDisabled',{value:false});
  assert.equal(exceptions.length,0,JSON.stringify(exceptions));
  await fs.writeFile(`${artifacts}/results.json`,JSON.stringify(summary,null,2));
  console.log(`PASS interaction, fallbacks, lifecycle and no uncaught exceptions. Artifacts: ${artifacts}`);
} finally {
  for (const identifier of startupScripts) await call('Page.removeScriptToEvaluateOnNewDocument',{identifier}).catch(()=>{});
  await call('Fetch.disable').catch(()=>{});
  await call('Network.setBlockedURLs',{urls:[]}).catch(()=>{});
  await call('Emulation.setScriptExecutionDisabled',{value:false}).catch(()=>{});
  ws.close();
}
