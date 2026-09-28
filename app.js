import{initializeApp}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import{getAuth,onAuthStateChanged as onAuth,createUserWithEmailAndPassword as reg,signInWithEmailAndPassword as login,signInWithPopup as pop,GoogleAuthProvider as GP,signOut as out,updateProfile as upd}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import{getFirestore,doc,getDoc,setDoc,updateDoc,onSnapshot,increment,arrayUnion,deleteField}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import{firebaseConfig as cfg}from'./firebase-config.js';

/* ========== أدوات عامة ========== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const J=(u,ms=12000)=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);return fetch(u,{signal:c.signal}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).finally(()=>clearTimeout(t))};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fa=n=>Number(n).toLocaleString('ar-EG',{useGrouping:false});
const nz=s=>String(s||'').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase();
const ic=(n,c='')=>`<svg class="i ${c}"><use href="#i-${n}"/></svg>`;
const LS={g(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const dstr=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const day=()=>Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/864e5);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const auth=getAuth(initializeApp(cfg)),db=getFirestore();
let me=null,ud={},cur='home',SU=[],unsub=0,K;
const T=['home','azkar','radio','quran','me'],init={},act={};
const ref=()=>doc(db,'users',me.uid);
const save=async o=>{Object.assign(ud,o);if(me)try{await setDoc(ref(),o,{merge:true})}catch{}};
const cache=async(k,f)=>{const d=new Date().toDateString(),c=LS.g(k,{});if(c.d==d&&c.v!=null)return c.v;const v=await f();LS.s(k,{d,v});return v};

/* ========== نوافذ سفلية + زر الرجوع + تنبيهات ========== */
const OV=[];let skip=0,shRes=0,shOn=0,tto;
const openOv=fn=>{OV.push(fn);history.pushState({o:1},'')};
const closeTop=()=>{if(!OV.length)return;skip++;history.back();OV.pop()()};
addEventListener('popstate',()=>{if(skip){skip--;return}const f=OV.pop();f&&f()});
const toast=m=>{const t=$('#tt');t.textContent=m;t.hidden=false;clearTimeout(tto);tto=setTimeout(()=>t.hidden=true,2600)};
function sheet(html){const o=$('#sh');o.innerHTML=`<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
 if(!shOn){shOn=1;o.hidden=false;openOv(()=>{shOn=0;o.hidden=true;if(shRes){const r=shRes;shRes=0;r(null)}})}}
const shut=()=>{if(shOn)closeTop()};
$('#sh').addEventListener('click',e=>{if(e.target.id=='sh')shut()});
const ask=(t,{d='',fields=[],ok='حفظ'}={})=>new Promise(r=>{
 sheet(`<h3>${t}</h3>${d?`<p class="m">${d}</p>`:''}${fields.map(f=>`<input class="inp" id="f_${f.id}" placeholder="${esc(f.ph||'')}" type="${f.type||'text'}" value="${esc(f.val||'')}" ${f.dir?`dir="${f.dir}"`:''} ${f.max?`maxlength="${f.max}"`:''} autocomplete="off">`).join('')}<div class="acts"><button class="btn g" data-a="sx">إلغاء</button><button class="btn" data-a="sok">${ok}</button></div>`);
 shRes=r;setTimeout(()=>$('#sh input')?.focus(),320)});
const conf=(t,d,ok='تأكيد')=>ask(t,{d,ok}).then(v=>!!v);
act.sx=()=>shut();
act.sok=()=>{const v={};$$('#sh input').forEach(i=>v[i.id.slice(2)]=i.value.trim());const r=shRes;shRes=0;shut();r&&r(v)};
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&shOn&&e.target.matches('#sh input'))act.sok()});

/* ========== التنقل ========== */
const go=t=>{cur=t;T.forEach(x=>{$('#'+x).hidden=x!=t;$('#n'+x).classList.toggle('on',x==t)});init[t]&&init[t]();scrollTo(0,0)};
$$('nav button').forEach(b=>b.onclick=()=>go(b.dataset.t));
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&act[b.dataset.a])act[b.dataset.a](b.dataset.v,b,e)});
document.addEventListener('keydown',e=>{if((e.key=='Enter'||e.key==' ')&&e.target.matches('.li[data-a]')){e.preventDefault();e.target.click()}});
document.addEventListener('change',e=>{const a=e.target.dataset.a;if(a=='mo'){mi=+e.target.value;rd2()}if(a=='pf'){PF.from=e.target.value;pvw()}});
document.addEventListener('input',e=>{const i=e.target.id;if(i=='sq')sl();if(i=='rq'&&RA)rl();if(i=='cd'){PF.cd=e.target.value;pvw()}if(i=='cq'){PF.q=+e.target.value||0;pvw()}});
const surahs=async()=>{if(SU.length)return SU;SU=LS.g('su',[]);if(SU.length)return SU;SU=(await J('https://api.alquran.cloud/v1/surah')).data;LS.s('su',SU);return SU};
const sn=n=>{const x=SU[n-1];return x?x.name.replace(/^\S+\s+/,''):''};

/* ========== الرئيسية ========== */
const hm=s=>{const[h,m]=s.slice(0,5).split(':');return`${fa(+h)}:${fa(+m).padStart(2,'٠')}`};
const P={Fajr:'الفجر',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'};let tick;
async function prayers(){let p={coords:{latitude:21.4225,longitude:39.8262}};
 try{p=await new Promise((r,j)=>navigator.geolocation.getCurrentPosition(r,j,{timeout:8000}))}catch{}
 const d=new Date();return(await J(`https://api.aladhan.com/v1/timings/${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}?latitude=${p.coords.latitude}&longitude=${p.coords.longitude}&method=4`)).data}
function run(t){clearInterval(tick);const z=x=>String(x).padStart(2,'0'),at=(k,add)=>{const[h,m]=t[k].slice(0,5).split(':'),d=new Date();d.setDate(d.getDate()+add);d.setHours(+h,+m,0,0);return d};
 const f=()=>{const n=new Date();let x=Object.keys(P).map(k=>[k,at(k,0)]).find(a=>a[1]>n)||['Fajr',at('Fajr',1)],s=Math.floor((x[1]-n)/1e3);
  $('#nn').textContent=P[x[0]];$('#nc').textContent=`${z(s/3600|0)}:${z(s/60%60|0)}:${z(s%60)}`;
  $$('.pl div').forEach(d=>d.classList.toggle('on',d.dataset.k==x[0]))};f();tick=setInterval(f,1000)}
init.home=async()=>{if(!init.home.d){init.home.d=1;
 $('#home').innerHTML=`<div class="hi"><h1>السلام عليكم</h1><p class="m" id="hj">&nbsp;</p></div><div class="card hero"><small>الصلاة القادمة</small><h2 id="nn" style="margin:2px 0 0">…</h2><div id="nc">--:--:--</div></div><div class="pl" id="pl"></div><div id="hq"></div><div class="card" id="dk"><div class="tt">${ic('star8')}ذكر اليوم</div></div><div class="card" id="hd"><div class="tt">${ic('book')}حديث اليوم</div></div>`;
 (async()=>{try{const d=await cache('pt',prayers),t=d.timings,h=d.date.hijri;$('#hj').textContent=`${h.weekday?.ar?h.weekday.ar+'، ':''}${fa(h.day)} ${h.month.ar} ${fa(h.year)} هـ`;
  $('#pl').innerHTML=Object.keys(P).map(k=>`<div data-k="${k}"><small>${P[k]}</small><b>${hm(t[k])}</b></div>`).join('');run(t)}catch{$('#nn').textContent='تعذّر تحميل المواقيت'}})();
 try{const a=Object.values(await azkar()).flat().filter(x=>x.t.length<220),z=a[day()*7%a.length];$('#dk').innerHTML+=`<p class="ar">${esc(z.t)}</p><small>${esc(z.s)}</small>`}catch{}
 try{const n=day()%42+1,h=await cache('hdc',()=>J(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nawawi/${n}.json`).then(j=>j.hadiths?.[0]?.text||j.text));$('#hd').innerHTML+=`<p class="ar">${esc(h)}</p><small>الأربعون النووية · حديث ${fa(n)}</small>`}catch{}}
 homeQ()};
async function homeQ(){await loadMeta();const p=PLAN(),lp=LS.g('lp',0),o=$('#hq');if(!o)return;let h='';
 if(p&&p.pos<604){const w=wird(p),ok=p.pos>=w.end;h+=ok?`<button class="card qc" data-a="gq"><span class="ic">${ic('check')}</span><div><b>أتممت وردك اليوم</b><small>تقدّمك ${fa(Math.round(p.pos/604*100))}٪ من الختمة</small></div></button>`
  :`<button class="card qc" data-a="pw"><span class="ic">${ic('book')}</span><div><b>وردك اليوم</b><small>من صفحة ${fa(w.a)} إلى ${fa(w.b)} · ${fa(w.b-w.a+1)} صفحة</small></div>${ic('back','fl')}</button>`}
 if(lp)h+=`<button class="card qc" data-a="lp"><span class="ic">${ic('goto')}</span><div><b>تابع القراءة</b><small>صفحة ${fa(lp)}</small></div>${ic('back','fl')}</button>`;
 o.innerHTML=h}
act.gq=()=>go('quran');

/* ========== الأذكار والمسبحة ========== */
let AZ,tc=+LS.g('tc',0)||0,pend=0,tm,tg=LS.g('tg',33);
const azkar=async()=>AZ||(AZ=await J('azkar.json'));
const flush=()=>{if(me&&pend){setDoc(ref(),{tasbih:increment(pend)},{merge:true}).catch(()=>0);ud.tasbih=(ud.tasbih||0)+pend}pend=0};
addEventListener('pagehide',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
const tapU=()=>{const b=$('#tc');if(!b)return;b.querySelector('span').textContent=fa(tc);b.style.setProperty('--p',tg?(tc%tg||(tc?tg:0))/tg*100+'%':'0%')};
act.tap=()=>{tc++;pend++;LS.s('tc',tc);tapU();navigator.vibrate?.(tg&&tc%tg==0?[30,40,30]:10);clearTimeout(tm);tm=setTimeout(flush,2500)};
act.tz=async()=>{if(tc&&!await conf('تصفير العدّاد؟','سيعود العدّاد إلى الصفر.','تصفير'))return;tc=0;LS.s('tc',0);tapU()};
act.tg=v=>{tg=+v;LS.s('tg',tg);act.tb()};
const AI={'الصباح':'sun','المساء':'moon','النوم':'moon','الاستيقاظ':'sun','المنزل':'home','المسجد':'home'};
const aic=k=>{for(const w in AI)if(k.includes(w))return AI[w];return'star8'};
async function azHome(){const o=$('#azkar');try{const a=await azkar();o.innerHTML=`<h2>الأذكار</h2><div class="tl"><button class="w" data-a="tb"><span class="ic">${ic('star8')}</span><b>المسبحة</b><small>عدّاد التسبيح مع هدف</small></button>${Object.keys(a).map(k=>`<button data-a="ac" data-v="${esc(k)}"><span class="ic">${ic(aic(k))}</span><b>${esc(k)}</b><small>${fa(a[k].length)} ذكر</small></button>`).join('')}</div>`}catch{o.innerHTML='<h2>الأذكار</h2><p class="emp">تعذّر تحميل الأذكار.</p>'}}
init.azkar=azHome;act.ab=azHome;
act.tb=()=>{$('#azkar').innerHTML=`<div class="row" style="margin-bottom:12px"><button class="ib" data-a="ab" aria-label="رجوع">${ic('back')}</button><h2 style="margin:0">المسبحة</h2><span style="width:44px"></span></div><div class="card" style="text-align:center"><div class="chips" style="justify-content:center">${[[33,'٣٣'],[100,'١٠٠'],[0,'مفتوح']].map(([v,l])=>`<button class="${tg==v?'on':''}" data-a="tg" data-v="${v}">${l}</button>`).join('')}</div><button class="tap" data-a="tap" id="tc" aria-label="سبّح"><span>${fa(tc)}</span></button><div class="row"><small>يُحفظ إجمالي تسبيحك في حسابك</small><button class="btn g sm" data-a="tz">${ic('reset')}تصفير</button></div></div>`;tapU()};
act.ac=k=>{$('#azkar').innerHTML=`<div class="row" style="margin-bottom:12px"><button class="ib" data-a="ab" aria-label="رجوع">${ic('back')}</button><h2 style="margin:0">${esc(k)}</h2><span style="width:44px"></span></div>`+AZ[k].map(x=>`<div class="card z" data-a="z" data-n="${x.n}" data-t="${x.n}"><div><p class="ar">${esc(x.t)}</p><small>${esc(x.s)}</small></div><div class="zc"><span>${fa(x.n)}</span></div></div>`).join('');scrollTo(0,0)};
act.z=(v,b)=>{const n=+b.dataset.n-1;if(n<0)return;b.dataset.n=n;const t=+b.dataset.t,c=b.querySelector('.zc');c.style.setProperty('--p',(t-n)/t*100+'%');navigator.vibrate?.(8);
 if(!n){b.classList.add('dn');c.innerHTML=ic('check');navigator.vibrate?.(30)}else c.querySelector('span').textContent=fa(n)};

/* ========== الصوت: الإذاعة والقرّاء ========== */
let RA,RC,rm=0,rid=null,mi=0,PL=null,stt=0,stE=0;const au=$('#au'),FV=LS.g('fv',{r:[],c:[]});
const KF=/الحرم|مكة|المدينة/;
function play(u,t,s,o={}){au.src=u.replace(/^http:/,'https:');au.play()?.catch(()=>toast('تعذّر التشغيل، تحقق من الاتصال'));PL={t,s,...o};
 $('#mt').textContent=t;$('#ms').textContent=s||'';$('#mbar').style.width='0';$('#mini').hidden=false;if(!$('#fp').hidden)fpv();
 if(navigator.mediaSession)navigator.mediaSession.metadata=new MediaMetadata({title:t,artist:s||'نور',artwork:[{src:'icons/icon-512.png',sizes:'512x512',type:'image/png'}]});
 rk()}
const rk=()=>{if(cur=='radio'&&RA&&rid==null)rl();else if(cur=='radio'&&rid!=null)rd2()};
const tf=s=>isFinite(s)?`${s/60|0}:${String(s%60|0).padStart(2,'0')}`:'0:00';
const pu=()=>{const p=au.paused,u=p?'i-play':'i-pause';$$('#mp use,#pp use').forEach(x=>x.setAttribute('href','#'+u));$('#eq').classList.toggle('on',!p);if(navigator.mediaSession)navigator.mediaSession.playbackState=p?'paused':'playing'};
au.onplay=au.onpause=pu;au.onerror=()=>{if(au.src)toast('تعذّر تشغيل هذا المقطع')};
$('#mp').onclick=e=>{e.stopPropagation();au.paused?au.play():au.pause()};
au.ontimeupdate=()=>{if(!PL||PL.live||!au.duration)return;const p=au.currentTime/au.duration*100;$('#mbar').style.width=p+'%';const k=$('#sk');if(k){k.max=au.duration;k.value=au.currentTime;k.style.setProperty('--p',p+'%');$('#t1').textContent=tf(au.currentTime);$('#t2').textContent=tf(au.duration)}};
au.onended=()=>{PL&&!PL.live&&act.nx()};
if(navigator.mediaSession){const ms=navigator.mediaSession,h=(a,f)=>{try{ms.setActionHandler(a,f)}catch{}};h('play',()=>au.play());h('pause',()=>au.pause());h('previoustrack',()=>act.pv());h('nexttrack',()=>act.nx());h('seekbackward',()=>act.sb());h('seekforward',()=>act.sf())}
function fpv(){const o=$('#fp'),L=PL.live;if(o.hidden){o.hidden=false;openOv(()=>{o.hidden=true})}
 o.innerHTML=`<div class="ph"><button class="ib" data-a="fx" aria-label="إغلاق">${ic('down')}</button><small>يُشغَّل الآن</small><button class="ib" data-a="sl" aria-label="مؤقّت النوم">${ic('timer')}</button></div>
 <div class="cv ${L?'lv':''}">${ic('star8','big')}<div class="ct">${esc(PL.t)}</div><div class="cs">${L?'<i class="dot"></i>بث مباشر':esc(PL.s)}</div></div>
 ${L?'':`<div><input type="range" id="sk" min="0" max="100" step="1" value="0" aria-label="موضع التشغيل"><div class="tm"><small id="t1">0:00</small><small id="t2">0:00</small></div></div>`}
 <div class="ctl">${L?'':`<button class="ib" data-a="pv" aria-label="السابق">${ic('prev','f')}</button><button class="ib" data-a="sb" aria-label="رجوع ١٥ ثانية">${ic('b15')}</button>`}<button class="ib pri" id="pp" data-a="pp" aria-label="تشغيل / إيقاف">${ic(au.paused?'play':'pause','f')}</button>${L?'':`<button class="ib" data-a="sf" aria-label="تقديم ١٥ ثانية">${ic('f15')}</button><button class="ib" data-a="nx" aria-label="التالي">${ic('next','f')}</button>`}</div>`;
 const k=$('#sk');if(k){k.oninput=e=>{au.currentTime=e.target.value;k.style.setProperty('--p',e.target.value/(au.duration||1)*100+'%')};au.ontimeupdate()}}
act.fo=()=>PL&&fpv();act.fx=()=>closeTop();act.pp=()=>au.paused?au.play():au.pause();
act.sb=()=>{au.currentTime=Math.max(0,au.currentTime-15)};act.sf=()=>{au.currentTime+=15};
act.sl=()=>sheet(`<h3>مؤقّت النوم</h3><p class="m">يتوقف التشغيل تلقائياً بعد المدة التي تختارها.</p><div class="opts">${[15,30,45,60,90].map(m=>`<button data-a="sm" data-v="${m}">${fa(m)} دقيقة</button>`).join('')}${stE?'<button data-a="sm" data-v="0">إلغاء المؤقّت</button>':''}</div>`);
act.sm=v=>{clearTimeout(stt);stE=0;if(+v){stE=1;stt=setTimeout(()=>{au.pause();stE=0;toast('توقّف التشغيل بحسب المؤقّت')},v*6e4);toast(`سيتوقف التشغيل بعد ${fa(v)} دقيقة`)}else toast('أُلغي المؤقّت');shut()};
const playS=(r,m,n)=>play(r.moshaf[m].server+String(n).padStart(3,'0')+'.mp3',SU[n-1]?.name||'سورة',r.name,{n:+n,rid:r.id,mi:m,id:'s'+n});
const step=d=>{if(!PL||PL.live||PL.n==null)return;const r=RC.find(x=>x.id==PL.rid),l=r.moshaf[PL.mi].surah_list.split(','),i=l.indexOf(String(PL.n))+d;if(l[i])playS(r,PL.mi,l[i])};
act.pv=()=>step(-1);act.nx=()=>step(1);
act.pr=v=>{const r=RA.find(x=>x.id==v);play(r.url,r.name,'بث مباشر',{live:1,id:r.id})};
act.ps=n=>playS(RC.find(x=>x.id==rid),mi,n);
act.fv=(v,b,e)=>{e.stopPropagation();const[t,id]=v.split(':'),a=FV[t],i=a.indexOf(+id);i<0?a.push(+id):a.splice(i,1);LS.s('fv',FV);rl()};
const eqi='<span class="eq on" style="height:18px;width:20px"><i></i><i></i><i></i></span>';
const rrow=r=>{const t=rm?'c':'r',fav=FV[t].includes(r.id),on=!rm&&PL?.live&&PL.id==r.id;
 return`<div class="li${on?' on':''}" role="button" tabindex="0" data-a="${rm?'rc':'pr'}" data-v="${r.id}"><span class="num">${on?eqi:ic('radio')}</span><span class="nm"><b>${esc(r.name)}</b><small>${rm?`${fa(r.moshaf.length)} ${r.moshaf.length>2?'روايات':'رواية'}`:'بث مباشر'}</small></span><button class="fv${fav?' on':''}" data-a="fv" data-v="${t}:${r.id}" aria-label="المفضلة">${ic('fav')}</button>${ic(rm?'back':'play',rm?'fl':'f')}</div>`};
const rl=()=>{const q=nz($('#rq').value.trim()),o=$('#rl'),fv=FV[rm?'c':'r'];
 let l=(rm?RC:RA).filter(r=>!q||nz(r.name).includes(q));l=[...l.filter(r=>fv.includes(r.id)),...l.filter(r=>!fv.includes(r.id))];
 let top='';if(!rm&&!q){const f=l.filter(r=>KF.test(r.name)).slice(0,2);if(f.length){top=`<div class="fh">${f.map(r=>{const on=PL?.live&&PL.id==r.id;return`<button class="fc" data-a="pr" data-v="${r.id}"><b>${esc(r.name)}</b><span class="live"><i class="dot"></i>بث مباشر</span><span class="ib pri">${on&&!au.paused?ic('pause','f'):ic('play','f')}</span></button>`}).join('')}</div>`;l=l.filter(r=>!f.includes(r))}}
 o.innerHTML=top+(l.map(rrow).join('')||`<p class="emp">لا نتائج مطابقة.</p>`)};
const rd2=()=>{const r=RC.find(x=>x.id==rid),m=r.moshaf[mi];$('#rt').hidden=true;
 $('#rl').innerHTML=`<div class="row" style="margin-bottom:12px"><button class="ib" data-a="rb" aria-label="رجوع">${ic('back')}</button><h3 style="flex:1;text-align:center">${esc(r.name)}</h3><span style="width:44px"></span></div>`+(r.moshaf.length>1?`<select class="sel" data-a="mo" aria-label="الرواية">${r.moshaf.map((x,i)=>`<option value="${i}" ${i==mi?'selected':''}>${esc(x.name)}</option>`).join('')}</select>`:`<p class="m" style="text-align:center;margin-bottom:12px">${esc(m.name)}</p>`)+
 m.surah_list.split(',').map(n=>{const on=PL&&PL.rid==r.id&&PL.mi==mi&&PL.n==n;return`<div class="li${on?' on':''}" role="button" tabindex="0" data-a="ps" data-v="${n}"><span class="num">${on?eqi:fa(n)}</span><span class="nm"><b>${esc(sn(n)||'سورة '+fa(n))}</b></span>${ic('play','f')}</div>`}).join('')};
init.radio=async()=>{if(init.radio.d)return rk();init.radio.d=1;
 $('#radio').innerHTML=`<h2>الراديو</h2><div id="rt"><div class="seg"><button class="on" data-a="rs" data-v="0">الإذاعات</button><button data-a="rs" data-v="1">القرّاء</button></div><div class="sr">${ic('search')}<input id="rq" class="inp" placeholder="ابحث..." autocomplete="off"></div></div><div id="rl"><p class="emp">جارٍ التحميل…</p></div>`;
 try{const[a,c]=await Promise.all([J('https://mp3quran.net/api/v3/radios?language=ar'),J('https://mp3quran.net/api/v3/reciters?language=ar'),surahs()]);
  RA=a.radios.sort((x,y)=>KF.test(y.name)-KF.test(x.name));RC=c.reciters;rl()}catch{init.radio.d=0;$('#rl').innerHTML='<p class="emp">تعذّر التحميل، تحقق من الاتصال.</p>'}};
act.rs=v=>{if(!RA)return;rm=+v;rid=null;$$('#rt .seg button').forEach((b,i)=>b.classList.toggle('on',i==rm));rl()};
act.rc=v=>{rid=+v;mi=0;rd2();scrollTo(0,0)};act.rb=()=>{rid=null;$('#rt').hidden=false;rl()};

/* ========== القرآن: الأجزاء والأحزاب والأرباع ========== */
const UN={p:604,r:240,h:60,j:30},UL={p:'صفحة',r:'ربع',h:'حزب',j:'جزء'};
const ORD=['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر','الثالث عشر','الرابع عشر','الخامس عشر','السادس عشر','السابع عشر','الثامن عشر','التاسع عشر','العشرون','الحادي والعشرون','الثاني والعشرون','الثالث والعشرون','الرابع والعشرون','الخامس والعشرون','السادس والعشرون','السابع والعشرون','الثامن والعشرون','التاسع والعشرون','الثلاثون'];
const FJ=[1,22,42,62,82,102,122,142,162,182,202,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582];
let META=null,US={};
const pageOf=k=>{const p=META.p;let lo=0,hi=p.length-1;while(lo<hi){const m=(lo+hi+1)>>1;p[m]<=k?lo=m:hi=m-1}return lo+1};
function setUS(r){US.r=[...r,605];US.h=[...r.filter((_,i)=>i%4==0),605];US.j=[...r.filter((_,i)=>i%8==0),605];US.p=[...Array(604)].map((_,i)=>i+1).concat(605)}
async function loadMeta(){if(META)return META;let m=LS.g('meta2',null);
 if(!m){try{const d=(await J('https://api.alquran.cloud/v1/meta')).data;m={p:d.pages.references.map(r=>r.surah*1e3+r.ayah),q:d.hizbQuarters.references.map(r=>r.surah*1e3+r.ayah)};if(m.p.length==604&&m.q.length==240)LS.s('meta2',m);else m=null}catch{m=null}}
 if(m){META=m;setUS(m.q.map(pageOf))}
 else{META={p:null,q:null};const r=[];FJ.forEach((j,i)=>{const nx=FJ[i+1]||605;for(let k=0;k<8;k++)r.push(Math.round(j+(nx-j)*k/8))});setUS(r)}
 return META}
const unitOf=(u,p)=>{const s=US[u];let i=0;while(i<s.length-2&&s[i+1]<=p)i++;return i+1};
const ul=(u,i)=>u=='j'?`الجزء ${ORD[i-1]}`:u=='h'?`الحزب ${fa(i)}`:u=='r'?`الربع ${fa(i)}`:`صفحة ${fa(i)}`;

/* ========== الخطة (وِردي) ========== */
let qm=0,qi=0,RD={p:1,w:null},PF={m:'d',d:30,u:'p',q:1,cd:'',from:'p'};const PG={};let af=0,warned=0;
const PLAN=()=>ud.plan||LS.g('plan',null);
const savePlan=p=>{LS.s('plan',p);save({plan:p})};
const snap=(u,x)=>{if(u=='p')return Math.round(x);const s=US[u];let b=604,bd=1e9;for(let i=1;i<s.length;i++){const v=s[i]-1,d=Math.abs(v-x);if(d<bd){bd=d;b=v}}return b};
const wird=p=>{const e=Math.max(0,Math.floor((new Date(dstr(new Date()))-new Date(p.start))/864e5)),s0=p.s0||0;let end;
 if(e+1>=p.days)end=604;else if(p.u&&p.u!='d')end=snap(p.u,s0+(e+1)*p.q*604/UN[p.u]);else end=s0+Math.ceil((604-s0)*(e+1)/p.days);
 end=Math.min(604,end);const a=Math.min(604,p.pos+1);return{a,b:Math.max(a,end),e,end}};
const pS0=()=>{if(PF.from=='p'&&+LS.g('pos',0)>0)return+LS.g('pos',0);const k=+PF.from;return k?US.j[k-1]-1:0};
const pdays=()=>{const s0=pS0(),tot=604-s0;if(PF.m=='d')return Math.round(+PF.cd||PF.d);return PF.q>0?Math.ceil(tot/(PF.q*604/UN[PF.u])):0};
function pvw(){const o=$('#pv');if(!o)return;const d=pdays(),tot=604-pS0();o.innerHTML=d>=1&&d<=3650?(PF.m=='d'?`وردك نحو <b>${fa(Math.ceil(tot/d))}</b> صفحة يومياً`:`تختم خلال <b>${fa(d)}</b> يوم`):'أدخل قيمة صحيحة'}
function plan(o){const p=PLAN();
 if(!p){const pos=+LS.g('pos',0);if(PF.from=='p'&&!pos)PF.from='1';
  o.innerHTML=`<div class="card"><h3>خطة الختمة</h3><p class="m" style="margin:4px 0 14px">اختر مدة الختمة أو مقدار وردك اليومي، ويصلك وردك كل يوم.</p>
  <div class="seg"><button class="${PF.m=='d'?'on':''}" data-a="pm" data-v="d">حسب المدة</button><button class="${PF.m=='u'?'on':''}" data-a="pm" data-v="u">حسب الورد اليومي</button></div>
  ${PF.m=='d'?`<div class="opts">${[7,15,30,60,90,180].map(d=>`<button class="${!PF.cd&&PF.d==d?'on':''}" data-a="pd" data-v="${d}">${fa(d)} يوم</button>`).join('')}</div><input id="cd" class="inp" type="number" inputmode="numeric" min="1" placeholder="أو اكتب عدد الأيام" value="${esc(PF.cd)}">`
  :`<label class="lb">وحدة الورد</label><div class="opts" style="grid-template-columns:repeat(4,1fr)">${['p','r','h','j'].map(u=>`<button class="${PF.u==u?'on':''}" data-a="pu" data-v="${u}">${UL[u]}</button>`).join('')}</div><label class="lb">كم ${UL[PF.u]} في اليوم؟</label><input id="cq" class="inp" type="number" inputmode="decimal" min="0.25" step="any" value="${PF.q||''}">`}
  <label class="lb">ابدأ من</label><select class="sel" data-a="pf">${pos>0?`<option value="p" ${PF.from=='p'?'selected':''}>من حيث وصلت · صفحة ${fa(pos+1)}</option>`:''}${[...Array(30)].map((_,i)=>`<option value="${i+1}" ${PF.from==i+1?'selected':''}>بداية الجزء ${ORD[i]}</option>`).join('')}</select>
  <p class="m" id="pv" style="margin:2px 4px 14px"></p><button class="btn w" data-a="pn">ابدأ الخطة</button></div>`;pvw();return}
 const w=wird(p),pct=Math.round(p.pos/604*100),dn=p.pos>=604,ok=p.pos>=w.end,left=Math.max(0,p.days-w.e-1),pa=unitOf('j',w.a),ha=unitOf('h',w.a);
 const sur=META?.p?sn(Math.floor(META.p[w.a-1]/1e3)):'';
 o.innerHTML=`<div class="card hero"><small>وردك اليوم · اليوم ${fa(Math.min(w.e+1,p.days))} من ${fa(p.days)}</small>${dn?'<h2 style="margin-top:8px">ما شاء الله، ختمتَ القرآن</h2>':ok?'<h2 style="margin-top:8px">أتممت وردك اليوم</h2><small>بارك الله فيك، نلقاك غداً</small>':`<div id="nc" style="font-size:2.4rem">${fa(w.a)}–${fa(w.b)}</div><small>${fa(w.b-w.a+1)} صفحة${sur?` · تبدأ من سورة ${esc(sur)}`:''}</small><p class="m" style="margin-top:2px">${ul('j',pa)} · ${ul('h',ha)}</p>`}<div class="bar"><i style="width:${pct}%"></i></div><small>${fa(p.pos)} من ٦٠٤ صفحة · ${fa(pct)}٪ · متبقٍ ${fa(left)} يوم</small></div>${dn||ok?'':'<button class="btn w" data-a="pw">'+ic('book')+'ابدأ القراءة</button>'}<button class="btn g w" style="margin-top:10px" data-a="pc">تغيير الخطة</button>`}
act.pm=v=>{PF.m=v;plan($('#qb'))};act.pd=v=>{PF.d=+v;PF.cd='';plan($('#qb'))};act.pu=v=>{PF.u=v;plan($('#qb'))};
act.pn=()=>{const d=pdays();if(!(d>=1&&d<=3650))return toast('أدخل قيمة صحيحة');const s0=pS0();savePlan({start:dstr(new Date()),days:d,pos:s0,s0,u:PF.m=='d'?'d':PF.u,q:PF.m=='d'?0:PF.q});PF.cd='';plan($('#qb'));toast('بدأت خطتك، بارك الله فيك')};
act.pc=async()=>{const p=PLAN();if(!await conf('تغيير الخطة؟','يبقى تقدّمك كما هو، وتختار خطة جديدة.','تغيير'))return;LS.s('pos',p.pos);LS.s('plan',null);save({plan:null});PF.from='p';plan($('#qb'))};
act.pw=()=>{const w=wird(PLAN());openP(w.a,w)};
act.wd=()=>{const p=PLAN();p.pos=Math.max(p.pos,RD.w.b);RD.w=null;savePlan(p);closeTop();toast('تقبّل الله منك، أُنجز وردك')};

/* ========== القرآن: الفهرس ========== */
init.quran=()=>{if(!init.quran.d){init.quran.d=1;$('#quran').innerHTML=`<h2>القرآن الكريم</h2><div class="seg">${['الفهرس','وِردي','ختمة جماعية'].map((x,i)=>`<button data-a="qs" data-v="${i}">${x}</button>`).join('')}</div><div id="qb"></div>`}qv()};
act.qs=v=>{qm=+v;qv()};
async function qv(){$$('#quran>.seg button').forEach((b,i)=>b.classList.toggle('on',i==qm));const o=$('#qb');if(unsub){unsub();unsub=0}
 await loadMeta();try{await surahs()}catch{}
 if(qm==1)return plan(o);if(qm==2)return shared(o);
 if(!SU.length){o.innerHTML='<p class="emp">تعذّر التحميل، تحقق من الاتصال.</p>';return}
 const lp=LS.g('lp',0);
 o.innerHTML=`${lp?`<button class="card qc" data-a="lp" style="padding:12px 16px"><span class="ic">${ic('goto')}</span><div><b>تابع القراءة</b><small>صفحة ${fa(lp)}</small></div>${ic('back','fl')}</button>`:''}<div class="chips">${['السور','الأجزاء','الأحزاب'].map((x,i)=>`<button class="${qi==i?'on':''}" data-a="qx" data-v="${i}">${x}</button>`).join('')}</div>${qi==0?`<div class="sr">${ic('search')}<input id="sq" class="inp" placeholder="ابحث عن سورة أو رقمها" autocomplete="off"></div><div id="sl"></div>`:'<div id="sl"></div>'}`;qi==0?sl():ul2()}
act.qx=v=>{qi=+v;qv()};
function sl(){const q=nz($('#sq').value.trim());$('#sl').innerHTML=SU.filter(x=>!q||nz(x.name).includes(q)||x.englishName.toLowerCase().includes(q)||x.number==q).map(x=>`<div class="li" role="button" tabindex="0" data-a="sp" data-v="${x.number}"><span class="num">${fa(x.number)}</span><span class="nm"><b>${esc(sn(x.number))}</b><small>${x.revelationType=='Meccan'?'مكية':'مدنية'} · ${fa(x.numberOfAyahs)} آية${META.p?` · صفحة ${fa(pageOf(x.number*1e3+1))}`:''}</small></span>${ic('back','fl')}</div>`).join('')||'<p class="emp">لا نتائج مطابقة.</p>'}
function ul2(){const u=qi==1?'j':'h',n=UN[u],per=u=='j'?8:4;$('#sl').innerHTML=[...Array(n)].map((_,i)=>{const pg=US[u][i],s=META.q?sn(Math.floor(META.q[i*per]/1e3)):'';return`<div class="li" role="button" tabindex="0" data-a="pg" data-v="${pg}"><span class="num">${fa(i+1)}</span><span class="nm"><b>${ul(u,i+1)}</b><small>${s?esc(s)+' · ':''}صفحة ${fa(pg)}</small></span>${ic('back','fl')}</div>`}).join('')}
act.pg=v=>openP(+v,null);
act.sp=async n=>{try{openP(META.p?pageOf(n*1e3+1):(await J(`https://api.alquran.cloud/v1/ayah/${n}:1`)).data.page,null)}catch{toast('تعذّر الفتح، تحقق من الاتصال')}};
act.lp=()=>openP(LS.g('lp',1),null);

/* ========== قارئ المصحف (١٥ سطراً) ========== */
const BSM='بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';let FSN=0,fontOK;
const fontsOk=()=>fontOK||(fontOK=Promise.race([document.fonts.load('40px "Amiri Quran"'),sleep(2500)]).catch(()=>0));
const ih=x=>x.e!=null?`<span class="e${String(x.e).length>2?' e3':''}">${fa(x.e)}</span>`:`<span>${esc(x.t)}</span>`;
async function viaQ(n){const j=await J(`https://api.quran.com/api/v4/verses/by_page/${n}?words=true&word_fields=text_uthmani,line_number&mushaf=2&per_page=100`,7000),V=j.verses;if(!V?.length)throw 0;
 const L={},st={};let last=null;
 V.forEach(v=>{const[ch,vn]=v.verse_key.split(':').map(Number);let first=1;
  (v.words||[]).forEach(w=>{const r=w.line_number;if(!(r>=1&&r<=16))throw 0;
   if(first){first=0;if(vn==1)st[r]=ch}
   if(w.char_type_name=='end'){(L[r]=L[r]||[]).push(last={e:vn})}
   else if(w.char_type_name=='pause'&&last&&last.t)last.t+=w.text_uthmani;
   else if(w.text_uthmani){(L[r]=L[r]||[]).push(last={t:w.text_uthmani})}})});
 const blocks=[];Object.keys(L).map(Number).sort((a,b)=>a-b).forEach(r=>{if(st[r]){blocks.push({k:'sb',s:st[r]});if(st[r]!=1&&st[r]!=9)blocks.push({k:'bs'})}blocks.push({k:'l',r,i:L[r]})});
 return{n,api:1,juz:V[0].juz_number,sur:+V[0].verse_key.split(':')[0],blocks}}
async function viaC(n){const d=(await J(`https://api.alquran.cloud/v1/page/${n}/quran-uthmani`)).data,A=d.ayahs,blocks=[];let f=null;
 A.forEach(a=>{let t=a.text;if(a.numberInSurah==1){blocks.push({k:'sb',s:a.surah.number});if(a.surah.number!=1&&a.surah.number!=9){blocks.push({k:'bs'});t=t.split(' ').slice(4).join(' ')}f=null}
  if(!f){f={k:'t',i:[]};blocks.push(f)}t.split(' ').filter(Boolean).forEach(w=>f.i.push({t:w}));f.i.push({e:a.numberInSurah})});
 return{n,juz:A[0].juz,sur:A[0].surah.number,blocks}}
async function pgd(n){if(PG[n])return PG[n];let d=null;
 if(af<2){try{d=await viaQ(n);af=0}catch{af++}}
 if(!d){d=await viaC(n);if(!warned){warned=1;toast('تعذّر تحميل ترتيب المصحف الأصلي، الأسطر هنا تقريبية والنص كما هو')}}return PG[n]=d}
function measure(items){const d=document.createElement('div');d.className='pg m';d.style.cssText='position:absolute;top:0;left:0;font-size:40px;width:max-content';d.innerHTML=items.map(x=>`<span class="ln" style="display:inline-flex">${ih(x)}</span>`).join('');$('#rd').append(d);const w=[...d.children].map(c=>c.offsetWidth);d.remove();return w}
function breakFlows(D,W,Rt){const fl=D.blocks.filter(x=>x.k=='t'),ws=measure(fl.flatMap(f=>f.i));let o=0;fl.forEach(f=>{f.w=ws.slice(o,o+f.i.length);o+=f.i.length});
 const cut=fs=>{const cap=W*40/fs,g=11.2,out=[];fl.forEach(f=>{let cu=[],cw=0;f.i.forEach((x,i)=>{const w=f.w[i];if(!cu.length){cu=[x];cw=w}else if(cw+g+w<=cap){cu.push(x);cw+=g+w}else{out.push({f,i:cu});cu=[x];cw=w}});if(cu.length)out.push({f,i:cu})});return out};
 let fs=12;for(let s=30;s>=12;s-=.25){if(cut(s).length<=Rt){fs=s;break}}
 const res=cut(fs),by=new Map();res.forEach(x=>{if(!by.has(x.f))by.set(x.f,[]);by.get(x.f).push(x.i)});return by}
async function pgv(D){await fontsOk();const o=$('#rd'),pg=$('#pg'),b=$('#rb');if(!pg||RD.p!=D.n)return;
 const W=b.clientWidth-20,H=b.clientHeight,rows=[];
 if(D.api){let c=0;D.blocks.forEach(x=>{c=x.k=='l'?Math.max(c+1,x.r):c+1;rows.push({...x,r:c})})}
 else{const nb=D.blocks.filter(x=>x.k!='t').length,by=breakFlows(D,W,15-nb);let c=0;D.blocks.forEach(x=>{if(x.k!='t'){c++;rows.push({...x,r:c})}else(by.get(x)||[]).forEach(i=>{c++;rows.push({k:'l',r:c,i})})})}
 const total=D.n<=2?Math.max(...rows.map(r=>r.r)):Math.max(15,...rows.map(r=>r.r));
 pg.innerHTML=rows.map(x=>x.k=='sb'?`<div class="sbw" style="grid-row:${x.r}"><div class="sb">${esc(SU[x.s-1]?.name||'سورة')}</div></div>`:x.k=='bs'?`<div class="bsw" style="grid-row:${x.r}">${BSM}</div>`:`<div class="ln" style="grid-row:${x.r}">${x.i.map(ih).join('')}</div>`).join('');
 pg.style.width=W+'px';pg.classList.add('m');pg.style.fontSize='40px';pg.style.gridTemplateRows='';
 const L=$$('#pg .ln'),nat=L.map(l=>l.offsetWidth);let fs=40*W/Math.max(1,...nat);
 if(D.n<=2&&FSN)fs=FSN;else if(D.n>2)FSN=fs;
 const rh=Math.max(H/15,fs*1.85);pg.style.fontSize=fs+'px';pg.style.gridTemplateRows=`repeat(${total},${rh}px)`;
 L.forEach((l,i)=>l.classList.toggle('c',nat[i]*fs/40<.72*W));pg.classList.remove('m');b.scrollTop=0}
async function openP(n,w){n=Math.max(1,Math.min(604,Math.round(n)||1));RD={p:n,w:w===undefined?RD.w:w};LS.s('lp',n);
 await Promise.all([surahs().catch(()=>0),loadMeta()]);const o=$('#rd');
 if(o.hidden){o.hidden=false;o.className=LS.g('rt','d')=='l'?'lt ui':'ui';setTimeout(()=>o.classList.remove('ui'),2400);
  o.innerHTML=`<div class="rtop"><span id="rj"></span><span id="rs"></span></div><div class="rbody" id="rb"><div class="pg" id="pg"></div></div><div class="rft" id="rf"><span class="pn" id="rn"></span></div>
  <div class="rbar"><button class="ib" data-a="rx" aria-label="إغلاق">${ic('close')}</button><span class="sp"></span><button class="ib txt" data-a="gp">${ic('goto')}<span id="rg"></span></button><button class="ib" data-a="th" aria-label="تبديل المظهر">${ic('sun')}</button></div><button class="btn wd" id="wdb" data-a="wd" hidden>${ic('check')}أنهيت وردي اليوم</button>`;
  $('#rb').onclick=()=>o.classList.toggle('ui');
  let sx=0,sy=0;const rb=$('#rb');rb.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
  rb.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>1.6*Math.abs(dy))openP(RD.p+(dx>0?1:-1))},{passive:true});
  openOv(()=>{o.hidden=true;RD.w=null;if(cur=='quran')qv();if(cur=='home')homeQ()})}
 $('#rg').textContent=`صفحة ${fa(n)}`;$('#rn').textContent=fa(n);$('#rf').classList.toggle('ev',n%2==0);
 $('#pg').innerHTML='<p class="rl">جارٍ التحميل…</p>';$('#pg').style.width='';
 try{const d=await pgd(n);if(RD.p!=n)return;$('#rj').textContent=`الجزء ${ORD[d.juz-1]||fa(d.juz)}`;$('#rs').textContent=sn(d.sur);$('#wdb').hidden=!(RD.w&&n==RD.w.b);await pgv(d)}
 catch{if(RD.p==n)$('#pg').innerHTML='<p class="rl">تعذّر التحميل، تحقق من الاتصال.</p>'}
 if(n<604)pgd(n+1).catch(()=>0);if(n>1)pgd(n-1).catch(()=>0)}
addEventListener('resize',()=>{if(!$('#rd').hidden&&PG[RD.p])pgv(PG[RD.p])});
document.fonts?.ready.then(()=>{if(!$('#rd').hidden&&PG[RD.p])pgv(PG[RD.p])});
act.rx=()=>closeTop();
act.th=()=>{const o=$('#rd'),l=o.classList.toggle('lt');LS.s('rt',l?'l':'d')};
act.gp=()=>sheet(`<h3>الانتقال إلى</h3><div class="row" style="gap:8px;margin:10px 0 14px"><input id="gpn" class="inp" style="margin:0" type="number" inputmode="numeric" min="1" max="604" placeholder="رقم الصفحة (١–٦٠٤)"><button class="btn" data-a="gpo">اذهب</button></div><label class="lb">الأجزاء</label><div class="opts" style="grid-template-columns:repeat(5,1fr)">${[...Array(30)].map((_,i)=>`<button data-a="gj" data-v="${US.j[i]}">${fa(i+1)}</button>`).join('')}</div>`);
act.gpo=()=>{const n=+$('#gpn').value;if(n>=1&&n<=604){shut();setTimeout(()=>openP(n),250)}else toast('أدخل رقماً بين ١ و٦٠٤')};
act.gj=v=>{shut();setTimeout(()=>openP(+v),250)};

/* ========== الختمة الجماعية ========== */
const PC={j:5,h:6,r:8};let kU='j';
const addK=(c,n)=>{ud.khs=[...(ud.khs||[]),{c,n}];return setDoc(ref(),{khs:arrayUnion({c,n})},{merge:true})};
function shared(o){if(!me){o.innerHTML=`<div class="card" style="text-align:center"><div class="qc" style="justify-content:center;padding:0 0 10px"><span class="ic">${ic('users')}</span></div><h3>ختمة مع أهلك وأصحابك</h3><p class="m" style="margin:6px 0 14px">سجّل دخولك لتنشئ ختمة أو تنضم إلى ختمة بالرمز.</p><button class="btn w" data-a="ga">تسجيل الدخول</button></div>`;return}
 o.innerHTML=`<div class="row" style="margin-bottom:14px;gap:10px"><button class="btn" style="flex:1" data-a="kn">${ic('plus')}ختمة جديدة</button><button class="btn g" style="flex:1" data-a="kj">انضمام برمز</button></div>${(ud.khs||[]).map(k=>`<div class="li" role="button" tabindex="0" data-a="ko" data-v="${esc(k.c)}"><span class="num">${ic('users')}</span><span class="nm"><b>${esc(k.n)}</b><small>الرمز: ${esc(k.c)}</small></span>${ic('back','fl')}</div>`).join('')||'<p class="emp">أنشئ ختمة وشارك رمزها مع أهلك وأصحابك، وكلٌّ يقرأ جزءاً.</p>'}`}
act.ga=()=>go('me');
act.kn=()=>{kU='j';sheet(`<h3>ختمة جديدة</h3><p class="m">سمِّ الختمة واختر طريقة تقسيمها بين المشاركين.</p><input id="kname" class="inp" placeholder="اسم الختمة، مثال: ختمة العائلة" maxlength="40" autocomplete="off"><label class="lb">التقسيم</label><div class="opts" id="ku">${['j','h','r'].map(u=>`<button class="${u==kU?'on':''}" data-a="ku" data-v="${u}">${fa(UN[u])}<small>${u=='j'?'جزءاً':u=='h'?'حزباً':'ربعاً'}</small></button>`).join('')}</div><div class="acts"><button class="btn g" data-a="sx">إلغاء</button><button class="btn" data-a="kcr">إنشاء</button></div>`);setTimeout(()=>$('#kname')?.focus(),320)};
act.ku=v=>{kU=v;$$('#ku button').forEach(b=>b.classList.toggle('on',b.dataset.v==v))};
act.kcr=async()=>{const n=$('#kname').value.trim();if(!n)return toast('اكتب اسم الختمة');let c;
 try{for(let i=0;i<4;i++){c=Math.random().toString(36).slice(2,8).toUpperCase();if(!(await getDoc(doc(db,'khatmas',c))).exists())break}
  await setDoc(doc(db,'khatmas',c),{name:n,u:kU,n:UN[kU],juz:{},by:me.uid});await addK(c,n)}catch{return toast('تعذّر إنشاء الختمة، حاول مرة أخرى')}
 shut();act.ko(c)};
act.kj=async()=>{const v=await ask('الانضمام إلى ختمة',{d:'اكتب الرمز الذي وصلك من صاحب الختمة.',fields:[{id:'c',ph:'الرمز',dir:'ltr',max:12}],ok:'انضمام'});if(!v||!v.c)return;const c=v.c.toUpperCase();
 try{const s=await getDoc(doc(db,'khatmas',c));if(!s.exists())return toast('الرمز غير صحيح');if(!(ud.khs||[]).some(k=>k.c==c))await addK(c,s.data().name);act.ko(c)}catch{toast('تعذّر الانضمام، تحقق من الاتصال')}};
act.ko=c=>{if(unsub)unsub();unsub=onSnapshot(doc(db,'khatmas',c),s=>{const d=s.data();if(!d){$('#qb').innerHTML='<p class="emp">هذه الختمة غير موجودة.</p>';return}
 const u=d.u||'j',N=d.n||UN[u],j=d.juz||{},n=Object.values(j).filter(x=>x.d).length,free=[...Array(N)].filter((_,i)=>!j[i+1]).length;K={c,j,u,N};
 $('#qb').innerHTML=`<div class="row" style="margin-bottom:12px"><button class="ib" data-a="kb" aria-label="رجوع">${ic('back')}</button><h3 style="flex:1;text-align:center">${esc(d.name)}</h3><button class="ib" data-a="ksh" data-v="${esc(c)}" aria-label="مشاركة">${ic('share')}</button></div>
 <div class="card hero"><small>${n==N?'ما شاء الله، تمّت الختمة':'المنجز'}</small><div class="big3">${fa(n)}/${fa(N)}</div><div class="bar"><i style="width:${n/N*100}%"></i></div><small>الرمز: <b style="color:var(--g2);letter-spacing:2px">${esc(c)}</b> · ${fa(free)} ${u=='j'?'جزءاً':u=='h'?'حزباً':'ربعاً'} متاح</small></div>
 ${free?`<button class="btn g w" style="margin-bottom:12px" data-a="kq">${ic('plus')}احجز لي ${u=='j'?'جزءاً':u=='h'?'حزباً':'ربعاً'} متاحاً</button>`:''}
 <div class="gr" style="grid-template-columns:repeat(${PC[u]},1fr)">${[...Array(N)].map((_,i)=>{const x=j[i+1];return`<button class="u ${x?x.d?'dn':x.u==me.uid?'mine':'tk':''}" data-a="jz" data-v="${i+1}"><b>${fa(i+1)}</b>${u=='r'?'':`<small>${x?esc(x.n).slice(0,8):'متاح'}</small>`}</button>`}).join('')}</div>
 <small>اضغط على المتاح لتحجزه. وعلى ما حجزته لتقرأه أو تُتمّه.</small>`})};
act.kb=()=>qv();
act.ksh=c=>{const t=`انضم لختمتنا في تطبيق نور، الرمز: ${c}`;navigator.share?navigator.share({text:t}).catch(()=>0):navigator.clipboard?.writeText(t).then(()=>toast('نُسخ الرمز'))};
const kref=()=>doc(db,'khatmas',K.c);
act.kq=()=>{const f=[...Array(K.N)].map((_,i)=>i+1).filter(i=>!K.j[i]);if(f.length)act.jz(f[0])};
act.jz=n=>{const x=K.j[n];n=+n;
 if(!x)return updateDoc(kref(),{['juz.'+n]:{u:me.uid,n:ud.name||'مشارك',d:false}}).then(()=>toast(`حجزت ${ul(K.u,n)}`)).catch(()=>toast('تعذّر الحجز'));
 if(x.u!=me.uid)return toast(`محجوز باسم ${x.n}`);
 sheet(`<h3>${ul(K.u,n)}</h3><p class="m">${x.d?'أتممته، تقبّل الله منك.':'محجوز باسمك.'}</p><div class="opts c2"><button data-a="kr" data-v="${n}">اقرأه الآن</button>${x.d?`<button data-a="kd" data-v="${n}:0">إلغاء الإتمام</button>`:`<button data-a="kd" data-v="${n}:1">أتممته ✓</button>`}<button data-a="kx" data-v="${n}" style="grid-column:span 2">تركه لغيري</button></div>`)};
act.kr=n=>{shut();const pg=US[K.u][n-1];setTimeout(()=>openP(pg,null),250)};
act.kd=v=>{const[n,d]=v.split(':');shut();updateDoc(kref(),{['juz.'+n]:{...K.j[n],d:d=='1'}}).catch(()=>toast('تعذّر التحديث'))};
act.kx=n=>{shut();updateDoc(kref(),{['juz.'+n]:deleteField()}).catch(()=>toast('تعذّر التحديث'))};

/* ========== الحساب ========== */
const er={'auth/invalid-credential':'بيانات الدخول غير صحيحة','auth/email-already-in-use':'البريد مسجّل مسبقاً','auth/weak-password':'كلمة المرور ضعيفة (٦ أحرف على الأقل)','auth/invalid-email':'البريد غير صحيح','auth/network-request-failed':'تحقق من اتصالك بالإنترنت','auth/too-many-requests':'محاولات كثيرة، حاول لاحقاً','auth/popup-closed-by-user':'أُغلقت نافذة الدخول'};
const fail=e=>{const m=$('#er');if(m)m.textContent=er[e.code]||'تعذّر إكمال العملية، حاول مرة أخرى'};
act.li=()=>login(auth,$('#em').value,$('#pw').value).catch(fail);
act.su=async()=>{try{const c=await reg(auth,$('#em').value,$('#pw').value),n=$('#nm').value||'ضيف';await upd(c.user,{displayName:n});me=auth.currentUser;await save({name:n});meView()}catch(e){fail(e)}};
act.gg=()=>pop(auth,new GP()).catch(fail);
act.lo=async()=>{if(!await conf('تسجيل الخروج؟','يبقى تقدّمك محفوظاً في حسابك.','خروج'))return;flush();out(auth)};
act.en=async()=>{const v=await ask('تعديل الاسم',{fields:[{id:'n',ph:'الاسم',val:ud.name||'',max:30}]});if(!v||!v.n)return;try{await upd(me,{displayName:v.n})}catch{}await save({name:v.n});meView()};
function meView(){const o=$('#me');
 o.innerHTML=me?`<h2>حسابي</h2><div class="card hero"><div class="av">${esc((ud.name||me.email||'؟')[0])}</div><h3>${esc(ud.name||'ضيف')}</h3><small>${esc(me.email||'')}</small><div style="margin-top:12px"><button class="btn g sm" data-a="en">تعديل الاسم</button></div></div><div class="stats"><div class="card">${ic('flame')}<b>${fa(ud.streak||0)}</b><small>أيام متتالية</small></div><div class="card">${ic('star8')}<b>${fa(ud.tasbih||0)}</b><small>تسبيحة</small></div><div class="card">${ic('book')}<b>${fa((PLAN()||{}).pos||0)}</b><small>صفحة مقروءة</small></div></div><button class="btn g w" data-a="lo">${ic('out')}تسجيل الخروج</button>`
 :`<h2>حسابي</h2><div class="card"><p class="m" style="margin-bottom:14px">سجّل لتحفظ تقدّمك وتشارك الختمات.</p><input id="em" class="inp" type="email" dir="ltr" placeholder="البريد الإلكتروني" autocomplete="email"><input id="pw" class="inp" type="password" dir="ltr" placeholder="كلمة المرور" autocomplete="current-password"><input id="nm" class="inp" placeholder="الاسم (للحساب الجديد)" autocomplete="name"><button class="btn w" style="margin-bottom:10px" data-a="li">دخول</button><button class="btn g w" style="margin-bottom:10px" data-a="su">حساب جديد</button><button class="btn g w" data-a="gg">المتابعة بحساب Google</button><p id="er" class="er"></p></div>`}
init.me=meView;
onAuth(auth,async u=>{me=u;ud={};
 if(u){try{ud=(await getDoc(ref())).data()||{}}catch{}
  const d=dstr(new Date()),y=dstr(new Date(Date.now()-864e5));
  if(ud.day!=d){ud.streak=ud.day==y?(ud.streak||0)+1:1;ud.day=d}
  const lp=LS.g('plan',null);if(!ud.plan&&lp)ud.plan=lp;
  save({plan:ud.plan||null,streak:ud.streak,day:ud.day,name:ud.name||u.displayName||''})}
 if(cur=='me')meView();if(cur=='quran')qv();if(cur=='home')homeQ()});
loadMeta();go('home');
