/* ═══ المصحف: صفحات مرقّمة (٦٠٤ صفحة) تتقلّب يمينًا ويسارًا ═══ */
let QD=null,PG=null,qp=1;
const AR=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
async function loadQuran(){QD=QD||await getQ();if(!QD){$('#slist').textContent=NEED;return}buildPG();drawS()}
function buildPG(){if(PG)return;PG=Array.from({length:605},()=>[]);QD.forEach((s,i)=>s.a.forEach((_,j)=>PG[s.p[j]].push([i,j])))}
function drawS(){const q=$('#q').value.trim(),l=S.get('lastP',0);$('#slist').className='mosaic';
  $('#slist').innerHTML=(l&&!q?`<div class="tile wide" data-p="${l}">${ic('book',20)}<b class="k">متابعة القراءة: صفحة ${AR(l)}</b></div>`:'')+QD.filter(s=>s.name.includes(q)||String(s.n)===q).map(s=>`<div class="tile ${s.mk?'mk':''}" data-p="${s.p[0]}"><small>${s.n}</small><b>${s.name.replace('سُورَةُ ','')}</b><span class="mute sm">${s.a.length} آية</span></div>`).join('')}
$('#q').oninput=()=>QD&&drawS();
$('#slist').onclick=e=>{const c=e.target.closest('.tile');if(c&&QD)openPage(+c.dataset.p)};
const orn=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8934a" stroke-width="2"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></svg>`;
function pageHTML(){let h='';PG[qp].forEach(([i,j])=>{const s=QD[i];let t=s.a[j];
  if(j===0){h+=`<div class="sb">${orn}<span>${s.name}</span>${orn}</div>`;if(i!==0&&i!==8){if(t.startsWith('بِسْمِ'))t=t.split(' ').slice(4).join(' ');h+='<div class="bsm">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>'}}
  h+=`${t}<span class="n">﴿${AR(j+1)}﴾</span> `});return h}
function fit(el){let z=Math.min(S.get('fs',22)+4,34);el.style.fontSize=z+'px';while(el.scrollHeight>el.clientHeight+1&&z>11){z--;el.style.fontSize=z+'px'}}
function openPage(p,dir){buildPG();p=Math.min(604,Math.max(1,parseInt(p)||1));qp=p;S.set('lastP',p);$('#qr').classList.add('on');
  const f=PG[p][0],s=QD[f[0]];
  $('#qpg').innerHTML=`<div class="hd"><span>${s.name}</span><span>الجزء ${AR(s.z[f[1]])}</span></div><div class="bd" id="qbd">${pageHTML()}</div><div class="ft">${AR(p)}</div>`;
  fit($('#qbd'));$('#qjn').value=p;if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if($('#qbd'))fit($('#qbd'))});
  if(dir&&$('#qpg').animate)$('#qpg').animate([{transform:`translateX(${dir*-40}px)`,opacity:0},{transform:'none',opacity:1}],{duration:220})}
let tx=0,ty=0;const qs=$('#qs');
qs.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
qs.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5)dx>0?openPage(qp+1,1):openPage(qp-1,-1)},{passive:true});
$('#qclose').innerHTML=ic('x',20);$('#qprev').innerHTML=ic('back',18);$('#qnext').innerHTML=ic('chev',18);
$('#qclose').onclick=()=>{$('#qr').classList.remove('on');drawS()};$('#qnext').onclick=()=>openPage(qp+1,1);$('#qprev').onclick=()=>openPage(qp-1,-1);
$('#qjn').onchange=e=>openPage(e.target.value);
