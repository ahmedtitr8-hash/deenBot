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
async function azkar(){if(AZ)return AZ;const j=await J('https://raw.githubusercontent.com/nawafalqari/azkar-api/main/azkar.json'),it=x=>({t:x.zekr||x.content||x.text||'',n:+(x.repeat||x.count)||1,s:x.bless||x.description||x.reference||''}),f=a=>a.flat().filter(x=>x&&typeof x=='object').map(it).filter(x=>typeof x.t=='string'&&x.t);AZ={};
 if(Array.isArray(j))j.forEach(c=>AZ[c.title||c.category]=f(c.content||c.array||[]));else for(const k in j)if(Array.isArray(j[k]))AZ[k]=f(j[k]);
 for(const k in AZ)if(!AZ[k].length)delete AZ[k];return AZ}
const flush=()=>{if(me&&pend){setDoc(ref(),{tasbih:increment(pend)},{merge:true});ud.tasbih=(ud.tasbih||0)+pend}pend=0};
act.tap=()=>{tc++;pend++;localStorage.tc=tc;$('#tc').textContent=fa(tc);navigator.vibrate?.(12);clearTimeout(tm);tm=setTimeout(flush,2500)};
act.tz=()=>{tc=0;localStorage.tc=0;$('#tc').textContent=fa(0)};
init.azkar=async()=>{if(init.azkar.d)return;init.azkar.d=1;
 $('#azkar').innerHTML=`<h2>الأذكار</h2><div class="card"><small>المسبحة</small><button class="tap" data-a="tap" id="tc">${fa(tc)}</button><div class="row"><small>تُحفظ في حسابك</small><button class="ghost" data-a="tz">تصفير</button></div></div><div class="chips" id="cats"></div><div id="ai"></div>`;
 try{const a=await azkar();$('#cats').innerHTML=Object.keys(a).map(k=>`<button data-a="ac" data-v="${esc(k)}">${esc(k)}</button>`).join('');act.ac(Object.keys(a)[0])}catch{$('#ai').innerHTML='<p class="m">تعذّر تحميل الأذكار، تحقق من الاتصال.</p>'}};
act.ac=k=>{document.querySelectorAll('#cats button').forEach(b=>b.classList.toggle('on',b.dataset.v==k));
 $('#ai').innerHTML=AZ[k].map(x=>`<div class="card z" data-a="z" data-n="${x.n}"><p class="ar">${esc(x.t)}</p><div class="fo"><small>${esc(x.s)}</small><b>${fa(x.n)}</b></div></div>`).join('')};
act.z=(v,b)=>{const n=+b.dataset.n-1;if(n<0)return;b.dataset.n=n;b.querySelector('b').textContent=fa(n);navigator.vibrate?.(8);if(!n)b.classList.add('dn')};

/* الراديو */
let RA,RC,rm=0,rid=null,mi=0;const au=$('#au');
function play(u,t,s){au.src=u.replace(/^http:/,'https:');au.play();$('#mt').textContent=t;$('#ms').textContent=s||'';$('#mini').hidden=false;
 if(navigator.mediaSession)navigator.mediaSession.metadata=new MediaMetadata({title:t,artist:s||'نور',artwork:[{src:'icons/icon-512.png',sizes:'512x512',type:'image/png'}]})}
au.onplay=au.onpause=()=>$('#mp').textContent=au.paused?'▶':'❚❚';$('#mp').onclick=()=>au.paused?au.play():au.pause();
const rl=()=>{const q=$('#rq').value.trim(),o=$('#rl');
 o.innerHTML=(rm?RC:RA).filter(r=>r.name.includes(q)).map(r=>`<button class="li" data-a="${rm?'rc':'pr'}" data-v="${r.id}"><span>${esc(r.name)}</span><i>${rm?'':'▶'}</i></button>`).join('')};
