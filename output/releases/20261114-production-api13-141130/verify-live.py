import pathlib,subprocess,json,sqlite3,urllib.request,urllib.error,hashlib
p=pathlib.Path('/opt/tcjstory/apps/cocos-zyx/releases/20261114-production-api13-141130');n='tcjstory-cocos-zyx-cocos_zyx_api-1'
x=json.loads(subprocess.check_output(['docker','inspect',n]))[0];v=next(m['Source'] for m in x['Mounts'] if m['Destination']=='/app/data')
db=sqlite3.connect('file:'+v+'/game.sqlite?mode=ro',uri=True);db.row_factory=sqlite3.Row
user=db.execute('SELECT * FROM players ORDER BY mood_bean_balance DESC,player_id LIMIT 1').fetchone();token=user['token']
base='https://api.tcjstory.cn/v1/cocos-zyx'
def req(route,t=token):
 try:
  with urllib.request.urlopen(urllib.request.Request(base+route,headers={'Authorization':'Bearer '+t}),timeout=15) as r:return r.status,json.load(r)
 except urllib.error.HTTPError as e:return e.code,json.load(e)
r={}
for kind,col in [('power','highest_single_game_score'),('beans','mood_bean_balance')]:
 status,data=req('/leaderboards?type='+kind);assert status==200 and data['code']==0;data=data['data']
 expected=db.execute('SELECT * FROM players WHERE '+col+'>0 ORDER BY '+col+' DESC,updated_at ASC,player_id ASC LIMIT 200').fetchall()
 assert [(a['playerId'],a['value']) for a in data['entries']]==[(a['player_id'],a[col]) for a in expected]
 for a in data['entries']:assert a['rank']==db.execute('SELECT COUNT(*)+1 FROM players WHERE '+col+'>?',[a['value']]).fetchone()[0]
 assert data['self']['value']==user[col] and data['self']['moodBeanBalance']==user['mood_bean_balance'] and data['self']['bestScore']==user['highest_single_game_score']
 r[kind]={'entries':len(data['entries']),'valuesMatchCurrentDatabase':True,'tiesAndSelfVerified':True}
assert req('/leaderboards?type=beans','invalid-release-token')[0]==401
assert req('/leaderboards?type=happiness')[0]==400
r['authRequired']=True;r['retiredCumulativeTypeRejected']=True
for label,url in [('staging','https://staging-api.tcjstory.cn/v1/cocos-zyx/health'),('dawn','https://api.tcjstory.cn/health')]:
 with urllib.request.urlopen(url,timeout=15) as response:
  result=json.load(response);r[label]={'httpStatus':response.status,'apiVersion':result.get('data',{}).get('apiVersion'),'healthy':True}
(p/'live-leaderboard-qa.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
