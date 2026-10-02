/* ═══ مصحف القيام: صفحات المصحف المدني (١٥ سطرًا) بنفس تقطيع الأسطر، تُقلَّب بالسحب ═══ */
let QD=null,PG=null,qp=1,qm={wird:false},rtok=0,MPC={};const NEEDP='هذه الصفحة غير محمّلة بعد. اتصل بالإنترنت مرة واحدة وسيُحفظ المصحف تلقائيًا.';
function buildPG(){if(PG)return;PG=Array.from({length:605},()=>[]);QD.forEach((s,i)=>s.a.forEach((_,j)=>PG[s.p[j]].push([i,j])))}
async function loadMush(){await loadQD();if(!QD){$('#slist').textContent=NEED;return}drawS()}
let QN=null;
function drawS(){const q=$('#q').value.trim(),l=S.get('lastP',0),bm=S.get('bm',[]),nq=nz(q);
  $('#bmk').innerHTML=bm.map(p=>`<button class="chip" data-p="${p}">${ic('bookmark',14)}ص ${AR(p)}</button>`).join('');$('#slist').className='mosaic';
  let h=(l&&!q?`<div class="tile wide" data-p="${l}">${ic('book',20)}<b class="k">متابعة القراءة: صفحة ${AR(l)}</b></div>`:'')+QD.filter(s=>!q||nm(s.name,q)||String(s.n)===nq).map(s=>`<div class="tile ${s.mk?'mk':''}" data-p="${s.p[0]}"><small>${s.n}</small><b>${s.name.replace('سُورَةُ ','')}</b><span class="mute sm">${s.a.length} آية</span></div>`).join('');
  if(q&&nq.length>=3&&!/^\d+$/.test(nq)){if(!QN)QN=QD.map(s=>s.a.map(a=>nz(a)));const ws=nq.split(' '),out=[];
    for(let i=0;i<QD.length&&out.length<30;i++)for(let j=0;j<QD[i].a.length&&out.length<30;j++)if(ws.every(w=>QN[i][j].includes(w)))out.push([i,j]);
    if(out.length)h+=`<div class="gh" style="grid-column:1/-1">الآيات</div>`+out.map(([i,j])=>`<div class="row" style="grid-column:1/-1" data-p="${QD[i].p[j]}"><span class="it">${ic('search',20)}</span><span class="tx"><b style="font-size:14px;line-height:1.7">${QD[i].a[j].slice(0,90)}…</b><small>${QD[i].name.replace('سُورَةُ ','')} • آية ${AR(j+1)} • صفحة ${AR(QD[i].p[j])}</small></span></div>`).join('')}
  $('#slist').innerHTML=h||'<div class="mute" style="grid-column:1/-1;text-align:center;padding:30px">لا توجد نتائج</div>'}
srch($('#qsb'),$('#qsf'),$('#q'),()=>{if(qv==='wird'&&$('#q').value.trim())qView('mush',true);QD&&drawS()});
$('#slist').onclick=e=>{const c=e.target.closest('[data-p]');if(c)openPage(+c.dataset.p,0,{wird:false})};
$('#bmk').onclick=e=>{const c=e.target.closest('[data-p]');if(c)openPage(+c.dataset.p,0,{wird:false})};
/* تحميل صفحة التقطيع: محليًا ثم من المصدر الخارجي، وتُحفظ على الجهاز */
const compactMP=j=>j.lines.map(l=>l.type==='surah-header'?[0,l.text]:l.type==='basmala'?[1]:[2,(l.words||[]).map(w=>w.word),l.verseRange||'']);
async function getMP(n){if(MPC[n])return MPC[n];let c=await idbGet('mp'+n);
  if(!c){for(const s of CFG.mushaf.sources){const u=s.replace('{n}',String(n).padStart(3,'0'));try{const r=await fetch(CONTENT_BASE&&!u.startsWith('http')?CONTENT_BASE+u:u);if(!r.ok)continue;c=compactMP(await r.json());idbSet('mp'+n,c);break}catch(e){}}}
  if(c)MPC[n]=c;return c||null}
let mpBusy=false;async function mpPrefetch(){if(mpBusy||S.get('mpDone',false)||navigator.onLine===false||!CFG||!allowed())return;if(!await idbSet('mpt',1))return;mpBusy=true;let miss=0;
  for(let n=1;n<=604;n++){if(!(await idbGet('mp'+n))){if(!await getMP(n))miss++;await new Promise(r=>setTimeout(r,60))}}if(!miss)S.set('mpDone',true);mpBusy=false}