const rd2=()=>{const r=RC.find(x=>x.id==rid),m=r.moshaf[mi];$('#rl').innerHTML=`<button class="ghost" data-a="rb">→ رجوع</button><h3 style="margin:10px 0">${esc(r.name)}</h3>`+(r.moshaf.length>1?`<select data-a="mo">${r.moshaf.map((x,i)=>`<option value="${i}" ${i==mi?'selected':''}>${esc(x.name)}</option>`).join('')}</select>`:'')+m.surah_list.split(',').map(n=>`<button class="li" data-a="ps" data-v="${n}"><span>${fa(n)}. ${esc(SU[n-1]?.name)}</span><i>▶</i></button>`).join('')};
init.radio=async()=>{if(init.radio.d)return;init.radio.d=1;
 $('#radio').innerHTML=`<h2>الراديو</h2><div class="seg"><button class="on" data-a="rs" data-v="0">الإذاعات</button><button data-a="rs" data-v="1">القرّاء</button></div><input id="rq" placeholder="ابحث..."><div id="rl"><p class="m">جارٍ التحميل…</p></div>`;
 try{const[a,c]=await Promise.all([J('https://mp3quran.net/api/v3/radios?language=ar'),J('https://mp3quran.net/api/v3/reciters?language=ar'),surahs()]),k=/الحرم|مكة|المدينة/;
  RA=a.radios.sort((x,y)=>k.test(y.name)-k.test(x.name));RC=c.reciters;rl()}catch{$('#rl').innerHTML='<p class="m">تعذّر التحميل، تحقق من الاتصال.</p>'}};
act.rs=v=>{if(!RA)return;rm=+v;rid=null;document.querySelectorAll('#radio .seg button').forEach((b,i)=>b.classList.toggle('on',i==rm));rl()};
act.pr=v=>{const r=RA.find(x=>x.id==v);play(r.url,r.name,'بث مباشر')};
act.rc=v=>{rid=v;mi=0;rd2()};act.rb=()=>{rid=null;rl()};
act.ps=n=>{const r=RC.find(x=>x.id==rid);play(r.moshaf[mi].server+String(n).padStart(3,'0')+'.mp3',SU[n-1].name,r.name)};

/* القرآن والختمة */
let qm=0;const rdset=()=>new Set(ud.read||JSON.parse(localStorage.read||'[]'));
init.quran=()=>{if(!init.quran.d){init.quran.d=1;$('#quran').innerHTML=`<h2>القرآن الكريم</h2><div class="seg">${['الفهرس','ختمتي','ختمة جماعية'].map((x,i)=>`<button data-a="qs" data-v="${i}">${x}</button>`).join('')}</div><div id="qb"></div>`}qv()};
act.qs=v=>{qm=+v;qv()};
async function qv(){document.querySelectorAll('#quran .seg button').forEach((b,i)=>b.classList.toggle('on',i==qm));const o=$('#qb');if(unsub){unsub();unsub=0}
 try{await surahs()}catch{o.innerHTML='<p class="m">تعذّر التحميل، تحقق من الاتصال.</p>';return}
 if(qm==0){o.innerHTML='<input id="sq" placeholder="ابحث عن سورة أو رقمها"><div id="sl"></div>';sl()}else if(qm==1)prog(o);else shared(o)}
function sl(){const q=$('#sq').value.trim(),s=rdset();$('#sl').innerHTML=SU.filter(x=>!q||x.name.includes(q)||x.englishName.toLowerCase().includes(q.toLowerCase())||x.number==q).map(x=>`<button class="li" data-a="sr" data-v="${x.number}"><span>${fa(x.number)}. ${esc(x.name)}<br><small>${x.revelationType=='Meccan'?'مكية':'مدنية'} · ${fa(x.numberOfAyahs)} آية</small></span><i>${s.has(x.number)?'✓':''}</i></button>`).join('')}
function prog(o){const s=rdset(),t=SU.reduce((a,x)=>a+(s.has(x.number)?x.numberOfAyahs:0),0),p=Math.round(t/6236*100),l=localStorage.last;
 o.innerHTML=`<div class="card np"><small>تقدّمك في الختمة</small><div id="nc">${fa(p)}٪</div><div class="bar"><i style="width:${p}%"></i></div><small>${fa(s.size)} من ١١٤ سورة</small></div>${l?`<button style="width:100%" data-a="sr" data-v="${l}">أكمل من ${esc(SU[l-1].name)}</button>`:''}<div class="gr">${SU.map(x=>`<button class="${s.has(x.number)?'on':''}" data-a="mk" data-v="${x.number}">${fa(x.number)}</button>`).join('')}</div><small>اضغط رقم السورة لتحديدها كمقروءة.</small>`}
