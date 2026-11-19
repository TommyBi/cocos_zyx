from pathlib import Path
import json,subprocess
p=Path('/opt/tcjstory/apps/cocos-zyx/releases/20261114-production-api13-141130');image='sha256:0e38a7e4a1f0f77ca9f660b7f0b4fc1981c8827e6d4f4710cd32ac5425b2d4f0'
commands=[['python3',str(p/'release_guard.py'),'verify','--root',str(p/'server'),'--manifest',str(p/'production-source-manifest.json')],['python3',str(p/'release_guard.py'),'verify','--root',str(p/'staging-runtime'),'--manifest',str(p/'runtime-manifest.json')],['docker','run','--rm','--network','none','-e','NODE_ENV=test','-v',str(p/'runtime-qa/server/test')+':/app/test:ro','-v',str(p/'runtime-qa/scripts/fixtures')+':/scripts/fixtures:ro',image,'sh','-c','node --test test/*.test.js']]
status=0
with (p/'preflight.log').open('w') as log:
 for args in commands:
  r=subprocess.run(args,stdout=log,stderr=subprocess.STDOUT)
  if r.returncode:status=r.returncode;break
(p/'preflight.exit').write_text(str(status))
if status:raise SystemExit(status)
print('PASS: immutable staging image, frozen source and 51 backend tests')
