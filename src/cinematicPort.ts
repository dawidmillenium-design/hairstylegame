/**
 * Cinematic Pixel World — layered Hong Kong port inspired by the supplied 10-second video.
 * Original procedural art rather than a stretched low-resolution screenshot.
 * Logical viewport is 800 x 450. The host canvas applies HiDPI scaling.
 */
export type PortScene = {
  frame: number;
  travel: number;
  ground: number;
  city: string;
  ghost: boolean;
  accent: string;
  reducedMotion?: boolean;
};
const W = 800;
const H = 450;
const TAU = Math.PI * 2;
const hash = (n:number) => {
  const x = Math.sin(n * 127.1 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const wrap = (value:number, length:number) => ((value % length) + length) % length;
function glowDot(c:CanvasRenderingContext2D,x:number,y:number,r:number,color:string){
  c.save();
  c.shadowBlur=r*6;
  c.shadowColor=color;
  c.fillStyle=color;
  c.beginPath(); c.arc(x,y,r,0,TAU); c.fill();
  c.restore();
}
function fill(c:CanvasRenderingContext2D,col:string,x:number,y:number,w:number,h:number){
  c.fillStyle=col; c.fillRect(x,y,w,h);
}
function container(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,col:string,label=''){
  fill(c,'#050a1e',x-2,y-2,w+4,h+4);
  fill(c,col,x,y,w,h);
  fill(c,'#ffffff24',x+2,y+2,w-4,2);
  fill(c,'#05092277',x+2,y+h-6,w-4,5);
  c.strokeStyle='#03082499'; c.lineWidth=1;
  for(let dx=8;dx<w-4;dx+=10){c.beginPath();c.moveTo(x+dx,y+5);c.lineTo(x+dx,y+h-5);c.stroke();}
  if(label){
    c.font='bold 9px monospace';c.fillStyle='#f8edf1';c.fillText(label,x+6,y+h/2+4);
  }
}
function city(c:CanvasRenderingContext2D,travel:number,frame:number){
  for(let i=0;i<36;i++){
    const w=16+hash(i+31)*29;
    const h=35+hash(i+82)*115;
    const x=wrap(i*31-travel*0.045,960)-70;
    const y=285-h;
    fill(c,i%4===0?'#152347':'#111d3c',x,y,w,h);
    fill(c, i%3?'#9945a7':'#37acde',x+2,y,w-4,1.5);
    for(let col=0;col<Math.floor(w/8);col++){
      for(let row=0;row<Math.floor(h/12);row++){
        if(hash(i*213+col*17+row*37)>.41){
          fill(c,(i+col+row)%5===0?'#ef61da':'#ffba7f',x+4+col*8,y+8+row*12,2,3);
        }
      }
    }
  }
  // Neon tower and rotating skyline beacons.
  const tx=wrap(287-travel*.03,950)-50;
  fill(c,'#ef55e0',tx,125,3,157);
  fill(c,'#d7eaff',tx-2,122,7,4);
  for(let i=0;i<8;i++){fill(c,'#ae6de5',tx-14+i*2,158+i*15,28-i*3,2);}
  if(frame%72<36)glowDot(c,tx+1,119,3,'#ff4bfb');
}
function crane(c:CanvasRenderingContext2D,x:number,y:number,s:number,frame:number){
  c.save();c.translate(x,y);c.scale(s,s);
  c.strokeStyle='#243653';c.lineWidth=5;
  c.beginPath();c.moveTo(-16,0);c.lineTo(0,-140);c.lineTo(20,0);c.stroke();
  c.strokeStyle='#6880a9';c.lineWidth=2;
  c.beginPath();c.moveTo(0,-140);c.lineTo(0,-212);c.lineTo(140,-212);
  c.lineTo(220,-170);c.stroke();
  c.strokeStyle='#1a2f58';c.lineWidth=4;
  c.beginPath();c.moveTo(-112,-150);c.lineTo(215,-181);c.stroke();
  c.beginPath();c.moveTo(-112,-150);c.lineTo(0,-212);c.lineTo(215,-181);c.stroke();
  c.strokeStyle='#82add1';c.lineWidth=1;
  for(let i=0;i<8;i++){
    const cx=-96+i*37;
    c.beginPath();c.moveTo(cx,-165+i*.4);c.lineTo(cx,-195+i*1.5);c.stroke();
  }
  for(let i=0;i<3;i++){
    const cx=25+i*70;
    c.beginPath();c.moveTo(cx,-196);c.lineTo(cx,-130);c.stroke();
    fill(c,'#f4be74',cx-7,-131,14,5);
  }
  glowDot(c,215,-182,2,frame%75<42?'#ff406e':'#b62b57');
  glowDot(c,0,-214,2,'#ffd08d');
  c.restore();
}
function ship(c:CanvasRenderingContext2D,x:number,y:number,s:number){
  c.save();c.translate(x,y);c.scale(s,s);
  fill(c,'#1d2d4f',10,-78,182,79);
  fill(c,'#0b1026',0,0,244,22);
  fill(c,'#18294b',7,18,225,16);
  c.fillStyle='#060c1d';c.beginPath();
  c.moveTo(-14,0);c.lineTo(245,0);c.lineTo(207,47);c.lineTo(30,47);c.closePath();c.fill();
  fill(c,'#eac678',7,-88,21,10);
  fill(c,'#fff1b1',42,-118,31,30);
  fill(c,'#cdd7df',65,-142,36,31);
  for(let row=0;row<2;row++){
    for(let col=0;col<5;col++){
      container(c,83+col*26,-78+row*35,26,32,['#de5f8e','#476ba8','#ab4162'][col%3]);
    }
  }
  for(let i=0;i<24;i++){fill(c,'#ffb97b',20+i*8,5,3,2);}
  glowDot(c,218,-11,3,'#5efff2');
  c.restore();
}
function tire(c:CanvasRenderingContext2D,x:number,y:number,r:number){
  c.save();c.translate(x,y);
  c.fillStyle='#090d19';c.beginPath();c.ellipse(0,0,r,r*1.13,0,0,TAU);c.fill();
  c.strokeStyle='#7783a7';c.lineWidth=3;c.beginPath();c.arc(0,0,r*.57,0,TAU);c.stroke();
  c.strokeStyle='#353d51';c.lineWidth=2;c.beginPath();c.arc(0,0,r*.79,0,TAU);c.stroke();
  for(let i=0;i<7;i++){const a=i*TAU/7;fill(c,'#b7c9db',Math.cos(a)*r*.43-2,Math.sin(a)*r*.43-2,4,4);}
  c.restore();
}
function truck(c:CanvasRenderingContext2D,x:number,y:number,s:number,indian:boolean,frame:number){
  c.save();c.translate(x,y);c.scale(s,s);
  // Trailer
  fill(c,'#050b1a',-165,-66,149,62);
  fill(c,indian?'#c16b18':'#384f79',-163,-64,146,55);
  fill(c,indian?'#edac35':'#8092b8',-163,-66,146,5);
  for(let i=0;i<12;i++){fill(c,'#a6d2e244',-157+i*12,-58,3,43);}
  fill(c,indian?'#8f244d':'#1b2748',-160,-12,141,7);
  // Distinguish US long-nose conventionals from Indian decorated short-cab lorries
  if(indian){
    fill(c,'#ac214f',-16,-68,45,65);
    fill(c,'#f1b934',-17,-78,48,10);
    fill(c,'#f2a920',-16,-65,44,59);
    fill(c,'#a7e9f8',-12,-57,36,20);
    fill(c,'#a92868',-15,-31,42,6);
    for(let i=0;i<6;i++){fill(c,i%2?'#77ffda':'#f353ae',-15+i*7,-73,5,3);}
    fill(c,'#f3e8c3',-14,-17,41,8);
    c.fillStyle='#f9d5de';c.font='bold 6px monospace';c.fillText('HORN OK',-14,-10);
  }else{
    fill(c,'#e24c67',-36,-68,45,65);
    fill(c,'#e85660',-32,-75,40,8);
    fill(c,'#aaecff',-29,-60,20,23);
    fill(c,'#232d49',-12,-44,18,4);
    fill(c,'#e0445a',5,-34,43,29); // long American hood
    fill(c,'#d9e5f8',11,-22,39,7);
    fill(c,'#afbacb',-11,-89,5,27);fill(c,'#afbacb',0,-89,5,27);
    fill(c,'#e1e9f4',46,-30,6,21);
  }
  tire(c,-140,-2,13);tire(c,-104,-2,13);tire(c,-27,-2,14);tire(c,indian?15:28,-2,14);
  fill(c,'#ffe3bd',indian?25:49,-27,4,6);
  glowDot(c,indian?29:51,-24,1.5,'#fff6d5');
  c.restore();
}
function rain(c:CanvasRenderingContext2D,frame:number,travel:number){
  c.save();
  c.strokeStyle='#95d8ff39'; c.lineWidth=1;
  for(let i=0;i<126;i++){
    const x=wrap(hash(i+17)*W+frame*2.2+i*7,W+100)-50;
    const y=wrap(hash(i+111)*H+frame*5.1,H+40)-30;
    c.beginPath();c.moveTo(x,y);c.lineTo(x-4,y+16);c.stroke();
  }
  c.restore();
}
function road(c:CanvasRenderingContext2D,travel:number,ground:number){
  const g=c.createLinearGradient(0,ground,0,H);
  g.addColorStop(0,'#263c5c');g.addColorStop(.38,'#151d39');g.addColorStop(1,'#090b1f');
  c.fillStyle=g;c.fillRect(0,ground,W,H-ground);
  // Pixelated reflective rain puddles and runway dashes.
  for(let i=0;i<90;i++){
    const x=wrap(hash(i+300)*W-travel*.21,W+60)-30;
    const y=ground+12+hash(i+735)*(H-ground-16);
    fill(c,i%4===0?'#ef65b141':'#62dcff2c',x,y,8+hash(i+39)*38,1);
  }
  const off=wrap(travel,120);
  for(let x=-off;x<W+100;x+=120){
    fill(c,'#fce091',x,ground+23,57,4);
    fill(c,'#fff5cd55',x,ground+29,48,2);
  }
  fill(c,'#0b1022',0,ground,800,6);
  fill(c,'#e6b453',0,ground+3,800,2);
  for(let i=0;i<10;i++){
    const x=i*89;
    fill(c,'#ed5b93aa',x,ground+8,20,2);
    fill(c,'#56d1f277',x+24,ground+8,25,2);
  }
}
export function drawCinematicPort(c:CanvasRenderingContext2D,p:PortScene){
  const {frame,travel,ground,city:stage,ghost}=p;
  const grad=c.createLinearGradient(0,0,0,ground);
  grad.addColorStop(0,ghost?'#101026':'#09112e');
  grad.addColorStop(.43,ghost?'#302a5d':'#202e64');
  grad.addColorStop(.75,ghost?'#5f4477':'#563b76');
  grad.addColorStop(1,ghost?'#56486e':'#a05d89');
  c.fillStyle=grad;c.fillRect(0,0,W,ground);
  // Diffuse moon / city haze
  const moon=c.createRadialGradient(620,98,12,620,98,270);
  moon.addColorStop(0,'#ac9de83a');moon.addColorStop(1,'#ac9de800');
  c.fillStyle=moon;c.fillRect(320,0,480,ground);
  city(c,travel,frame);
  const craneOffset=wrap(travel*.08,360);
  crane(c,150-craneOffset,312,.78,frame);
  crane(c,500-craneOffset,308,1,frame);
  crane(c,810-craneOffset,312,.9,frame);
  // Ocean — deliberately distinct from the gameplay road.
  fill(c,'#15294f',0,280,W,55);
  for(let i=0;i<28;i++){
    const x=wrap(i*49+frame*1.5,W+80)-40;
    fill(c,i%3===0?'#e774aa55':'#63dcff55',x,285+(i*17)%46,13+(i%4)*7,1);
  }
  ship(c,wrap(480-travel*.035,1020)-145,278,.84);
  // Second depth plane: containers and working lamps
  const palettes=['#294a82','#623c68','#884361','#205b6b','#a35a59'];
  for(let i=0;i<9;i++){
    const x=wrap(i*114-travel*.11,1020)-110;
    const y=337-(i%3)*25;
    container(c,x,y,106,25,palettes[i%5]);
  }
  for(let i=0;i<4;i++){
    const x=wrap(38+i*254-travel*.15,1020)-80;
    fill(c,'#18243b',x,297,4,84);
    fill(c,'#c6d3f1',x-4,295,13,2);
    glowDot(c,x+1,294,2, i%2?'#ff67ad':'#ffeaaa');
  }
  // The two permitted vehicle archetypes alternate continuously: USA and INDIA.
  for(let i=0;i<4;i++){
    const x=wrap(i*242+100-travel*.3,1140)-170;
    truck(c,x,356,i%2? .54:.61,i%2===1,frame);
  }
  road(c,travel,ground);
  // Raised foreground containers and physical jumping platforms
  for(let i=0;i<8;i++){
    const x=wrap(i*208+88-travel*.8,1690)-205;
    if(i%3===0) {
      container(c,x,ground-26,83,25,palettes[(i+2)%5]);
      container(c,x+18,ground-51,47,23,palettes[(i+3)%5]);
    }
    else if(i%3===1){
      fill(c,'#192037',x,ground-9,105,9);
      fill(c,'#ffd071',x,ground-9,105,3);
      for(let k=0;k<5;k++)fill(c,'#e3546a',x+6+k*20,ground-7,9,3);
    }
  }
  // Neon exit gate — visual landmark modeled after the finale shown in the video.
  const exitX=wrap(1540-travel*.9,1700)-80;
  if(exitX>-80&&exitX<W+80){
    fill(c,'#091423',exitX-20,ground-168,83,171);
    fill(c,'#5cffb4',exitX-18,ground-166,5,165);
    fill(c,'#5cffb4',exitX+60,ground-166,5,165);
    c.fillStyle='#163a37';c.fillRect(exitX-11,ground-119,65,110);
    c.save(); c.shadowColor='#70ffbd';c.shadowBlur=20;
    c.fillStyle='#64ffa5';
    c.font='bold 50px monospace'; c.fillText('»',exitX+4,ground-51);
    c.restore();
    fill(c,'#e43c95',exitX-28,ground-184,99,18);
    c.fillStyle='#fff';c.font='bold 10px monospace';c.fillText('TRUCK TERMINAL',exitX-25,ground-172);
  }
  if(!p.reducedMotion)rain(c,frame,travel);
  // Stage identification is retained without hiding the scrolling world.
  fill(c,'#050a1fdd',272,9,256,42);
  c.strokeStyle=p.accent;c.lineWidth=1;c.strokeRect(272,9,256,42);
  c.fillStyle=p.accent;c.font='bold 17px monospace';c.textAlign='center';c.fillText('✦ '+stage.toUpperCase()+' ✦',400,27);
  c.fillStyle='#e6e9fd';c.font='11px monospace';c.fillText('PIXEL WORLD • WORLD TRUCK TOUR',400,42);
  c.textAlign='left';
}
