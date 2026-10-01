/* ═══ JS-3: المظهر ═══ */
const PH={dawn:{bg:'#241D3B',card:'#2F2650',fg:'#F6E9EE',mute:'#B7A6C4',acc:'#FF9E80',line:'#3D3461'},day:{bg:'#F4F1E8',card:'#FFFFFF',fg:'#14332C',mute:'#62786F',acc:'#0E7C66',line:'#DDD8C6'},dusk:{bg:'#2A1A2C',card:'#392438',fg:'#FBE9D6',mute:'#C4A3A0',acc:'#FFB454',line:'#523651'},night:{bg:'#0C1022',card:'#141A33',fg:'#E6E9F7',mute:'#8D96BD',acc:'#9FB4FF',line:'#222B52'}};
let cur='';
function themeKey(ph){const t=S.get('theme','auto');if(t==='sky')return ph;if(t==='light')return 'day';if(t==='dark')return 'night';try{return matchMedia('(prefers-color-scheme: dark)').matches?'night':'day'}catch(e){return 'night'}}
function applyTheme(ph){const k=themeKey(ph);if(k===cur)return;cur=k;const r=document.documentElement.style,t=PH[k];for(const x in t)r.setProperty('--'+x,t[x]);r.setProperty('--soft',t.acc+'26');$('meta[name=theme-color]').content=t.bg}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{cur='';tick()})}catch(e){}

