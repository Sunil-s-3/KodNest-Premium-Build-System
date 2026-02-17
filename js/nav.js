/**
 * Job Notification Tracker — Hamburger menu toggle
 */
(function () {
  var toggle = document.getElementById('jnt-nav-toggle');
  var links = document.getElementById('jnt-nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });

  // Close on escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();
