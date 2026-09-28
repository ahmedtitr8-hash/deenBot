import{initializeApp}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import{getAuth,onAuthStateChanged as onAuth,createUserWithEmailAndPassword as reg,signInWithEmailAndPassword as login,signInWithPopup as pop,GoogleAuthProvider as GP,signOut as out,updateProfile as upd}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import{getFirestore,doc,getDoc,setDoc,updateDoc,onSnapshot,increment,arrayUnion,deleteField}from'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import{firebaseConfig as cfg}from'./firebase-config.js';
const $=s=>document.querySelector(s),J=u=>fetch(u).then(r=>{if(!r.ok)throw 0;return r.json()});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fa=n=>Number(n).toLocaleString('ar-EG'),day=()=>Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/864e5);
const auth=getAuth(initializeApp(cfg)),db=getFirestore();
let me=null,ud={},cur='home',SU=[],unsub=0,K;const T=['home','azkar','radio','quran','me'],init={},act={};
const ref=()=>doc(db,'users',me.uid);
const save=async o=>{Object.assign(ud,o);if(me)try{await setDoc(ref(),o,{merge:true})}catch{}};
const cache=async(k,f)=>{const d=new Date().toDateString(),c=JSON.parse(localStorage[k]||'{}');if(c.d==d)return c.v;const v=await f();localStorage[k]=JSON.stringify({d,v});return v};
const go=t=>{cur=t;T.forEach(x=>{$('#'+x).hidden=x!=t;$('#n'+x).classList.toggle('on',x==t)});init[t]&&init[t]();scrollTo(0,0)};
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>go(b.dataset.t));
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&act[b.dataset.a])act[b.dataset.a](b.dataset.v,b)});
document.addEventListener('change',e=>{if(e.target.dataset.a=='mo'){mi=+e.target.value;rd2()}});
document.addEventListener('input',e=>{if(e.target.id=='sq')sl();if(e.target.id=='rq'&&RA)rl()});
const surahs=async()=>SU.length?SU:(SU=(await J('https://api.alquran.cloud/v1/surah')).data);

