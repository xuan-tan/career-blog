---
title: "Route Drawing Prototype"
date: 2026-09-03
draft: false
layout: editorial
description: "Interactive prototype — scroll to draw a route across a pinned map, with photo waypoints that pause the drawing. Dummy data pending real GPX + media."
tags:
  - prototype
  - interactive
  - cycling
  - "2026"
category:
  - Travel
---

{{< content-block side="center" width="narrow" >}}

**Interactive prototype — dummy route.** Scroll and the route draws itself across a pinned map. When the line reaches a waypoint, its photos appear — keep scrolling (or use the arrows) to page through them, then the route continues drawing to the next waypoint. Everything below is placeholder geometry and placeholder images, waiting for the real Swiss GPX and media.

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
  @keyframes srdPulse{0%{r:14;opacity:.5}100%{r:30;opacity:0}}
  .srd-hud{position:absolute;left:16px;bottom:14px;background:rgba(246,242,234,.92);border:1px solid #d8cfba;border-radius:8px;padding:8px 12px;font:12px/1.4 ui-monospace,Menlo,monospace;color:#6b5d4b;max-width:320px;pointer-events:none}
  .srd-hint{position:absolute;right:16px;bottom:14px;background:rgba(246,242,234,.92);border:1px solid #d8cfba;border-radius:8px;padding:8px 12px;font:12px/1.4 system-ui,sans-serif;color:#6b5d4b;pointer-events:none}
  .srd-gallery{position:absolute;left:50%;bottom:7vh;transform:translateX(-50%);width:min(520px,88vw);display:none;background:rgba(246,242,234,.97);border:1px solid #d8cfba;border-radius:14px;box-shadow:0 18px 50px rgba(90,70,40,.25);overflow:hidden}
  .srd-gallery--on{display:block}
  .srd-stage{position:relative;aspect-ratio:4/3;background:#e9e2d2;overflow:hidden}
  .srd-slide{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;opacity:0;transition:opacity .35s ease;font-family:system-ui,sans-serif;color:#fff;text-align:center}
  .srd-slide--on{opacity:1}
  .srd-slide .srd-emoji{font-size:64px;line-height:1;filter:drop-shadow(0 4px 8px rgba(0,0,0,.3))}
  .srd-slide .srd-cap{font-size:15px;font-weight:600;letter-spacing:.02em;background:rgba(0,0,0,.25);padding:4px 12px;border-radius:99px}
  .srd-bar{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border-top:1px solid #e2dbc9}
  .srd-dots{display:flex;gap:6px}
  .srd-dot{width:8px;height:8px;border-radius:99px;background:#d8cfba}
  .srd-dot--on{background:#b5532e}
  .srd-nav{font:600 15px system-ui,sans-serif;color:#6b5d4b;background:none;border:1px solid #d8cfba;border-radius:8px;padding:4px 12px;cursor:pointer}
  .srd-nav:hover{background:#efe8d8}
  .srd-lbl{font:11px system-ui,sans-serif;color:#9a8b74;letter-spacing:.08em;text-transform:uppercase}
  .srd-g0{background:linear-gradient(160deg,#8ea6b8,#5c7386)}
  .srd-g1{background:linear-gradient(160deg,#b7a284,#8a7355)}
  .srd-g2{background:linear-gradient(160deg,#7d9a86,#4e6f5c)}
  .srd-g3{background:linear-gradient(160deg,#b88a6e,#8a5f42)}
</style>

<div class="srd-wrap" id="srdWrap">
  <div class="srd-viewport" id="srdViewport">
    <div class="srd-map" id="srdMap"></div>
    <div class="srd-hint">scroll ↓ — the route draws as you go</div>
    <div class="srd-hud" id="srdHud">initialising…</div>
    <div class="srd-gallery" id="srdGallery">
      <div class="srd-stage" id="srdStage"></div>
      <div class="srd-bar">
        <button class="srd-nav" id="srdPrev">‹ prev</button>
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
          <div class="srd-dots" id="srdDots"></div>
          <div class="srd-lbl" id="srdLbl">waypoint</div>
        </div>
        <button class="srd-nav" id="srdNext">next ›</button>
      </div>
    </div>
  </div>
</div>

<script>
(function () {
  // ============ DEMO DATA (swap for real GPX + media later) ============
  // Route as raw points (dummy alpine-ish squiggle, top → bottom).
  var PTS = [
    [300,110],[210,200],[360,270],[240,360],[310,430],[170,520],[290,600],
    [400,660],[240,740],[350,820],[200,900],[330,960],[150,1050],[300,1130],[220,1220],[320,1260]
  ];
  // Waypoints sit on route indices: [idx, nImages, [gradients], [captions]]
  var WAYPOINTS = [
    {i:3,  imgs:[{g:'srd-g0',e:'🏔️',c:'Waypoint 1 — placeholder one'},{g:'srd-g0',e:'🌄',c:'Waypoint 1 — placeholder two'}]},
    {i:7,  imgs:[{g:'srd-g1',e:'🚵',c:'Waypoint 2 — one'},{g:'srd-g1',e:'🛖',c:'Waypoint 2 — two'},{g:'srd-g1',e:'🐄',c:'Waypoint 2 — three'}]},
    {i:11, imgs:[{g:'srd-g2',e:'🏞️',c:'Waypoint 3 — one'},{g:'srd-g2',e:'📷',c:'Waypoint 3 — two'}]}
  ];
  var START = PTS[0], END = PTS[PTS.length - 1];
  var WP_FRAC = [0]; // fraction along route of each waypoint + start/end
  var GATES = [];    // {type:'draw'|'hold', f0, f1, wp, len}

  // ---- geometry helpers ----
  function segLen(a, b) { return Math.hypot(a[0]-b[0], a[1]-b[1]); }
  function cumulativeFracs(pts) {
    var total = 0, acc = [0];
    for (var i = 1; i < pts.length; i++) { total += segLen(pts[i-1], pts[i]); acc.push(total); }
    return acc.map(function (v) { return v / total; });
  }
  function buildSvg() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 600 1400');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    // dummy base map — streets (thin) + a river (dashed) + a few blocks
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

    // route path
    var d = PTS.map(function (p, k) { return (k ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
    var route = document.createElementNS(ns, 'path');
    route.setAttribute('d', d); route.setAttribute('id', 'srdRoute');
    route.setAttribute('class', 'srd-route');
    route.setAttribute('pathLength', '1');
    svg.appendChild(route);

    // waypoint markers (start/end + photo waypoints)
    function marker(x, y, kind) {
      var g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'srd-marker');
      if (kind === 'end') {
        var ring = document.createElementNS(ns, 'circle');
        ring.setAttribute('cx', x); ring.setAttribute('cy', y); ring.setAttribute('r', 13);
        ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', '#b5532e'); ring.setAttribute('stroke-width', 5);
        g.appendChild(ring); return g;
      }
      var c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', kind === 'photo' ? 11 : 8);
      c.setAttribute('class', 'srd-wp'); c.dataset.kind = kind;
      g.appendChild(c);
      return g;
    }
    svg.appendChild(marker(START[0], START[1], 'start'));
    WAYPOINTS.forEach(function (w) {
      svg.appendChild(marker(PTS[w.i][0], PTS[w.i][1], 'photo'));
    });
    svg.appendChild(marker(END[0], END[1], 'end'));

    document.getElementById('srdMap').appendChild(svg);
  }

  // ---- gate / progress model ----
  function vh(n) { return n * (window.innerHeight / 100); }

  function buildGates() {
    var cf = cumulativeFracs(PTS);
    WP_FRAC = [0];
    var cursor = 0;
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
  var wrap, routePath, hud, gallery, stage, dots, lbl;
  var totalLen = 0, gateIdx = -1, drawFrac = 0, effIdx = 0, tick = 0;

  function indexAtGate(g, local) { // local 0..1 → image index
    return Math.min(g.imgs.length - 1, Math.max(0, Math.floor(local * g.imgs.length)));
  }

  function render() {
    var g = GATES[gateIdx];
    var p = g.type === 'draw' ? (g.f0 + (g.f1 - g.f0) * drawFrac) : g.f;
    routePath.style.strokeDashoffset = String(1 - p);
    // markers reached?
    var reached = 0;
    var cur = -1;
    for (var k = 0; k < WAYPOINTS.length; k++) if (WP_FRAC[k + 1] <= p + 0.001) reached++;
    if (g.type === 'hold') cur = g.wp;
    var marks = document.querySelectorAll('.srd-marker circle.srd-wp');
    marks.forEach(function (m, k) {
      m.classList.toggle('srd-wp--reached', k < reached);
      m.classList.toggle('srd-wp--active', k === cur);
    });
    // gallery
    if (g.type === 'hold') {
      var imgs = WAYPOINTS[g.wp].imgs;
      var si = indexAtGate(g, g.local);
      if (si > effIdx) effIdx = si;
      var show = Math.min(imgs.length - 1, Math.max(effIdx, si));
      if (show >= 0 && show < imgs.length) {
        if (stage.children.length !== imgs.length) stage.innerHTML = '';
        for (var q = 0; q < imgs.length; q++) {
          var el = stage.children[q];
          if (!el) {
            el = document.createElement('div');
            el.className = 'srd-slide ' + imgs[q].g;
            el.innerHTML = '<span class="srd-emoji">' + imgs[q].e + '</span><span class="srd-cap">' + imgs[q].c + '</span>';
            stage.appendChild(el);
          }
          el.classList.toggle('srd-slide--on', q === show);
        }
        // dots
        if (dots.children.length !== imgs.length) {
          dots.innerHTML = '';
          for (var d = 0; d < imgs.length; d++) {
            var dot = document.createElement('span');
            dot.className = 'srd-dot';
            dots.appendChild(dot);
          }
        }
        Array.prototype.forEach.call(dots.children, function (dot, d) { dot.classList.toggle('srd-dot--on', d === show); });
        lbl.textContent = 'waypoint ' + (g.wp + 1) + ' · image ' + (show + 1) + '/' + imgs.length;
        gallery.classList.add('srd-gallery--on');
      }
    } else {
      gallery.classList.remove('srd-gallery--on');
      if (g.type === 'hold' && g.local >= 1) { /* released */ }
    }
    // hud
    var label = g.type === 'draw'
      ? 'drawing route… ' + Math.round(p * 100) + '%'
      : 'at waypoint ' + (g.wp + 1) + ' — scroll or use arrows';
    hud.textContent = label + '   [gate ' + (gateIdx + 1) + '/' + GATES.length + ']';
  }

  function update() {
    var rect = wrap.getBoundingClientRect();
    var scrollY = window.scrollY;
    var top = rect.top + scrollY;
    var p = Math.max(0, Math.min(1, (scrollY - top) / totalLen));
    var acc = 0, gi = 0, found = null;
    for (gi = 0; gi < GATES.length; gi++) {
      if (p * totalLen <= acc + GATES[gi].len) { found = gi; break; }
      acc += GATES[gi].len;
    }
    if (!found) found = GATES.length - 1;
    var g = GATES[found];
    var local = Math.max(0, Math.min(1, (p * totalLen - acc) / g.len));
    g.local = local;
    gateIdx = found;
    if (g.type === 'draw') {
      drawFrac = local;
      if (tick > 0 && effIdx > 0) effIdx = 0; // fresh draw after a hold: reset arrow bias
    }
    tick++;
    render();
  }

  // arrows: manual override within the CURRENT hold gate (works while gallery open)
  function nudge(dir) {
    var g = GATES[gateIdx];
    if (!g || g.type !== 'hold') return;
    var n = WAYPOINTS[g.wp].imgs.length;
    effIdx = Math.max(0, Math.min(n - 1, effIdx + dir));
    // nudge scroll anchor so the browser doesn't yank us back on next frame
    var rect = wrap.getBoundingClientRect();
    var top = rect.top + window.scrollY;
    var acc = 0;
    for (var i = 0; i < gateIdx; i++) acc += GATES[i].len;
    var local = (effIdx + 0.5) / n;
    var target = top + acc + local * g.len;
    window.scrollTo({top: target, behavior: 'smooth'});
    render();
  }

  // ---- boot ----
  buildSvg();
  routePath = document.getElementById('srdRoute');
  wrap = document.getElementById('srdWrap');
  hud = document.getElementById('srdHud');
  gallery = document.getElementById('srdGallery');
  stage = document.getElementById('srdStage');
  dots = document.getElementById('srdDots');
  lbl = document.getElementById('srdLbl');
  document.getElementById('srdPrev').addEventListener('click', function () { nudge(-1); });
  document.getElementById('srdNext').addEventListener('click', function () { nudge(1); });
  totalLen = buildGates();
  wrap.style.height = totalLen + 'px';
  var raf = null;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = null; update(); });
  }
  window.addEventListener('scroll', onScroll, {passive: true});
  window.addEventListener('resize', function () { totalLen = buildGates(); wrap.style.height = totalLen + 'px'; update(); });
  update();
})();
</script>
