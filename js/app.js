/* ═══ التشغيل ═══ */
(function heal(){try{const b=getComputedStyle(document.documentElement).getPropertyValue('--build').trim();
  if(b==='5'){S.set('healed',0);return}
  if(!S.get('healed',0)){S.set('healed',1);(async()=>{try{for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister();for(const k of await caches.keys())await caches.delete(k)}catch(e){}location.reload()})()}
  else setTimeout(()=>banner('ملف css/ غير محدّث على GitHub. ارفع مجلد css كاملًا ثم افتح التطبيق'),1500)}catch(e){}})();
(async()=>{gateInit();if(!allowed())return;
  if(!await loadAll()){banner('تعذر تحميل المحتوى. اتصل بالإنترنت وأعد فتح التطبيق');return}
  if(loc.precise||loc.label==='موقعي الدقيق'||loc.label==='موقعي'){loc.label=near(loc.lat,loc.lng);loc.precise=true;S.set('loc',loc);$('#cityBtn').innerHTML=ic('pin',16)+loc.label}
  setFs(S.get('fs',22));tick();drawQ();if(!S.get('locSet'))$('#locBan').style.display='';prefetch();setTimeout(mpPrefetch,8000)})();
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
$('#hl').innerHTML=LOGO(34);$('#mart').innerHTML=LOGO(26);
