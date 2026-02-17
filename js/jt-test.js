/**
 * Job Notification Tracker — Test checklist page logic
 */

(function () {
  'use strict';

  var ITEMS = [
    { id: 1, label: 'Preferences persist after refresh', tip: 'Save preferences on Settings, refresh the page, and confirm fields are still filled.' },
    { id: 2, label: 'Match score calculates correctly', tip: 'Set role keywords and confirm job cards show match score badges that change with preferences.' },
    { id: 3, label: '"Show only matches" toggle works', tip: 'Enable the toggle on Dashboard and confirm only jobs at or above your threshold appear.' },
    { id: 4, label: 'Save job persists after refresh', tip: 'Save a job on Dashboard, refresh, then open Saved and confirm the job is listed.' },
    { id: 5, label: 'Apply opens in new tab', tip: 'Click Apply on any job card and confirm the link opens in a new tab.' },
    { id: 6, label: 'Status update persists after refresh', tip: 'Set a job status to Applied/Rejected/Selected, refresh, and confirm the status is still set.' },
    { id: 7, label: 'Status filter works correctly', tip: 'Filter by status on Dashboard and confirm only jobs with that status appear.' },
    { id: 8, label: 'Digest generates top 10 by score', tip: 'Generate digest and confirm exactly 10 jobs, ordered by match score then recency.' },
    { id: 9, label: 'Digest persists for the day', tip: 'Generate digest, refresh the page, and confirm the same digest is shown without regenerating.' },
    { id: 10, label: 'No console errors on main pages', tip: 'Open Dashboard, Saved, Digest, Settings, and Proof with DevTools console open; confirm no errors.' }
  ];

  function render() {
    var listEl = document.getElementById('jnt-test-list');
    var summaryEl = document.getElementById('jnt-test-summary');
    var warningEl = document.getElementById('jnt-test-warning');
    if (!listEl || !window.JTChecklist) return;

    var passed = window.JTChecklist.getPassedCount();
    var total = window.JTChecklist.TOTAL;

    summaryEl.textContent = 'Tests Passed: ' + passed + ' / ' + total;
    warningEl.style.display = passed < total ? 'block' : 'none';

    listEl.innerHTML = ITEMS.map(function (item) {
      var checked = window.JTChecklist.getItem(item.id);
      var tipHtml = item.tip ? ' <span class="jnt-test-item__tip-trigger" title="' + escapeAttr(item.tip) + '">How to test</span>' : '';
      return '<li class="jnt-test-item">' +
        '<input type="checkbox" class="jnt-test-item__input" id="jt-check-' + item.id + '" data-id="' + item.id + '" ' + (checked ? 'checked' : '') + ' aria-describedby="jt-tip-' + item.id + '">' +
        '<label class="jnt-test-item__label" for="jt-check-' + item.id + '">' + escapeHtml(item.label) + tipHtml + '</label>' +
        (item.tip ? '<div class="jnt-test-item__tip" id="jt-tip-' + item.id + '" role="tooltip" style="display:none;">' + escapeHtml(item.tip) + '</div>' : '') +
        '</li>';
    }).join('');

    listEl.querySelectorAll('.jnt-test-item__input').forEach(function (input) {
      input.addEventListener('change', function () {
        window.JTChecklist.setItem(this.getAttribute('data-id'), this.checked);
        render();
      });
    });

    listEl.querySelectorAll('.jnt-test-item__tip-trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var tip = this.parentElement.nextElementSibling;
        if (tip) tip.style.display = tip.style.display === 'none' ? 'block' : 'none';
      });
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeAttr(text) {
    return String(text).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function init() {
    var resetBtn = document.getElementById('jnt-test-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (window.JTChecklist) {
          window.JTChecklist.reset();
          render();
        }
      });
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
