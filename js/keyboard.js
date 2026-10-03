/* ═══ لوحة مفاتيح مدمجة بتصميم التطبيق: بدون اقتراحات ولا أزرار تعبئة تلقائية ولا شريط الحافظة ═══ */
const KBL={
  ar:[['ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج'],['ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط'],['ذ','د','ز','ر','و','ة','ى','ؤ','ء','ئ']],
  en:[['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l'],['z','x','c','v','b','n','m','-','.']],
  num:[['1','2','3','4','5','6','7','8','9','0'],['-','.','/','،','؟','!',':','(',')']]};
let kEl=null,kLayer='ar',kRep=null;
const kbOn=()=>S.get('kbd',true);
const AUTO='autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"';
const kbAttr=t=>kbOn()?`${AUTO} inputmode="none" data-kb="${t}"`:`${AUTO} inputmode="${t==='num'?'numeric':'text'}"`;
function kbInit(){document.querySelectorAll('input[data-kb],input[type=search],input[type=text]').forEach(i=>{i.setAttribute('autocomplete','off');i.setAttribute('autocorrect','off');i.setAttribute('autocapitalize','off');i.setAttribute('spellcheck','false');
  if(i.dataset.kb){if(kbOn())i.setAttribute('inputmode','none');else i.setAttribute('inputmode',i.dataset.kb==='num'?'numeric':'text')}});if(!kbOn())kbHide()}
function kbDraw(){const kb=$('#kb');let rows;
  if(kEl&&kEl.dataset.kb==='num')rows=[['1','2','3'],['4','5','6'],['7','8','9']].map(r=>r.map(k=>`<button data-k="${k}">${k}</button>`).join('')).concat([`<button data-a="bs" class="a">${ic('bksp',22)}</button><button data-k="0">0</button><button data-a="done" class="a">${ic('check',20)}</button>`]);
  else{rows=KBL[kLayer].map(r=>r.map(k=>`<button data-k="${k}">${k}</button>`).join(''));
    const sw1=kLayer==='ar'?['en','EN']:['ar','ع'],sw2=kLayer==='num'?['en','EN']:['num','123'];
    rows.push(`<button data-a="${sw1[0]}" class="a">${sw1[1]}</button><button data-a="${sw2[0]}" class="a">${sw2[1]}</button><button data-k=" " class="sp">${kLayer==='ar'?'مسافة':'space'}</button><button data-a="bs" class="a">${ic('bksp',22)}</button><button data-a="done" class="a">${ic('down',20)}</button>`)}
  kb.innerHTML=rows.map(r=>`<div class="kbr">${r}</div>`).join('')}
function kbShow(el){kEl=el;kLayer=el.dataset.kb==='en'?'en':'ar';kbDraw();$('#kb').classList.add('on');document.documentElement.classList.add('kbon');setTimeout(()=>{try{el.scrollIntoView({block:'center',behavior:'smooth'})}catch(e){}},260)}
function kbHide(){$('#kb').classList.remove('on');document.documentElement.classList.remove('kbon');kEl=null;clearInterval(kRep)}
function kbIns(ch){const el=kEl;if(!el)return;if(el.maxLength>0&&el.value.length>=el.maxLength&&el.selectionStart===el.selectionEnd)return;const s=el.selectionStart==null?el.value.length:el.selectionStart,e=el.selectionEnd==null?s:el.selectionEnd;el.setRangeText(ch,s,e,'end');el.dispatchEvent(new Event('input',{bubbles:true}))}
function kbDel(){const el=kEl;if(!el)return;const s=el.selectionStart==null?el.value.length:el.selectionStart,e=el.selectionEnd==null?s:el.selectionEnd;if(s!==e)el.setRangeText('',s,e,'end');else if(s>0)el.setRangeText('',s-1,s,'end');else return;el.dispatchEvent(new Event('input',{bubbles:true}))}
function kbPress(b){vib(8);if(b.dataset.k!=null)return kbIns(b.dataset.k);const a=b.dataset.a;
  if(a==='bs')return kbDel();if(a==='done'){const el=kEl;kbHide();if(el)el.blur();return}
  if(a==='ar'||a==='en'||a==='num'){kLayer=a;kbDraw()}}
$('#kb').addEventListener('pointerdown',e=>{e.preventDefault();const b=e.target.closest('button');if(!b)return;kbPress(b);
  if(b.dataset.a==='bs'){clearInterval(kRep);const t=setTimeout(()=>{kRep=setInterval(kbDel,70)},420);const stop=()=>{clearTimeout(t);clearInterval(kRep)};['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,stop,{once:true}))}});
$('#kb').addEventListener('mousedown',e=>e.preventDefault());
document.addEventListener('focusin',e=>{const t=e.target;if(kbOn()&&t.matches&&t.matches('input[data-kb]'))kbShow(t)});
document.addEventListener('focusout',e=>{if(e.target===kEl)setTimeout(()=>{if(document.activeElement!==kEl)kbHide()},60)});
kbInit();
