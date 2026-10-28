/* OJIX — set the theme before first paint (external file: the CSP blocks inline scripts). Default is dark mode. */
(function () {
  var t = null;
  try { t = localStorage.getItem('ojix_theme'); } catch (e) {}
  if (t !== 'dark' && t !== 'light') {
    t = 'dark';
  }
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.style.colorScheme = t;
})();
