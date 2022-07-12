"use strict";

window.addEventListener("load",function() {

  let canv, ctx;    // canvas and context
  let maxx, maxy;   // canvas dimensions

  let radius;
  let p0, p1;
  let mat1, mat2, mat3;
  let maxDepth;
  let hue0, hue1;

// for animation
  let events;

// shortcuts for Math.
  const mrandom = Math.random;
  const mfloor = Math.floor;
  const mround = Math.round;
  const mceil = Math.ceil;
  const mabs = Math.abs;
  const mmin = Math.min;
  const mmax = Math.max;

  const mPI = Math.PI;
  const mPIS2 = Math.PI / 2;
  const mPIS3 = Math.PI / 3;
  const m2PI = Math.PI * 2;
  const m2PIS3 = Math.PI * 2 / 3;
  const msin = Math.sin;
  const mcos = Math.cos;
  const matan2 = Math.atan2;

  const mhypot = Math.hypot;
  const msqrt = Math.sqrt;

  const rac3   = msqrt(3);
  const rac3s2 = rac3 / 2;

//------------------------------------------------------------------------

function alea (mini, maxi) {
// random number in given range

  if (typeof(maxi) == 'undefined') return mini * mrandom(); // range 0..mini

  return mini + mrandom() * (maxi - mini); // range mini..maxi
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function intAlea (mini, maxi) {
// random integer in given range (mini..maxi - 1 or 0..mini - 1)
//
  if (typeof(maxi) == 'undefined') return mfloor(mini * mrandom()); // range 0..mini - 1
  return mini + mfloor(mrandom() * (maxi - mini)); // range mini .. maxi - 1
}
//------------------------------------------------------------------------
function draw1 (path) {
  ctx.setTransform(...mat1);
  ctx.stroke(path);
}
function draw2 (path) {
  ctx.setTransform(...mat2);
  ctx.stroke(path);
}
function draw3 (path) {
  ctx.setTransform(...mat3);
  ctx.stroke(path);
}
//------------------------------------------------------------------------
function drawSegment(p0, p1, level, depth, alpha, path) {
 // p0, p1 : ends of segment
 // level : recursion level (0 for outermost)
 // depth : max recursion level
 // path : drawing path being generated

  if (level==0) path.moveTo (p0.x, p0.y);
  if (level < depth) { // not max level, draw recursively

    const talpha = (level == depth - 1) ? alpha : 1;
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const l = mhypot(dx, dy);
    const pa = {x: p0.x + dx / 3, y: p0.y + dy / 3};
    const pc = {x: p1.x - dx / 3, y: p1.y - dy / 3};
    const pb = {x: p0.x + dx / 2 + talpha * dy / 2 / rac3,
                y: p0.y + dy / 2 - talpha * dx / 2 / rac3};
    drawSegment(p0, pa, level + 1, depth, alpha, path);
    drawSegment(pa, pb, level + 1, depth, alpha, path);
    drawSegment(pb, pc, level + 1, depth, alpha, path);
    drawSegment(pc, p1, level + 1, depth, alpha, path);
  } else {
    path.lineTo(p1.x, p1.y);
  }
} // drawSegment

//------------------------------------------------------------------------

let animate;

{ // scope for animate

let animState = 0;
let tInit;
let depth;

animate = function(tStamp) {

  let event;
  let alpha, path;

  const STEP_DURATION = 1000;

  event = events.shift();
  if (event && event.event == 'reset') animState = 0;
  if (event && event.event == 'click') animState = 0;
  window.requestAnimationFrame(animate)

  switch (animState) {

    case 0 :
      if (startOver()) {
        depth = 0;
        ++animState;
      }

    case 1 :
      if (depth > maxDepth) {
        animState = 10; // finished
        break;
      }
      tInit = performance.now();
      hue0 = (hue1 + 360) % 360;
      hue1 = hue0 + intAlea(-50,50);
      ++animState;
  
    case 2:
      alpha = (performance.now() - tInit) / STEP_DURATION;
      if (alpha > 1) alpha = 1;
      path = new Path2D();
      drawSegment(p0, p1, 0, depth, alpha, path);

      ctx.setTransform(1,0,0,1,0,0); // reset transforms
      ctx.fillStyle = "#000";
      ctx.fillRect(0 ,0, maxx, maxy);
      ctx.strokeStyle = `hsl(${(1-alpha) * hue0 + alpha * hue1},100%,70%)`;
      draw1(path);
      draw2(path);
      draw3(path);
      if (alpha == 1) {
        ++depth;
        --animState;
      }
      break;

    case 10 :
      if (depth == 0) {
        animState = 1; // finished
        break;
      }
      tInit = performance.now();
      hue0 = (hue1 + 360) % 360;
      hue1 = hue0 + intAlea(-50,50);
      ++animState;

    case 11:
      alpha = 1 - (performance.now() - tInit) / STEP_DURATION;
      if (alpha <= 0) alpha = 0;
      path = new Path2D();
      drawSegment(p0, p1, 0, depth, alpha, path);

      ctx.setTransform(1,0,0,1,0,0); // reset transforms
      ctx.fillStyle = "#000";
      ctx.fillRect(0 ,0, maxx, maxy);
      ctx.strokeStyle = `hsl(${alpha * hue0 + (1-alpha) * hue1},100%,70%)`;
      draw1(path);
      draw2(path);
      draw3(path);
      if (alpha == 0) {
        --depth;
        --animState;
      }
      break;


  } // switch

} // animate
} // scope for animate

//------------------------------------------------------------------------
//------------------------------------------------------------------------

function startOver() {

// canvas dimensions

  maxx = window.innerWidth;
  maxy = window.innerHeight;

  canv.width = maxx;
  canv.height = maxy;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,maxx,maxy);

  radius = (mmin (maxx, maxy)) / 2 * 0.9;

/* transform matrixes to get 3 copies of 0,0 centered segment */

  mat1 = [1,0,0,1,maxx / 2, maxy / 2 - radius / 2];
  mat2 = [-0.5, rac3s2, -rac3s2, -0.5, maxx / 2 + radius * rac3s2 / 2, maxy / 2 + radius * 0.25];
  mat3 = [-0.5, -rac3s2, rac3s2, -0.5, maxx / 2 - radius * rac3s2 / 2, maxy / 2 + radius * 0.25];

  p0 = {x: -radius * rac3s2, y:0 }
  p1 = {x: radius * rac3s2, y:0 }

// check max recursion level allowed to have shortest segment == 1 px

  let l = p1.x - p0.x;
  maxDepth = 0;
  while (l > 1.5) {
    l /= 3;         // every recutsion divides length by 3
    ++maxDepth;
  }

  ctx.lineWidth = 1.5;
  hue0 = hue1 = intAlea(360);

  return true;

} // startOver

//------------------------------------------------------------------------

function mouseClick (event) {

  events.push({event:'click'});;

} // mouseClick

//------------------------------------------------------------------------
//------------------------------------------------------------------------
// beginning of execution

  {
    canv = document.createElement('canvas');
    canv.style.position="absolute";
    document.body.appendChild(canv);
    ctx = canv.getContext('2d');
    canv.setAttribute ('title','click me');
  } // création CANVAS
  canv.addEventListener('click',mouseClick);
  events = [{event:'reset'}];
  requestAnimationFrame (animate);

}); // window load listener
