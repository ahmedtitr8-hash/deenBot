/* ═══ قيام: وِرد القيام (ختمة بخطة) + مصحف القيام (قراءة حرة) ═══ */
/* ═══ قيام: تبويبان، الورد (ختمة بخطة) والمصحف (قراءة حرة) ═══ */
let qv='wird';
const W0=()=>S.get('wird',null);
async function loadQD(){QD=QD||await getQ();if(QD)buildPG();return QD}
async function loadQuran(){await loadQD();qView(qv)}
function qView(v,keep){qv=v;document.querySelectorAll('#qtb .chip').forEach(c=>c.classList.toggle('on',c.dataset.t===v));$('#qwird').style.display=v==='wird'?'':'none';$('#qmush').style.display=v==='mush'?'':'none';if(!keep)$('#qsf').classList.remove('on');scrollTo(0,0);if(v==='wird')drawWird();else loadMush()}
$('#qtb').onclick=e=>{const b=e.target.closest('.chip');if(b)qView(b.dataset.t)};
/* ---- الورد ---- */
const sn=p=>QD&&PG&&PG[p]&&PG[p][0]?QD[PG[p][0][0]].name.replace('سُورَةُ ',''):'';
async function drawWird(){const w=W0(),el=$('#qwird');
  if(!w){el.innerHTML=`<div class="card" style="text-align:center;padding:28px 18px"><span class="acc">${ic('calendar',36)}</span><h3 class="k" style="margin:8px 0">ابدأ ختمتك</h3><div class="mute sm">اختر طريقة الورد (حزب أو جزء أو صفحات أو مدة)، فيجهّز لك التطبيق وردك كل يوم ويحفظ أين توقفت.</div><button class="btn" id="wnew" style="margin-top:16px">إعداد الختمة</button></div>`;$('#wnew').onclick=openWZ;return}
  if(!await loadQD()){el.innerHTML=`<div class="mute">${NEED}</div>`;return}
  const[a,b]=w.chunks[w.i],pos=Math.min(b,Math.max(a,w.pos||a)),pw=Math.round((pos-a)/(b-a+1)*100),total=605-w.start,pk=Math.round((a-w.start)/total*100),today=w.last===ymd();
  el.innerHTML=`<div class="hero" style="padding:20px"><div class="mute sm">الورد ${AR(w.i+1)} من ${AR(w.chunks.length)}${today?' • أتممت ورد اليوم':''}</div><div class="big">صفحة ${AR(a)} – ${AR(b)}</div><div class="mute sm">${sn(a)}${sn(b)&&sn(b)!==sn(a)?' إلى '+sn(b):''}</div><div class="pbar"><i style="width:${pw}%"></i></div><div class="mute sm">${pos>a?`وصلت إلى صفحة ${AR(pos)}`:'لم تبدأ هذا الورد بعد'}</div>
   <button class="btn" id="wgo" style="margin-top:14px">${pos>a?'تابع من صفحة '+AR(pos):'ابدأ الورد'}</button><button class="btn" id="wdone" style="margin-top:8px;background:var(--line);color:var(--fg)">${ic('check',18)}أتممت الورد</button></div>
   <div class="stats"><div class="card"><b>${AR(w.khatmas||0)}</b><small>ختمات</small></div><div class="card"><b>${AR(w.streak||0)}</b><small>أيام متتالية</small></div><div class="card"><b>${AR(pk)}٪</b><small>تقدّم الختمة</small></div></div>
   <div class="rw" style="gap:8px"><button class="chip" id="wedit" style="flex:1;justify-content:center">${ic('edit',16)}تعديل الخطة</button><button class="chip" id="wstop" style="flex:1;justify-content:center">${ic('trash',16)}إيقاف الخطة</button></div>`;
  $('#wgo').onclick=()=>openPage(pos,0,{wird:true});$('#wdone').onclick=finishWird;$('#wedit').onclick=openWZ;
  $('#wstop').onclick=async()=>{if(await dlg({title:'إيقاف الخطة؟',msg:'سيُحذف تقدّمك في الختمة الحالية ولا يمكن استرجاعه.',ok:'إيقاف الخطة',danger:1})){S.set('wird',null);drawWird()}}}
function finishWird(){const w=W0(),t=ymd(),y=new Date();y.setDate(y.getDate()-1);
  if(w.last!==t){w.streak=w.last===ymd(y)?(w.streak||0)+1:1;w.last=t}
  if(w.i>=w.chunks.length-1){w.khatmas=(w.khatmas||0)+1;w.i=0;banner('بارك الله فيك، أتممت ختمة كاملة',1)}else w.i++;
  w.pos=w.chunks[w.i][0];S.set('wird',w);if($('#qr').classList.contains('on'))closeReader();else{drawWird();}}
