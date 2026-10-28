/* OJIX — home hero carousel (v1.0.0). Tabs with autoplay progress, pause button,
   pauses on hover / focus / when off-screen, arrow keys on the tabs, swipe on phones. */
(function () {
  var hero = document.getElementById('ojx-hero');
  if (!hero) return;

  var INTERVAL = 3000;
  var tabs = Array.prototype.slice.call(hero.querySelectorAll('.ojx-hero__tab'));
  var texts = Array.prototype.slice.call(hero.querySelectorAll('.ojx-hero__text'));
  var media = Array.prototype.slice.call(hero.querySelectorAll('.ojx-hero__media'));
  var pauseBtn = hero.querySelector('.ojx-hero__pause');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var index = 0, timer = null, userPaused = !!reduce, hovering = false, visible = true;

  hero.style.setProperty('--ojx-hero-interval', INTERVAL + 'ms');
  if (reduce) hero.classList.add('is-static');

  function go(next, fromUser) {
    var n = tabs.length;
    next = ((next % n) + n) % n;
    if (next === index && !fromUser) return;
    index = next;
    tabs.forEach(function (t, i) {
      var on = i === index;
      t.classList.toggle('is-active', on);
      t.classList.toggle('is-done', i < index);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      // restart the progress animation
      var bar = t.querySelector('.ojx-hero__bar i');
      if (on && bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
    texts.forEach(function (el, i) {
      var on = i === index;
      el.classList.toggle('is-active', on);
      if (on) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
    });
    media.forEach(function (el, i) { el.classList.toggle('is-active', i === index); });
    hero.classList.remove('is-animating'); void hero.offsetWidth; hero.classList.add('is-animating');
    schedule();
  }

  function running() { return !userPaused && !hovering && visible && !document.hidden; }

  function schedule() {
    clearTimeout(timer);
    hero.classList.toggle('is-paused', userPaused && !reduce);   // icon state: only the user's choice
    hero.classList.toggle('is-holding', !running());               // bar freezes on hover/focus/off-screen
    if (running()) timer = setTimeout(function () { go(index + 1); }, INTERVAL);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { go(i, true); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        go(index + (e.key === 'ArrowRight' ? 1 : -1), true);
        tabs[index].focus();
      }
    });
  });

  if (pauseBtn) pauseBtn.addEventListener('click', function () {
    if (reduce) { hero.classList.remove('is-static'); reduce = false; userPaused = false; }
    else userPaused = !userPaused;
    pauseBtn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
    pauseBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
    // a paused bar restarts from zero on resume, so the slide gets its full time
    go(index, true);
  });

  var stage = hero.querySelector('.ojx-hero__stage');
  [stage, hero.querySelector('.ojx-hero__copy')].forEach(function (el) {
    if (!el) return;
    el.addEventListener('mouseenter', function () { hovering = true; schedule(); });
    el.addEventListener('mouseleave', function () { hovering = false; go(index, true); });
  });
  hero.addEventListener('focusin', function () { hovering = true; schedule(); });
  hero.addEventListener('focusout', function (e) { if (!hero.contains(e.relatedTarget)) { hovering = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; schedule(); }, { threshold: 0.25 }).observe(hero);
  }

  // swipe on touch screens
  var x0 = null;
  if (stage) {
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1), true);
    }, { passive: true });
  }

  go(0, true);
})();
