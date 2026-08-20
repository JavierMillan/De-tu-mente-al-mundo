const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('C:/Users/Usuario/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const results = path.join(root, 'test-results', 'academy-hubs');
const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};

function server(){
  const instance = http.createServer((req,res)=>{
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file = path.resolve(root,'.'+pathname);
    if(pathname.endsWith('/')) file = path.join(file,'index.html');
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end('Forbidden');return;}
    fs.readFile(file,(error,body)=>{
      if(error){res.writeHead(404).end('Not found');return;}
      res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'}).end(body);
    });
  });
  return new Promise(resolve=>instance.listen(0,'127.0.0.1',()=>resolve(instance)));
}

async function inspect(browser,base,route,name,viewport){
  const context = await browser.newContext({viewport});
  const page = await context.newPage();
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+route,{waitUntil:'networkidle'});
  await page.locator('.deck-card').first().waitFor();
  const metrics = await page.evaluate(()=>{
    const rect = selector=>document.querySelector(selector).getBoundingClientRect();
    const cards=[...document.querySelectorAll('.deck-card')];
    return {
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      header:rect('.academy-shell'),hero:rect('.hub-hero'),firstRow:rect('.row-sec'),
      burger:getComputedStyle(document.querySelector('#burger')).display,
      nav:getComputedStyle(document.querySelector('#navMain')).display,
      blurred:cards.every(card=>getComputedStyle(card).backdropFilter.includes('blur')),
      cardBackground:getComputedStyle(cards[0]).backgroundColor
    };
  });
  assert.ok(metrics.overflow<=0, `${name} must not overflow at ${viewport.width}`);
  assert.ok(metrics.firstRow.top<viewport.height, `${name} first row must begin in first viewport`);
  assert.ok(metrics.blurred, `${name} cards must blur their backdrop`);
  assert.deepEqual(errors,[]);
  if(viewport.width===1440){
    assert.equal(metrics.burger,'none',`${name} desktop navigation should fit at 1440`);
    assert.notEqual(metrics.nav,'none',`${name} desktop navigation must remain visible at 1440`);
  }
  if(viewport.width===760){
    assert.notEqual(metrics.burger,'none',`${name} burger must appear when nav does not fit`);
    assert.equal(metrics.nav,'none',`${name} desktop nav must collapse`);
    await page.locator('#burger').click();
    await page.locator('#navDrawer[aria-hidden="false"]').waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#burger').getAttribute('aria-expanded'),'false');
  }
  await page.screenshot({path:path.join(results,`${name}-${viewport.width}x${viewport.height}.png`),fullPage:true});
  await context.close();
}

(async()=>{
  fs.mkdirSync(results,{recursive:true});
  const httpServer=await server();
  const base=`http://127.0.0.1:${httpServer.address().port}`;
  const browser=await chromium.launch({executablePath:edge,headless:true});
  try{
    for(const [route,name] of [['/presentacion/','dtmm'],['/ingles/','ingles']]){
      for(const viewport of [{width:1440,height:900},{width:1024,height:768},
        {width:760,height:900},{width:390,height:844}]){
        await inspect(browser,base,route,name,viewport);
      }
    }
    console.log('academy hubs browser layout: PASS');
  }finally{
    await browser.close();
    await new Promise(resolve=>httpServer.close(resolve));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
