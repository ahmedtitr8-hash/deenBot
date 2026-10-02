/* ═══ الأذكار: بطاقة واحدة تتنقّل بين الأذكار بسلاسة، وبحث يفهم كل الصيغ ═══ */
let AZ=null,ME=null,azTab='d',azQ='';const NEED='يلزم اتصال بالإنترنت في أول تشغيل فقط، ثم يعمل بدونه.';
const ymd=(d=new Date())=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const AZI={morning:'sun',evening:'sunset',after:'ring',sleep:'moon',wake:'dawn'};
const clean=t=>t.replace(/\(\(/g,'«').replace(/\)\)/g,'»').replace(/\[[^\]]*\]/g,'').replace(/\s+/g,' ').trim();
const fixN=(t,n)=>{(CFG.azkar.countFix||[]).forEach(r=>{if(t.includes(r.match))n=r.count});return n};
function coreList(){return CFG.azkar.core.map(c=>{let it=null;
  if(c.key&&ME&&ME[c.key])it=ME[c.key].map(x=>[x.t,x.n||1,x.s||'']);
  else if(c.src&&AZ){const g=AZ.find(x=>x.c.trim()===c.src)||AZ.find(x=>x.c.includes(c.src));if(g)it=g.i.map(([t,n])=>[clean(t),n,''])}
  return it&&it.length?{id:c.id,name:c.name,items:it}:null}).filter(Boolean)}
function moreList(){const hide=[...CFG.azkar.core.map(c=>c.src).filter(Boolean),...(CFG.azkar.hiddenSrc||[])];
  return AZ.map((g,i)=>({id:'g'+i,name:g.c,items:g.i.map(([t,n])=>[clean(t),n,''])})).filter(x=>!hide.includes(x.name.trim())&&!CFG.azkar.exclude.some(k=>x.name.includes(k)))}
async function loadAz(){if(AZ&&ME){drawAz();return}ME=ME||await J('data/azkar-me.json');AZ=AZ||await getAz();if(!AZ&&!ME){$('#azgrid').innerHTML=`<div class="mute">${NEED}</div>`;return}AZ=AZ||[];drawAz()}
const doneIds=()=>{const d=S.get('azdone',{});return d.d===ymd()?d.ids:[]};
function drawAz(){const q=azQ,done=doneIds();
  if(q){const all=[...coreList(),...moreList()],out=[];all.forEach(sec=>sec.items.forEach((it,i)=>{if(out.length<40&&(nm(sec.name,q)&&i===0||nm(it[0],q)))out.push([sec,i])}));
    $('#azgrid').className='';$('#azgrid').innerHTML=out.map(([s,i],k)=>`<div class="row" data-r="${k}"><span class="it">${ic('search',20)}</span><span class="tx"><b style="font-size:14px;line-height:1.7">${clean(s.items[i][0]).slice(0,70)}…</b><small>${s.name} • ${AR(i+1)}</small></span></div>`).join('')||'<div class="mute" style="text-align:center;padding:30px">لا توجد نتائج</div>';azRes=out;return}
  if(azTab==='d'){$('#azgrid').className='';$('#azgrid').innerHTML=coreList().map(c=>`<div class="row" data-c="${c.id}"><span class="it">${ic(AZI[c.id]||'ring',21)}</span><span class="tx"><b>${c.name}</b><small>${c.items.length} ذكر</small></span>${done.includes(c.id)?`<span class="acc">${ic('check',20)}</span>`:`<span class="cv">${ic('chev',18)}</span>`}</div>`).join('')+`<div class="row" data-tsb="1"><span class="it">${ic('ring',21)}</span><span class="tx"><b>السبحة الإلكترونية</b><small>حلقة تكتمل كل ٣٣</small></span><span class="cv">${ic('chev',18)}</span></div>`}
  else{$('#azgrid').className='grid';$('#azgrid').innerHTML=moreList().map((x,k)=>`<div class="tile" data-g="${x.id}"><small>${k+1}</small>${x.name}</div>`).join('')}}