act.mk=(v,b)=>{const s=rdset(),n=+v;s.has(n)?s.delete(n):s.add(n);const a=[...s];localStorage.read=JSON.stringify(a);save({read:a});b.classList.toggle('on',s.has(n));if(qm==1&&cur=='quran'&&b.closest('.gr'))prog($('#qb'))};
act.sr=async n=>{const o=$('#rd');o.hidden=false;o.innerHTML='<p class="m">جارٍ التحميل…</p>';
 try{const s=(await J(`https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`)).data;localStorage.last=n;
  o.innerHTML=`<div class="rh"><button class="ghost" data-a="rx">✕</button><b class="ar">${esc(s.name)}</b><button class="ghost ${rdset().has(+n)?'on':''}" data-a="mk" data-v="${n}">ختمتها ✓</button></div><div class="mus">${s.ayahs.map(a=>`${esc(a.text)} <span class="an">﴿${fa(a.numberInSurah)}﴾</span>`).join(' ')}</div>`;o.scrollTop=0}catch{o.innerHTML='<button class="ghost" data-a="rx">✕</button><p class="m">تعذّر التحميل.</p>'}};
act.rx=()=>{$('#rd').hidden=true;if(qm==0&&$('#sl'))sl();if(qm==1)prog($('#qb'))};
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
const fail=e=>{$('#er').textContent=er[e.code]||'تعذّر إكمال العملية، حاول مرة أخرى'};
act.li=()=>login(auth,$('#em').value,$('#pw').value).catch(fail);
act.su=async()=>{try{const c=await reg(auth,$('#em').value,$('#pw').value),n=$('#nm').value||'ضيف';await upd(c.user,{displayName:n});me=auth.currentUser;await save({name:n});meView()}catch(e){fail(e)}};
act.gg=()=>pop(auth,new GP()).catch(fail);act.lo=()=>{flush();out(auth)};
function meView(){const o=$('#me');
 o.innerHTML=me?`<h2>حسابي</h2><div class="card np"><div class="av">${esc((ud.name||me.email||'؟')[0])}</div><h3>${esc(ud.name||'ضيف')}</h3><small>${esc(me.email||'')}</small></div><div class="stats"><div class="card"><b>${fa(ud.streak||0)}</b><small>أيام متتالية</small></div><div class="card"><b>${fa(ud.tasbih||0)}</b><small>تسبيحة</small></div><div class="card"><b>${fa((ud.read||[]).length)}</b><small>سورة مقروءة</small></div></div><button class="ghost" style="width:100%" data-a="lo">تسجيل الخروج</button>`
 :`<h2>حسابي</h2><div class="card"><p class="m" style="margin-bottom:12px">سجّل لتحفظ تقدّمك وتشارك الختمات.</p><input id="em" type="email" dir="ltr" placeholder="البريد الإلكتروني"><input id="pw" type="password" dir="ltr" placeholder="كلمة المرور"><input id="nm" placeholder="الاسم (للحساب الجديد)"><button style="width:100%;margin-bottom:8px" data-a="li">دخول</button><button class="ghost" style="width:100%;margin-bottom:8px" data-a="su">حساب جديد</button><button class="ghost" style="width:100%" data-a="gg">المتابعة بحساب Google</button><p id="er" class="er"></p></div>`}
init.me=meView;
onAuth(auth,async u=>{me=u;ud={};
 if(u){try{ud=(await getDoc(ref())).data()||{}}catch{}
  const d=new Date().toISOString().slice(0,10),y=new Date(Date.now()-864e5).toISOString().slice(0,10);
  if(ud.day!=d){ud.streak=ud.day==y?(ud.streak||0)+1:1;ud.day=d}
  save({read:[...new Set([...(ud.read||[]),...JSON.parse(localStorage.read||'[]')])],streak:ud.streak,day:ud.day,name:ud.name||u.displayName||''})}
 if(cur=='me')meView();if(cur=='quran')qv()});
go('home');
