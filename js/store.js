/* ═══ المحتوى: كل المحتوى في ملفات JSON داخل مجلد data/ ═══ */
const CONTENT_BASE=(document.querySelector('meta[name=content-base]')||{}).content||'';
let CFG=null,REG=[],MUEZ=[],METHL=[],METH={},BASE='';
async function J(p){for(const u of(CONTENT_BASE?[CONTENT_BASE+p,p]:[p])){try{const r=await fetch(u,{cache:'no-cache'});if(r.ok){const j=await r.json();idbSet('j:'+p,j);return j}}catch(e){}}return (await idbGet('j:'+p))||null}
async function loadAll(){CFG=await J('data/config.json');const[c,m]=await Promise.all([J('data/cities.json'),J('data/muezzins.json')]);if(!CFG||!c||!m){CFG=null;return false}
  REG=c.map(g=>[g.name,g.tz,g.cities]);BASE=m.base||'';MUEZ=m.list.map(x=>[x.id,x.name,x.file||'']);METHL=CFG.methods.map(x=>[x.id,x.name]);CFG.methods.forEach(x=>METH[x.id]={f:x.fajr,i:x.isha,im:x.ishaMin});return true}
