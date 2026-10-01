/* ═══ JS-4: محرك المواقيت (بدون إنترنت) ═══ */
const R=Math.PI/180,sin=x=>Math.sin(x*R),cos=x=>Math.cos(x*R),tan=x=>Math.tan(x*R),asin=x=>Math.asin(x)/R,acos=x=>Math.acos(x)/R,atan2=(y,x)=>Math.atan2(y,x)/R,acot=x=>Math.atan(1/x)/R,fx=(x,a)=>x-a*Math.floor(x/a);
function jd(y,m,d){if(m<=2){y--;m+=12}const A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5}
function sunPos(j){const d=j-2451545,g=fx(357.529+.98560028*d,360),q=fx(280.459+.98564736*d,360),L=fx(q+1.915*sin(g)+.02*sin(2*g),360),e=23.439-3.6e-7*d,RA=fx(atan2(cos(e)*sin(L),cos(L))/15,24);return{dec:asin(sin(e)*sin(L)),eq:q/15-RA}}
function calc(y,m,d,P){const J=jd(y,m,d)-P.lng/360,mid=t=>fx(12-sunPos(J+t).eq,24);
  const ang=(a,t,ccw)=>{const dec=sunPos(J+t).dec,v=acos((-sin(a)-sin(dec)*sin(P.lat))/(cos(dec)*cos(P.lat)));return mid(t)+(ccw?-v:v)/15};
  const asr=(f,t)=>{const dec=sunPos(J+t).dec;return ang(-acot(f+tan(Math.abs(P.lat-dec))),t)};
  let t={f:5,s:6,d:12,a:13,m:18,i:18};
  for(let k=0;k<2;k++){const n={f:ang(P.f,t.f/24,1),s:ang(.833,t.s/24,1),d:mid(t.d/24),a:asr(P.asr,t.a/24),m:ang(.833,t.m/24)};n.i=P.im?n.m+P.im/60:ang(P.i,t.i/24);t=n}
  const z=x=>x+P.tz-P.lng/15;return{Fajr:z(t.f),Sunrise:z(t.s),Dhuhr:z(t.d),Asr:z(t.a),Maghrib:z(t.m),Isha:z(t.i)}}
function tzOff(tz,date){const p={};new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}).formatToParts(date).forEach(x=>p[x.type]=x.value);return(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-Math.floor(date.getTime()/1000)*1000)/36e5}
let loc=S.get('loc',null)||{label:'مكة',lat:21.4225,lng:39.8262,tz:'Asia/Riyadh'},method=S.get('method',4);
const NM={Fajr:'الفجر',Sunrise:'الشروق',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'},KEYS=Object.keys(NM),PI={Fajr:'dawn',Sunrise:'dawn',Dhuhr:'sun',Asr:'sun',Maghrib:'sunset',Isha:'moon'};
function isRam(d){try{return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{month:'numeric'}).format(d)==='9'}catch(e){return false}}
function times(base,add){const d=new Date(base.getFullYear(),base.getMonth(),base.getDate()+add),u=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),12)),m=METH[method],adj=S.get('adj',{});
  const r=calc(d.getFullYear(),d.getMonth()+1,d.getDate(),{lat:loc.lat,lng:loc.lng,tz:tzOff(loc.tz,u),f:m.f,i:m.i,im:method==4&&isRam(u)?120:m.im,asr:S.get('asr',1)});
  KEYS.forEach(k=>r[k]+=(adj[k]||0)/60);return r}
const cityNow=()=>new Date(new Date().toLocaleString('en-US',{timeZone:loc.tz}));
function h2d(base,h,add){if(!isFinite(h))return null;const x=new Date(base.getFullYear(),base.getMonth(),base.getDate()+add);x.setMinutes(Math.round(h*60));return x}
const fmt=d=>d?d.toLocaleTimeString('ar',{hour:'numeric',minute:'2-digit',hour12:S.get('h12',true)}):'--';
function phaseOf(n,L){const[f,s,a,i]=[L[0][2],L[1][2],L[3][2],L[5][2]];return f&&n>=f&&n<s?'dawn':n>=s&&n<a?'day':n>=a&&n<i?'dusk':'night'}
function tick(){if(!CFG)return;
  const now=cityNow(),tt=times(now,0),tn=times(now,1),L=KEYS.map(k=>[k,NM[k],h2d(now,tt[k],0)]);
  let ni=L.findIndex(x=>x[2]&&x[2]>now),nn,nt;if(ni<0){nn='الفجر';nt=h2d(now,tn.Fajr,1)}else{nn=L[ni][1];nt=L[ni][2]}
  const d=nt?Math.max(0,Math.floor((nt-now)/1000)):0,ph=phaseOf(now,L);
  $('#nm').textContent=nn;$('#cd').textContent=`${p2(Math.floor(d/3600))}:${p2(Math.floor(d/60)%60)}:${p2(d%60)}`;$('#at').textContent='عند '+fmt(nt);
  applyTheme(ph);setVerse(now);
  const f=L[0][2],e=L[5][2];let svg='';
  if(f&&e){const raw=(now-f)/(e-f),fr=Math.min(1,Math.max(0,raw)),Rd=138,pt=(x,r=Rd)=>[170+r*Math.cos(Math.PI*x),160-r*Math.sin(Math.PI*x)];
    const st=['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(k=>{const x=(L[KEYS.indexOf(k)][2]-f)/(e-f),[a,b]=pt(x),[l,m]=pt(x,Rd+22);return `<circle cx="${a}" cy="${b}" r="4" fill="var(--card)" stroke="var(--acc)" stroke-width="2"/><text x="${l}" y="${m+4}" text-anchor="middle" font-size="11" fill="var(--mute)" font-family="IBM Plex Sans Arabic,Tahoma">${NM[k]}</text>`}).join('');
    const[sx,sy]=pt(fr),out=raw<0||raw>1;
    svg=`<svg viewBox="-8 0 356 190" style="display:block;width:100%"><path d="M308 160A138 138 0 0 0 32 160" pathLength="100" fill="none" stroke="var(--line)" stroke-width="3" stroke-linecap="round"/><path d="M308 160A138 138 0 0 0 32 160" pathLength="100" fill="none" stroke="var(--acc)" stroke-width="3" stroke-linecap="round" stroke-dasharray="${fr*100} 200"/>${st}<circle cx="${sx}" cy="${sy}" r="14" fill="var(--acc)" opacity=".22"/><circle cx="${sx}" cy="${sy}" r="7" fill="${out?'var(--card)':'var(--acc)'}" stroke="var(--acc)" stroke-width="2"/></svg>`}
  $('#arc').innerHTML=svg;
  $('#times').innerHTML=L.map((x,i)=>`<div class="tl ${i===ni?'next':x[2]&&x[2]<now?'past':''}"><span class="ti">${ic(PI[x[0]],20)}</span>${x[1]}<span class="t">${fmt(x[2])}</span></div>`).join('');
  adhanCheck(now,L)}
setInterval(tick,1000);document.addEventListener('visibilitychange',()=>!document.hidden&&tick());