let azRes=[];
srch($('#azs'),$('#azsf'),$('#azq'),()=>{azQ=$('#azq').value.trim();AZ&&drawAz()});
$('#azt').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;azTab=b.dataset.t;document.querySelectorAll('#azt .chip').forEach(x=>x.classList.toggle('on',x===b));AZ&&drawAz()};
function leaveSec(){const L=$('#azlist');L.style.display='none';L.innerHTML='';$('#azgrid').style.display='';$('#azt').style.display='';$('#azsf').style.display='';$('#azs').style.display='';drawAz();scrollTo(0,0)}
function enterSec(){['#azgrid','#azt','#azsf','#azs'].forEach(s=>$(s).style.display='none');$('#azlist').style.display='block';scrollTo(0,0)}
/* البطاقة الواحدة */
function openSec(sec,i0){enterSec();const L=$('#azlist'),n=sec.items.length,left=sec.items.map(([t,c])=>fixN(t,c));
  let idx=i0!=null?i0:(S.get('azpos',{})[sec.id]||0);if(idx>=n||idx<0)idx=0;
  L.innerHTML=`<div class="rw" style="margin-bottom:10px"><button class="chip" id="azb">${ic('back',16)}${sec.name}</button><span class="mute sm" id="azp"></span></div><div class="pbar"><i id="azpr"></i></div><div class="azc" id="azc"></div><div class="azn"><button class="qb" id="azprev">${ic('back',18)}</button><div id="azr"></div><button class="qb" id="aznext">${ic('chev',18)}</button></div>`;
  const save=()=>{const p=S.get('azpos',{});p[sec.id]=idx>=n?0:idx;S.set('azpos',p)};
  const ring=()=>{const c=fixN(sec.items[idx][0],sec.items[idx][1]),l=left[idx];$('#azr').innerHTML=`<button class="ring" style="--p:${100-l/c*100}">${l>0?l:ic('check',26)}</button>`};
  function draw(dir){if(idx>=n){finish();return}const[t,,s]=sec.items[idx];
    $('#azc').innerHTML=`<div class="zk">${t}</div>${s?`<div class="src">${s}</div>`:''}<div style="text-align:center;margin-top:8px"><button class="chip cp">${ic('copy',15)}نسخ</button></div>`;
    $('#azp').textContent=`${AR(idx+1)} من ${AR(n)}`;$('#azpr').style.width=(idx/n*100)+'%';ring();$('#azprev').style.visibility=idx>0?'visible':'hidden';$('#azr').style.display='';$('#aznext').style.visibility='visible';save();
    if(dir&&$('#azc').animate)$('#azc').animate([{transform:`translateX(${dir*-34}px)`,opacity:0},{transform:'none',opacity:1}],{duration:220})}
  function finish(){const d=S.get('azdone',{}),ids=d.d===ymd()?d.ids:[];if(!ids.includes(sec.id))ids.push(sec.id);S.set('azdone',{d:ymd(),ids});idx=0;save();
    $('#azc').innerHTML=`<div style="text-align:center;padding:26px 8px"><span class="acc">${ic('check',46)}</span><div class="k" style="font-size:20px;margin:8px 0">أتممت ${sec.name}</div><div class="mute sm">تقبّل الله منك</div><button class="btn" id="azagain" style="margin-top:16px">أعد القراءة</button></div>`;
    $('#azp').textContent='';$('#azpr').style.width='100%';$('#azr').style.display='none';$('#aznext').style.visibility='hidden';$('#azprev').style.visibility='visible'}
  const next=()=>{idx++;draw(1)},prev=()=>{if(idx>=n)idx=n-1;else if(idx>0)idx--;else return;draw(-1)};
  function count(){if(idx>=n)return;if(left[idx]>0){left[idx]--;vib(15);ring();if(left[idx]===0){vib([20,30,20]);const at=idx;setTimeout(()=>{if(idx===at&&$('#azc'))next()},380)}}}
  L.onclick=e=>{if(e.target.closest('#azb'))return leaveSec();if(e.target.closest('#azprev'))return prev();if(e.target.closest('#aznext'))return next();if(e.target.closest('#azagain')){left.splice(0,n,...sec.items.map(([t,c])=>fixN(t,c)));idx=0;return draw(1)}
    const c=e.target.closest('.cp');if(c){try{navigator.clipboard.writeText(sec.items[idx][0]);c.innerHTML=ic('check',15)+'تم النسخ'}catch(x){c.textContent='تعذر النسخ'}return}
    if(e.target.closest('.ring')||e.target.closest('#azc'))count()};
  let sx=0,sy=0;L.ontouchstart=e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY};
  L.ontouchend=e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.6)dx>0?next():prev()};
  draw(0)}
function openTasbih(){enterSec();const L=$('#azlist');L.innerHTML=`<button class="chip" id="azb" style="margin-bottom:12px">${ic('back',16)}السبحة</button><div style="text-align:center;margin-top:22px"><button class="ring" id="tb" style="width:170px;height:170px;font-size:48px"></button><div class="mute sm" style="margin:12px 0">تكتمل الحلقة كل ٣٣ تسبيحة</div><button class="chip" id="tr">${ic('reset',16)}تصفير العدّاد</button></div>`;
  const tb=$('#tb'),show=n=>{tb.textContent=n;tb.style.setProperty('--p',(n%33||(n?33:0))/33*100)};let c=S.get('tsb',0);show(c);
  tb.onclick=()=>{c++;S.set('tsb',c);show(c);vib(c%33?12:[30,40,30])};$('#tr').onclick=()=>{c=0;S.set('tsb',0);show(0)};$('#azb').onclick=leaveSec}
$('#azgrid').onclick=e=>{const t=e.target.closest('[data-c],[data-tsb],[data-g],[data-r]');if(!t)return;
  if(t.dataset.tsb)return openTasbih();
  if(t.dataset.r!=null){const[s,i]=azRes[+t.dataset.r];return openSec(s,i)}
  if(t.dataset.c)return openSec(coreList().find(x=>x.id===t.dataset.c));
  openSec(moreList().find(x=>x.id===t.dataset.g))};
