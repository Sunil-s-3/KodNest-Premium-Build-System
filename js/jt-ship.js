/**
 * Job Notification Tracker — Ship page: locked until all 10 tests + 3 proof links
 */

(function () {
  'use strict';

  function render() {
    var container = document.getElementById('jnt-ship-content');
    if (!container || !window.JTChecklist) return;

    var projectStatus = window.JTProof ? window.JTProof.getProjectStatus() : 'Not Started';
    var canShip = window.JTProof && window.JTProof.canMarkShipped();

    if (projectStatus === 'Shipped') {
      container.innerHTML = '<div class="jnt-ship-unlocked">' +
        '<h2 class="jnt-ship-unlocked__title">Project 1 Shipped Successfully.</h2>' +
        '<p class="jnt-ship-lock__body">All requirements met. Project 1 is marked as shipped.</p>' +
        '</div>';
      return;
    }

    if (canShip) {
      container.innerHTML = '<div class="jnt-ship-unlocked">' +
        '<h2 class="jnt-ship-unlocked__title">Ready to ship</h2>' +
        '<p class="jnt-ship-lock__body">All 10 tests passed and all proof links provided. Mark as shipped when ready.</p>' +
        '<button type="button" class="kn-btn kn-btn--primary" id="jnt-ship-mark-btn">Mark as Shipped</button>' +
        '</div>';
      var btn = document.getElementById('jnt-ship-mark-btn');
      if (btn) btn.addEventListener('click', function () {
        if (window.JTProof && window.JTProof.canMarkShipped()) {
          window.JTProof.setProjectStatus('Shipped');
          render();
        }
      });
      return;
    }

    var passed = window.JTChecklist.getPassedCount();
    var msg = 'Complete all 10 tests on the Test page and provide all three proof links (Lovable, GitHub, Deployed URL) on Final Proof to unlock Ship.';
    container.innerHTML = '<div class="jnt-ship-lock">' +
      '<h2 class="jnt-ship-lock__title">Ship locked</h2>' +
      '<p class="jnt-ship-lock__body">' + msg + ' Current tests: ' + passed + ' / 10 passed.</p>' +
      '<a href="../../jt/07-test/" class="kn-btn kn-btn--secondary" style="text-decoration: none;">Go to Test</a> ' +
      '<a href="../../jt/proof/" class="kn-btn kn-btn--primary" style="text-decoration: none;">Final Proof</a>' +
      '</div>';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
