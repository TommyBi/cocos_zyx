const fs=require('fs'),os=require('os'),path=require('path'),cp=require('child_process');
const repo=path.resolve(__dirname,'../..');const out=fs.mkdtempSync(path.join(os.tmpdir(),'zyx-bomb-eval-'));
try{cp.execFileSync('npx',['--yes','-p','typescript@4.9.5','tsc',path.join(repo,'assets/script/dataModule/ZyxGameModule.ts'),'--outDir',out,'--module','commonjs','--target','es2017','--skipLibCheck'],{stdio:'pipe'});}catch(e){if(!fs.existsSync(path.join(out,'ZyxGameModule.js')))throw e;}
let store=new Map();global.cc={sys:{localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}},log(){},warn(){}};
const source=fs.readFileSync(path.join(out,'ZyxGameModule.js'),'utf8');
const changed=source.replace('this.combo === 4','this.combo === 3');if(source===changed)throw Error('threshold patch failed');
fs.writeFileSync(path.join(out,'GameCombo3.js'),changed);
const classes={4:require(path.join(out,'ZyxGameModule.js')).default,3:require(path.join(out,'GameCombo3.js')).default};
function rngFor(seed){let x=(seed^0x85ebca6b)>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
const results=[];
for(const threshold of [4,3])for(const policy of ['hint-first','bomb-first']){
 const st={threshold,policy,seeds:1000,maxFreeActions:30,openingBombRounds:0,openingOneCellClearRounds:0,bombUses:0,bombActionsWithoutFullRow:0,bombActionsAwardedNewBomb:0,playedFreeActions:0,freeActionsCleared:0,multiRowFreeActions:0,roundsReachedPerfect:0,roundsAliveAfter30:0};
 for(let i=1;i<=1000;i++){
  const seed=Math.imul(i,0x9e3779b1)>>>0;store=new Map([['zyx_data_generation','mood_bean_v1']]);const g=new classes[threshold]();g.setRoundSeed(seed,true);g.resetRound();const rng=rngFor(seed);
  for(let k=0;k<3;k++){const m=g.getTutorialMove(k);g.movePiece(m.id,m.offset);g.resolveBoard();g.finishPlayerAction();}
  for(let k=0;k<3;k++)g.appendNextRow();g.resolveBoard();
  if(g.pieces.some(p=>p.bomb))st.openingBombRounds++;
  if(g.pieces.some(p=>{const r=g.getMoveRange(p.id);return [-1,1].some(d=>d>=r.min&&d<=r.max&&g.wouldCreateFullRow(p,d));}))st.openingOneCellClearRounds++;
  let perfect=g.combo>=5;let alive=true;
  for(let k=0;k<30;k++){
   const hint=g.findEliminationHint(),bomb=g.pieces.find(p=>p.bomb);const useBomb=!!bomb&&(policy==='bomb-first'||!hint);let move=hint;
   if(!useBomb&&!move){const moves=[];for(const p of g.pieces){const r=g.getMoveRange(p.id);for(let d=r.min;d<=r.max;d++)if(d)moves.push({id:p.id,offset:d});}move=moves[Math.floor(rng()*moves.length)];}
   if(!useBomb&&!move){alive=false;break;}
   const beforeRows=g.roundClearedRows,remainingBombIds=new Set(g.pieces.filter(p=>p.bomb).map(p=>p.id));
   if(useBomb){st.bombUses++;g.detonateBomb(bomb.id);remainingBombIds.delete(bomb.id);}else g.movePiece(move.id,move.offset);
   g.resolveBoard();
   if(!g.appendNextRow()){alive=false;break;}g.resolveBoard();
   let guard=0;while(g.getOccupiedRowCount()<2&&guard++<30){if(!g.appendNextRow()){alive=false;break;}g.resolveBoard();}
   g.finishPlayerAction();st.playedFreeActions++;const rows=g.roundClearedRows-beforeRows;if(rows>0)st.freeActionsCleared++;if(rows>=2)st.multiRowFreeActions++;
   if(useBomb&&rows===0)st.bombActionsWithoutFullRow++;if(useBomb&&g.pieces.some(p=>p.bomb&&!remainingBombIds.has(p.id)))st.bombActionsAwardedNewBomb++;
   perfect=perfect||g.combo>=5;if(!alive||g.isGameOver()){alive=false;break;}
  }
  if(perfect)st.roundsReachedPerfect++;if(alive)st.roundsAliveAfter30++;
 }
 results.push(st);
}
console.log(JSON.stringify({method:'Local isolated compiled variants. Only combo bomb threshold changes, no adaptive generator or bomb-preservation changes. Tutorial UI sequence, no paid tools; policies prioritize existing elimination hint or bomb. Fixed 1000 distributed seeds per scenario.',results},null,2));
