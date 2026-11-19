from pathlib import Path
import subprocess,json,hashlib,shutil,sqlite3,time,urllib.request,os
rid='20261114-production-api13-141130';p=Path('/opt/tcjstory/apps/cocos-zyx/releases')/rid;baseline=json.loads((p/'baseline.json').read_text())
name='tcjstory-cocos-zyx-cocos_zyx_api-1';service='cocos_zyx_api';expected='sha256:0e38a7e4a1f0f77ca9f660b7f0b4fc1981c8827e6d4f4710cd32ac5425b2d4f0';image='cocos-zyx-production:'+rid
backup=Path('/opt/tcjstory/backups/cocos-zyx-production-'+rid)
def run(args):return subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True).stdout
def inspect(n):return json.loads(run(['docker','inspect',n]))[0]
def unchanged():
 for f,h in baseline['configSha256'].items():assert hashlib.sha256(Path(f).read_bytes()).hexdigest()==h,'Config drift: '+f
 for n,v in baseline['containers'].items():
  if n==name:continue
  x=inspect(n);assert x['Id']==v['id'] and x['Image']==v['image'],'Other container changed: '+n
 for f,h in baseline['sources']['shared'].items():assert hashlib.sha256((Path('/opt/tcjstory/apps/cocos-zyx/server')/f).read_bytes()).hexdigest()==h,'Shared source drift: '+f

def audit(file):
 db=sqlite3.connect('file:'+str(file)+'?mode=ro',uri=True);assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok';assert db.execute('PRAGMA user_version').fetchone()[0]==8
 tables={}
 for table, in db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall():
  rows=db.execute('SELECT * FROM "'+table.replace('"','""')+'"').fetchall();rows=sorted(json.dumps(r,ensure_ascii=False,default=lambda x:x.hex()) for r in rows)
  tables[table]={'count':len(rows),'sha256':hashlib.sha256(json.dumps(rows,ensure_ascii=False).encode()).hexdigest()}
 db.close();return tables

def health():
 for _ in range(30):
  try:
   with urllib.request.urlopen('https://api.tcjstory.cn/v1/cocos-zyx/health',timeout=4) as r:h=json.load(r)['data']
   if h.get('apiVersion')==13 and 'heart-rescue-v10' in h.get('capabilities',[]):return h
  except Exception:pass
  time.sleep(1)
 raise RuntimeError('Production health/capability check failed')

assert (p/'preflight.exit').read_text()=='0';unchanged();old=inspect(name);assert old['Image']==baseline['containers'][name]['image']
run(['python3',str(p/'release_guard.py'),'verify','--root',str(p/'server'),'--manifest',str(p/'production-source-manifest.json')])
assert inspect('tcjstory-cocos-zyx-staging-cocos_zyx_api_staging-1')['Image']==expected
run(['docker','image','tag',expected,image]);assert json.loads(run(['docker','image','inspect',image]))[0]['Id']==expected
backup.mkdir(parents=True,mode=0o700,exist_ok=False);shutil.copy2(p/'baseline.json',backup/'baseline.json');shutil.copy2(p/'production-runtime.tar.gz',backup/'previous-runtime.tar.gz')
for f in ['docker-compose.yml','.env']:
 shutil.copy2(Path('/opt/tcjstory/apps/cocos-zyx/server')/f,backup/f);os.chmod(backup/f,0o600)
oldoverride=old['Config']['Labels']['com.docker.compose.project.config_files'].split(',')[-1];shutil.copy2(oldoverride,backup/'previous-image.override.yml')
rollback='cocos-zyx-production-rollback:'+rid;run(['docker','image','tag',old['Image'],rollback])
override=p/'production-image.override.yml';override.write_text('services:\n  cocos_zyx_api:\n    image: '+image+'\n    build:\n      context: '+str(p/'server')+'\n    environment:\n      NODE_ENV: production\n      ENABLE_GM_ROUTES: "0"\n')
base=['docker','compose','-p','tcjstory-cocos-zyx','-f','/opt/tcjstory/apps/cocos-zyx/server/docker-compose.yml']
config=json.loads(run(base+['-f',str(override),'config','--format','json']))['services'][service]
assert config['environment']['NODE_ENV']=='production' and str(config['environment']['ENABLE_GM_ROUTES'])=='0';assert config['environment']['DB_PATH']=='/app/data/game.sqlite';assert not config.get('ports')
volume=next(m['Source'] for m in old['Mounts'] if m['Destination']=='/app/data');stopped=False
try:
 run(['docker','stop','--time','30',name]);stopped=True
 shutil.copytree(volume,backup/'data');before=audit(backup/'data/game.sqlite');assert before==audit(Path(volume)/'game.sqlite');(backup/'data-before.json').write_text(json.dumps(before,indent=2)+'\n')
 rehearsal=json.loads(run(['docker','run','--rm','--network','none','-v',str(backup)+':/audit:ro',expected,'node','src/databaseAudit.js','/audit/data/game.sqlite']));(p/'migration-rehearsal.json').write_text(json.dumps(rehearsal,indent=2)+'\n')
 run(base+['-f',str(override),'up','-d','--no-deps','--no-build',service]);h=health();new=inspect(name);assert new['Image']==expected;assert next(m['Source'] for m in new['Mounts'] if m['Destination']=='/app/data')==volume
 env=dict(s.split('=',1) for s in new['Config']['Env']);assert env.get('NODE_ENV')=='production' and env.get('ENABLE_GM_ROUTES')=='0'
 after=audit(Path(volume)/'game.sqlite');(p/'data-after-switch.json').write_text(json.dumps(after,indent=2)+'\n');assert before==after,'Business data changed during switch; inspect before continuing'
 unchanged();actual=p/'served-runtime';actual.mkdir()
 for f in ['src','package.json','package-lock.json']:run(['docker','cp',name+':/app/'+f,str(actual/f)])
 run(['python3',str(p/'release_guard.py'),'verify','--root',str(actual),'--manifest',str(p/'runtime-manifest.json')])
 result={'releaseId':rid,'promotedFrom':'20261114-bean-icons-111748','image':expected,'imageRef':image,'container':new['Id'],'backup':str(backup),'source':str(p/'server'),'composeOverride':str(override),'rollbackImage':rollback,'previousOverride':oldoverride,'health':h,'dataPreserved':True,'dataSwitchExact':True,'tableCounts':{t:v['count'] for t,v in after.items()},'servedSourceVerified':True,'productionEnvironmentVerified':True,'gmRoutesDisabled':True,'stagingGatewayAndOtherServicesUnchanged':True}
 (p/'deployment-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
except Exception as ex:
 (p/'deployment-error.txt').write_text(str(ex))
 if stopped:run(base+['-f',oldoverride,'up','-d','--no-deps','--no-build',service])
 raise
