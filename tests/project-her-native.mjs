// Contract/UI fixtures with the genuine approved MP4 as a playback fixture.
// All API calls are intercepted. This is never a live generation claim.
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.PUPPETEER_MODULE||'/private/tmp/her-browser/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
const {default:puppeteer}=await import(pathToFileURL(modulePath));
const site=process.env.SITE_URL||'http://127.0.0.1:8766';
const media=readFileSync(new URL('../assets/project-her/zheng-yi-sao.mp4',import.meta.url));
const browser=await puppeteer.launch({headless:true,executablePath:process.env.PORTFOLIO_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const jid='a'.repeat(32),token='b'.repeat(64),base='http://127.0.0.1:7860/api/portfolio';
const config={version:1,enabled:true,limits:{input_characters:6000,duration_seconds:90,daily_jobs:10,visitor_daily_jobs:2,concurrent_jobs:1,output_hours:48},options:{tone:['informative','storytelling','educational'],visual_style:['claymorphism','minimalism'],tts_provider:['replicate','edge_tts']},defaults:{},classic_defaults:{tts_provider:'replicate'},cancellation:{news:true,article:false}};
const access={job_id:jid,access_token:token,expires_at:Date.now()/1000+3600,status:'queued',cancel_supported:true};
const state=(status,extra={})=>({job_id:jid,status,stage:null,result:null,error:null,expires_at:access.expires_at,cancel_supported:true,cancel_requested:false,...extra});
const completed=()=>state('completed',{result:{title:'Recorded playback fixture',duration:56.128,resolution:'1080x1920',video_url:`/api/portfolio/jobs/${jid}/media/video?ticket=fixture`,download_url:`/api/portfolio/jobs/${jid}/media/video?ticket=fixture&download=1`}});
const widths=[320,375,430,768,1024,1440];let checks=0;
async function pageFor(width,scenario='success'){
 const page=await browser.newPage();const errors=[],posts=[];let statusReads=0,cancelled=false;
 page.on('pageerror',e=>errors.push(e.message));await page.setViewport({width,height:width<768?844:1000});await page.setRequestInterception(true);
 page.on('request',async req=>{
  if(!req.url().startsWith(base))return req.continue();
  const path=new URL(req.url()).pathname,headers={'Access-Control-Allow-Origin':site,'Access-Control-Allow-Headers':'Content-Type, Authorization, Idempotency-Key','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Content-Type':'application/json'};
  if(req.method()==='OPTIONS')return req.respond({status:204,headers});
  const json=(body,status=200)=>req.respond({status,headers,body:JSON.stringify(body)});
  if(path.endsWith('/config'))return json(scenario==='unavailable'?{error:'Native backend is unavailable.'}:config,scenario==='unavailable'?503:200);
  if(path.endsWith('/jobs')&&req.method()==='POST'){
   posts.push(JSON.parse(req.postData()));assert.ok(req.headers()['idempotency-key']);
   return scenario==='quota'?json({error:'Your daily generation limit has been reached.'},429):json(access,202);
  }
  if(path.endsWith('/cancel')){cancelled=true;return json({status:'cancelling'},202);}
  if(path.endsWith('/events')){
   if(scenario==='sse-failure')return json({error:'Stream unavailable'},503);
   let final=scenario==='unsafe'?{...completed(),result:{...completed().result,video_url:'https://attacker.invalid/stolen.mp4'}}:scenario==='cancel'?state('cancelled',{error:'Generation cancelled.'}):scenario==='failure'?state('failed',{error:'Narration provider unavailable.'}):completed();
   const stage=state('running',{stage:{name:'narrate',label:'Narration and word alignment',status:'running',elapsed:2.3}});
   return req.respond({status:200,headers:{...headers,'Content-Type':'text/event-stream'},body:`event: progress\ndata: ${JSON.stringify(stage)}\n\n`+(scenario==='cancel'&&!cancelled?'':`event: done\ndata: ${JSON.stringify(final)}\n\n`)});
  }
  if(path.endsWith('/media/video')){
   if(scenario==='expired')return json({error:'Output expired'},410);
   const range=req.headers().range;let start=0,end=media.length-1,status=200;
   if(range){const m=/bytes=(\d+)-(\d*)/.exec(range);if(m){start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),end):end;status=206;}}
   return req.respond({status,headers:{...headers,'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Length':String(end-start+1),...(status===206?{'Content-Range':`bytes ${start}-${end}/${media.length}`}:{})},body:media.subarray(start,end+1)});
  }
  if(path.endsWith('/jobs/'+jid)){
   assert.equal(req.headers().authorization,'Bearer '+token);statusReads++;if(scenario==='cancel'&&cancelled)return json(state('cancelled',{error:'Generation cancelled.'}));
   if(scenario==='sse-failure'&&statusReads>1)return json(completed());
   return json(state('running',{stage:{name:'script',label:'Approving script',status:'running',elapsed:.8}}));
  }
  if(path.endsWith('/submission'))return json(access);
  return json({error:'Unknown fixture route'},404);
 });
 await page.goto(site+'/projects/project-her/#studio',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#her-status').textContent!=='Checking video backend…');
 return {page,posts,errors};
}
try{
 for(const width of widths){
  const {page,posts,errors}=await pageFor(width);
  await page.waitForFunction(()=>document.querySelector('#her-status').textContent==='Ready to create');
  assert.equal(await page.$('iframe'),null);assert.ok(await page.$eval('#her-output',e=>e.hidden));assert.ok(await page.$eval('#her-generate',e=>e.disabled));
  assert.ok(!await page.$eval('.her-advanced',e=>e.open));
  await page.type('#her-input','Fictional story: a ceramic robot plants a seed.');
  await page.$eval('#her-generate',e=>e.click());
  await page.waitForFunction(()=>document.querySelector('#her-video').readyState>=1,{timeout:30000});
  assert.equal(posts.length,1);assert.equal(posts[0].content_mode,'news');assert.equal(posts[0].visual_preset,'reference_editorial');assert.equal(posts[0].tts_provider,'replicate');
  assert.ok((await page.$eval('#her-stages',e=>e.textContent)).includes('Narration and word alignment'));
  assert.ok(!await page.$eval('#her-download',e=>e.hidden));
  assert.ok(await page.$eval('#her-download',e=>e.href.includes('download=1')));
  assert.ok(await page.$eval('#her-video',e=>e.controls&&!e.autoplay&&e.videoWidth===1080&&e.videoHeight===1920));
  const stored=await page.evaluate(()=>sessionStorage.getItem('project-her-job-v1'));assert.ok(!stored.includes('ceramic'));assert.ok(stored.includes(token));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#her-video').readyState>=1,{timeout:30000});assert.equal(posts.length,1,'Refresh submitted another paid job');
  await page.$eval('#her-another',e=>e.click());assert.ok(await page.$eval('#her-output',e=>e.hidden));
  await page.type('#her-input','A revised fictional story about a cup.');await page.$eval('.her-advanced',e=>e.open=true);await page.select('#her-format','square');assert.ok(await page.$eval('#her-generate',e=>e.disabled));
  await page.select('#her-mode','article');assert.ok(!await page.$eval('#her-generate',e=>e.disabled));
  assert.equal(await page.$eval('#her-preset',e=>e.value),'default');
  await page.focus('#her-input');assert.equal(await page.evaluate(()=>document.activeElement.id),'her-input');
  assert.deepEqual(errors,[]);mkdirSync('/private/tmp/her-native-browser',{recursive:true});await page.screenshot({path:`/private/tmp/her-native-browser/studio-${width}.png`,fullPage:true});
  await page.close();checks++;
 }
 for(const scenario of ['quota','failure','unavailable','sse-failure','expired','unsafe','cancel']){
  const {page,posts,errors}=await pageFor(375,scenario);
  if(scenario==='unavailable')assert.ok(await page.$eval('#her-generate',e=>e.disabled));
  else{
   await page.type('#her-input','Fictional story: a blue bowl beside a red cup.');await page.$eval('#her-generate',e=>e.click());
   if(scenario==='cancel'){await page.waitForFunction(()=>!document.querySelector('#her-cancel').hidden);await page.click('#her-cancel');}
   await page.waitForFunction(()=>['Generation limit reached','Generation failed','Your video is ready','Video result unavailable','Video could not be loaded','Generation cancelled'].includes(document.querySelector('#her-status').textContent),{timeout:30000});
   if(scenario==='expired')await page.waitForFunction(()=>document.querySelector('#her-status').textContent==='Video could not be loaded');
   if(!['sse-failure','expired'].includes(scenario))assert.ok(await page.$eval('#her-output',e=>e.hidden));
   if(scenario==='expired')assert.ok(await page.$eval('#her-download',e=>e.hidden));
   assert.equal(posts.length,1);
  }
  assert.deepEqual(errors,[]);await page.close();checks++;
 }
 console.log(`PASS: ${checks} native UI scenarios (six widths, genuine fixture playback, scoped requests, stage events, quota/failure/unavailable, SSE-to-polling, options, keyboard and overflow). No live generation requests.`);
}finally{await browser.close();}
