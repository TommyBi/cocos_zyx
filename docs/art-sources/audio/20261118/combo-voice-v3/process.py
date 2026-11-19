from pathlib import Path
import subprocess,json,uuid,shutil
import numpy as np,imageio_ffmpeg
ff=imageio_ffmpeg.get_ffmpeg_exe();out=Path('output/combo-voice-v3-20261118');archive=Path('docs/art-sources/audio/20261118/combo-voice-v3');archive.mkdir(parents=True,exist_ok=True)
recipe=json.loads((out/'voice-recipe-v3.json').read_text());metrics=[]
for n,key in enumerate(['wow','good','great','perfect']):
 raw=out/f'combo_{key}_raw_v3.mp3';shutil.copy2(raw,archive/raw.name)
 filters='silenceremove=start_periods=1:start_duration=0.01:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_duration=0.01:start_threshold=-45dB,areverse,highpass=f=80,equalizer=f=3200:t=q:w=0.8:g=-2.5,lowpass=f=6500'
 speech=np.frombuffer(subprocess.check_output([ff,'-v','error','-i',str(raw),'-af',filters,'-ar','44100','-ac','1','-f','f32le','-']),dtype=np.float32).copy()
 rms=float(np.sqrt(np.mean(speech**2)));peak=float(np.max(np.abs(speech)))
 target=[-23,-21,-19,-17][n];maxpeak=[-6.5,-5.5,-4.5,-3.5][n]
 gain=min(10**(target/20)/rms,10**(maxpeak/20)/peak);speech*=gain
 speech=np.pad(speech,(int(.012*44100),int(.08*44100)))
 dst=Path(f'assets/bundles/effects/sound/combo_{key}_v3.mp3')
 subprocess.run([ff,'-v','error','-y','-f','f32le','-ar','44100','-ac','1','-i','-','-b:a','128k',str(dst)],input=speech.tobytes(),check=True)
 if not dst.with_suffix('.mp3.meta').exists():dst.with_suffix('.mp3.meta').write_text(json.dumps({'ver':'2.0.3','uuid':str(uuid.uuid4()),'importer':'audio-clip','downloadMode':0,'subMetas':{}},indent=2)+'\n')
 metrics.append({'key':key,'durationSeconds':round(len(speech)/44100,3),'speechRmsDb':round(float(20*np.log10(rms*gain)),1),'speechPeakDb':round(float(20*np.log10(peak*gain)),1),'pitchShift':False,'layeredVoice':False,'musicalTail':False})
recipe['processing']={'description':'Silence trim, 12ms lead/80ms tail, gentle upper-mid attenuation; fixed gain only. Original speech pitch, formants and microdynamics preserved. No pitch/speed resampling, chorus, echo or bell.','metrics':metrics}
(out/'voice-recipe-v3.json').write_text(json.dumps(recipe,indent=2)+'\n');shutil.copy2(out/'voice-recipe-v3.json',archive/'voice-recipe-v3.json');shutil.copy2('/private/tmp/zyx-generate-combo-v3.py',archive/'generate.py');shutil.copy2('/private/tmp/zyx-process-combo-v3.py',archive/'process.py')
args=[ff,'-v','error','-y']
for key in ['wow','good','great','perfect']:args+=['-i',f'assets/bundles/effects/sound/combo_{key}_v3.mp3']
args+=['-filter_complex','[0:a]apad=pad_dur=0.50[a0];[1:a]apad=pad_dur=0.50[a1];[2:a]apad=pad_dur=0.50[a2];[a0][a1][a2][3:a]concat=n=4:v=0:a=1[a]','-map','[a]','-b:a','160k',str(out/'combo-voice-audition-v3.mp3')]
subprocess.run(args,check=True);print(json.dumps(metrics,indent=2))
