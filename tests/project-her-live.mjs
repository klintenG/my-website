// Explicit live follow-up to one already-created smoke job. No job submissions.
// Scoped credentials arrive on stdin and are never printed or written to disk.
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,existsSync,rmSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const access=JSON.parse(readFileSync(0,'utf8'));
assert.match(access.job_id,/^[a-f0-9]{32}$/);assert.match(access.token,/^[a-f0-9]{64}$/);
const site=access.site||'https://klinteng.com';
assert.equal(new URL(site).origin,'https://klinteng.com');
const driver=await import(pathToFileURL(process.env.PUPPETEER_MODULE||'/private/tmp/her-browser/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js'));
const puppeteer=driver.default;
const browser=await puppeteer.launch({headless:true,executablePath:process.env.PORTFOLIO_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const dir=mkdtempSync(join(tmpdir(),'her-native-live-download-'));let creates=0;
try{
 const page=await browser.newPage();await page.setViewport({width:1440,height:1000});
 await page.evaluateOnNewDocument(value=>{if(location.origin==='https://klinteng.com')sessionStorage.setItem('project-her-job-v1',JSON.stringify({jobId:value.job_id,token:value.token,expiresAt:value.expires_at}));},access);
 page.on('request',request=>{if(request.method()==='POST'&&request.url().endsWith('/api/portfolio/jobs'))creates++;});
 const response=await page.goto(site+'/projects/project-her/#studio',{waitUntil:'domcontentloaded',timeout:60000});assert.equal(response.status(),200);
 await page.waitForFunction(()=>document.querySelector('#her-video')?.readyState>=1,{timeout:120000});
 assert.equal(await page.$eval('#her-status',e=>e.textContent),'Your video is ready');
 await page.$eval('#her-video',async video=>{video.muted=true;await video.play();});
 await page.waitForFunction(()=>document.querySelector('#her-video').currentTime>.3);await page.$eval('#her-video',video=>video.pause());
 const cdp=await page.createCDPSession();await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:dir});
 await page.click('#her-download');const downloaded=join(dir,'project-her-'+access.job_id.slice(0,8)+'.mp4');
 const end=Date.now()+120000;
 while(!existsSync(downloaded)&&Date.now()<end)await new Promise(r=>setTimeout(r,250));
 assert.ok(existsSync(downloaded),'Actual browser attachment did not finish downloading');
 assert.equal(createHash('sha256').update(readFileSync(downloaded)).digest('hex'),access.sha256,'Browser download differs from the real smoke MP4');
 assert.ok(page.url().startsWith(site+'/projects/project-her/'),'Download navigated away from the native studio');
 assert.equal(creates,0,'Restoring the smoke job submitted another paid job');
 mkdirSync('/private/tmp/her-native-live',{recursive:true});await page.screenshot({path:'/private/tmp/her-native-live/production.png',fullPage:true});
 console.log('PASS: production portfolio restored the actual job, played its private MP4 and downloaded identical bytes without leaving klinteng.com or creating another job.');
}finally{await browser.close();rmSync(dir,{recursive:true,force:true});}
