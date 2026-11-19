from pathlib import Path
import json,sqlite3,subprocess,hashlib,datetime
p=Path('/opt/tcjstory/apps/cocos-zyx/releases/20261114-production-shop3-201041');base=json.loads((p/'baseline.json').read_text());res=json.loads((p/'deployment-result.json').read_text())
a=sqlite3.connect('file:'+res['backup']+'/data/game.sqlite?mode=ro',uri=True);a.row_factory=sqlite3.Row
snapshot=p/'post-live-audit.sqlite';b=sqlite3.connect('file:'+str(snapshot)+'?mode=ro',uri=True);b.row_factory=sqlite3.Row
assert b.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
def mapping(db,table):
 cols=db.execute('PRAGMA table_info("'+table+'")').fetchall();keys=[x['name'] for x in sorted(cols,key=lambda x:x['pk']) if x['pk']]
 if table=='sqlite_sequence':keys=['name']
 if not keys:keys=[x['name'] for x in cols]
 return {tuple(row[k] for k in keys):dict(row) for row in db.execute('SELECT * FROM "'+table+'"')}
tables={};old={};new={}
for (table,) in a.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
 old[table]=mapping(a,table);new[table]=mapping(b,table);assert old[table].keys()<=new[table].keys(),'Missing old primary keys: '+table
 tables[table]={'before':len(old[table]),'after':len(new[table]),'allOldPrimaryKeysRetained':True,'unchangedOldRows':0,'businessUpdatesReconciled':0}
for table in old:
 for key,prior in old[table].items():
  current=new[table][key]
  if current==prior:tables[table]['unchangedOldRows']+=1;continue
  if table=='sqlite_sequence':
   assert current['name']==prior['name'] and current['seq']>=prior['seq'];tables[table]['businessUpdatesReconciled']+=1;continue
  assert table=='players','Unexpected old row update: '+table
  pid=prior['player_id']
  rounds=[v for k,v in new['game_rounds'].items() if k not in old['game_rounds'] and v['player_id']==pid]
  assert len(rounds)==1 and rounds[0]['status']=='active'
  for t in ['round_settlements','tool_transactions','stamina_share_claims']:
   assert not any(k not in old[t] and v['player_id']==pid for k,v in new[t].items()),'Unaccounted additional operation'
  at=rounds[0]['started_at'];count=max(0,prior['stamina_current']);clock=prior['stamina_updated_at'] or at
  if count>=10:clock=at
  else:
   recovered=max(0,(at-clock)//300000);count=min(10,count+recovered);clock=at if count>=10 else clock+recovered*300000
  assert count>=1
  expected=dict(prior);expected.update(stamina_current=count-1,stamina_updated_at=clock,updated_at=at,asset_revision=prior['asset_revision']+1)
  assert current==expected,'Profile update does not exactly match recorded round start'
  tables[table]['businessUpdatesReconciled']+=1
new_players=[v for k,v in new['players'].items() if k not in old['players']]
assert len(new_players)==2
assert all(v['device_id'].startswith('release_check_') and v['mood_bean_balance']==0 and v['highest_single_game_score']==0 for v in new_players)
for name,prior in base['containers'].items():
 x=json.loads(subprocess.check_output(['docker','inspect',name]))[0]
 if name=='tcjstory-cocos-zyx-cocos_zyx_api-1':assert x['Id']==res['container'] and x['Image']==res['image'] and x['State']['Running']
 else:assert x['Id']==prior['id'] and x['Image']==prior['image']
for f,h in base['configSha256'].items():assert hashlib.sha256(Path(f).read_bytes()).hexdigest()==h
for f,h in base['sources']['shared'].items():assert hashlib.sha256((Path('/opt/tcjstory/apps/cocos-zyx/server')/f).read_bytes()).hexdigest()==h
report={'integrity':'ok','snapshotVerifiedAtUtc':datetime.datetime.fromtimestamp(snapshot.stat().st_mtime,datetime.timezone.utc).isoformat(),'tables':tables,'preexistingBusinessRecordsRetained':True,'oldProfileUpdateExactlyReconciled':True,'normalLiveActivity':'One existing player started one new round; regeneration, stamina spending, timestamp and asset revision exactly reproduce the new profile. Every other old business row is unchanged.','testWrites':'Two isolated zero-score/zero-bean release_check accounts, 20 new rounds, 7 settlements, 2 share claims. Initial probe encountered minimum-duration guard; corrected wait then passed. No test purchase succeeded and no tool transactions were added.','stagingGatewayOtherServicesAndSharedSourceUnchanged':True}
(p/'post-verification-audit.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
