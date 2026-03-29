(function(){
  const c=document.getElementById('stars'),x=c.getContext('2d');
  c.width=window.innerWidth;c.height=window.innerHeight;
  const S=Array.from({length:160},()=>({x:Math.random()*c.width,y:Math.random()*c.height*.65,r:Math.random()*1.3+.3,a:Math.random()}));
  (function d(){x.clearRect(0,0,c.width,c.height);S.forEach(s=>{s.a+=(Math.random()-.5)*.012;s.a=Math.max(.08,Math.min(.88,s.a));x.beginPath();x.arc(s.x,s.y,s.r,0,Math.PI*2);x.fillStyle=`rgba(255,255,220,${s.a})`;x.fill();});requestAnimationFrame(d);})();
})();

const PC=document.getElementById('pcanvas'),PX=PC.getContext('2d');
PC.width=window.innerWidth;PC.height=window.innerHeight;
let particles=[];
function spawnP(x,y,t){
  const C=t==='bullseye'?['#f5c842','#ffe066','#ffaa00','#fff']:t==='hit'?['#ff6b35','#ff8c42','#ffaa00']:['#999','#777'];
  const n=t==='bullseye'?55:t==='hit'?30:10;
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,sp=Math.random()*(t==='bullseye'?8:4.5)+1;particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(t==='bullseye'?2.5:.8),r:Math.random()*(t==='bullseye'?5:3)+1,color:C[Math.floor(Math.random()*C.length)],life:1,decay:Math.random()*.024+.014,g:.14});}
}
(function pl(){PX.clearRect(0,0,PC.width,PC.height);particles=particles.filter(p=>p.life>0);particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life-=p.decay;const r=p.r*p.life;if(r<=0)return;PX.beginPath();PX.arc(p.x,p.y,r,0,Math.PI*2);PX.fillStyle=p.color;PX.globalAlpha=p.life;PX.fill();PX.globalAlpha=1;});requestAnimationFrame(pl);})();

const svg=document.getElementById('game');
const arrowsGroup=document.querySelector('.arrows');
const arcEl=document.getElementById('arc');
const nockedArrow=document.getElementById('nocked-arrow');
const aimDotsG=document.getElementById('aim-dots');
const aimDots=aimDotsG.querySelectorAll('circle');
const aimCursor=document.getElementById('aim-cursor');
const aimCursorInner=document.getElementById('aim-cursor-inner');
const rtEl=document.getElementById('rt');
const rsEl=document.getElementById('rs');
const goEl=document.getElementById('go');
const hintEl=document.getElementById('hint');
const pfEl=document.getElementById('pf');
const shbEl=document.getElementById('shb');

const TOTAL=6,TGT={x:901,y:298};
let score=0,best=parseInt(localStorage.getItem('ab2_best')||'0');
let arrowsLeft=TOTAL,round=1,canShoot=true;
let stats={bull:0,hit:0,miss:0},rTimer=null;
let isCharging=false,chargeStart=0,chargeRaf=null;
let smOffX=0;

const PIVOT={x:100,y:250};
const AIM_DEFAULT={x:901,y:298};
let aimPt={x:AIM_DEFAULT.x,y:AIM_DEFAULT.y};
let aimPtNorm={x:1,y:0};

