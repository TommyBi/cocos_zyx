import asyncio,edge_tts,json
from pathlib import Path
out=Path('output/combo-voice-v3-20261118')
items=[('wow','Wow!','-10%'),('good','Good!','-5%'),('great','Great!','+0%'),('perfect','Perfect!','-4%')]
async def main():
 await asyncio.gather(*(edge_tts.Communicate(text,voice='en-US-AnaNeural',pitch='+0Hz',rate=rate,proxy='http://127.0.0.1:7890').save(str(out/f'combo_{name}_raw_v3.mp3')) for name,text,rate in items))
 out.joinpath('voice-recipe-v3.json').write_text(json.dumps({'engine':'edge-tts','voice':'en-US-AnaNeural','lines':[{'key':k,'text':t,'pitch':'+0Hz','rate':r} for k,t,r in items],'direction':'Natural gentle cute female voice; preserve original formants; progress through articulation, pace and fullness; no pitch shifting, doubled voice or bell effects'},indent=2))
asyncio.run(main())
