(function(root){
  'use strict';
  function safeURL(value,base){if(typeof value!=='string'||!value.trim())return null;try{const url=new URL(value,base);if(url.username||url.password||url.protocol!=='https:')return null;return url.href;}catch{return null;}}
  function validate(config,base){if(!config||config.enabled!==true)return null;const src=safeURL(config.src,base);if(!src||!['video/mp4','video/webm'].includes(config.type))return null;return {...config,src,poster:safeURL(config.poster,base),captions:safeURL(config.captions,base),title:String(config.title||'I need my tags'),autoplayWithSound:config.autoplayWithSound===true};}
  function trySound(video,onBlocked){
    video.muted=false;
    try{const playing=video.play();if(playing&&typeof playing.catch==='function')playing.catch(onBlocked);}catch(error){onBlocked(error);}
  }
  function mount(host,raw,base){
    host.hidden=true;host.replaceChildren();const config=validate(raw,base);if(!config)return false;
    const wrap=document.createElement('div');wrap.className='tags-video-inner';
    const copy=document.createElement('div'),kicker=document.createElement('p'),title=document.createElement('h2'),subtitle=document.createElement('p');
    kicker.className='tags-video-kicker';kicker.textContent='TITLE TRANSFER NEAR ME';title.textContent='“'+config.title+'”';title.id='tags-video-title';
    subtitle.textContent='Watch the video. Ready to talk about your title? Tell us what you need.';
    const link=document.createElement('a');link.href='#contact';link.className='btn btn-primary';link.textContent='Get title help';copy.append(kicker,title,subtitle,link);
    const media=document.createElement('div'),video=document.createElement('video');video.controls=true;video.playsInline=true;video.preload=config.autoplayWithSound?'metadata':'none';video.muted=false;video.defaultMuted=false;video.autoplay=config.autoplayWithSound;video.setAttribute('aria-label',config.title);if(config.poster)video.poster=config.poster;
    const source=document.createElement('source');source.src=config.src;source.type=config.type;video.append(source);
    if(config.captions){video.crossOrigin='anonymous';const track=document.createElement('track');track.kind='captions';track.src=config.captions;track.srclang='en';track.label='English';video.append(track);}
    const sound=document.createElement('div'),soundText=document.createElement('p'),play=document.createElement('button');sound.className='tags-video-sound';sound.hidden=true;soundText.textContent='Press Play with sound to start the video.';soundText.setAttribute('role','status');soundText.setAttribute('aria-live','polite');play.type='button';play.className='btn btn-primary';play.textContent='Play with sound';sound.append(soundText,play);
    const blocked=()=>{sound.hidden=false;};play.addEventListener('click',()=>trySound(video,blocked));video.addEventListener('playing',()=>{sound.hidden=true;});
    const fallback=document.createElement('p');fallback.hidden=true;fallback.setAttribute('role','status');fallback.append('The video could not load. ');const open=document.createElement('a');open.href=config.src;open.textContent='Open the video file';open.rel='noopener';fallback.append(open);
    source.addEventListener('error',()=>{fallback.hidden=false;sound.hidden=true;});video.addEventListener('error',()=>{fallback.hidden=false;sound.hidden=true;});media.append(video,sound,fallback);
    if(typeof config.transcript==='string'&&config.transcript.trim()){const details=document.createElement('details'),summary=document.createElement('summary'),text=document.createElement('p');summary.textContent='Read the transcript';text.textContent=config.transcript;details.append(summary,text);media.append(details);}
    wrap.append(copy,media);host.append(wrap);host.hidden=false;
    if(config.autoplayWithSound)trySound(video,blocked);
    return true;
  }
  root.TitleTagsVideo={validate,mount};
  if(typeof document!=='undefined'){const host=document.getElementById('tags-video');if(host)fetch('tags-video.config.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(c=>mount(host,c,location.href)).catch(()=>{host.hidden=true;});}
})(typeof window==='undefined'?globalThis:window);