/* الرئيسية */
const P={Fajr:'الفجر',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'};let tick;
async function prayers(){let p={coords:{latitude:21.4225,longitude:39.8262}};
 try{p=await new Promise((r,j)=>navigator.geolocation.getCurrentPosition(r,j,{timeout:8000}))}catch{}
 const d=new Date();return(await J(`https://api.aladhan.com/v1/timings/${d.getDate()}-${d.getMonth()+1}-${d.getFullYear()}?latitude=${p.coords.latitude}&longitude=${p.coords.longitude}&method=4`)).data}
function run(t){clearInterval(tick);const z=x=>String(x).padStart(2,'0'),at=(k,add)=>{const[h,m]=t[k].slice(0,5).split(':'),d=new Date();d.setDate(d.getDate()+add);d.setHours(+h,+m,0,0);return d};
 const f=()=>{const n=new Date();let x=Object.keys(P).map(k=>[k,at(k,0)]).find(a=>a[1]>n)||['Fajr',at('Fajr',1)],s=Math.floor((x[1]-n)/1e3);
  $('#nn').textContent=P[x[0]];$('#nc').textContent=`${z(s/3600|0)}:${z(s/60%60|0)}:${z(s%60)}`;
  document.querySelectorAll('.pl div').forEach(d=>d.classList.toggle('on',d.dataset.k==x[0]))};f();tick=setInterval(f,1000)}
init.home=async()=>{if(init.home.d)return;init.home.d=1;
 $('#home').innerHTML=`<h1>السلام عليكم</h1><p class="m" id="hj">&nbsp;</p><br><div class="card np"><small>الصلاة القادمة</small><h2 id="nn">…</h2><div id="nc">--:--:--</div></div><div class="pl" id="pl"></div><div class="card" id="dk"><small>ذكر اليوم</small></div><div class="card" id="hd"><small>حديث اليوم</small></div>`;
 try{const d=await cache('pt',prayers),t=d.timings,h=d.date.hijri;$('#hj').textContent=`${fa(h.day)} ${h.month.ar} ${fa(h.year)} هـ`;
  $('#pl').innerHTML=Object.keys(P).map(k=>`<div data-k="${k}"><small>${P[k]}</small><b>${t[k].slice(0,5)}</b></div>`).join('');run(t)}catch{$('#nn').textContent='تعذّر تحميل المواقيت'}
 try{const a=Object.values(await azkar()).flat().filter(x=>x.t.length<220),z=a[day()*7%a.length];$('#dk').innerHTML+=`<p class="ar">${esc(z.t)}</p><small>${esc(z.s)}</small>`}catch{}
 try{const n=day()%42+1,h=await cache('hdc',()=>J(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-nawawi/${n}.json`).then(j=>j.hadiths?.[0]?.text||j.text));$('#hd').innerHTML+=`<p class="ar">${esc(h)}</p><small>الأربعون النووية · حديث ${fa(n)}</small>`}catch{}};

/* الأذكار والمسبحة */
let AZ,tc=+localStorage.tc||0,pend=0,tm;
const azkar=async()=>AZ||(AZ=await J('azkar.json'));
const flush=()=>{if(me&&pend){setDoc(ref(),{tasbih:increment(pend)},{merge:true});ud.tasbih=(ud.tasbih||0)+pend}pend=0};
act.tap=()=>{tc++;pend++;localStorage.tc=tc;$('#tc').textContent=fa(tc);navigator.vibrate?.(12);clearTimeout(tm);tm=setTimeout(flush,2500)};
act.tz=()=>{tc=0;localStorage.tc=0;$('#tc').textContent=fa(0)};
async function azHome(){const o=$('#azkar');try{const a=await azkar();o.innerHTML=`<h2>الأذكار</h2><div class="tl">${Object.keys(a).map(k=>`<button data-a="ac" data-v="${esc(k)}"><b>${esc(k)}</b><small>${fa(a[k].length)} ذكر</small></button>`).join('')}<button class="w" data-a="tb"><b>المسبحة</b><small>عدّاد التسبيح</small></button></div>`}catch{o.innerHTML='<h2>الأذكار</h2><p class="m">تعذّر تحميل الأذكار.</p>'}}
init.azkar=azHome;act.ab=azHome;
act.tb=()=>{$('#azkar').innerHTML=`<button class="ghost" data-a="ab">→ رجوع</button><div class="card" style="margin-top:10px"><small>المسبحة</small><button class="tap" data-a="tap" id="tc">${fa(tc)}</button><div class="row"><small>يُحفظ إجمالي تسبيحك في حسابك</small><button class="ghost" data-a="tz">تصفير</button></div></div>`};
act.ac=k=>{$('#azkar').innerHTML=`<button class="ghost" data-a="ab">→ رجوع</button><h2 style="margin:12px 0">${esc(k)}</h2>`+AZ[k].map(x=>`<div class="card z" data-a="z" data-n="${x.n}"><p class="ar">${esc(x.t)}</p><div class="fo"><small>${esc(x.s)}</small><b>${fa(x.n)}</b></div></div>`).join('');scrollTo(0,0)};
act.z=(v,b)=>{const n=+b.dataset.n-1;if(n<0)return;b.dataset.n=n;b.querySelector('b').textContent=fa(n);navigator.vibrate?.(8);if(!n)b.classList.add('dn')};

/* الراديو */
let RA,RC,rm=0,rid=null,mi=0,PL=null;const au=$('#au');
function play(u,t,s,o={}){au.src=u.replace(/^http:/,'https:');au.play();PL={t,s,...o};$('#mt').textContent=t;$('#ms').textContent=s||'';$('#mini').hidden=false;if(!$('#fp').hidden)fpv();
 if(navigator.mediaSession)navigator.mediaSession.metadata=new MediaMetadata({title:t,artist:s||'نور',artwork:[{src:'icons/icon-512.png',sizes:'512x512',type:'image/png'}]})}
const tf=s=>isFinite(s)?`${s/60|0}:${String(s%60|0).padStart(2,'0')}`:'0:00';
au.onplay=au.onpause=()=>{const t=au.paused?'▶':'❚❚';$('#mp').textContent=t;const p=$('#pp');if(p)p.textContent=t};
$('#mp').onclick=e=>{e.stopPropagation();au.paused?au.play():au.pause()};
au.ontimeupdate=()=>{const k=$('#sk');if(k&&PL&&!PL.live&&au.duration){k.max=au.duration;k.value=au.currentTime;$('#t1').textContent=tf(au.currentTime);$('#t2').textContent=tf(au.duration)}};
au.onended=()=>act.nx();
function fpv(){const o=$('#fp');o.hidden=false;
 o.innerHTML=`<div class="rh"><button class="ghost" data-a="fx">⌄</button><small>يُشغَّل الآن</small><span style="width:48px"></span></div><div class="cv ${PL.live?'lv':''}"><div class="ar">${esc(PL.t)}</div><small>${esc(PL.s)}</small></div><input type="range" id="sk" min="0" max="100" value="0" ${PL.live?'disabled':''}><div class="row"><small id="t1">${PL.live?'':'0:00'}</small><small id="t2">${PL.live?'● بث مباشر':'0:00'}</small></div><div class="ctl">${PL.live?'':'<button class="ghost" data-a="pv">⏮</button><button class="ghost" data-a="sb">−١٥</button>'}<button id="pp" data-a="pp">${au.paused?'▶':'❚❚'}</button>${PL.live?'':'<button class="ghost" data-a="sf">+١٥</button><button class="ghost" data-a="nx">⏭</button>'}</div>`;
 $('#sk').oninput=e=>{au.currentTime=e.target.value}}
act.fo=()=>PL&&fpv();act.fx=()=>{$('#fp').hidden=true};act.pp=()=>au.paused?au.play():au.pause();
act.sb=()=>{au.currentTime-=15};act.sf=()=>{au.currentTime+=15};
const playS=(r,m,n)=>play(r.moshaf[m].server+String(n).padStart(3,'0')+'.mp3',SU[n-1].name,r.name,{n:+n,rid:r.id,mi:m});
const step=d=>{if(!PL||PL.live||PL.n==null)return;const r=RC.find(x=>x.id==PL.rid),l=r.moshaf[PL.mi].surah_list.split(','),i=l.indexOf(String(PL.n))+d;if(l[i])playS(r,PL.mi,l[i])};
act.pv=()=>step(-1);act.nx=()=>step(1);
act.pr=v=>{const r=RA.find(x=>x.id==v);play(r.url,r.name,'بث مباشر',{live:1})};
act.ps=n=>playS(RC.find(x=>x.id==rid),mi,n);
const rl=()=>{const q=$('#rq').value.trim(),o=$('#rl');
 o.innerHTML=(rm?RC:RA).filter(r=>r.name.includes(q)).map(r=>`<button class="li" data-a="${rm?'rc':'pr'}" data-v="${r.id}"><span>${esc(r.name)}</span><i>${rm?'':'▶'}</i></button>`).join('')};
const rd2=()=>{const r=RC.find(x=>x.id==rid),m=r.moshaf[mi];$('#rl').innerHTML=`<button class="ghost" data-a="rb">→ رجوع</button><h3 style="margin:10px 0">${esc(r.name)}</h3>`+(r.moshaf.length>1?`<select data-a="mo">${r.moshaf.map((x,i)=>`<option value="${i}" ${i==mi?'selected':''}>${esc(x.name)}</option>`).join('')}</select>`:'')+m.surah_list.split(',').map(n=>`<button class="li" data-a="ps" data-v="${n}"><span>${fa(n)}. ${esc(SU[n-1]?.name)}</span><i>▶</i></button>`).join('')};
init.radio=async()=>{if(init.radio.d)return;init.radio.d=1;
 $('#radio').innerHTML=`<h2>الراديو</h2><div class="seg"><button class="on" data-a="rs" data-v="0">الإذاعات</button><button data-a="rs" data-v="1">القرّاء</button></div><input id="rq" placeholder="ابحث..."><div id="rl"><p class="m">جارٍ التحميل…</p></div>`;
 try{const[a,c]=await Promise.all([J('https://mp3quran.net/api/v3/radios?language=ar'),J('https://mp3quran.net/api/v3/reciters?language=ar'),surahs()]),k=/الحرم|مكة|المدينة/;
  RA=a.radios.sort((x,y)=>k.test(y.name)-k.test(x.name));RC=c.reciters;rl()}catch{$('#rl').innerHTML='<p class="m">تعذّر التحميل، تحقق من الاتصال.</p>'}};
act.rs=v=>{if(!RA)return;rm=+v;rid=null;document.querySelectorAll('#radio .seg button').forEach((b,i)=>b.classList.toggle('on',i==rm));rl()};
act.rc=v=>{rid=v;mi=0;rd2()};act.rb=()=>{rid=null;rl()};

/* القرآن والختمة */
let qm=0,RD={p:1,w:null};const PG={};
const pgd=async n=>PG[n]||(PG[n]=(await J(`https://api.alquran.cloud/v1/page/${n}/quran-uthmani`)).data);
const dstr=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10),PLAN=()=>ud.plan||JSON.parse(localStorage.plan||'null');
const savePlan=p=>{localStorage.plan=JSON.stringify(p);save({plan:p})};
const wird=p=>{const e=Math.max(0,Math.floor((new Date(dstr(new Date()))-new Date(p.start))/864e5)),end=Math.min(604,Math.ceil(604*(e+1)/p.days)),a=Math.min(604,p.pos+1);return{a,b:Math.max(a,end),e,end}};
init.quran=()=>{if(!init.quran.d){init.quran.d=1;$('#quran').innerHTML=`<h2>القرآن الكريم</h2><div class="seg">${['الفهرس','وِردي','ختمة جماعية'].map((x,i)=>`<button data-a="qs" data-v="${i}">${x}</button>`).join('')}</div><div id="qb"></div>`}qv()};
act.qs=v=>{qm=+v;qv()};
async function qv(){document.querySelectorAll('#quran .seg button').forEach((b,i)=>b.classList.toggle('on',i==qm));const o=$('#qb');if(unsub){unsub();unsub=0}
 if(qm==1)return plan(o);if(qm==2)return shared(o);
 try{await surahs()}catch{o.innerHTML='<p class="m">تعذّر التحميل، تحقق من الاتصال.</p>';return}
 o.innerHTML=`${localStorage.lp?`<button class="ghost" style="width:100%;margin-bottom:10px" data-a="lp">تابع من صفحة ${fa(localStorage.lp)}</button>`:''}<input id="sq" placeholder="ابحث عن سورة أو رقمها"><div id="sl"></div>`;sl()}
function sl(){const q=$('#sq').value.trim();$('#sl').innerHTML=SU.filter(x=>!q||x.name.includes(q)||x.englishName.toLowerCase().includes(q.toLowerCase())||x.number==q).map(x=>`<button class="li" data-a="sp" data-v="${x.number}"><span>${fa(x.number)}. ${esc(x.name)}<br><small>${x.revelationType=='Meccan'?'مكية':'مدنية'} · ${fa(x.numberOfAyahs)} آية</small></span></button>`).join('')}
act.sp=async n=>{try{openP((await J(`https://api.alquran.cloud/v1/ayah/${n}:1`)).data.page,null)}catch{}};
act.lp=()=>openP(+localStorage.lp,null);
function plan(o){const p=PLAN();
 if(!p){o.innerHTML=`<div class="card"><h3>خطة الختمة</h3><p class="m" style="margin:6px 0 12px">اختر المدة التي تريد أن تختم فيها القرآن، ويصلك وردك كل يوم.</p><div class="gr" style="grid-template-columns:repeat(3,1fr)">${[7,15,30,60,90,180].map(d=>`<button data-a="pn" data-v="${d}">${fa(d)} يوم</button>`).join('')}</div><input id="cd" type="number" min="1" placeholder="أو اكتب عدد الأيام"><button style="width:100%" data-a="pn" data-v="0">ابدأ الخطة</button></div>`;return}
 const w=wird(p),pct=Math.round(p.pos/604*100),dn=p.pos>=604,ok=p.pos>=w.end;
 o.innerHTML=`<div class="card np"><small>وردك اليوم · اليوم ${fa(Math.min(w.e+1,p.days))} من ${fa(p.days)}</small>${dn?'<h2>ما شاء الله، ختمتَ القرآن</h2>':ok?'<h2>أتممت وردك اليوم</h2>':`<div id="nc">${fa(w.a)}–${fa(w.b)}</div><small>${fa(w.b-w.a+1)} صفحة</small>`}<div class="bar"><i style="width:${pct}%"></i></div><small>${fa(p.pos)} من ٦٠٤ صفحة · ${fa(pct)}٪</small></div>${dn||ok?'':'<button style="width:100%" data-a="pw">ابدأ القراءة</button>'}<button class="ghost" style="width:100%;margin-top:8px" data-a="pc">تغيير الخطة</button>`}
act.pn=v=>{const d=+v||+($('#cd')||{}).value;if(!d||d<1||d>3650)return;savePlan({start:dstr(new Date()),days:Math.round(d),pos:+localStorage.pos||0});plan($('#qb'))};
act.pc=()=>{const p=PLAN();if(!confirm('تغيير الخطة؟ يبقى تقدّمك كما هو.'))return;localStorage.pos=p.pos;localStorage.plan='null';save({plan:null});plan($('#qb'))};
act.pw=()=>{const w=wird(PLAN());openP(w.a,w)};
act.wd=()=>{const p=PLAN();p.pos=Math.max(p.pos,RD.w.b);RD.w=null;savePlan(p);act.rx()};
act.rx=()=>{$('#rd').hidden=true;if(cur=='quran'&&qm==1)plan($('#qb'))};
act.gp=()=>{const n=+prompt('رقم الصفحة (١–٦٠٤)');if(n>=1&&n<=604)openP(n)};
async function openP(n,w){n=Math.max(1,Math.min(604,n));RD={p:n,w:w===undefined?RD.w:w};localStorage.lp=n;const o=$('#rd');o.hidden=false;
 if(!PG[n])o.innerHTML='<div class="mp"><p class="m" style="margin:auto;padding:30px">جارٍ التحميل…</p></div>';
 try{const d=await pgd(n);if(RD.p==n)pgv(d)}catch{o.innerHTML='<button class="ghost" data-a="rx">✕</button><p class="m">تعذّر التحميل، تحقق من الاتصال.</p>'}
 if(n<604)pgd(n+1).catch(()=>0)}
function pgv(d){const o=$('#rd'),A=d.ayahs;let h='';
 A.forEach(a=>{let t=a.text;if(a.numberInSurah==1){h+=`<div class="sb">${esc(a.surah.name)}</div>`;if(a.surah.number!=1&&a.surah.number!=9){h+='<div class="bs">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>';t=t.split(' ').slice(4).join(' ')}}
  h+=`${esc(t)} <span class="an">﴿${fa(a.numberInSurah)}﴾</span> `});
 const w=RD.w;
 o.innerHTML=`<div class="rh"><button class="ghost" data-a="rx">✕</button><small>${esc(A[0].surah.name)} · الجزء ${fa(A[0].juz)}</small><button class="ghost" data-a="gp">صفحة ${fa(d.number)}</button></div><div class="mp" id="mp1"><div class="mt">${h}</div></div>${w&&d.number==w.b?'<button class="wd" data-a="wd">أنهيت وردي اليوم ✓</button>':''}`;
 fit();document.fonts&&document.fonts.ready.then(fit)}
function fit(){const p=$('#mp1');if(!p)return;const t=p.firstChild;let s=30;t.style.fontSize=s+'px';while(t.scrollHeight>p.clientHeight-8&&s>12){s--;t.style.fontSize=s+'px'}}
let sx=0;document.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
document.addEventListener('touchend',e=>{if($('#rd').hidden||!$('#mp1'))return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>60)openP(RD.p+(dx>0?1:-1))},{passive:true});
const addK=(c,n)=>{ud.khs=[...(ud.khs||[]),{c,n}];return setDoc(ref(),{khs:arrayUnion({c,n})},{merge:true})};
function shared(o){if(!me){o.innerHTML='<div class="card">سجّل دخولك من تبويب «حسابي» لتستخدم الختمة الجماعية.</div>';return}
 o.innerHTML=`<div class="row2"><button data-a="kn">ختمة جديدة</button><button class="ghost" data-a="kj">انضمام برمز</button></div>${(ud.khs||[]).map(k=>`<button class="li" data-a="ko" data-v="${esc(k.c)}"><span>${esc(k.n)}</span><i>${esc(k.c)}</i></button>`).join('')||'<p class="m">أنشئ ختمة وشارك رمزها مع أهلك وأصحابك، وكلٌّ يقرأ جزءاً.</p>'}`}
act.kn=async()=>{const n=prompt('اسم الختمة');if(!n)return;const c=Math.random().toString(36).slice(2,8).toUpperCase();await setDoc(doc(db,'khatmas',c),{name:n,juz:{}});await addK(c,n);act.ko(c)};
act.kj=async()=>{const c=(prompt('رمز الختمة')||'').trim().toUpperCase();if(!c)return;const s=await getDoc(doc(db,'khatmas',c));if(!s.exists())return alert('الرمز غير صحيح');if(!(ud.khs||[]).some(k=>k.c==c))await addK(c,s.data().name);act.ko(c)};
act.ko=c=>{if(unsub)unsub();unsub=onSnapshot(doc(db,'khatmas',c),s=>{const d=s.data(),j=d.juz||{},n=Object.values(j).filter(x=>x.d).length;K={c,j};
 $('#qb').innerHTML=`<button class="ghost" data-a="kb">→ رجوع</button><div class="card np" style="margin-top:10px"><small>${esc(d.name)}</small><div id="nc">${fa(n)}/٣٠</div><div class="bar"><i style="width:${n/30*100}%"></i></div><small>الرمز: ${esc(c)}</small> <button class="ghost" data-a="ksh" data-v="${esc(c)}">مشاركة</button></div><div class="gr j">${[...Array(30)].map((_,i)=>{const x=j[i+1];return`<button class="${x?x.d?'dn':x.u==me.uid?'mine':'tk':''}" data-a="jz" data-v="${i+1}"><b>${fa(i+1)}</b><small>${x?esc(x.n).slice(0,8):'متاح'}</small></button>`}).join('')}</div><small>اضغط جزءاً متاحاً لتأخذه، ثم عند إتمامه، ثم مرة أخرى لإلغائه.</small>`})};
act.kb=()=>qv();
act.ksh=c=>{const t=`انضم لختمتنا في تطبيق نور، الرمز: ${c}`;navigator.share?navigator.share({text:t}):navigator.clipboard.writeText(t)};
act.jz=n=>{const x=K.j[n],r=doc(db,'khatmas',K.c);if(!x)updateDoc(r,{['juz.'+n]:{u:me.uid,n:ud.name||'مشارك',d:false}});else if(x.u==me.uid)updateDoc(r,{['juz.'+n]:x.d?deleteField():{...x,d:true}})};

/* الحساب */
const er={'auth/invalid-credential':'بيانات الدخول غير صحيحة','auth/email-already-in-use':'البريد مسجّل مسبقاً','auth/weak-password':'كلمة المرور ضعيفة (٦ أحرف على الأقل)','auth/invalid-email':'البريد غير صحيح'};
const fail=e=>{$('#er').textContent=(er[e.code]||'تعذّر إكمال العملية، حاول مرة أخرى')+' ('+(e.code||e.message||'')+')'};
act.li=()=>login(auth,$('#em').value,$('#pw').value).catch(fail);
act.su=async()=>{try{const c=await reg(auth,$('#em').value,$('#pw').value),n=$('#nm').value||'ضيف';await upd(c.user,{displayName:n});me=auth.currentUser;await save({name:n});meView()}catch(e){fail(e)}};
act.gg=()=>pop(auth,new GP()).catch(fail);act.lo=()=>{flush();out(auth)};
function meView(){const o=$('#me');
 o.innerHTML=me?`<h2>حسابي</h2><div class="card np"><div class="av">${esc((ud.name||me.email||'؟')[0])}</div><h3>${esc(ud.name||'ضيف')}</h3><small>${esc(me.email||'')}</small></div><div class="stats"><div class="card"><b>${fa(ud.streak||0)}</b><small>أيام متتالية</small></div><div class="card"><b>${fa(ud.tasbih||0)}</b><small>تسبيحة</small></div><div class="card"><b>${fa((PLAN()||{}).pos||0)}</b><small>صفحة مقروءة</small></div></div><button class="ghost" style="width:100%" data-a="lo">تسجيل الخروج</button>`
 :`<h2>حسابي</h2><div class="card"><p class="m" style="margin-bottom:12px">سجّل لتحفظ تقدّمك وتشارك الختمات.</p><input id="em" type="email" dir="ltr" placeholder="البريد الإلكتروني"><input id="pw" type="password" dir="ltr" placeholder="كلمة المرور"><input id="nm" placeholder="الاسم (للحساب الجديد)"><button style="width:100%;margin-bottom:8px" data-a="li">دخول</button><button class="ghost" style="width:100%;margin-bottom:8px" data-a="su">حساب جديد</button><button class="ghost" style="width:100%" data-a="gg">المتابعة بحساب Google</button><p id="er" class="er"></p></div>`}
init.me=meView;
onAuth(auth,async u=>{me=u;ud={};
 if(u){try{ud=(await getDoc(ref())).data()||{}}catch{}
  const d=new Date().toISOString().slice(0,10),y=new Date(Date.now()-864e5).toISOString().slice(0,10);
  if(ud.day!=d){ud.streak=ud.day==y?(ud.streak||0)+1:1;ud.day=d}
  if(!ud.plan&&localStorage.plan&&localStorage.plan!='null')ud.plan=JSON.parse(localStorage.plan);save({plan:ud.plan||null,streak:ud.streak,day:ud.day,name:ud.name||u.displayName||''})}
 if(cur=='me')meView();if(cur=='quran')qv()});
go('home');
