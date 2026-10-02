/* ═══ المدن: مناطق السعودية أولًا ثم دول أخرى (الإحداثيات تقريبية، والموقع الدقيق أدق) ═══ */
let cpG='all',cpQ='';
const setLoc=l=>{loc=l;S.set('loc',l);S.set('locSet',1);$('#cp').classList.remove('on');$('#cityBtn').innerHTML=ic('pin',16)+l.label;$('#locBan').style.display='none';tick();drawQ()};
function openCP(){$('#cp').classList.add('on');$('#cp').scrollTop=0;cpList()}
function gps(){banner('جارٍ تحديد موقعك...',1);navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>setLoc({label:near(p.coords.latitude,p.coords.longitude),precise:true,lat:p.coords.latitude,lng:p.coords.longitude,tz:Intl.DateTimeFormat().resolvedOptions().timeZone}),()=>banner('لم نستطع تحديد موقعك. اسمح بالموقع من إعدادات الجوال ثم أعد المحاولة',1),{enableHighAccuracy:true,timeout:20000,maximumAge:60000}):banner('جهازك لا يدعم تحديد الموقع',1)}
function cpList(){const q=cpQ.trim();
  $('#cpg').innerHTML=[['all','الكل'],...REG.map(r=>[r[0],r[0]])].map(x=>`<button class="chip ${cpG===x[0]?'on':''}" data-g="${x[0]}">${x[1]}</button>`).join('');
  let h='';REG.forEach((r,gi)=>{if(cpG!=='all'&&cpG!==r[0])return;const rows=r[2].map((c,n)=>[c,n]).filter(x=>x[0][0].includes(q));if(!rows.length)return;
    h+=`<div class="gh">${r[0]}</div>`+rows.map(([c,n])=>{const sel=loc.label===c[0]&&Math.abs(loc.lat-c[1])<.02;return `<div class="row ${sel?'sel':''}" data-g="${gi}" data-n="${n}"><span class="it">${ic('pin',20)}</span><span class="tx"><b>${c[0]}</b></span><span class="rd">${sel?ic('check',14):''}</span></div>`}).join('')});
  $('#cpl').innerHTML=h||'<div class="mute" style="padding:24px;text-align:center">لا توجد نتائج. ابحث بالإنترنت في الأسفل.</div>'}
$('#cpb').innerHTML=ic('back',20);$('#gps').innerHTML=`<span class="it">${ic('gps',22)}</span><span class="tx"><b>تحديد موقعي الدقيق</b><small>سيُطلب منك السماح بالموقع، وهو أدق خيار للمواقيت</small></span><span class="cv">${ic('chev',18)}</span>`;
$('#cpb').onclick=()=>$('#cp').classList.remove('on');$('#gps').onclick=gps;$('#bGps').onclick=gps;$('#bCity').onclick=openCP;
$('#cpq').oninput=e=>{cpQ=e.target.value;cpList()};
$('#cpg').onclick=e=>{const b=e.target.closest('.chip');if(b){cpG=b.dataset.g;cpList()}};
$('#cpl').onclick=e=>{const r=e.target.closest('.row');if(!r)return;const g=REG[r.dataset.g],c=g[2][r.dataset.n];setLoc({label:c[0],lat:c[1],lng:c[2],tz:c[3]||g[1]})};
$('#cpgo').onclick=async()=>{const c=$('#ci').value.trim(),o=$('#co').value.trim();if(!c||!o)return;
  try{const d=(await (await fetch(`${CFG.api.aladhanCity}?city=${encodeURIComponent(c)}&country=${encodeURIComponent(o)}&method=4`)).json()).data;setLoc({label:c,lat:+d.meta.latitude,lng:+d.meta.longitude,tz:d.meta.timezone})}catch(e){banner('تعذر العثور على المدينة. تأكد من الإنترنت ومن الإملاء بالإنجليزية',1)}};
$('#cityBtn').onclick=openCP;$('#cityBtn').innerHTML=ic('pin',16)+loc.label;

const locDesc=()=>loc.label+(loc.precise?' • موقعك الدقيق':'');
function near(lat,lng){let b=null,bd=1e9;const r=Math.PI/180;REG.forEach(g=>g[2].forEach(c=>{const a=Math.sin((c[1]-lat)*r/2)**2+Math.cos(lat*r)*Math.cos(c[1]*r)*Math.sin((c[2]-lng)*r/2)**2,d=12742*Math.asin(Math.sqrt(a));if(d<bd){bd=d;b=c[0]}}));return bd<=45?b:bd<=250?'قرب '+b:'موقعي الدقيق'}
