const fs=require('fs'),os=require('os'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require('/Users/liuyang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
process.env.ENABLE_GM_ROUTES='1';
const {start}=require('/Users/liuyang/Documents/private/cocos_zyx/server/src/index');
const out='/Users/liuyang/Documents/private/cocos_zyx/output/releases/20261114-shop-three-181631/visual-qa';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const api=(await start(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'shop-three-browser-')),'game.sqlite'))).listen(0,'127.0.0.1');await new Promise(r=>api.once('listening',r));
 const apiBase='http://127.0.0.1:'+api.address().port;
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});const page=await context.newPage();let seeded=false,lose=false;const errors=[],exchanges=[],report={};page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.startsWith('/v1/cocos-zyx/')){
   if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'}});
   const response=await route.fetch({url:apiBase+url.pathname+url.search});const json=await response.json();
   if(url.pathname.endsWith('/players/bootstrap')&&!seeded){seeded=true;const seed=await fetch(apiBase+'/v1/cocos-zyx/debug/profile',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+json.data.token},body:JSON.stringify({moodBeanBalance:12,totalMoodBeans:12})});json.data.profile=(await seed.json()).data.profile;}
   if(url.pathname.endsWith('/shop/exchanges')){exchanges.push({request:route.request().postDataJSON(),status:response.status(),price:json.data&&json.data.price,duplicate:!!(json.data&&json.data.duplicate)});if(lose){lose=false;return route.abort('failed');}}
   return route.fulfill({response,json,headers:{...response.headers(),'access-control-allow-origin':'*'}});
  }
  if(!['localhost','127.0.0.1'].includes(url.hostname))return route.abort();return route.continue();
 });
 await page.goto('http://localhost:7458/?localApi=1&home=1',{waitUntil:'load'});
 await page.waitForFunction(()=>{function find(n){const c=(n._components||[]).find(x=>x.screen&&x.screen.name==='home');if(c){window.s=c;return true;}return(n.children||[]).some(find);}return window.cc&&cc.director.getScene()&&find(cc.director.getScene());},null,{timeout:40000});
 await page.evaluate(()=>{window.b=window.__require('ZyxGameModule').zyxGameModule;window.find=(name,n=cc.director.getScene())=>{if(n.name===name)return n;for(const c of n.children||[]){const x=window.find(name,c);if(x)return x;}return null;};window.point=name=>{const n=window.find(name),p=cc.Camera.findCamera(n).getWorldToScreenPoint(n.convertToWorldSpaceAR(cc.v2())),r=document.querySelector('canvas').getBoundingClientRect();return{x:r.left+p.x/cc.winSize.width*r.width,y:r.top+(1-p.y/cc.winSize.height)*r.height};};const gm=window.find('gmFloatingBubble');if(gm)gm.active=false;});
 const click=async name=>{const p=await page.evaluate(name=>window.point(name),name);await page.mouse.click(p.x,p.y);};
 const open=async()=>{await page.evaluate(()=>window.__require('ShopPanel').showShopPanel(()=>window.s.refreshCloudProfile(),p=>window.s.applyCloudProfile(p),{staminaText:()=>window.s.getChallengeStaminaText(),staminaAmount:()=>`当前体力 ${window.s.getStaminaPreview().current}/10`,start:()=>window.s.startGame()}));await page.waitForTimeout(300);};
 await open();
 report.sizes=[];
 for(const size of [{width:320,height:568},{width:390,height:844},{width:768,height:1024}]){
  await page.setViewportSize(size);await page.waitForTimeout(1200);await open();
  const layout=await page.evaluate(()=>{
   const panel=window.find('shopExchange_hammer').parent.parent;
   const camera=cc.Camera.findCamera(panel),lo=camera.getWorldToScreenPoint(panel.convertToWorldSpaceAR(cc.v2(-panel.width/2,-panel.height/2))),hi=camera.getWorldToScreenPoint(panel.convertToWorldSpaceAR(cc.v2(panel.width/2,panel.height/2)));const box={x:lo.x,y:lo.y,width:hi.x-lo.x,height:hi.y-lo.y};
   return {viewport:{w:cc.winSize.width,h:cc.winSize.height},panel:{x:box.x,y:box.y,w:box.width,h:box.height},items:['hammer','magicWand','stamina'].map(item=>{const button=window.find('shopExchange_'+item),content=button.getChildByName('shopExchangeContent'),coin=content.getChildByName('shopCurrencyIcon'),price=content.getChildByName('shopPrice').getComponent(cc.Label);return{item,height:button.height,iconWidth:coin.width,hasSprite:!!coin.getComponent(cc.Sprite).spriteFrame,labels:button.getComponentsInChildren(cc.Label).map(l=>l.string),price:price.string,color:price.node.color.toHEX('#rrggbb'),order:content.children.map(c=>c.name),center:content.x,cardY:button.parent.y,cardHeight:button.parent.height};})};
  });
  for(const x of layout.items){assert.equal(x.height,84);assert.equal(x.iconWidth,50);assert.equal(x.hasSprite,true);assert.deepEqual(x.labels,['兑换','3']);assert.equal(x.color,'287638');assert.deepEqual(x.order,['shopPurchaseText','shopPrice','shopCurrencyIcon']);}
  assert.ok(layout.items[0].cardY-layout.items[1].cardY-layout.items[0].cardHeight>=34);
  await page.screenshot({path:path.join(out,`shop-${size.width}x${size.height}.png`)});
  assert.ok(layout.panel.x>=0&&layout.panel.y>=0&&layout.panel.x+layout.panel.w<=layout.viewport.w+1&&layout.panel.y+layout.panel.h<=layout.viewport.h+1,JSON.stringify(layout));
  report.sizes.push({size,layout});await page.screenshot({path:path.join(out,`shop-${size.width}x${size.height}.png`)});
 }
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1200);await open();lose=true;
 await click('shopExchange_hammer');await page.waitForFunction(()=>window.find('shopExchange_hammer').getComponentsInChildren(cc.Label).some(l=>l.string==='继续确认'));
 const id=exchanges[exchanges.length-1].request.actionId;
 await click('shopExchange_hammer');await page.waitForFunction(()=>window.find('shopExchangeSuccess'));await page.waitForTimeout(300);
 assert.equal(exchanges[exchanges.length-1].request.actionId,id);assert.equal(exchanges[exchanges.length-1].duplicate,true);
 assert.equal(await page.evaluate(()=>window.b.moodBeanBalance),9);assert.equal(await page.evaluate(()=>window.b.hammerCount),1);
 assert.equal(await page.evaluate(()=>window.find('shopRewardName').getComponent(cc.Label).string),'解压锤 ×1');await page.screenshot({path:path.join(out,'success-hammer.png')});await click('button_收下');await page.waitForTimeout(300);
 for(const [item,balance,title] of [['magicWand',6,'魔法棒 ×1'],['stamina',3,'体力 ×1']]){await click('shopExchange_'+item);await page.waitForFunction(()=>window.find('shopExchangeSuccess'));await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>window.b.moodBeanBalance),balance);assert.equal(await page.evaluate(()=>window.find('shopRewardName').getComponent(cc.Label).string),title);await page.screenshot({path:path.join(out,'success-'+item+'.png')});await click('button_收下');await page.waitForTimeout(300);}
 assert.equal(await page.evaluate(()=>window.s.stamina.current),11);
 await page.evaluate(async()=>{const r=await window.__require('CloudService').cloudService.postAuthenticated('/debug/profile',{moodBeanBalance:2,totalMoodBeans:12});window.s.applyCloudProfile(r.profile);});
 const colors=await page.evaluate(()=>['hammer','magicWand','stamina'].map(item=>window.find('shopExchange_'+item).getChildByName('shopExchangeContent').getChildByName('shopPrice').color.toHEX('#rrggbb')));assert.deepEqual(colors,['bd4035','bd4035','bd4035']);await page.screenshot({path:path.join(out,'shop-insufficient-red.png')});
 const before=exchanges.length;await click('shopExchange_hammer');await page.waitForFunction(()=>window.find('button_开始挑战'));assert.equal(exchanges.length,before);assert.deepEqual(errors,[]);
 Object.assign(report,{errors,exchanges,retryDidNotChargeTwice:true,insufficientDidNotSendExchange:true,staminaGained:1,priceRedWhenInsufficient:true,priceGreenWhenSufficient:true});fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2));console.log('PASS shop price, layout, new icon, three success modals, retry and insufficient balance; zero page errors.');
 }finally{await browser.close();await new Promise(r=>api.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