/* ---- معالج إعداد الختمة ---- */
let wz={unit:'pages',val:5,from:'start',surah:0,page:1};
function juzStarts(){const js=[];QD.forEach(s=>s.a.forEach((_,j)=>{const z=s.z[j];if(js[z]===undefined||s.p[j]<js[z])js[z]=s.p[j]}));return js.filter(Boolean)}
function buildChunks(unit,val,st){const end=604;let b=[];
  if(unit==='juz')b=juzStarts().filter(p=>p>st);else{const step=unit==='pages'?val:unit==='half'?5:unit==='hizb'?10:Math.ceil((end-st+1)/val);for(let p=st+step;p<=end;p+=step)b.push(p)}
  const s=[st,...b];return s.map((x,i)=>[x,(s[i+1]||end+1)-1])}
const wzStart=()=>wz.from==='start'?1:wz.from==='surah'?QD[wz.surah].p[0]:Math.min(604,Math.max(1,+wz.page||1));
async function openWZ(){if(!await loadQD()){banner(NEED,1);return}wz={unit:'pages',val:5,from:'start',surah:0,page:1};$('#wz').classList.add('on');wzDraw()}
function wzSum(){const st=wzStart(),ch=buildChunks(wz.unit,wz.val,st);$('#wzsum').innerHTML=`${AR(ch.length)} ورد، وكل ورد ≈ ${AR(Math.round((605-st)/ch.length))} صفحة. تنتهي الختمة بعد ${AR(ch.length)} يوم تقريبًا (تبدأ من صفحة ${AR(st)}).`}
function wzDraw(){const U=[['pages','عدد صفحات كل يوم','تحدّد العدد بنفسك'],['half','نصف حزب','٥ صفحات تقريبًا'],['hizb','حزب','١٠ صفحات تقريبًا'],['juz','جزء','٢٠ صفحة تقريبًا'],['days','مدة الختمة بالأيام','نقسّم القرآن على الأيام']];
  $('#wzb').innerHTML=`<div class="lbl" style="margin-top:0">كيف تحدّد وردك؟</div>`+U.map(u=>`<div class="row ${wz.unit===u[0]?'sel':''}" data-u="${u[0]}"><span class="rd">${wz.unit===u[0]?ic('check',14):''}</span><span class="tx"><b>${u[1]}</b><small>${u[2]}</small></span></div>`).join('')
   +(wz.unit==='pages'||wz.unit==='days'?`<div class="lbl">${wz.unit==='pages'?'عدد الصفحات يوميًا':'عدد الأيام'}</div><div id="wzv"></div>`:'')
   +`<div class="lbl">من أين تبدأ؟</div><div id="wzf"></div><div id="wzx" style="margin-top:8px"></div><div class="card" style="margin-top:16px"><b>ملخص خطتك</b><div class="mute sm" id="wzsum" style="margin-top:6px"></div></div><button class="btn" id="wzok">تأكيد الخطة</button>`;
  $('#wzb').onclick=e=>{const r=e.target.closest('[data-u]');if(r){wz.unit=r.dataset.u;wz.val=wz.unit==='days'?30:5;wzDraw()}};
  if($('#wzv'))stp($('#wzv'),wz.val,1,wz.unit==='days'?365:60,1,v=>{wz.val=v;wzSum()},x=>AR(x));
  dd($('#wzf'),[['start','من أول القرآن'],['surah','من سورة معيّنة'],['page','من صفحة معيّنة']],wz.from,v=>{wz.from=v;wzDraw()});
  if(wz.from==='surah')dd($('#wzx'),QD.map((s,i)=>[i,(i+1)+'. '+s.name.replace('سُورَةُ ','')]),wz.surah,v=>{wz.surah=+v;wzSum()});
  if(wz.from==='page'){$('#wzx').innerHTML=`<input type="text" ${kbAttr('num')} maxlength="3" id="wzp" placeholder="رقم الصفحة (1 - 604)" style="margin:0">`;$('#wzp').value=wz.page;$('#wzp').onchange=e=>{wz.page=parseInt(e.target.value)||1;wzSum()}}
  wzSum();
  $('#wzok').onclick=()=>{const st=wzStart(),ch=buildChunks(wz.unit,wz.val,st),o=W0()||{};S.set('wird',{chunks:ch,i:0,pos:ch[0][0],start:st,khatmas:o.khatmas||0,streak:o.streak||0,last:o.last||null});$('#wz').classList.remove('on');qView('wird')}}
$('#wzc').innerHTML=ic('back',20);$('#wzc').onclick=()=>$('#wz').classList.remove('on');
