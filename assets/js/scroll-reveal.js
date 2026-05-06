/**
 * Scroll Reveal — IntersectionObserver-based
 * Triggers CSS transitions when elements scroll into view.
 * Gracefully falls back to static display in all browsers.
 * Respects prefers-reduced-motion.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const SELECTOR = '.content figure, .gallery img, .content h2';
  const VISIBLE_CLASS = 'reveal-visible';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(VISIBLE_CLASS);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  // Wait for DOM then observe
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    document.querySelectorAll(SELECTOR).forEach((el) => observer.observe(el));
  }
})();
