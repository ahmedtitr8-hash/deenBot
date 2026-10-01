/* ═══ التشغيل ═══ */
(async()=>{gateInit();if(!allowed())return;
  if(!await loadAll()){banner('تعذر تحميل المحتوى. اتصل بالإنترنت وأعد فتح التطبيق')  ;return}
  setFs(S.get('fs',22));tick();drawQ();if(!S.get('locSet'))$('#locBan').style.display='';prefetch()})();
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
$('#hl').innerHTML=LOGO(34);$('#mart').innerHTML=LOGO(26);
