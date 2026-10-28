/* OJIX — product detail pages (v1.0.0): row dots on reveal, and the same
   image-expands-into-the-page transition for the "Next product" link. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // capability rows: add .is-in when seen (home.js reveals .dx-reveal; this covers the dot)
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.25 });
    document.querySelectorAll('.pd-row, .pd-stats').forEach(function (r) { io.observe(r); });
  } else {
    document.querySelectorAll('.pd-row, .pd-stats').forEach(function (r) { r.classList.add('is-in'); });
  }

  // next product → full-screen image, then navigate
  var next = document.querySelector('.pd-next__link');
  if (next) {
    next.addEventListener('click', function (e) {
      if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      var img = next.querySelector('img');
      e.preventDefault();
      var r = next.getBoundingClientRect();
      var o = document.createElement('div');
      o.className = 'px-open';
      o.style.top = r.top + 'px'; o.style.left = r.left + 'px';
      o.style.width = r.width + 'px'; o.style.height = r.height + 'px';
      o.style.borderRadius = '0px';
      o.innerHTML = '<img alt="" src="' + (img.currentSrc || img.src) + '"><p class="px-open__name"></p>';
      o.querySelector('.px-open__name').textContent = next.getAttribute('data-name') || '';
      document.body.appendChild(o);
      document.documentElement.classList.add('px-opening');
      var hd = document.querySelector('.site-header');
      if (hd) hd.classList.remove('ojx-hide');
      try { sessionStorage.setItem('ojx-from-products', '1'); } catch (err) {}
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var head = document.querySelector('.site-header');
          var hh = head ? Math.round(head.offsetHeight) : 80;
          var narrow = window.innerWidth <= 900;
          o.style.top = hh + 'px'; o.style.left = '0px';
          o.style.width = document.documentElement.clientWidth + 'px';
          o.style.height = Math.max(narrow ? 460 : 520, window.innerHeight - (narrow ? 60 : 80)) + 'px';
          o.classList.add('is-full');
        });
      });
      setTimeout(function () { window.location.href = next.href; }, 900);
    });
  }
  window.addEventListener('pageshow', function () {
    document.querySelectorAll('.px-open').forEach(function (n) { n.remove(); });
    document.documentElement.classList.remove('px-opening');
  });
})();
