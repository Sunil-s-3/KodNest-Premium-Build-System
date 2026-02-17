/**
 * Job Notification Tracker — Ship page: locked until all 10 tests passed
 */

(function () {
  'use strict';

  function render() {
    var container = document.getElementById('jnt-ship-content');
    if (!container || !window.JTChecklist) return;

    if (window.JTChecklist.areAllPassed()) {
      container.innerHTML = '<div class="jnt-ship-unlocked">' +
        '<h2 class="jnt-ship-unlocked__title">Ready to ship</h2>' +
        '<p class="jnt-ship-lock__body">All 10 tests passed. You can proceed to ship.</p>' +
        '</div>';
    } else {
      var passed = window.JTChecklist.getPassedCount();
      container.innerHTML = '<div class="jnt-ship-lock">' +
        '<h2 class="jnt-ship-lock__title">Ship locked</h2>' +
        '<p class="jnt-ship-lock__body">Complete all 10 tests on the Test page to unlock Ship. Current: ' + passed + ' / 10 passed.</p>' +
        '<a href="../../jt/07-test/" class="kn-btn kn-btn--primary" style="text-decoration: none;">Go to Test</a>' +
        '</div>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
