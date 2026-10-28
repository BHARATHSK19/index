/* OJIX — products page (v1.0.0): scroll-driven gallery, live counter, list preview,
   and the image-expands-into-the-page transition when a product is opened. */
(function () {
  var gallery = document.getElementById('px-gallery');
  if (!gallery) return;
  var track = gallery.querySelector('.px-track');
  var cards = Array.prototype.slice.call(gallery.querySelectorAll('.px-card'));
  var bar = gallery.querySelector('.px-bar');
  var nameEl = document.querySelector('[data-px-name]');
  var idxEl = document.querySelector('[data-px-index]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 900px)');
  var active = -1;

  function setActive(i) {
    if (i === active) return;
    active = i;
    cards.forEach(function (c, k) { c.classList.toggle('is-active', k === i); });
    if (nameEl) nameEl.textContent = cards[i].getAttribute('data-name');
    if (idxEl) idxEl.textContent = ('0' + (i + 1)).slice(-2);
  }

  function nearestToCenter() {
    var mid = window.innerWidth / 2, best = 0, bestD = Infinity;
    cards.forEach(function (c, k) {
      var r = c.getBoundingClientRect();
      var d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bestD) { bestD = d; best = k; }
      // inner parallax: image drifts against the card's travel
      var off = (r.left + r.width / 2 - mid) / window.innerWidth;
      c.style.setProperty('--px-shift', (reduce ? 0 : off * -60).toFixed(1) + 'px');
    });
    return best;
  }

  // desktop: vertical scroll drives the horizontal track
  function onScroll() {
    if (mobile.matches) return;
    var r = gallery.getBoundingClientRect();
    var total = gallery.offsetHeight - window.innerHeight;
    var p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
    var last = cards[cards.length - 1];
    var maxX = Math.max(0, last.offsetLeft + last.offsetWidth / 2 - window.innerWidth / 2 - (cards[0].offsetLeft + cards[0].offsetWidth / 2 - window.innerWidth / 2));
    track.style.transform = 'translate3d(' + (-p * maxX).toFixed(1) + 'px,0,0)';
    if (bar) bar.style.setProperty('--p', p.toFixed(4));
    setActive(nearestToCenter());
  }

  // phones: native swipe
  function onSwipe() {
    if (!mobile.matches) return;
    var p = track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth);
    if (bar) bar.style.setProperty('--p', p.toFixed(4));
    setActive(nearestToCenter());
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  track.addEventListener('scroll', function () { requestAnimationFrame(onSwipe); }, { passive: true });
  window.addEventListener('resize', function () { track.style.transform = ''; onScroll(); onSwipe(); });
  onScroll(); onSwipe();
  if (active < 0) setActive(0);

  // open transition: the card image grows to fill the screen, then the page changes
  function openProduct(e, link) {
    if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    var img = link.querySelector('img');
    if (!img) return;
    e.preventDefault();
    var media = img.closest('.px-card__media') || img;
    var r = media.getBoundingClientRect();
    if (link.classList.contains('px-line')) r = { top: e.clientY - 90, left: e.clientX - 150, width: 300, height: 187 };
    var o = document.createElement('div');
    o.className = 'px-open';
    o.style.top = r.top + 'px'; o.style.left = r.left + 'px';
    o.style.width = r.width + 'px'; o.style.height = r.height + 'px';
    o.innerHTML = '<img alt="" src="' + img.currentSrc + '"><p class="px-open__name"></p>';
    o.querySelector('.px-open__name').textContent = link.getAttribute('data-name') || '';
    document.body.appendChild(o);
    document.documentElement.classList.add('px-opening');
    var hd = document.querySelector('.site-header');
    if (hd) hd.classList.remove('ojx-hide');
    try { sessionStorage.setItem('ojx-from-products', '1'); } catch (err) {}
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        // target = the product page hero: full width, directly under the header
        var head = document.querySelector('.site-header');
        var hh = head ? Math.round(head.offsetHeight) : 80;
        var minH = window.innerWidth <= 900 ? 460 : 520;
        var cut = window.innerWidth <= 900 ? 60 : 80;
        o.style.top = hh + 'px'; o.style.left = '0px';
        o.style.width = document.documentElement.clientWidth + 'px';
        o.style.height = Math.max(minH, window.innerHeight - cut) + 'px';
        o.style.borderRadius = '0px';
        o.classList.add('is-full');
      });
    });
    setTimeout(function () { window.location.href = link.href; }, 1000);
  }

  document.querySelectorAll('.px-card, .px-line').forEach(function (a) {
    a.addEventListener('click', function (e) { openProduct(e, a); });
  });
  // back button: drop any leftover overlay
  window.addEventListener('pageshow', function () {
    document.querySelectorAll('.px-open').forEach(function (n) { n.remove(); });
    document.documentElement.classList.remove('px-opening');
  });

  // list: preview image follows the cursor
  var float = document.querySelector('.px-float');
  var floatImg = float && float.querySelector('img');
  var list = document.querySelector('.px-list');
  if (float && list && window.matchMedia('(hover: hover)').matches) {
    var x = 0, y = 0, fx = 0, fy = 0, raf = 0;
    var follow = function () {
      fx += (x - fx) * 0.18; fy += (y - fy) * 0.18;
      float.style.left = fx + 'px'; float.style.top = fy + 'px';
      raf = requestAnimationFrame(follow);
    };
    list.querySelectorAll('.px-line').forEach(function (line) {
      line.addEventListener('mouseenter', function () {
        floatImg.src = line.querySelector('img').currentSrc || line.querySelector('img').src;
        float.classList.add('is-on');
      });
    });
    list.addEventListener('mousemove', function (e) {
      x = e.clientX + 170; y = e.clientY;
      if (!raf) { fx = x; fy = y; raf = requestAnimationFrame(follow); }
    });
    window.addEventListener('scroll', function () { float.classList.remove('is-on'); }, { passive: true });
    list.addEventListener('mouseleave', function () {
      float.classList.remove('is-on');
      cancelAnimationFrame(raf); raf = 0;
    });
  }
})();
