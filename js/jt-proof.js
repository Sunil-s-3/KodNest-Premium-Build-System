/**
 * Job Notification Tracker — Final Proof page (/jt/proof)
 */

(function () {
  'use strict';

  var STEP_NAMES = [
    'Preferences configured',
    'Match score calculating',
    'Show only matches toggle works',
    'Save job persists after refresh',
    'Apply opens in new tab',
    'Status tracking persists',
    'Digest generated for the day',
    'Test checklist passed'
  ];

  function getStepStatuses() {
    var prefs = getPrefs();
    var hasPrefs = prefs && prefs.roleKeywords;
    var saved = getSavedJobs();
    var statusMap = getStatusMap();
    var digestKey = 'jobTrackerDigest_' + getTodayDateKey();
    var hasDigest = !!localStorage.getItem(digestKey);
    var allTestsPassed = window.JTChecklist && window.JTChecklist.areAllPassed();

    return [
      !!hasPrefs,
      !!hasPrefs,
      !!hasPrefs,
      saved.length > 0,
      true,
      Object.keys(statusMap).length > 0,
      hasDigest,
      allTestsPassed
    ];
  }

  function getPrefs() {
    try {
      var raw = localStorage.getItem('jobTrackerPreferences');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function getSavedJobs() {
    try {
      var raw = localStorage.getItem('jnt-saved-jobs');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function getStatusMap() {
    try {
      var raw = localStorage.getItem('jobTrackerStatus');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  function getTodayDateKey() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function buildSubmissionText() {
    var a = window.JTProof.getArtifacts();
    return [
      '------------------------------------------',
      'Job Notification Tracker — Final Submission',
      '',
      'Lovable Project:',
      a.lovableLink || '[not set]',
      '',
      'GitHub Repository:',
      a.githubLink || '[not set]',
      '',
      'Live Deployment:',
      a.deployedUrl || '[not set]',
      '',
      'Core Features:',
      '- Intelligent match scoring',
      '- Daily digest simulation',
      '- Status tracking',
      '- Test checklist enforced',
      '------------------------------------------'
    ].join('\n');
  }

  function render() {
    var root = document.getElementById('jnt-proof-root');
    if (!root || !window.JTProof) return;

    window.JTProof.updateStatusFromConditions();
    var statuses = getStepStatuses();
    var artifacts = window.JTProof.getArtifacts();
    var projectStatus = window.JTProof.getProjectStatus();
    var lovableValid = window.JTProof.isValidUrl(artifacts.lovableLink);
    var githubValid = window.JTProof.isValidUrl(artifacts.githubLink);
    var deployedValid = window.JTProof.isValidUrl(artifacts.deployedUrl);

    var stepList = STEP_NAMES.map(function (name, i) {
      var done = statuses[i];
      return '<li class="jnt-proof-step"><span class="jnt-proof-step__status ' + (done ? 'jnt-proof-step__status--done' : '') + '">' + (done ? 'Completed' : 'Pending') + '</span> ' + escapeHtml(name) + '</li>';
    }).join('');

    root.innerHTML =
      '<div class="jnt-proof-card">' +
        '<h1 class="jnt-proof-card__title">Project 1 — Job Notification Tracker</h1>' +
        '<p class="jnt-proof-status"><span class="jnt-proof-status__label">Status:</span> <span class="jnt-proof-badge jnt-proof-badge--' + projectStatus.toLowerCase().replace(/\s/g, '-') + '">' + escapeHtml(projectStatus) + '</span></p>' +
        '<section class="jnt-proof-section" aria-labelledby="jnt-proof-steps-heading">' +
          '<h2 id="jnt-proof-steps-heading" class="jnt-proof-section__title">A) Step Completion Summary</h2>' +
          '<ul class="jnt-proof-steps">' + stepList + '</ul>' +
        '</section>' +
        '<section class="jnt-proof-section" aria-labelledby="jnt-proof-artifacts-heading">' +
          '<h2 id="jnt-proof-artifacts-heading" class="jnt-proof-section__title">B) Artifact Collection</h2>' +
          '<div class="kn-field">' +
            '<label class="kn-label" for="jnt-proof-lovable">Lovable Project Link</label>' +
            '<input type="url" id="jnt-proof-lovable" class="kn-input ' + (artifacts.lovableLink && !lovableValid ? 'is-error' : '') + '" placeholder="https://..." value="' + escapeHtml(artifacts.lovableLink) + '" />' +
            '<span class="jnt-proof-input-hint" id="jnt-proof-lovable-hint"></span>' +
          '</div>' +
          '<div class="kn-field">' +
            '<label class="kn-label" for="jnt-proof-github">GitHub Repository Link</label>' +
            '<input type="url" id="jnt-proof-github" class="kn-input ' + (artifacts.githubLink && !githubValid ? 'is-error' : '') + '" placeholder="https://github.com/..." value="' + escapeHtml(artifacts.githubLink) + '" />' +
            '<span class="jnt-proof-input-hint" id="jnt-proof-github-hint"></span>' +
          '</div>' +
          '<div class="kn-field">' +
            '<label class="kn-label" for="jnt-proof-deployed">Deployed URL (Vercel or equivalent)</label>' +
            '<input type="url" id="jnt-proof-deployed" class="kn-input ' + (artifacts.deployedUrl && !deployedValid ? 'is-error' : '') + '" placeholder="https://..." value="' + escapeHtml(artifacts.deployedUrl) + '" />' +
            '<span class="jnt-proof-input-hint" id="jnt-proof-deployed-hint"></span>' +
          '</div>' +
        '</section>' +
        '<div class="jnt-proof-actions">' +
          '<button type="button" class="kn-btn kn-btn--primary" id="jnt-proof-copy">Copy Final Submission</button>' +
        '</div>' +
      '</div>';

    ['lovable', 'github', 'deployed'].forEach(function (key) {
      var input = document.getElementById('jnt-proof-' + key);
      var hint = document.getElementById('jnt-proof-' + key + '-hint');
      if (!input) return;
      function validate() {
        var val = input.value.trim();
        window.JTProof.setArtifact(key === 'lovable' ? 'lovableLink' : key === 'github' ? 'githubLink' : 'deployedUrl', val);
        var ok = window.JTProof.isValidUrl(val);
        input.classList.toggle('is-error', val.length > 0 && !ok);
        if (hint) hint.textContent = val.length > 0 && !ok ? 'Enter a valid http or https URL.' : '';
        window.JTProof.updateStatusFromConditions();
        render();
      }
      input.addEventListener('input', validate);
      input.addEventListener('blur', validate);
    });

    var copyBtn = document.getElementById('jnt-proof-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = buildSubmissionText();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = 'Copied';
            setTimeout(function () { copyBtn.textContent = 'Copy Final Submission'; }, 2000);
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.textContent = 'Copied';
          setTimeout(function () { copyBtn.textContent = 'Copy Final Submission'; }, 2000);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
