/* ═══ JS-2: التنقل ═══ */
const NAV=[['home','الرئيسية','<path d="M3 21h18M5 21V11l7-6 7 6v10M9 21v-6h6v6"/>'],['azkar','الأذكار','<path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/>'],['radio','الراديو','<path d="M4 9h16v11H4zM8 9l8-5M8 14h4"/>'],['quran','القرآن','<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v14"/>'],['me','حسابي','<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/>']];
$('#nav').innerHTML=NAV.map(n=>`<button data-t="${n[0]}"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${n[2]}</svg>${n[1]}</button>`).join('');
function go(t){document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id===t));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));scrollTo(0,0);if(t==='radio')loadRadio();if(t==='quran')loadQuran();if(t==='azkar')loadAz();if(t==='me')hub()}
$('#nav').onclick=e=>{const b=e.target.closest('button');if(b)go(b.dataset.t)};go('home');
$('#sback').innerHTML=ic('back',20);$('#mp').innerHTML=ic('pause',18);
try{$('#hj').textContent=new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(new Date())}catch(e){}