const aw=w=>w.replace(/\s+([٠-٩]+)$/,(m,d)=>`<span class="av">${d}</span>`);
const orn=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></svg>`;
function fitMP(){const bd=$('#qbd');if(!$('#qr').classList.contains('on'))return;const H=bd.clientHeight,W=bd.clientWidth;if(H<80||W<80){setTimeout(fitMP,120);return}
  const rh=H/15,fs=Math.min(rh*.6,28);bd.style.fontSize=fs+'px';[...bd.querySelectorAll('.ln')].forEach(l=>l.style.height=rh+'px');
  const ls=[...bd.querySelectorAll('.ln.tx')];ls.forEach(l=>l.classList.add('meas'));const nat=ls.map(l=>l.offsetWidth),mx=Math.max(...nat,1),k=Math.min(W/mx*.99,rh*.72/fs);
  bd.style.fontSize=(fs*k)+'px';ls.forEach((l,i)=>{l.classList.remove('meas');l.classList.toggle('ctr',nat[i]*k<W*.72)})}
async function renderMP(dir){const my=++rtok,L=await getMP(qp);if(my!==rtok)return;
  $('#qft').textContent=AR(qp);$('#qjn').value=qp;const bm=S.get('bm',[]).includes(qp);$('#qbm').classList.toggle('on',bm);qBar();
  if(!L){$('#qh1').textContent='';$('#qh2').textContent='';$('#qbd').innerHTML=`<div class="mute" style="padding:30px;text-align:center">${NEEDP}</div>`;return}
  let h='',ref=null;L.forEach(l=>{if(l[0]===0)h+=`<div class="ln sh2"><span>${orn}${l[1]}${orn}</span></div>`;
    else if(l[0]===1)h+='<div class="ln bs">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>';
    else{if(!ref){const m=l[2].match(/^(\d+):(\d+)/);if(m)ref=[+m[1],+m[2]]}h+=`<div class="ln tx">${l[1].map(w=>`<span class="w">${aw(w)}</span>`).join('')}</div>`}});
  if(ref&&QD){const s=QD[ref[0]-1];$('#qh1').textContent=s.name;$('#qh2').textContent='الجزء '+AR(s.z[ref[1]-1])}
  $('#qbd').innerHTML=h;if(document.fonts&&document.fonts.ready)await document.fonts.ready;if(my!==rtok)return;fitMP();
  if(dir&&$('#qpg').animate)$('#qpg').animate([{transform:`translateX(${dir*-40}px)`,opacity:0},{transform:'none',opacity:1}],{duration:220});
  getMP(Math.min(604,qp+1));getMP(Math.max(1,qp-1))}
function qBar(){if(qm.wird){const w=W0(),[a,b]=w.chunks[w.i];$('#qhint').textContent='ورد القيام';
    $('#qmid').innerHTML=qp>=b?`<button class="btn" id="qfin">${ic('check',16)}أتممت الورد</button>`:`<span class="mute sm">صفحة ${AR(qp-a+1)} من ${AR(b-a+1)}</span>`;if($('#qfin'))$('#qfin').onclick=finishWird}
  else{$('#qhint').textContent='';$('#qmid').innerHTML=`<span class="mute sm">صفحة ${AR(qp)} من ٦٠٤</span>`}}
async function openPage(p,dir,o){if(!await loadQD())return;if(o)qm=o;p=Math.min(604,Math.max(1,parseInt(p)||1));
  if(qm.wird){const w=W0(),[a,b]=w.chunks[w.i];p=Math.min(b,Math.max(a,p));w.pos=p;S.set('wird',w)}
  qp=p;S.set('lastP',p);$('#qr').classList.add('on');renderMP(dir)}
function closeReader(){$('#qr').classList.remove('on');if(qv==='wird')drawWird();else drawS()}
let tx=0,ty=0;const qst=$('#qs');
qst.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
qst.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)dx>0?openPage(qp+1,1):openPage(qp-1,-1)},{passive:true});
$('#qclose').innerHTML=ic('x',20);$('#qbm').innerHTML=ic('bookmark',20);$('#qprev').innerHTML=ic('back',18);$('#qnext').innerHTML=ic('chev',18);
$('#qclose').onclick=closeReader;$('#qnext').onclick=()=>openPage(qp+1,1);$('#qprev').onclick=()=>openPage(qp-1,-1);$('#qjn').onchange=e=>openPage(e.target.value);
$('#qbm').onclick=()=>{let b=S.get('bm',[]);b=b.includes(qp)?b.filter(x=>x!==qp):[...b,qp].sort((x,y)=>x-y);S.set('bm',b);$('#qbm').classList.toggle('on',b.includes(qp))};
