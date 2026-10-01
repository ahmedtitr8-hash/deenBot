/* ═══ JS-7: البيانات (تُحفظ تلقائيًا في الخلفية) ═══ */
const normAz=j=>{if(!Array.isArray(j))j=Object.values(j).find(Array.isArray)||[];return j.map(c=>({c:c.category,i:(c.array||[]).filter(z=>z.text).map(z=>[z.text,Math.max(1,+z.count||1)])})).filter(c=>c.c&&c.i.length)};
async function getAz(){for(const u of CFG.azkar.sources){try{const r=await fetch(CONTENT_BASE&&!u.startsWith('http')?CONTENT_BASE+u:u,{cache:u.startsWith('http')?'default':'no-cache'});if(!r.ok)continue;const a=normAz(await r.json());if(a.length){idbSet('az',a);return a}}catch(e){}}return (await idbGet('az'))||null}
async function getQ(){let q=await idbGet('quran2');if(q)return q;try{const j=(await (await fetch(CFG.api.quran)).json()).data.surahs;q=j.map(s=>({n:s.number,name:s.name,mk:s.revelationType==='Meccan',a:s.ayahs.map(x=>x.text),p:s.ayahs.map(x=>x.page),z:s.ayahs.map(x=>x.juz)}));await idbSet('quran2',q);return q}catch(e){return null}}
function prefetch(){if(!CFG||navigator.onLine===false||!allowed())return;getAz();getQ().then(q=>{if(q&&!QD)QD=q});dlAdhan(AD().who)}
setTimeout(prefetch,2500);addEventListener('online',prefetch);

