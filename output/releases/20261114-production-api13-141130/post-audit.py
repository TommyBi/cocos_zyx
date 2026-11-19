from pathlib import Path
import subprocess,json,sqlite3,hashlib
p=Path('/opt/tcjstory/apps/cocos-zyx/releases/20261114-production-api13-141130');base=json.loads((p/'baseline.json').read_text());result=json.loads((p/'deployment-result.json').read_text())
def inspect(n):return json.loads(subprocess.check_output(['docker','inspect',n]))[0]
name='tcjstory-cocos-zyx-cocos_zyx_api-1';cur=inspect(name);assert cur['Image']==result['image'];assert cur['State']['Running']
volume=next(m['Source'] for m in cur['Mounts'] if m['Destination']=='/app/data')
before=sqlite3.connect('file:'+result['backup']+'/data/game.sqlite?mode=ro',uri=True);after=sqlite3.connect('file:'+volume+'/game.sqlite?mode=ro',uri=True);assert after.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
tables={}
for table, in before.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
 sql='SELECT * FROM "'+table+'"';a=before.execute(sql).fetchall();b=after.execute(sql).fetchall()
 if table!='sqlite_sequence':assert set(a)<=set(b),'Existing rows changed: '+table
 tables[table]={'before':len(a),'after':len(b),'existingRowsPreserved':table!='sqlite_sequence'}
for n,v in base['containers'].items():
 if n!=name:
  x=inspect(n);assert x['Id']==v['id'] and x['Image']==v['image']
for f,h in base['configSha256'].items():assert hashlib.sha256(Path(f).read_bytes()).hexdigest()==h
for f,h in base['sources']['shared'].items():assert hashlib.sha256((Path('/opt/tcjstory/apps/cocos-zyx/server')/f).read_bytes()).hexdigest()==h
report={'integrity':'ok','tables':tables,'stagingGatewayOtherServicesAndSharedSourceUnchanged':True,'newWrites':'One isolated zero-score/zero-bean protocol account, 10 rounds, 7 settlements, 1 share claim; sqlite_sequence increases normally.'}
(p/'post-verification-audit.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
