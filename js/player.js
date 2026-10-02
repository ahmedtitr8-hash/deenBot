/* ═══ الراديو والقرّاء والمفضلة ومشغّل الصوت ═══ */
let RT='live',rl=null,RC=null,PL=null,curRec=null,curM=0;const au=$('#au'),OFFR='يحتاج هذا القسم اتصالًا بالإنترنت.',pad=n=>String(n).padStart(3,'0');
const surahName=n=>QD&&QD[n-1]?QD[n-1].name:'سورة '+n;
const tm=s=>isFinite(s)?Math.floor(s/60)+':'+p2(Math.floor(s%60)):'0:00';
const eq='<span class="bars"><b></b><b></b><b></b></span>';
/* المفضلة: l إذاعات، r قرّاء، s سور */
const FV=()=>Object.assign({l:[],r:[],s:[]},S.get('fav',{}));
const isFav=(k,id)=>FV()[k].some(x=>x.id===id);
function togFav(k,o){const f=FV(),i=f[k].findIndex(x=>x.id===o.id);i>-1?f[k].splice(i,1):f[k].push(o);S.set('fav',f)}
const hb=(k,id)=>`<button class="hb ${isFav(k,id)?'on':''}" data-f="${k}" data-id="${id}">${ic('heart',20)}</button>`;
function loadRadio(){setRT(RT)}
function setRT(t){RT=t;document.querySelectorAll('#rt .chip').forEach(c=>c.classList.toggle('on',c.dataset.t===t));$('#rLive').style.display=t==='live'?'':'none';$('#rRec').style.display=t==='rec'?'':'none';$('#rFav').style.display=t==='fav'?'':'none';
  $('#rs').style.display=t==='rec'?'':'none';$('#rsf').classList.remove('on');t==='live'?loadLive():t==='rec'?loadRec():drawFav()}
$('#rt').onclick=e=>{const b=e.target.closest('.chip');if(b)setRT(b.dataset.t)};
srch($('#rs'),$('#rsf'),$('#rq'),()=>RC&&drawRec());
async function loadLive(){if(rl){drawLive();return}try{const ex=((await J('data/radios.json'))||[]).map((r,i)=>({id:'x'+i,name:r.name,url:r.url}));let ap=[];try{ap=(await (await fetch(CFG.api.radios)).json()).radios}catch(e){}rl=[...ex,...ap];if(!rl.length)throw 0;drawLive()}catch(e){$('#rlist').textContent=OFFR}}
function drawLive(){$('#rlist').className='';$('#rlist').innerHTML=rl.map((r,i)=>`<div class="row st ${PL&&PL.id==='l'+r.id?'playing':''}" data-i="${i}"><span class="it">${ic('play',18)}</span><span class="tx"><b>${r.name}</b><small>بث مباشر</small></span>${eq}${hb('l','l'+r.id)}</div>`).join('')}
$('#rlist').onclick=e=>{const h=e.target.closest('.hb');const c=e.target.closest('.st');if(!c)return;const r=rl[c.dataset.i];
  if(h){togFav('l',{id:'l'+r.id,name:r.name,url:r.url});h.classList.toggle('on');return}play({id:'l'+r.id,title:r.name,sub:'بث مباشر',src:r.url})};
async function loadRec(){if(RC){drawRec();return}RC=await idbGet('rec');
  if(!RC){try{const j=(await (await fetch(CFG.api.reciters)).json()).reciters;RC=j.map(r=>({id:r.id,name:r.name,m:(r.moshaf||[]).map(m=>({id:m.id,name:m.name,server:m.server,list:(m.surah_list||'').split(',').filter(Boolean).map(Number)}))}));await idbSet('rec',RC)}catch(e){RC=null;$('#rcl').textContent=OFFR;return}}
  drawRec()}