function svgPt(cx,cy){
  const pt=svg.createSVGPoint();pt.x=cx;pt.y=cy;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function screenPt(sx,sy){
  const pt=svg.createSVGPoint();pt.x=sx;pt.y=sy;
  return pt.matrixTransform(svg.getScreenCTM());
}

function updateHUD(){
  document.getElementById('hs').textContent=score;
  document.getElementById('hb').textContent=best;
  document.getElementById('hr').textContent=round;
}

function updatePips(){
  const d=document.getElementById('apips');d.innerHTML='';
  for(let i=0;i<TOTAL;i++){const p=document.createElement('div');p.className='pip'+(i>=arrowsLeft?' u':'');d.appendChild(p);}
}

function initGame(){
  score=0;arrowsLeft=TOTAL;round=1;stats={bull:0,hit:0,miss:0};canShoot=true;
  arrowsGroup.innerHTML='';goEl.classList.remove('show');
  aimPt={x:AIM_DEFAULT.x,y:AIM_DEFAULT.y};smOffX=0;
  document.getElementById('stickman').setAttribute('transform','');
  document.getElementById('bow').setAttribute('transform','');
  updateHUD();updatePips();hintEl.classList.remove('h');
  drawArc(0);
}
document.getElementById('rb').addEventListener('click',initGame);

function getBezier(pull){
  const px=PIVOT.x+smOffX,py=PIVOT.y;
  const ex=aimPt.x,ey=aimPt.y;
  const dx=ex-px,dy=ey-py;
  const dist=Math.sqrt(dx*dx+dy*dy);
  const t=dist||1;
  const cp1x=px+dx*0.3-dy*0.3;
  const cp1y=py+dy*0.3+dx*0.3;
  const cp2x=px+dx*0.7-dy*0.1;
  const cp2y=py+dy*0.7+dx*0.05;
  return{P0:{x:px,y:py},CP1:{x:cp1x,y:cp1y},CP2:{x:cp2x,y:cp2y},P3:{x:ex,y:ey}};
}

function bPoint(bez,t){
  const m=1-t,{P0,CP1,CP2,P3}=bez;
  return{x:m*m*m*P0.x+3*m*m*t*CP1.x+3*m*t*t*CP2.x+t*t*t*P3.x,y:m*m*m*P0.y+3*m*m*t*CP1.y+3*m*t*t*CP2.y+t*t*t*P3.y};
}
function bTan(bez,t){
  const m=1-t,{P0,CP1,CP2,P3}=bez;
  return{x:3*m*m*(CP1.x-P0.x)+6*m*t*(CP2.x-CP1.x)+3*t*t*(P3.x-CP2.x),y:3*m*m*(CP1.y-P0.y)+6*m*t*(CP2.y-CP1.y)+3*t*t*(P3.y-CP2.y)};
}

function drawArc(pull){
  const bez=getBezier(pull);
  const {P0,CP1,CP2,P3}=bez;
  const d=`M${P0.x},${P0.y} C${CP1.x},${CP1.y} ${CP2.x},${CP2.y} ${P3.x},${P3.y}`;
  arcEl.setAttribute('d',d);
  arcEl.style.opacity=pull>4?Math.min(pull/52,1):'0';

  if(pull>4){
    const ts=[0.22,0.42,0.60,0.76];
    aimDotsG.style.opacity='1';
    ts.forEach((t,i)=>{const p=bPoint(bez,t);aimDots[i].setAttribute('cx',p.x);aimDots[i].setAttribute('cy',p.y);});
  } else {
    aimDotsG.style.opacity='0';
  }

  aimCursor.setAttribute('cx',P3.x);aimCursor.setAttribute('cy',P3.y);
  aimCursorInner.setAttribute('cx',P3.x);aimCursorInner.setAttribute('cy',P3.y);
  aimCursor.style.opacity='0.7';aimCursorInner.style.opacity='0.7';

  const angle=Math.atan2(P3.y-P0.y,P3.x-P0.x)*180/Math.PI;
  const bowAngle=(angle)*Math.PI/180;
  const scale=Math.min(Math.max(pull/30,1),2.2);
  const px=PIVOT.x+smOffX;

  TweenMax.set('#bow',{scaleX:scale,rotation:angle+'deg',transformOrigin:`${88-px} center`,x:0,y:0});
  TweenMax.to('#bow',0.08,{rotation:angle+'deg',scaleX:scale,transformOrigin:'right center'});

  const bowRot=(angle)*Math.PI/180;
  const pullBack=pull*(1/scale);
  const nockX=px+Math.cos(bowRot+Math.PI)*pullBack;
  const nockY=PIVOT.y+Math.sin(bowRot+Math.PI)*pullBack;
  nockedArrow.setAttribute('x',nockX);nockedArrow.setAttribute('y',nockY);
  nockedArrow.setAttribute('transform',`rotate(${angle},${nockX},${nockY})`);
  nockedArrow.style.opacity=pull>4?'1':'0';

  const sp=Math.min(88+smOffX-(1/scale)*pull,88+smOffX);
  TweenMax.to('#bstr',0.08,{attr:{points:`${88+smOffX},200 ${sp},250 ${88+smOffX},300`}});

  const armPull=Math.min(pull/52,1);
  TweenMax.to('#afu',0.08,{attr:{x2:108+smOffX+22*armPull,y2:287-14*armPull}});
  TweenMax.to('#afl',0.08,{attr:{x1:108+smOffX+22*armPull,y1:287-14*armPull,x2:100+smOffX+28*armPull,y2:272-9*armPull}});
}

let currentPull=0;

const jb=document.getElementById('jb'),js=document.getElementById('js');
let jActive=false,jOX=0,jOY=0;
const JR=32;

const SVG_W=1000,SVG_H=500;
const AIM_MIN_X=400,AIM_MAX_X=970,AIM_MIN_Y=180,AIM_MAX_Y=420;

function bindJoy(se,me,ee,gxy){
  jb.addEventListener(se,e=>{
    e.preventDefault();jActive=true;
    const r=jb.getBoundingClientRect();jOX=r.left+r.width/2;jOY=r.top+r.height/2;
    hintEl.classList.add('h');
    const {x,y}=gxy(e);joyMove(x,y);
  },{passive:false});
  window.addEventListener(me,e=>{if(!jActive)return;e.preventDefault();const {x,y}=gxy(e);joyMove(x,y);},{passive:false});
  window.addEventListener(ee,()=>{if(!jActive)return;jActive=false;js.style.transform='translate(-50%,-50%)';});
}
bindJoy('touchstart','touchmove','touchend',e=>({x:e.touches[0].clientX,y:e.touches[0].clientY}));
bindJoy('mousedown','mousemove','mouseup',e=>({x:e.clientX,y:e.clientY}));

function joyMove(cx,cy){
  const dx=cx-jOX,dy=cy-jOY,dist=Math.sqrt(dx*dx+dy*dy)||1;
  const cl=Math.min(dist,JR),nx=dx/dist,ny=dy/dist;
  js.style.transform=`translate(calc(-50% + ${nx*cl}px),calc(-50% + ${ny*cl}px))`;

  const SPEED=6;
  aimPt.x=Math.max(AIM_MIN_X,Math.min(AIM_MAX_X,aimPt.x+nx*SPEED));
  aimPt.y=Math.max(AIM_MIN_Y,Math.min(AIM_MAX_Y,aimPt.y+ny*SPEED));
  drawArc(currentPull);
}

const moveState={l:false,r:false};
let mRaf=null;
function bindBtn(id,dir){
  const btn=document.getElementById(id);
  const on=e=>{e.preventDefault();moveState[dir]=true;btn.classList.add('p');hintEl.classList.add('h');startML();};
  const off=()=>{moveState[dir]=false;btn.classList.remove('p');};
  btn.addEventListener('touchstart',on,{passive:false});btn.addEventListener('mousedown',on);
  btn.addEventListener('touchend',off);btn.addEventListener('touchcancel',off);btn.addEventListener('mouseup',off);btn.addEventListener('mouseleave',off);
}
bindBtn('bl','l');bindBtn('br','r');
['bu','bd'].forEach(id=>{
  const btn=document.getElementById(id);
  btn.addEventListener('touchstart',e=>{e.preventDefault();btn.classList.add('p');},{passive:false});
  btn.addEventListener('touchend',()=>btn.classList.remove('p'));
  btn.addEventListener('mousedown',()=>btn.classList.add('p'));
  btn.addEventListener('mouseup',()=>btn.classList.remove('p'));
});

function startML(){
  if(mRaf)return;
  (function lp(){
    if(!moveState.l&&!moveState.r){mRaf=null;return;}
    if(moveState.l)smOffX=Math.max(-60,smOffX-3);
    if(moveState.r)smOffX=Math.min(200,smOffX+3);
    document.getElementById('stickman').setAttribute('transform',`translate(${smOffX},0)`);
    document.getElementById('bow').setAttribute('transform',`translate(${smOffX},0)`);
    PIVOT.x=100+smOffX;
    drawArc(currentPull);
    mRaf=requestAnimationFrame(lp);
  })();
}

function startCharge(e){
  e.preventDefault();
  if(!canShoot||arrowsLeft<=0||goEl.classList.contains('show'))return;
  isCharging=true;chargeStart=performance.now();
  hintEl.classList.add('h');shbEl.classList.add('sa');
  (function tick(){
    if(!isCharging)return;
    const held=Math.min(performance.now()-chargeStart,1000);
    const pct=held/1000;
    pfEl.style.height=(pct*100)+'%';
    currentPull=pct*52;
    drawArc(currentPull);
    chargeRaf=requestAnimationFrame(tick);
  })();
}

function releaseCharge(e){
  if(!isCharging)return;
  isCharging=false;cancelAnimationFrame(chargeRaf);
  shbEl.classList.remove('sa');
  const power=Math.max(0.15,(performance.now()-chargeStart)/1000);
  pfEl.style.height='0%';
  const shotPull=currentPull;
  currentPull=0;
  drawArc(0);
  fire(power,shotPull);
}

shbEl.addEventListener('touchstart',startCharge,{passive:false});
shbEl.addEventListener('mousedown',startCharge);
shbEl.addEventListener('touchend',releaseCharge,{passive:false});
shbEl.addEventListener('mouseup',releaseCharge);

function fire(power,pull){
  if(!canShoot||arrowsLeft<=0)return;
  canShoot=false;

  TweenMax.to('#bstr',0.45,{attr:{points:`${88+smOffX},200 ${88+smOffX},250 ${88+smOffX},300`},ease:Elastic.easeOut});
  TweenMax.to('#afu',0.45,{attr:{x2:128+smOffX,y2:287},ease:Elastic.easeOut});
  TweenMax.to('#afl',0.45,{attr:{x1:128+smOffX,y1:287,x2:118+smOffX,y2:274},ease:Elastic.easeOut});
  aimDotsG.style.opacity='0';
  aimCursor.style.opacity='0';aimCursorInner.style.opacity='0';
  nockedArrow.style.opacity='0';

  const bez=getBezier(pull);
  const newArrow=document.createElementNS('http://www.w3.org/2000/svg','use');
  newArrow.setAttributeNS('http://www.w3.org/1999/xlink','href','#arrow');
  arrowsGroup.appendChild(newArrow);

  const dur=Math.max(260,600*(1-Math.min(power,1)*0.5));
  const t0=performance.now();
  let hitDone=false;

  (function anim(now){
    const t=Math.min((now-t0)/dur,1);
    const pos=bPoint(bez,t),tan=bTan(bez,t);
    const ang=Math.atan2(tan.y,tan.x)*180/Math.PI;
    newArrow.setAttribute('x',pos.x);newArrow.setAttribute('y',pos.y);
    newArrow.setAttribute('transform',`rotate(${ang},${pos.x},${pos.y})`);

    if(!hitDone){
      const dx=pos.x-TGT.x,dy=pos.y-TGT.y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<45&&t>0.5){
        hitDone=true;
        const R=svg.getBoundingClientRect();
        const px=R.left+TGT.x*(R.width/SVG_W),py=R.top+TGT.y*(R.height/SVG_H);
        if(d<6){score+=200;stats.bull++;spawnP(px,py,'bullseye');showR('bullseye','🎯 BULLSEYE!','+200 PTS');}
        else if(d<20){score+=60;stats.hit++;spawnP(px,py,'hit');showR('hit','HIT','+60 PTS');}
        else if(d<38){score+=20;stats.hit++;spawnP(px,py,'hit');showR('hit','CLOSE','+20 PTS');}
        else{stats.miss++;spawnP(px,py,'miss');showR('miss','MISS','');}
        if(best<score){best=score;localStorage.setItem('ab2_best',best);}
        updateHUD();
        setTimeout(()=>{if(arrowsLeft<=0)endGame();},1600);
        return;
      }
    }
    if(t<1)requestAnimationFrame(anim);
    else if(!hitDone){stats.miss++;showR('miss','MISS','');updateHUD();setTimeout(()=>{if(arrowsLeft<=0)endGame();},1600);}
  })(t0);

  arcEl.style.opacity='0';
  arrowsLeft--;updatePips();
  setTimeout(()=>{canShoot=true;},450);
}

function showR(type,text,sub){
  clearTimeout(rTimer);rtEl.className='rt';rsEl.className='rs';
  rtEl.textContent=text;rtEl.classList.add(type);rsEl.textContent=sub;
  requestAnimationFrame(()=>{rtEl.classList.add('show');rsEl.classList.add('show');});
  rTimer=setTimeout(()=>{rtEl.classList.remove('show');rsEl.classList.remove('show');},1400);
}

function endGame(){
  round++;
  document.getElementById('fsc').textContent=score;
  document.getElementById('stb').textContent=stats.bull;
  document.getElementById('sth').textContent=stats.hit;
  document.getElementById('stm').textContent=stats.miss;
  setTimeout(()=>goEl.classList.add('show'),600);
}

updateHUD();updatePips();drawArc(0);
