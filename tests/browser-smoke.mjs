import fs from 'node:fs';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const evidence='.artifacts';fs.mkdirSync(evidence,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173'],{stdio:'ignore'});
let browser;
try {
 for(let i=0;i<40;i++){try{const r=await fetch('http://127.0.0.1:4173');if(r.ok)break}catch{}await new Promise(r=>setTimeout(r,250))}
 browser=await puppeteer.launch({executablePath:'/home/huyadmin/.cache/puppeteer/chrome-headless-shell/linux-154.0.8037.57/chrome-headless-shell-linux64/chrome-headless-shell',headless:true,args:['--no-sandbox','--disable-dev-shm-usage'],env:{...process.env,LD_LIBRARY_PATH:'/mnt/data1/Projects/edtech-ai-portfolio/.agent-worktrees/local-team01/.artifacts/browser-libs/root/usr/lib/x86_64-linux-gnu'}});
 for (const [asset,type] of [['/favicon.svg','image/svg+xml'],['/robots.txt','text/plain'],['/sitemap.xml','xml']]) {
  const response=await fetch('http://127.0.0.1:4173'+asset);
  assert.equal(response.status,200);assert.ok(response.headers.get('content-type').includes(type));
 }
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const findings=[];
 for(const width of [360,1280]){
  await page.setViewport({width,height:900});await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle0'});
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,title:document.title,text:document.body.innerText.slice(0,200)}));
  assert.equal(layout.scrollWidth<=width,true,'Horizontal overflow at '+width);findings.push(layout);
  await page.screenshot({path:evidence+'/login-'+width+'.png',fullPage:true});
 }
 await page.click('button[type="submit"]');
 await page.waitForFunction(()=>document.body.innerText.includes('Dịch vụ xác thực chưa được cấu hình.'));
 assert.equal(await page.evaluate(()=>!!sessionStorage.getItem('smarttax_user_auth')),false);
 await page.goto('http://127.0.0.1:4173/admin',{waitUntil:'networkidle0'});
 await page.click('button[type="submit"]');
 await page.waitForFunction(()=>document.body.innerText.includes('Vui lòng đăng nhập tài khoản quản trị trước.'));
 assert.equal(errors.length,0,JSON.stringify(errors));
 fs.writeFileSync(evidence+'/browser-smoke.json',JSON.stringify({status:'PASS',findings,errors,checks:['desktop/mobile no overflow','login fail closed','admin denies missing token','no runtime exceptions']},null,2));
 console.log('Browser smoke 4 checks passed; desktop/mobile screenshots saved');
} finally {if(browser)await browser.close();server.kill('SIGTERM')}
