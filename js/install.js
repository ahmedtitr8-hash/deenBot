/* ═══ شاشة التثبيت: لا يُفتح التطبيق إلا كتطبيق مثبّت ═══ */
const QS=new URLSearchParams(location.search);
if(QS.get('app')==='1')S.set('isApp',true);if(QS.get('dev')==='1')S.set('dev',true);
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const allowed=()=>standalone()||S.get('isApp',false)||S.get('dev',false);
let dip=null,done=false;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;if(!allowed())renderGate()});
addEventListener('appinstalled',()=>{done=true;renderGate()});
const IOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),AND=/android/i.test(navigator.userAgent);
const step_=(n,i,t)=>`<div class="gs"><span class="gn">${n}</span><span class="gi">${ic(i,20)}</span><span>${t}</span></div>`;
function renderGate(){const g=$('#gate');let b='';
  if(done)b='<p class="mute">تم التثبيت. افتح <b>قيام</b> من الشاشة الرئيسية في جوالك.</p>';
  else if(IOS)b='<p class="mute">على الآيفون يتم التثبيت من متصفح سفاري:</p>'+step_(1,'share','اضغط زر المشاركة أسفل الشاشة')+step_(2,'addbox','اختر «إضافة إلى الشاشة الرئيسية»')+step_(3,'check','اضغط «إضافة» ثم افتح التطبيق من الشاشة الرئيسية');
  else if(AND)b=(dip?`<button class="btn" id="gin">${ic('download',20)}تثبيت التطبيق</button>`:'')+'<p class="mute">'+(dip?'أو يدويًا:':'ثبّت التطبيق يدويًا:')+'</p>'+step_(1,'more','افتح قائمة المتصفح (النقاط الثلاث)')+step_(2,'addbox','اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»')+step_(3,'check','افتح التطبيق من الشاشة الرئيسية');
  else b=`<div class="gs">${ic('desktop',22)}<span>افتح هذا الرابط من جوالك لتثبيت التطبيق</span></div>`;
  g.innerHTML=`<div class="glogo">${LOGO(88)}</div><h1 class="k" style="font-size:34px;margin:6px 0">قيام</h1><p class="mute" style="margin:0 0 18px">ثبّت التطبيق أولًا ليعمل على جوالك</p>${b}`;
  if($('#gin'))$('#gin').onclick=async()=>{dip.prompt();await dip.userChoice;dip=null}}
function gateInit(){if(allowed()){$('#gate').style.display='none'}else{document.body.classList.add('locked');$('#gate').style.display='flex';renderGate()}}
