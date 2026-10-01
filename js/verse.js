/* ═══ آية الساعة: آية جديدة كل ساعة (تُختار من المصحف المحفوظ على الجهاز) ═══ */
let vKey=0,VS=null;
function setVerse(now){const k=now.getFullYear()*1e6+(now.getMonth()+1)*1e4+now.getDate()*100+now.getHours();
  if(k===vKey&&(VS||!QD))return;vKey=k;let t,s,n;
  if(QD){if(!VS){VS=[];QD.forEach((q,i)=>q.a.forEach((a,j)=>{if(a.length>CFG.verse.minLen&&a.length<CFG.verse.maxLen&&!a.startsWith('بِسْمِ'))VS.push([i,j])}))}
    const h=Math.imul(k,2654435761)>>>0,[i,j]=VS[h%VS.length];t=QD[i].a[j];s=QD[i].name.replace('سُورَةُ ','');n=j+1}
  else{const v=CFG.verse.fallback[k%CFG.verse.fallback.length];t=v[0];s=v[1];n=v[2]}
  $('#verse').innerHTML=`<div class="zk">${t}</div><div class="mute sm" style="text-align:center">سورة ${s} • آية ${n}</div>`}