function drawRec(){const q=$('#rq').value.trim();$('#rcl').className='';$('#rcl').innerHTML=RC.filter(r=>r.name.includes(q)).map(r=>`<div class="row" data-id="${r.id}"><span class="it">${ic('user',20)}</span><span class="tx"><b>${r.name}</b><small>${r.m.length} ${r.m.length>2?'مصاحف':'مصحف'}</small></span>${hb('r','c'+r.id)}<span class="cv">${ic('chev',18)}</span></div>`).join('')}
function openRec(id){curRec=RC.find(x=>x.id==id);curM=0;$('#rcMain').style.display='none';$('#rdet').style.display='';$('#rs').style.display='none';drawDet();scrollTo(0,0);if(!QD)getQ().then(q=>{if(q){QD=q;drawDet()}})}
$('#rcl').onclick=e=>{const h=e.target.closest('.hb'),r=e.target.closest('.row');if(!r)return;
  if(h){const c=RC.find(x=>x.id==r.dataset.id);togFav('r',{id:'c'+c.id,name:c.name,rid:c.id});h.classList.toggle('on');return}openRec(r.dataset.id)};
function drawDet(){const r=curRec,m=r.m[curM];if(!m)return;
  $('#rdet').innerHTML=`<button class="chip" id="rdb">${ic('back',16)}${r.name}</button>`+(r.m.length>1?'<div class="lbl">المصحف والرواية</div><div id="rmd"></div>':'')+`<div class="lbl">السور (${m.list.length})</div>`+m.list.map((n,i)=>{const id='r'+m.id+'_'+n;return `<div class="row st ${PL&&PL.id===id?'playing':''}" data-i="${i}"><span class="it">${ic('play',18)}</span><span class="tx"><b>${n}. ${surahName(n)}</b></span>${eq}${hb('s',id)}</div>`}).join('');
  $('#rdb').onclick=()=>{$('#rdet').style.display='none';$('#rcMain').style.display='';$('#rs').style.display='';scrollTo(0,0)};
  if($('#rmd'))dd($('#rmd'),r.m.map((x,i)=>[i,x.name]),curM,v=>{curM=+v;drawDet()});
  $('#rdet').onclick=e=>{const c=e.target.closest('.st');if(!c)return;const i=+c.dataset.i,n=m.list[i],h=e.target.closest('.hb');
    if(h){togFav('s',{id:'r'+m.id+'_'+n,title:surahName(n),sub:r.name+' • '+m.name,src:m.server+pad(n)+'.mp3'});h.classList.toggle('on');return}playRec(r,m,i)}}
function playRec(r,m,i){const n=m.list[i];play({id:'r'+m.id+'_'+n,title:surahName(n),sub:r.name+' • '+m.name,src:m.server+pad(n)+'.mp3',rec:r,m,i})}
function step(d){if(!PL||!PL.m)return;const i=PL.i+d;if(i>=0&&i<PL.m.list.length)playRec(PL.rec,PL.m,i)}
/* تبويب المفضلة */
function drawFav(){const f=FV(),sec=(t,a)=>a.length?`<div class="lbl">${t}</div>`+a.join(''):'';
  const l=f.l.map(x=>`<div class="row st ${PL&&PL.id===x.id?'playing':''}" data-k="l" data-id="${x.id}"><span class="it">${ic('play',18)}</span><span class="tx"><b>${x.name}</b><small>بث مباشر</small></span>${eq}${hb('l',x.id)}</div>`);
  const r=f.r.map(x=>`<div class="row" data-k="r" data-id="${x.id}"><span class="it">${ic('user',20)}</span><span class="tx"><b>${x.name}</b></span>${hb('r',x.id)}<span class="cv">${ic('chev',18)}</span></div>`);
  const s=f.s.map(x=>`<div class="row st ${PL&&PL.id===x.id?'playing':''}" data-k="s" data-id="${x.id}"><span class="it">${ic('play',18)}</span><span class="tx"><b>${x.title}</b><small>${x.sub}</small></span>${eq}${hb('s',x.id)}</div>`);
  $('#rFav').innerHTML=sec('الإذاعات',l)+sec('القرّاء',r)+sec('السور',s)||`<div class="mute" style="text-align:center;padding:40px 10px">${ic('heart',30)}<div style="margin-top:8px">اضغط القلب على أي إذاعة أو قارئ أو سورة لتجدها هنا بسرعة.</div></div>`}
