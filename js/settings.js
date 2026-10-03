/* ═══ JS-11: حسابي: القائمة والصفحات الداخلية ═══ */
function sub(title,build){$('#stitle').textContent=title;$('#sub').classList.add('on');$('#sbody').innerHTML='';$('#sub').scrollTop=0;build($('#sbody'))}
$('#sback').onclick=()=>{$('#sub').classList.remove('on');if(pvId)stopA();hub()};
const THN={auto:'تلقائي',light:'فاتح',dark:'داكن',sky:'ألوان اليوم'};
function hub(){const A=AD(),rows=[['pin','الموقع',locDesc(),openCP],['theme','المظهر',THN[S.get('theme','auto')],pTheme],['bell','الأذان',MUEZ.find(m=>m[0]===A.who)[1]+(A.on?'':' (متوقف)'),pAdhan],['clock','المواقيت والدقة',METHL.find(m=>m[0]==method)[1],pTimes],['text','الخط','الحجم '+S.get('fs',22),pFont],['sliders','عام','الاهتزاز وإعادة الضبط',pGen]];
  $('#hub').innerHTML=`<div class="prof"><span class="av">${LOGO(32)}</span><div><div class="k" style="font-size:19px">قيام</div><div class="mute sm">إعداداتك محفوظة على هذا الجهاز</div></div></div>`+rows.map((r,i)=>`<div class="row" data-i="${i}"><span class="it">${ic(r[0],21)}</span><span class="tx"><b>${r[1]}</b><small>${r[2]}</small></span><span class="cv">${ic('chev',18)}</span></div>`).join('')+`<div class="row" style="opacity:.5"><span class="it">${ic('user',21)}</span><span class="tx"><b>الحساب والمزامنة</b><small>قريبًا</small></span></div>`;
  $('#hub').onclick=e=>{const r=e.target.closest('.row[data-i]');if(r){const x=rows[r.dataset.i];x[3]===openCP?openCP():sub(x[1],x[3])}}}
function pTheme(c){const o=[['auto','تلقائي','حسب نظام الجوال','linear-gradient(135deg,#0C1022 50%,#F4F1E8 50%)','#888','#0E7C66'],['light','فاتح','',PH.day.bg,PH.day.card,PH.day.acc],['dark','داكن','',PH.night.bg,PH.night.card,PH.night.acc],['sky','ألوان اليوم','تتغير مع الصلوات','linear-gradient(135deg,#241D3B,#0E7C66,#FFB454,#0C1022)','#ffffff55','#fff']],cv=S.get('theme','auto');
  c.innerHTML='<div class="tcs">'+o.map(x=>`<div class="tc ${x[0]===cv?'sel':''}" data-v="${x[0]}"><div class="pv" style="background:${x[3]}"><i style="background:${x[4]};width:70%"></i><i style="background:${x[5]};width:40%"></i></div><b>${x[1]}</b><small>${x[2]||'&nbsp;'}</small></div>`).join('')+'</div>';
  c.onclick=e=>{const t=e.target.closest('.tc');if(!t)return;S.set('theme',t.dataset.v);cur='';tick();pTheme(c)}}
