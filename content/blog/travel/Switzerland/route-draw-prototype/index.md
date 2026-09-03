---
title: "Route Drawing Prototype"
date: 2026-09-03
draft: false
layout: editorial
description: "Interactive prototype — scroll to draw a route across a pinned map, with photo waypoints that pause the drawing. Demo images from the Swiss Alps posts; GPX + full media pending."
tags:
  - prototype
  - interactive
  - cycling
  - "2026"
category:
  - Travel
---

{{< content-block side="center" width="narrow" >}}

**Interactive prototype — dummy route, real scenery.** Scroll and the route draws itself across a pinned map. When the line reaches a waypoint, that point's photos appear — keep scrolling (or use the arrows) to page through them, then the route continues drawing to the next waypoint. Click a photo to open it full-screen. Route geometry is placeholder; media is demo (Swiss Alps scenery). Real GPX and trip media drop in later.

{{< /content-block >}}

<style>
  .srd-wrap{position:relative;margin:2rem 0}
  .srd-viewport{position:sticky;top:0;height:100vh;overflow:hidden;background:#f6f2ea}
  .srd-map{position:absolute;inset:0;width:100%;height:100%}
  .srd-map svg{width:100%;height:100%;display:block}
  .srd-base{fill:none;stroke:#ddd4c2;stroke-width:1.5}
  .srd-base--minor{fill:none;stroke:#e6dfd0;stroke-width:1;stroke-dasharray:3 5}
  .srd-route{fill:none;stroke:#b5532e;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1}
  .srd-wp{fill:#f6f2ea;stroke:#b5532e;stroke-width:3}
  .srd-wp--reached{fill:#b5532e}
  .srd-wp--active{animation:srdPulse 1.4s ease-out infinite}
  @keyframes srdPulse{from{r:12;opacity:.6}to{r:30;opacity:0}}
  .srd-hud{position:absolute;left:16px;bottom:14px;background:rgba(246,242,234,.92);border:1px solid #d8cfba;border-radius:8px;padding:8px 12px;font:12px/1.4 ui-monospace,Menlo,monospace;color:#6b5d4b;max-width:300px;pointer-events:none;z-index:3}
  .srd-hint{position:absolute;right:16px;bottom:14px;background:rgba(246,242,234,.92);border:1px solid #d8cfba;border-radius:8px;padding:8px 12px;font:12px/1.4 system-ui,sans-serif;color:#6b5d4b;pointer-events:none;z-index:3}
  .srd-gallery{position:absolute;left:50%;bottom:6vh;transform:translateX(-50%);width:min(540px,92vw);display:none;background:rgba(246,242,234,.98);border:1px solid #d8cfba;border-radius:14px;box-shadow:0 18px 50px rgba(90,70,40,.28);overflow:hidden;z-index:4}
  .srd-gallery--on{display:block}
  .srd-stage{position:relative;aspect-ratio:4/3;background:#0f0c08;overflow:hidden;cursor:zoom-in}
  .srd-slide{position:absolute;inset:0;opacity:0;transition:opacity .35s ease}
  .srd-slide--on{opacity:1}
  .srd-photo{width:100%;height:100%;object-fit:cover;display:block}
  .srd-cap{position:absolute;left:0;right:0;bottom:0;padding:26px 14px 10px;background:linear-gradient(transparent,rgba(15,10,5,.72));color:#fdf9f0;font:600 14px/1.3 system-ui,sans-serif;letter-spacing:.02em;text-align:left}
  .srd-zoom{position:absolute;top:10px;right:12px;color:rgba(255,255,255,.85);font:12px system-ui,sans-serif;background:rgba(0,0,0,.3);border-radius:99px;padding:3px 10px}
  .srd-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-top:1px solid #e2dbc9}
  .srd-dots{display:flex;gap:6px}
  .srd-dot{width:8px;height:8px;border-radius:99px;background:#d8cfba}
  .srd-dot--on{background:#b5532e}
  .srd-nav{font:600 14px system-ui,sans-serif;color:#6b5d4b;background:none;border:1px solid #d8cfba;border-radius:8px;padding:4px 12px;cursor:pointer}
  .srd-nav:hover{background:#efe8d8}
  .srd-lbl{font:11px system-ui,sans-serif;color:#9a8b74;letter-spacing:.08em;text-transform:uppercase}
  .srd-lb{position:fixed;inset:0;background:rgba(18,13,8,.94);display:none;align-items:center;justify-content:center;flex-direction:column;gap:10px;z-index:99;cursor:zoom-out}
  .srd-lb--on{display:flex}
  .srd-lb img{max-width:94vw;max-height:82vh;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
  .srd-lb .srd-lb-cap{color:#e8dfcc;font:14px system-ui,sans-serif}
</style>

<div class="srd-wrap" id="srdWrap">
  <div class="srd-viewport" id="srdViewport">
    <div class="srd-map" id="srdMap"></div>
    <div class="srd-hint">scroll ↓ — the route draws as you go</div>
    <div class="srd-hud" id="srdHud">initialising…</div>
    <div class="srd-gallery" id="srdGallery">
      <div class="srd-stage" id="srdStage"></div>
      <div class="srd-bar">
        <button class="srd-nav" id="srdPrev" type="button">‹ prev</button>
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
          <div class="srd-dots" id="srdDots"></div>
          <div class="srd-lbl" id="srdLbl">waypoint</div>
        </div>
        <button class="srd-nav" id="srdNext" type="button">next ›</button>
      </div>
    </div>
  </div>
</div>

<div class="srd-lb" id="srdLb"><img id="srdLbImg" alt=""><div class="srd-lb-cap" id="srdLbCap"></div></div>

<script>
(function () {
  // ============ DEMO DATA — swap for real GPX + media ============
  // Route as raw points (dummy alpine squiggle, top → bottom).
  var PTS = [
    [300,110],[210,200],[360,270],[240,360],[310,430],[170,520],[290,600],
    [400,660],[240,740],[350,820],[200,900],[330,960],[150,1050],[300,1130],[220,1220],[320,1260]
  ];
  // Waypoints: index into PTS + images {src, cap} bundled in this post folder.
  var WAYPOINTS = [
    {i:3,  imgs:[{src:'demo-furka.jpg',  cap:'Furka — 2,429 m'},        {src:'demo-day1.png',   cap:'Route — day 1: Susten'}]},
    {i:7,  imgs:[{src:'demo-grimsel.jpg',cap:'Grimsel — 2,171 m'},      {src:'demo-day2.png',   cap:'Route — day 2: Grimsel'},{src:'demo-susten.jpg',cap:'Susten — 2,250 m'}]},
    {i:11, imgs:[{src:'demo-day3.png',   cap:'Route — day 3: Furka'}]}
  ];
  var START = PTS[0], END = PTS[PTS.length - 1];
  var WP_FRAC = [], GATES = [];

  // ---- geometry helpers ----
  function segLen(a, b) { return Math.hypot(a[0]-b[0], a[1]-b[1]); }
  function cumulativeFracs(pts) {
    var total = 0, acc = [0];
    for (var i = 1; i < pts.length; i++) { total += segLen(pts[i-1], pts[i]); acc.push(total); }
    return acc.map(function (v) { return v / total; });
  }
  function vh(n) { return n * (window.innerHeight / 100); }

  function buildSvg() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 600 1400');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    var streets = [
      'M -50 250 L 260 260 L 330 330 L 660 300',
      'M 120 -50 L 150 180 L 300 300 L 280 480 L 150 620 L -50 600',
      'M 380 -50 L 420 120 L 520 200 L 560 360 L 660 420',
      'M -50 900 L 180 920 L 260 1010 L 660 980',
      'M 120 700 L 200 780 L 250 900 L 200 1100 L 120 1450',
      'M 420 640 L 520 760 L 560 900 L 500 1120 L 660 1280',
      'M -50 130 L 120 100 L 240 170 L 380 140 L 520 60'
    ];
    var river = 'M 660 -50 C 560 300 640 520 560 700 C 500 840 560 1000 480 1220 L 420 1450';
    var blocks = [[40,320,90,70],[440,60,120,90],[60,1010,100,80],[430,1030,120,90]];
    streets.forEach(function (d) {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', d); p.setAttribute('class', 'srd-base');
      svg.appendChild(p);
    });
    var r = document.createElementNS(ns, 'path');
    r.setAttribute('d', river); r.setAttribute('class', 'srd-base--minor');
    svg.appendChild(r);
    blocks.forEach(function (b) {
      var x = document.createElementNS(ns, 'rect');
      x.setAttribute('x', b[0]); x.setAttribute('y', b[1]);
      x.setAttribute('width', b[2]); x.setAttribute('height', b[3]);
      x.setAttribute('fill', '#ece5d6'); x.setAttribute('rx', 4);
      svg.appendChild(x);
    });
    var d = PTS.map(function (p, k) { return (k ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
    var route = document.createElementNS(ns, 'path');
    route.setAttribute('d', d); route.setAttribute('class', 'srd-route');
    route.setAttribute('pathLength', '1');
    svg.appendChild(route);
    function marker(x, y, kind) {
      var c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y);
      c.setAttribute('r', kind === 'photo' ? 11 : 8);
      c.setAttribute('class', 'srd-wp');
      if (kind === 'photo') c.setAttribute('data-kind', 'photo');
      if (kind === 'end') { c.setAttribute('fill', 'none'); c.setAttribute('stroke-width', 5); }
      return c;
    }
    svg.appendChild(marker(START[0], START[1], 'start'));
    WAYPOINTS.forEach(function (w) { svg.appendChild(marker(PTS[w.i][0], PTS[w.i][1], 'photo')); });
    svg.appendChild(marker(END[0], END[1], 'end'));
    document.getElementById('srdMap').appendChild(svg);
  }

  function buildGates() {
    var cf = cumulativeFracs(PTS);
    WP_FRAC = [0];
    WAYPOINTS.forEach(function (w) { WP_FRAC.push(cf[w.i]); });
    WP_FRAC.push(1);
    GATES = [];
    var drawLen = vh(110), holdLen = vh(52);
    for (var k = 0; k < WP_FRAC.length - 1; k++) {
      GATES.push({type: 'draw', f0: WP_FRAC[k], f1: WP_FRAC[k + 1], len: drawLen});
      if (k < WAYPOINTS.length) GATES.push({type: 'hold', wp: k, f: WP_FRAC[k + 1], len: WAYPOINTS[k].imgs.length * holdLen});
    }
    var total = 0;
    GATES.forEach(function (g) { total += g.len; });
    return total;
  }

  // ---- state ----
  var wrap, routePath, hud, gallery, stage, dots, lbl, lb, lbImg, lbCap;
  var totalLen = 0, gateIdx = 0, lastWp = -1;

  function indexAtGate(imgs, local) {
    return Math.min(imgs.length - 1, Math.max(0, Math.floor(local * imgs.length)));
  }

  function currentScrollIndex(g) {
    return indexAtGate(WAYPOINTS[g.wp].imgs, g.local || 0);
  }

  function rebuildSlides(imgs) {
    stage.innerHTML = '';
    dots.innerHTML = '';
    imgs.forEach(function (im, q) {
      var el = document.createElement('div');
      el.className = 'srd-slide';
      var img = document.createElement('img');
      img.className = 'srd-photo';
      img.src = im.src; img.alt = im.cap; img.loading = 'lazy';
      el.appendChild(img);
      var cap = document.createElement('div');
      cap.className = 'srd-cap'; cap.textContent = im.cap;
      el.appendChild(cap);
      var zoom = document.createElement('span');
      zoom.className = 'srd-zoom'; zoom.textContent = '⛶';
      el.appendChild(zoom);
      el.addEventListener('click', function (e) {
        openLightbox(im.src, im.cap);
        e.stopPropagation();
      });
      stage.appendChild(el);
      var dot = document.createElement('span');
      dot.className = 'srd-dot';
      dots.appendChild(dot);
    });
  }

  function openLightbox(src, cap) {
    lbImg.src = src; lbImg.alt = cap; lbCap.textContent = cap;
    lb.classList.add('srd-lb--on');
  }
  function closeLightbox() { lb.classList.remove('srd-lb--on'); }

  function render() {
    var g = GATES[gateIdx];
    var p = g.type === 'draw' ? (g.f0 + (g.f1 - g.f0) * (g.local || 0)) : g.f;
    routePath.style.strokeDashoffset = String(1 - p);
    // markers
    var reached = 0;
    for (var k = 0; k < WAYPOINTS.length; k++) if (WP_FRAC[k + 1] <= p + 0.001) reached++;
    var marks = document.getElementById('srdMap').querySelectorAll('circle[data-kind="photo"]');
    marks.forEach(function (m, k) {
      m.classList.toggle('srd-wp--reached', k < reached);
      m.classList.toggle('srd-wp--active', k === gateIdx && g.type === 'hold');
    });
    // gallery
    if (g.type === 'hold') {
      var imgs = WAYPOINTS[g.wp].imgs;
      if (g.wp !== lastWp) { rebuildSlides(imgs); lastWp = g.wp; }
      var show = currentScrollIndex(g);
      Array.prototype.forEach.call(stage.children, function (el, q) {
        el.classList.toggle('srd-slide--on', q === show);
      });
      Array.prototype.forEach.call(dots.children, function (dot, q) {
        dot.classList.toggle('srd-dot--on', q === show);
      });
      lbl.textContent = 'waypoint ' + (g.wp + 1) + ' · ' + (show + 1) + '/' + imgs.length;
      gallery.classList.add('srd-gallery--on');
    } else {
      gallery.classList.remove('srd-gallery--on');
    }
    hud.textContent = g.type === 'draw'
      ? 'drawing route… ' + Math.round(p * 100) + '%'
      : 'at waypoint ' + (g.wp + 1) + ' — scroll or use arrows';
  }

  function update() {
    var rect = wrap.getBoundingClientRect();
    var top = rect.top + window.scrollY;
    var p = Math.max(0, Math.min(1, (window.scrollY - top) / totalLen));
    var acc = 0, found = null;
    for (var gi = 0; gi < GATES.length; gi++) {
      if (p * totalLen <= acc + GATES[gi].len) { found = gi; break; }
      acc += GATES[gi].len;
    }
    if (found === null) found = GATES.length - 1;
    var g = GATES[found];
    g.local = Math.max(0, Math.min(1, (p * totalLen - acc) / g.len));
    if (found !== gateIdx) {
      if (g.type === 'hold') lastWp = -1; // force slide rebuild on entry
      gateIdx = found;
    }
    render();
  }

  // arrows: jump the page to the adjacent image's slot within the hold gate
  function nudge(dir) {
    var g = GATES[gateIdx];
    if (!g || g.type !== 'hold') return;
    var imgs = WAYPOINTS[g.wp].imgs;
    var show = currentScrollIndex(g);
    var next = Math.max(0, Math.min(imgs.length - 1, show + dir));
    var rect = wrap.getBoundingClientRect();
    var top = rect.top + window.scrollY;
    var acc = 0;
    for (var i = 0; i < gateIdx; i++) acc += GATES[i].len;
    var target = top + acc + ((next + 0.5) / imgs.length) * g.len;
    window.scrollTo({top: target, behavior: 'smooth'});
  }

  // ---- boot ----
  buildSvg();
  wrap = document.getElementById('srdWrap');
  routePath = document.querySelector('#srdRoute');
  hud = document.getElementById('srdHud');
  gallery = document.getElementById('srdGallery');
  stage = document.getElementById('srdStage');
  dots = document.getElementById('srdDots');
  lbl = document.getElementById('srdLbl');
  lb = document.getElementById('srdLb');
  lbImg = document.getElementById('srdLbImg');
  lbCap = document.getElementById('srdLbCap');
  document.getElementById('srdPrev').addEventListener('click', function () { nudge(-1); });
  document.getElementById('srdNext').addEventListener('click', function () { nudge(1); });
  lb.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
  totalLen = buildGates();
  wrap.style.height = totalLen + 'px';
  var raf = null;
  window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = null; update(); });
  }, {passive: true});
  window.addEventListener('resize', function () {
    totalLen = buildGates();
    wrap.style.height = totalLen + 'px';
    update();
  });
  update();
})();
</script>