$('#rFav').onclick=async e=>{const row=e.target.closest('.row');if(!row)return;const k=row.dataset.k,id=row.dataset.id,f=FV(),x=f[k].find(y=>y.id===id);
  if(e.target.closest('.hb')){togFav(k,x);drawFav();return}
  if(k==='l')play({id:x.id,title:x.name,sub:'بث مباشر',src:x.url});else if(k==='s')play({id:x.id,title:x.title,sub:x.sub,src:x.src});
  else{setRT('rec');await loadRec();if(RC)openRec(x.rid)}};
function play(p){PL=p;au.src=p.src;au.play().catch(()=>{});$('#mt').textContent=p.title;$('#ms').textContent=p.sub;$('#mini').style.display='flex';npFill();media();marks()}
function marks(){if(rl&&RT==='live')drawLive();if(RT==='fav')drawFav();if(curRec&&$('#rdet').style.display!=='none')drawDet()}
function media(){try{const ms=navigator.mediaSession;if(!ms)return;ms.metadata=new MediaMetadata({title:PL.title,artist:PL.sub});ms.setActionHandler('play',()=>au.play());ms.setActionHandler('pause',()=>au.pause());ms.setActionHandler('nexttrack',PL.m?()=>step(1):null);ms.setActionHandler('previoustrack',PL.m?()=>step(-1):null)}catch(e){}}
function killP(){au.pause();au.removeAttribute('src');au.load();PL=null;$('#mini').style.display='none';$('#np').classList.remove('on');marks()}
function npFill(){if(!PL)return;$('#npt').textContent=PL.title;$('#nps').textContent=PL.sub;const rec=!!PL.m,fin=!isFinite(au.duration)&&!rec;$('#npp').style.display=PL.m||PL.src.endsWith('.mp3')?'':'none';$('#npprev').style.visibility=rec&&PL.i>0?'visible':'hidden';$('#npnext').style.visibility=rec&&PL.i<PL.m.list.length-1?'visible':'hidden';icons()}
function icons(){$('#mp').innerHTML=ic(au.paused?'play':'pause',18);$('#npplay').innerHTML=ic(au.paused?'play':'pause',26)}
$('#npc').innerHTML=ic('down',22);$('#npart').innerHTML=LOGO(120);$('#npprev').innerHTML=ic('next',22);$('#npnext').innerHTML=ic('prevb',22);$('#mx').innerHTML=ic('x',18);$('#npkill').innerHTML=ic('stop',18)+'إيقاف وإزالة';
$('#mi').onclick=()=>{$('#np').classList.add('on');npFill()};$('#npc').onclick=()=>$('#np').classList.remove('on');
$('#mx').onclick=killP;$('#npkill').onclick=killP;$('#npprev').onclick=()=>step(-1);$('#npnext').onclick=()=>step(1);
$('#mp').onclick=$('#npplay').onclick=()=>au.paused?au.play():au.pause();
au.onplay=au.onpause=icons;au.onended=()=>{PL&&PL.m&&PL.i<PL.m.list.length-1?step(1):icons()};
au.ontimeupdate=()=>{if(!isFinite(au.duration))return;const v=au.currentTime/au.duration*1000;$('#npr').value=v;$('#npr').style.setProperty('--v',v/10+'%');$('#npcur').textContent=tm(au.currentTime);$('#npdur').textContent=tm(au.duration)};
$('#npr').oninput=e=>{if(isFinite(au.duration))au.currentTime=e.target.value/1000*au.duration};
icons();
