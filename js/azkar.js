/* ═══ الأذكار: خمسة أقسام يومية فقط، والأدعية في تبويب منفصل، وأدعية الصلاة الداخلية مخفية ═══ */
let AZ=null,azTab='d';const NEED='يلزم اتصال بالإنترنت في أول تشغيل فقط، ثم يعمل بدونه.';
const ymd=(d=new Date())=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const AZI={morning:'sun',evening:'sunset',after:'ring',sleep:'moon',wake:'dawn'};
const clean=t=>t.replace(/\(\(/g,'«').replace(/\)\)/g,'»').replace(/\s+/g,' ').trim();
const fixN=(t,n)=>{(CFG.azkar.countFix||[]).forEach(r=>{if(t.includes(r.match))n=r.count});return n};
const BR=/\[[^\]]*\]/g;
function coreList(){return CFG.azkar.core.map(c=>{const g=AZ.find(x=>x.c.trim()===c.src)||AZ.find(x=>x.c.includes(c.src));if(!g)return null;let it=g.i;
  if(c.mode)it=it.filter(([t])=>{const b=t.replace(BR,'');return c.mode==='m'?!/إذا أمسى/.test(b):!/إذا أصبح/.test(b)}).map(([t,n])=>[c.mode==='m'?t.replace(BR,''):t,n]);
  return{id:c.id,name:c.name,mode:c.mode,items:it}}).filter(Boolean)}
function moreList(){const used=CFG.azkar.core.map(c=>c.src);return AZ.map((g,i)=>({g,i})).filter(x=>!used.includes(x.g.c.trim())&&!CFG.azkar.exclude.some(k=>x.g.c.includes(k)))}
async function loadAz(){if(AZ){drawAz();return}AZ=await getAz();if(!AZ){$('#azgrid').innerHTML=`<div class="mute">${NEED}</div>`;return}drawAz()}
function drawAz(){const q=$('#azq').value.trim(),dn=S.get('azdone',{}),done=dn.d===ymd()?dn.ids:[];
  if(azTab==='d'){$('#azgrid').className='';$('#azgrid').innerHTML=coreList().map(c=>`<div class="row" data-c="${c.id}"><span class="it">${ic(AZI[c.id]||'ring',21)}</span><span class="tx"><b>${c.name}</b><small>${c.items.length} ذكر</small></span>${done.includes(c.id)?`<span class="acc">${ic('check',20)}</span>`:`<span class="cv">${ic('chev',18)}</span>`}</div>`).join('')+`<div class="row" data-tsb="1"><span class="it">${ic('ring',21)}</span><span class="tx"><b>السبحة الإلكترونية</b><small>حلقة تكتمل كل ٣٣</small></span><span class="cv">${ic('chev',18)}</span></div>`}
  else{const L=moreList().filter(x=>x.g.c.includes(q));$('#azgrid').className='grid';$('#azgrid').innerHTML=L.map((x,k)=>`<div class="tile" data-i="${x.i}"><small>${k+1}</small>${x.g.c}</div>`).join('')||'<div class="mute">لا توجد نتائج</div>'}}
srch($('#azs'),$('#azsf'),$('#azq'),()=>AZ&&drawAz());$('#azs').style.display='none';
$('#azt').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;azTab=b.dataset.t;document.querySelectorAll('#azt .chip').forEach(x=>x.classList.toggle('on',x===b));$('#azs').style.display=azTab==='o'?'':'none';$('#azsf').classList.remove('on');$('#azq').value='';AZ&&drawAz()};
function showList(title,html){['#azgrid','#azt','#azsf'].forEach(s=>$(s).style.display='none');$('#azs').style.display='none';const L=$('#azlist');L.style.display='block';scrollTo(0,0);
  L.innerHTML=`<button class="chip" id="azb" style="margin-bottom:12px">${ic('back',16)}${title}</button>`+html;
  $('#azb').onclick=()=>{L.style.display='none';$('#azgrid').style.display='';$('#azt').style.display='';$('#azsf').style.display='';$('#azs').style.display=azTab==='o'?'':'none';drawAz();scrollTo(0,0)}}
function itemsHTML(items,mode){return items.map(([t,n])=>{n=fixN(t,n);let h=clean(t);
  if(mode==='e'&&BR.test(t)){BR.lastIndex=0;h=t.split(/(\[[^\]]*\])/).map(p=>p.startsWith('[')?`<span class="ev">${clean(p)}</span>`:`<span class="dm">${clean(p)}</span>`).join('')}BR.lastIndex=0;
  return `<div class="card"><div class="zk">${h}</div><button class="ring" data-n="${n}" data-l="${n}">${n}</button><div style="text-align:center;margin-top:10px"><button class="chip cp">${ic('copy',15)}نسخ</button></div></div>`}).join('')}
$('#azgrid').onclick=e=>{const t=e.target.closest('[data-c],[data-tsb],[data-i]');if(!t)return;
  if(t.dataset.tsb){showList('السبحة','<div style="text-align:center;margin-top:26px"><button class="ring" id="tb" style="width:190px;height:190px;font-size:54px"></button><div class="mute sm" style="margin:12px 0">تكتمل الحلقة كل ٣٣ تسبيحة</div><button class="chip" id="tr">'+ic('reset',16)+'تصفير العدّاد</button></div>');
    const tb=$('#tb'),show=n=>{tb.textContent=n;tb.style.setProperty('--p',(n%33||(n?33:0))/33*100)};let c=S.get('tsb',0);show(c);
    tb.onclick=()=>{c++;S.set('tsb',c);show(c);vib(c%33?12:[30,40,30])};$('#tr').onclick=()=>{c=0;S.set('tsb',0);show(0)};return}
  if(t.dataset.c){const c=coreList().find(x=>x.id===t.dataset.c);
    showList(c.name,(c.mode==='e'?'<div class="card sm mute">الأجزاء الملوّنة هي صيغة المساء كما وردت في المصدر، والباقي صيغة الصباح.</div>':'')+itemsHTML(c.items,c.mode)+`<button class="btn" id="azdone">${ic('check',18)}أتممت هذا القسم</button>`);
    $('#azdone').onclick=()=>{const d=S.get('azdone',{});const ids=d.d===ymd()?d.ids:[];if(!ids.includes(c.id))ids.push(c.id);S.set('azdone',{d:ymd(),ids});$('#azb').click()};return}
  const g=AZ[t.dataset.i];showList(g.c,itemsHTML(g.i))};
$('#azlist').onclick=e=>{const c=e.target.closest('.cp');if(c){try{navigator.clipboard.writeText(c.closest('.card').querySelector('.zk').textContent);c.innerHTML=ic('check',15)+'تم النسخ'}catch(x){c.textContent='تعذر النسخ'}return}
  const r=e.target.closest('.ring');if(!r||r.id==='tb')return;let l=+r.dataset.l;if(l<=0)return;l--;r.dataset.l=l;r.style.setProperty('--p',100-l/r.dataset.n*100);r.innerHTML=l||ic('check',28);r.classList.remove('tap');void r.offsetWidth;r.classList.add('tap');vib(15)};
