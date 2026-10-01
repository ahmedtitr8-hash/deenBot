/* ═══ JS-6: الأذان ═══ */
const AD=()=>Object.assign({on:true,who:'mishari',vol:80,Fajr:true,Dhuhr:true,Asr:true,Maghrib:true,Isha:true,pre:0,wake:false},S.get('ad',{}));
const setAD=(k,v)=>{const a=AD();a[k]=v;S.set('ad',a)};
const aa=new Audio();let aUrl=null,bTm=null,pvId=null;
document.addEventListener('click',()=>{aa.muted=true;aa.src='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';aa.play().catch(()=>{}).then(()=>{aa.muted=false})},{once:true});
function banner(t,auto){$('#adt').textContent=t;$('#adb').style.display='flex';clearTimeout(bTm);if(auto)bTm=setTimeout(()=>$('#adb').style.display='none',9000)}
function stopA(){aa.pause();aa.currentTime=0;pvId=null;$('#adb').style.display='none';$('#mz')&&mzr()}
$('#ads').onclick=stopA;aa.onended=stopA;
async function srcFor(id){const b=await idbGet('ad_'+id);if(b){if(aUrl)URL.revokeObjectURL(aUrl);aUrl=URL.createObjectURL(b);return aUrl}const m=MUEZ.find(x=>x[0]===id);return m&&m[2]?(m[2].startsWith('http')?m[2]:BASE+m[2]):null}
async function playAdhan(id){const s=await srcFor(id);if(!s){banner('اختر ملف أذان من جوالك أولًا',1);return false}aa.src=s;aa.volume=AD().vol/100;try{await aa.play();return true}catch(e){banner('منع المتصفح التشغيل. المس الشاشة مرة ثم أعد المحاولة',1);return false}}
function adhanCheck(now,L){const A=AD();let F=S.get('fired',{});if(F.d!==now.toDateString())F={d:now.toDateString(),k:[]};
  for(const[k,nm,t]of L){if(!t||k==='Sunrise')continue;const dt=(now-t)/1000;
    if(A.on&&A[k]&&dt>=0&&dt<90&&!F.k.includes(k)){F.k.push(k);S.set('fired',F);banner('حان وقت صلاة '+nm);playAdhan(A.who);vib([300,100,300])}
    const pre=+A.pre,r=(t-now)/1000;if(A.on&&pre&&A[k]&&r>0&&r<=pre*60&&!F.k.includes('p'+k)){F.k.push('p'+k);S.set('fired',F);banner(`بقي ${pre} دقائق على صلاة ${nm}`,1);vib([120,80,120])}}}
async function dlAdhan(id){const m=MUEZ.find(x=>x[0]===id);if(!m||!m[2]||await idbGet('ad_'+id))return;try{const b=await (await fetch(m[2].startsWith('http')?m[2]:BASE+m[2])).blob();await idbSet('ad_'+id,b)}catch(e){}}
let wl=null;async function wake(){try{if(AD().wake&&navigator.wakeLock)wl=await navigator.wakeLock.request('screen')}catch(e){}}
document.addEventListener('visibilitychange',()=>!document.hidden&&wake());wake();

