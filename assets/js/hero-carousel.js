/* Home hero card rail.
   Steps one card at a time, disables the ends, and reports position in
   the meter + index. No dependencies; inert if the hero is not on the page.
   Styling: .ed-hero* in assets/css/type-system.css. */
(function () {
  var hero = document.querySelector("[data-hero-carousel]");
  if (!hero) return;

  var vp = hero.querySelector(".ed-hero__vp");
  var track = hero.querySelector(".ed-hero__track");
  var prev = hero.querySelector("#carousel-prev");
  var next = hero.querySelector("#carousel-next");
  var meter = hero.querySelector("#carousel-progress");
  var idx = hero.querySelector("#carousel-idx");
  if (!vp || !track || !prev || !next) return;

  var cards = track.querySelectorAll(".ed-hero-card");
  if (!cards.length) return;

  /* Gap comes from the token via computed style; never hardcode it here. */
  var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  var pos = 0;

  function step() {
    return (cards[0].offsetWidth || 240) + gap;
  }

  function max() {
    var inset = parseInt(getComputedStyle(vp).paddingLeft, 10) || 0;
    var visible = Math.max(1, Math.floor((vp.offsetWidth - inset) / step()));
    return Math.max(0, cards.length - visible);
  }

  function update() {
    var m = max();
    if (pos > m) pos = m;
    track.style.transform = "translateX(-" + pos * step() + "px)";
    if (meter) meter.style.width = m > 0 ? (pos / m) * 100 + "%" : "0%";
    if (idx) idx.textContent = String(pos + 1).padStart(2, "0");
    prev.disabled = pos === 0;
    next.disabled = pos >= m;
  }

  prev.addEventListener("click", function () {
    if (pos > 0) {
      pos--;
      update();
    }
  });
  next.addEventListener("click", function () {
    if (pos < max()) {
      pos++;
      update();
    }
  });
  window.addEventListener("resize", function () {
    gap = parseFloat(getComputedStyle(track).columnGap) || gap;
    update();
  });
  update();
})();