async function pAdhan(c){const A=AD(),hasC=!!await idbGet('ad_custom');
  c.innerHTML=`<div class="card rw"><span>تفعيل الأذان</span><button class="sw" id="swA"><i></i></button></div>
  <div class="lbl">المؤذن (المس المثلث للاستماع)</div><div id="mz"></div>
  <label class="row"><span class="it">${ic('file',21)}</span><span class="tx"><b>أضف أذانًا من جوالك</b><small>ملف صوتي تفضله</small></span><input type="file" id="aFile" accept="audio/*" hidden></label>
  <div class="lbl">مستوى الصوت</div><div id="sVol"></div>
  <div class="lbl">الصلوات المفعّلة</div><div class="opts" id="aPr"></div>
  <div class="lbl">تنبيه قبل الأذان</div><div id="dPre"></div>
  <div class="card rw" style="margin-top:16px"><span>إبقاء الشاشة مضيئة</span><button class="sw" id="swW"><i></i></button></div>
  <div class="mute sm" style="margin:6px 4px">الأذان يُرفع والتطبيق مفتوح على الشاشة فقط. لا يعمل والتطبيق مغلق أو الجوال مقفل.</div>`;
  window.hasC=hasC;mzr();
  sw($('#swA'),'adOn',A.on,v=>setAD('on',v));
  $('#aFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;await idbSet('ad_custom',f);setAD('who','custom');window.hasC=true;mzr()};
  stp($('#sVol'),A.vol,10,100,10,v=>{setAD('vol',v);aa.volume=v/100},x=>x+'%');
  $('#aPr').innerHTML=['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(k=>`<button class="chip ${A[k]?'on':''}" data-k="${k}">${NM[k]}</button>`).join('');
  $('#aPr').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;b.classList.toggle('on');setAD(b.dataset.k,b.classList.contains('on'))};
  dd($('#dPre'),[[0,'بدون تنبيه'],[5,'قبل ٥ دقائق'],[10,'قبل ١٠ دقائق'],[15,'قبل ١٥ دقيقة']],A.pre,v=>setAD('pre',+v));
  sw($('#swW'),'wakeOn',A.wake,v=>{setAD('wake',v);if(v)wake();else try{wl&&wl.release()}catch(e){}})}
function mzr(){const w=AD().who,el=$('#mz');if(!el)return;el.innerHTML=MUEZ.filter(m=>m[0]!=='custom'||window.hasC).map(m=>`<div class="row ${m[0]===w?'sel':''}" data-id="${m[0]}"><span class="rd">${m[0]===w?ic('check',14):''}</span><span class="tx"><b>${m[1]}</b></span><button class="pb" data-p="${m[0]}">${ic(pvId===m[0]?'pause':'play',16)}</button></div>`).join('');
  el.onclick=async e=>{const p=e.target.closest('.pb');if(p){const id=p.dataset.p;if(pvId===id){stopA();return}pvId=id;mzr();if(!await playAdhan(id)){pvId=null;mzr()}return}
    const r=e.target.closest('.row');if(r){setAD('who',r.dataset.id);dlAdhan(r.dataset.id);mzr()}}}
function pTimes(c){c.innerHTML=`<div class="row" id="cRow"><span class="it">${ic('pin',21)}</span><span class="tx"><b>الموقع</b><small>${locDesc()}</small></span><span class="cv">${ic('chev',18)}</span></div>
  <div class="lbl">طريقة الحساب</div><div id="dMethod"></div><div class="lbl">مذهب العصر</div><div id="dAsr"></div>
  <div class="lbl">صيغة الساعة</div><div id="dHour"></div><div class="lbl">تعديل المواقيت بالدقائق</div><div class="card" id="adj"></div>`;
  $('#cRow').onclick=()=>{$('#sub').classList.remove('on');openCP()};
  dd($('#dMethod'),METHL,method,v=>{method=+v;S.set('method',method);tick()});
  dd($('#dAsr'),[[1,'الجمهور (ظل الشيء مثله)'],[2,'الحنفي (ظل الشيء مثليه)']],S.get('asr',1),v=>{S.set('asr',+v);tick()});
  dd($('#dHour'),[['1','نظام ١٢ ساعة'],['0','نظام ٢٤ ساعة']],S.get('h12',true)?'1':'0',v=>{S.set('h12',v==='1');tick()});
  const P=['Fajr','Dhuhr','Asr','Maghrib','Isha'];$('#adj').innerHTML=P.map(k=>`<div class="rw" style="margin-bottom:8px"><span>${NM[k]}</span><div id="j${k}"></div></div>`).join('');
  P.forEach(k=>stp($('#j'+k),S.get('adj',{})[k]||0,-15,15,1,v=>{const a=S.get('adj',{});a[k]=v;S.set('adj',a);tick()},x=>(x>0?'+':'')+x+' د'))}
function setFs(v){v=Math.min(44,Math.max(14,parseInt(v)||22));document.documentElement.style.setProperty('--fs',v+'px');if($('#fs'))$('#fs').value=v;S.set('fs',v)}
function pFont(c){c.innerHTML=`<div class="card"><div class="lbl" style="margin-top:0">حجم الخط (اكتب الرقم أو استخدم الأزرار)</div><div class="step"><button id="fp">${ic('plus',18)}</button><input id="fs" type="text" ${kbAttr('num')} maxlength="2"><button id="fm">${ic('minus',18)}</button></div></div><div class="lbl">معاينة</div><div class="paper">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ﴿١﴾ ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ</div>`;
  $('#fs').value=S.get('fs',22);$('#fp').onclick=()=>setFs(+$('#fs').value+1);$('#fm').onclick=()=>setFs(+$('#fs').value-1);$('#fs').onchange=e=>setFs(e.target.value)}
function pGen(c){c.innerHTML=`<div class="card rw"><span>الاهتزاز عند اللمس</span><button class="sw" id="swv"><i></i></button></div><div class="card rw" style="margin-top:12px"><span>لوحة المفاتيح المدمجة</span><button class="sw" id="swk"><i></i></button></div><div class="mute sm" style="margin:-4px 4px 12px">بدون اقتراحات ولا أزرار تعبئة تلقائية. أوقفها إن فضّلت لوحة جوالك.</div><button class="btn" id="rst" style="background:var(--line);color:var(--fg);margin-top:14px">${ic('reset',18)}إعادة الإعدادات للوضع الافتراضي</button>`;
  sw($('#swv'),'vib',true);sw($('#swk'),'kbd',true,()=>kbInit());$('#rst').onclick=async()=>{if(await dlg({title:'إعادة الإعدادات؟',msg:'ستعود كل الإعدادات إلى الوضع الافتراضي. الأذكار والمصحف المحفوظة لا تتأثر.',ok:'إعادة الضبط',icon:'reset',danger:1})){try{localStorage.clear()}catch(e){}location.reload()}}}

