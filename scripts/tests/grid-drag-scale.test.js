const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
let Grid;
test.before(() => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'zyx-drag-'));
  global.cc = {
    _decorator: { ccclass: (cls) => cls }, Component: class {},
    Tween: { stopAllByTarget() {} },
    tween: () => ({ to() { return this; }, start() {} }),
  };
  try {
    execFileSync('npx', ['--yes', '-p', 'typescript@4.9.5', 'tsc', 'assets/script/zyxGame/ZyxGridCom.ts', '--outDir', out, '--module', 'commonjs', '--target', 'es2017', '--experimentalDecorators', '--skipLibCheck'], { stdio: 'pipe' });
  } catch (_) { /* Cocos 全局类型不参与独立编译，验证生成的行为。 */ }
  Grid = require(path.join(out, 'zyxGame/ZyxGridCom.js')).default;
});
test('舞台缩放和平移后，手指移动一格仍只移动一个逻辑格', () => {
  for (const scale of [0.48, 0.7, 1, 1.25]) {
    const grid = new Grid();
    grid.node = { x: 0, parent: { convertToNodeSpaceAR: (point) => ({ x: (point.x - 90) / scale }) }, getChildByName: () => null };
    let moved;
    grid.initialize(7, 80, { canInteract: () => true, onInteract() {}, getMoveRange: () => ({ min: -3, max: 3 }), onMove: (id, offset) => { moved = { id, offset }; }, onTap() {} });
    const event = (x) => ({ touch: { getLocation: () => ({ x, y: 0 }) } });
    grid.onTouchStart(event(90));
    grid.onTouchMove(event(90 + 80 * scale));
    assert.ok(Math.abs(grid.node.x - 80) < 0.000001);
    grid.onTouchEnd(event(90 + 80 * scale));
    assert.deepEqual(moved, { id: 7, offset: 1 });
  }
});


test('另一根手指引爆后，进行中的拖动/松手/取消都不能改演出位置或提交动作', () => {
  for (const method of ['onTouchMove','onTouchEnd','onTouchCancel']) {
    const grid=new Grid();let allowed=true,moves=0,taps=0;
    grid.node={x:0,zIndex:10,parent:{convertToNodeSpaceAR:p=>p},getChildByName:()=>null};
    grid.initialize(7,80,{canInteract:()=>allowed,onInteract(){},getMoveRange:()=>({min:-3,max:3}),onMove(){moves++;},onTap(){taps++;}});
    const event=x=>({touch:{getLocation:()=>({x,y:0})}});
    grid.onTouchStart(event(0));grid.onTouchMove(event(20));
    allowed=false;grid.node.x=99;grid[method](event(120));
    assert.equal(grid.node.x,99);assert.equal(moves,0);assert.equal(taps,0);assert.equal(grid.touching,false);
    allowed=true;grid.onTouchEnd(event(150));assert.equal(moves,0);
  }
});

test('锁定时主动撤销旧拖拽，动画结束才松手也不能重放，下一次新手势可正常操作', () => {
  const grid=new Grid();let allowed=true,moves=0,taps=0;
  grid.node={x:0,zIndex:10,scale:1,parent:{convertToNodeSpaceAR:p=>p},getChildByName:()=>null};
  grid.initialize(7,80,{canInteract:()=>allowed,onInteract(){},getMoveRange:()=>({min:-3,max:3}),onMove(){moves++;},onTap(){taps++;}});
  const event=(x,id=1)=>({touch:{getID:()=>id,getLocation:()=>({x,y:0})}});
  grid.onTouchStart(event(0));grid.onTouchMove(event(70));assert.equal(grid.node.x,70);
  allowed=false;assert.equal(grid.cancelTouch(),true);assert.equal(grid.node.x,0);assert.equal(grid.node.scale,1);
  grid.node.x=180;allowed=true;grid.onTouchEnd(event(150));grid.onTouchCancel(event(150));
  assert.equal(grid.node.x,180);assert.equal(moves,0);assert.equal(taps,0);
  grid.onTouchStart(event(0,2));grid.onTouchEnd(event(80,2));assert.equal(moves,1);
});

test('同一色块只认最初的触点，第二根手指不能抢拖拽或松手提交', () => {
  const grid=new Grid();let moved;
  grid.node={x:0,zIndex:10,parent:{convertToNodeSpaceAR:p=>p},getChildByName:()=>null};
  grid.initialize(7,80,{canInteract:()=>true,onInteract(){},getMoveRange:()=>({min:-3,max:3}),onMove:(id,offset)=>{moved={id,offset};},onTap(){}});
  const event=(x,id)=>({touch:{getID:()=>id,getLocation:()=>({x,y:0})}});
  grid.onTouchStart(event(0,1));grid.onTouchMove(event(40,1));grid.onTouchStart(event(120,2));
  grid.onTouchMove(event(220,2));grid.onTouchEnd(event(220,2));assert.equal(grid.node.x,40);assert.equal(moved,undefined);
  grid.onTouchEnd(event(80,1));assert.deepEqual(moved,{id:7,offset:1});
});

test('色块在演出中失去父节点或停用，迟到的移动/松手不抛错也不提交', () => {
  for(const disable of [false,true]) {
    const grid=new Grid();let moves=0;
    grid.node={x:0,zIndex:10,scale:1,parent:{convertToNodeSpaceAR:p=>p},getChildByName:()=>null};
    grid.initialize(7,80,{canInteract:()=>true,onInteract(){},getMoveRange:()=>({min:-3,max:3}),onMove(){moves++;},onTap(){}});
    const event={touch:{getLocation:()=>({x:100,y:0})}};grid.onTouchStart(event);
    if(disable)grid.onDisable();grid.node.parent=null;
    assert.doesNotThrow(()=>{grid.onTouchMove(event);grid.onTouchEnd(event);grid.onTouchCancel(event);});assert.equal(moves,0);
  }
});

test('纵向列提示按吸附列更新、夹在合法范围，松手/取消/锁定/停用都立即清除', () => {
  for (const ending of ['onTouchEnd','onTouchCancel','cancelTouch','onDisable']) {
    const grid = new Grid(), hints = [];
    grid.node = {x:0,zIndex:10,parent:{convertToNodeSpaceAR:p=>p},getChildByName:()=>null};
    grid.initialize(7,80,{canInteract:()=>true,onInteract(){},getMoveRange:()=>({min:-1,max:2}),onMove(){},onTap(){},onDragColumns:(id,offset)=>hints.push([id,offset])});
    const event = x => ({touch:{getID:()=>1,getLocation:()=>({x,y:0})}});
    grid.onTouchStart(event(0)); assert.deepEqual(hints.at(-1),[7,0]);
    grid.onTouchMove(event(31)); assert.deepEqual(hints.at(-1),[7,0]);
    grid.onTouchMove(event(33)); assert.deepEqual(hints.at(-1),[7,1]);
    grid.onTouchMove(event(999)); assert.deepEqual(hints.at(-1),[7,2]);
    grid[ending](event(999)); assert.deepEqual(hints.at(-1),[7,null]);
    const count=hints.length;grid.onTouchEnd(event(999));assert.equal(hints.length,count);
  }
});
