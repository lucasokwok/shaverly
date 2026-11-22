// Dedicated Chromium profile with CDP; native Node only. Includes a real 30-second wait.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.argv[2] || 'http://127.0.0.1:8000/prototypes/landing-page/';
const endpoint = process.argv[3] || 'http://127.0.0.1:9223';
const artifacts = process.argv[4] || '/tmp/shaverly-pointer-checks';
await fs.mkdir(artifacts,{recursive:true});
const tabs=await(await fetch(`${endpoint}/json`)).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[],requests=[];
ws.addEventListener('message',({data})=>{
 const m=JSON.parse(data);
 if(pending.has(m.id)){const[r,j]=pending.get(m.id);pending.delete(m.id);m.error?j(Error(JSON.stringify(m.error))):r(m.result);}
 if(m.method==='Runtime.exceptionThrown')errors.push(m.params);
 if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);
});
const call=(method,params={})=>new Promise((r,j)=>{pending.set(++id,[r,j]);ws.send(JSON.stringify({id,method,params}));});
const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const snapshot=()=>ev('shaverlyDebug.snapshot()');
const hint=()=>ev('shaverlyHintDebug.snapshot()');
const distance=(a,b)=>2*Math.acos(Math.min(1,Math.abs(a.reduce((v,n,i)=>v+n*b[i],0))));
async function load(expected='ready') {
 await call('Page.navigate',{url:'about:blank'});requests.length=0;
 await call('Page.navigate',{url:base+'?debug=1'});
 for(let i=0;i<120;i++){
  if(await ev('document.documentElement?.dataset.introState')===expected){await sleep(200);return;}
  await sleep(100);
 }
 throw Error(`Expected ${expected}`);
}
async function move(x,y,delay=10){await call('Input.dispatchMouseEvent',{type:'mouseMoved',x,y,button:'none'});if(delay)await sleep(delay);}
async function settle(){
 for(let i=0;i<40;i++){
  const a=await snapshot();await sleep(120);const b=await snapshot();
  if(distance(b.pointerQuaternion,b.pointerTarget)<.001 && a.renderCount===b.renderCount)return b;
 }
 throw Error('Pointer did not settle');
}
async function seek(p){const s=await snapshot();await ev(`scrollTo(0,${s.scrollEnd*p})`);await sleep(120);return snapshot();}
async function shot(name){const{data}=await call('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${artifacts}/${name}.png`,Buffer.from(data,'base64'));}
const result={};
try{
 await call('Page.enable');await call('Runtime.enable');await call('Network.enable');
 await call('Emulation.setTouchEmulationEnabled',{enabled:false});
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await load();
 // A horizontal traverse makes the back face the camera, without any button press.
 await move(144,450);assert.equal((await snapshot()).pointerEnabled,true);
 for(let i=1;i<=40;i++)await move(144+1008*i/40,450);
 const back=await settle();const[x,y]=back.orientation;
 result.backNormalZ=1-2*(x*x+y*y);
 assert.ok(result.backNormalZ<-.85,`Back face not visible: ${result.backNormalZ}`);
 await shot('back');
 result.backQuaternion=back.pointerQuaternion;
 assert.ok(Math.abs(back.light[0]+3)>.2);
 // Scroll must gradually remove any interactive orientation and light offset.
 const entering=await seek(.002);
 assert.ok(distance(entering.pointerQuaternion,back.pointerQuaternion)<.02);
 const corrected=await seek(.13);
 assert.ok(distance(corrected.pointerQuaternion,[0,0,0,1])<.0001);
 assert.deepEqual(corrected.light,[-3,4,6]);
 const targetBefore=corrected.pointerTarget;
 for(let i=0;i<10;i++)await move(200+i*90,200+i*20);
 assert.ok(distance((await snapshot()).pointerTarget,targetBefore)<.0001);
 const docked=await seek(.68);
 assert.ok(Math.hypot(docked.model.x-docked.target.x,docked.model.y-docked.target.y)<.1);
 await shot('dock-after-back');
 const reversed=await seek(0);
 assert.ok(distance(reversed.pointerQuaternion,back.pointerQuaternion)<.0001);
 await move(400,250); // First point anchors; no jump from a stale cursor position.
 assert.ok(distance((await settle()).pointerQuaternion,back.pointerQuaternion)<.0001);
 await move(450,280);assert.ok(distance((await settle()).pointerQuaternion,back.pointerQuaternion)>.05);
 console.log('PASS back view, handover, frozen input, docking and reverse');
 // Isolate pitch and circular roll in fresh documents.
 await load();await move(720,90);
 for(let i=1;i<=40;i++)await move(720,90+630*i/40);
 const pitch=await settle();assert.ok(Math.abs(pitch.pointerQuaternion[0])>.5);result.pitch=pitch.pointerQuaternion;
 await load();await move(1020,450);
 for(let i=1;i<=80;i++){const a=i/80*Math.PI*2;await move(720+300*Math.cos(a),450+250*Math.sin(a));}
 const rolled=await settle();assert.ok(Math.abs(rolled.pointerQuaternion[2])>.05);result.circular=rolled.pointerQuaternion;
 await shot('circular-rotation');
 // Freeze what is drawn while smoothing is still in progress, not the unrendered target.
 for(let i=1;i<=5;i++)await move(1020-i*80,450,0);
 const before=await snapshot();assert.ok(distance(before.pointerQuaternion,before.pointerTarget)>.05);
 await seek(.01);const frozen=await snapshot();
 assert.ok(distance(frozen.pointerExit,before.pointerTarget)>.02);
 assert.ok(distance((await seek(.13)).pointerQuaternion,[0,0,0,1])<.0001);
 console.log('PASS pitch, roll and scroll during smoothing');
 // Touch devices keep the scroll sequence and do not react to simulated mouse paths.
 await call('Emulation.setTouchEmulationEnabled',{enabled:true});
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
 await load();assert.equal((await snapshot()).pointerEnabled,false);
 await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:60,y:350}]});
 for(let i=1;i<8;i++)await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:60+i*25,y:350}]});
 await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.deepEqual((await snapshot()).pointerQuaternion,[0,0,0,1]);
 await call('Emulation.setTouchEmulationEnabled',{enabled:false});
 await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await load();
 // Simulate the document visibility event, checking that hidden time does not accumulate.
 await ev(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))`);
 const paused=(await hint()).elapsed;await sleep(200);
 assert.ok(Math.abs((await hint()).elapsed-paused)<2);
 await ev(`delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))`);
 assert.equal((await hint()).running,true);
 await seek(.1);assert.equal((await hint()).elapsed,0);await seek(0);
 // Real wall-clock delay: pointer movement must not postpone the instruction.
 const wait=30000-(await hint()).elapsed;
 console.log('Waiting for the real 30-second hint timer…');
 await sleep(wait-500);
 assert.equal((await hint()).visible,false);
 await move(600,400);
 await sleep(800);
 assert.equal((await hint()).visible,true);assert.ok((await hint()).elapsed>=30000);
 result.hint=await hint();
 assert.equal(await ev(`document.querySelector('[data-scroll-status]').textContent`),'Role para baixo para continuar.');
 await shot('hint-30-seconds');
 await seek(.1);assert.equal((await hint()).visible,false);
 await seek(0);assert.equal((await hint()).dismissed,true);assert.equal((await hint()).visible,false);
 console.log('PASS visibility pause, timer reset, real 30 seconds, dismissal and no repeat');
 // Reduced motion still receives the instruction, without loading any 3D libraries.
 await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await load('reduced-motion');
 assert.equal(requests.filter(u=>/mustache|jsdelivr/.test(u)).length,0);
 // Test clock only: the preceding cinematic test used the real 30-second delay.
 await ev(`(()=>{const real=performance.now.bind(performance);Object.defineProperty(performance,'now',{configurable:true,value:()=>real()+30000});document.dispatchEvent(new Event('visibilitychange'))})()`);
 assert.equal((await hint()).visible,true);
 assert.equal(await ev(`getComputedStyle(document.querySelector('.scroll-hint')).animationName`),'none');
 assert.equal(await ev(`document.querySelectorAll('canvas').length`),0);
 assert.equal(errors.length,0,JSON.stringify(errors));
 result.exceptions=errors;
 await fs.writeFile(`${artifacts}/results.json`,JSON.stringify(result,null,2));
 console.log(`PASS reduced motion and no uncaught exceptions. Artifacts: ${artifacts}`);
}finally{
 await ev('delete performance.now; delete document.hidden').catch(()=>{});
 await call('Emulation.setEmulatedMedia',{features:[]}).catch(()=>{});
 await call('Emulation.setTouchEmulationEnabled',{enabled:false}).catch(()=>{});
 ws.close();
}
