/* ═══ JS-5: القبلة ═══ */
let hd=0,hasS=false;
function drawQ(){const a=loc.lat*R,b=loc.lng*R,c=21.4225*R,d=39.8262*R,q=(Math.atan2(Math.sin(d-b)*Math.cos(c),Math.cos(a)*Math.sin(c)-Math.sin(a)*Math.cos(c)*Math.cos(d-b))/R+360)%360;
  $('#nd').style.transform=`rotate(${q-hd}deg)`;$('#qt').textContent=`${Math.round(q)}° من الشمال. `+(hasS?'وجّه الجوال حتى تصير الإبرة للأعلى':'ضع الجوال أفقيًا وحرّكه لتفعيل البوصلة')}
addEventListener('deviceorientationabsolute',e=>{if(e.alpha!=null){hasS=true;hd=360-e.alpha;drawQ()}},true);
addEventListener('deviceorientation',e=>{if(e.webkitCompassHeading!=null){hasS=true;hd=e.webkitCompassHeading;drawQ()}},true);

