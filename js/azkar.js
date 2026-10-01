/* ═══ الأذكار: الأذكار اليومية فقط، والأدعية في تبويب منفصل، وأدعية الصلاة الداخلية مخفية ═══ */
let AZ=null,azTab='d';const NEED='يلزم اتصال بالإنترنت في أول تشغيل فقط، ثم يعمل بدونه.';
function azSplit(){const d=[],o=[];AZ.forEach((g,i)=>{if(CFG.azkar.exclude.some(k=>g.c.includes(k)))return;const x=CFG.azkar.daily.findIndex(k=>g.c.includes(k));x>-1?d.push([x,i]):o.push([99,i])});d.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);return{d,o}}
async function loadAz(){if(AZ){drawAz();return}AZ=await getAz();if(!AZ){$('#azgrid').innerHTML=`<div class="mute">${NEED}</div>`;return}drawAz()}
function drawAz(){const q=$('#azq').value.trim(),sp=azSplit(),L=(azTab==='d'?sp.d:sp.o).filter(x=>AZ[x[1]].c.includes(q));
  $('#azgrid').innerHTML=(azTab==='d'&&!q?`<div class="tile wide" data-tsb="1">${ic('ring',22)}<b class="k">السبحة الإلكترونية</b></div>`:'')+(L.map((x,k)=>`<div class="tile" data-i="${x[1]}"><small>${k+1}</small>${AZ[x[1]].c}</div>`).join('')||'<div class="mute">لا توجد نتائج</div>')}
$('#azq').oninput=()=>AZ&&drawAz();
$('#azt').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;azTab=b.dataset.t;document.querySelectorAll('#azt .chip').forEach(x=>x.classList.toggle('on',x===b));AZ&&drawAz()};
function showList(title,html){$('#azgrid').style.display=$('#azhead').style.display='none';const L=$('#azlist');L.style.display='block';scrollTo(0,0);
  L.innerHTML=`<button class="chip" id="azb" style="margin-bottom:12px">${ic('back',16)}${title}</button>`+html;$('#azb').onclick=()=>{L.style.display='none';$('#azgrid').style.display='grid';$('#azhead').style.display='';scrollTo(0,0)}}
$('#azgrid').onclick=e=>{const t=e.target.closest('.tile');if(!t)return;
  if(t.dataset.tsb){showList('السبحة','<div style="text-align:center;margin-top:26px"><button class="ring" id="tb" style="width:190px;height:190px;font-size:54px"></button><div class="mute sm" style="margin:12px 0">تكتمل الحلقة كل ٣٣ تسبيحة</div><button class="chip" id="tr">'+ic('reset',16)+'تصفير العدّاد</button></div>');
    const tb=$('#tb'),show=n=>{tb.textContent=n;tb.style.setProperty('--p',(n%33||(n?33:0))/33*100)};let c=S.get('tsb',0);show(c);
    tb.onclick=()=>{c++;S.set('tsb',c);show(c);vib(c%33?12:[30,40,30])};$('#tr').onclick=()=>{c=0;S.set('tsb',0);show(0)};return}
  const g=AZ[t.dataset.i];showList(g.c,g.i.map(z=>`<div class="card"><div class="zk">${z[0]}</div><button class="ring" data-n="${z[1]}" data-l="${z[1]}">${z[1]}</button><div style="text-align:center;margin-top:10px"><button class="chip cp">${ic('copy',15)}نسخ</button></div></div>`).join(''))};
$('#azlist').onclick=e=>{const c=e.target.closest('.cp');if(c){try{navigator.clipboard.writeText(c.closest('.card').querySelector('.zk').textContent);c.innerHTML=ic('check',15)+'تم النسخ'}catch(x){c.textContent='تعذر النسخ'}return}
  const r=e.target.closest('.ring');if(!r||r.id==='tb')return;let l=+r.dataset.l;if(l<=0)return;l--;r.dataset.l=l;r.style.setProperty('--p',100-l/r.dataset.n*100);r.innerHTML=l||ic('check',28);r.classList.remove('tap');void r.offsetWidth;r.classList.add('tap');vib(15)};
