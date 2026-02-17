/**
 * Job Notification Tracker — Daily Digest Engine
 * Persists digest per day: jobTrackerDigest_YYYY-MM-DD
 */

(function () {
  'use strict';

  const PREFS_KEY = 'jobTrackerPreferences';
  const DIGEST_PREFIX = 'jobTrackerDigest_';

  function getTodayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return DIGEST_PREFIX + y + '-' + m + '-' + day;
  }

  function getPreferences() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function getStoredDigest() {
    try {
      const raw = localStorage.getItem(getTodayKey());
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveDigest(jobs) {
    localStorage.setItem(getTodayKey(), JSON.stringify(jobs));
  }

  function getTop10Jobs() {
    const prefs = getPreferences();
    if (!prefs || !prefs.roleKeywords) return [];

    const withScores = JOBS_DATA.map(function (job) {
      const matchScore = window.MatchScoreEngine.calculate(job, prefs);
      return { ...job, matchScore };
    });

    withScores.sort(function (a, b) {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return a.postedDaysAgo - b.postedDaysAgo;
    });

    return withScores.slice(0, 10);
  }

  function formatDigestPlainText(jobs, dateLabel) {
    var lines = [
      'Top 10 Jobs For You — 9AM Digest',
      dateLabel,
      '',
      '---',
      ''
    ];
    jobs.forEach(function (job, i) {
      lines.push((i + 1) + '. ' + job.title + ' at ' + job.company);
      lines.push('   Location: ' + job.location + ' | Experience: ' + job.experience + ' | Match: ' + (job.matchScore || 0));
      lines.push('   Apply: ' + job.applyUrl);
      lines.push('');
    });
    lines.push('---');
    lines.push('This digest was generated based on your preferences.');
    return lines.join('\n');
  }

  function getDateLabel() {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function getBadgeClass(score) {
    return window.MatchScoreEngine ? window.MatchScoreEngine.getBadgeClass(score) : '';
  }

  function renderStatusUpdatesHTML() {
    if (!window.JobStatus || !window.JobStatus.getStatusUpdates) return '';
    var updates = window.JobStatus.getStatusUpdates();
    if (updates.length === 0) return '';
    var list = updates.slice(0, 20).map(function (upd) {
      var job = typeof JOBS_DATA !== 'undefined' && JOBS_DATA.find ? JOBS_DATA.find(function (j) { return j.id === upd.jobId; }) : null;
      var title = job ? job.title : 'Job #' + upd.jobId;
      var company = job ? job.company : '';
      var dateStr = upd.dateChanged ? new Date(upd.dateChanged).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '';
      var statusClass = 'jnt-digest-updates__status--' + (upd.status ? upd.status.toLowerCase().replace(/\s/g, '-') : '');
      return '<li class="jnt-digest-updates__item">' +
        '<span class="jnt-digest-updates__job">' + escapeHtml(title) + '</span>' +
        '<span class="jnt-digest-updates__company">' + escapeHtml(company) + '</span>' +
        '<span class="jnt-digest-updates__status ' + statusClass + '">' + escapeHtml(upd.status || '') + '</span>' +
        '<span class="jnt-digest-updates__date">' + escapeHtml(dateStr) + '</span>' +
        '</li>';
    }).join('');
    return '<div class="jnt-digest-updates">' +
      '<h2 class="jnt-digest-updates__title">Recent Status Updates</h2>' +
      '<ul class="jnt-digest-updates__list">' + list + '</ul>' +
      '</div>';
  }

  function render() {
    var container = document.getElementById('jnt-digest-root');
    if (!container) return;

    var prefs = getPreferences();
    if (!prefs || !prefs.roleKeywords) {
      container.innerHTML = '<div class="jnt-digest-block">' +
        '<h2 class="kn-empty__title">Set preferences to generate a personalized digest.</h2>' +
        '<div class="kn-empty__action" style="margin-top: 24px;">' +
        '<a href="../settings/" class="kn-btn kn-btn--primary" style="text-decoration: none;">Go to Settings</a>' +
        '</div></div>' + renderStatusUpdatesHTML();
      return;
    }

    var existing = getStoredDigest();
    var digestJobs = existing;

    if (!digestJobs || digestJobs.length === 0) {
      container.innerHTML =
        '<div class="jnt-digest-actions">' +
        '<button type="button" class="kn-btn kn-btn--primary" id="jnt-digest-generate">Generate Today\'s 9AM Digest (Simulated)</button>' +
        '</div>' +
        '<p class="jnt-digest-note">Demo Mode: Daily 9AM trigger simulated manually.</p>' +
        '<div id="jnt-digest-placeholder"></div>' + renderStatusUpdatesHTML();
      document.getElementById('jnt-digest-generate').onclick = generateAndRender;
      return;
    }

    var dateLabel = getDateLabel();

    container.innerHTML =
      '<div class="jnt-digest-actions">' +
      '<button type="button" class="kn-btn kn-btn--secondary" id="jnt-digest-regenerate">Regenerate Today\'s Digest</button>' +
      '</div>' +
      '<p class="jnt-digest-note">Demo Mode: Daily 9AM trigger simulated manually.</p>' +
      '<div class="jnt-digest-card">' +
      '<h1 class="jnt-digest-card__title">Top 10 Jobs For You — 9AM Digest</h1>' +
      '<p class="jnt-digest-card__subtext">' + escapeHtml(dateLabel) + '</p>' +
      '<ul class="jnt-digest-list">' +
      digestJobs.map(function (job) {
        var score = job.matchScore != null ? job.matchScore : 0;
        var badgeClass = getBadgeClass(score);
        return '<li class="jnt-digest-item">' +
          '<div class="jnt-digest-item__main">' +
          '<span class="jnt-digest-item__title">' + escapeHtml(job.title) + '</span>' +
          '<span class="jnt-digest-item__company">' + escapeHtml(job.company) + '</span>' +
          '<span class="jnt-digest-item__meta">' + escapeHtml(job.location) + ' · ' + escapeHtml(job.experience) + '</span>' +
          '<span class="jnt-match-badge ' + badgeClass + '">' + score + '</span>' +
          '</div>' +
          '<a href="' + escapeHtml(job.applyUrl) + '" target="_blank" class="kn-btn kn-btn--primary jnt-digest-item__apply" style="text-decoration: none;">Apply</a>' +
          '</li>';
      }).join('') +
      '</ul>' +
      '<p class="jnt-digest-card__footer">This digest was generated based on your preferences.</p>' +
      '</div>' +
      '<div class="jnt-digest-actions jnt-digest-actions--secondary">' +
      '<button type="button" class="kn-btn kn-btn--secondary" id="jnt-digest-copy">Copy Digest to Clipboard</button>' +
      '<a id="jnt-digest-mailto" href="#" class="kn-btn kn-btn--secondary" style="text-decoration: none;">Create Email Draft</a>' +
      '</div>' + renderStatusUpdatesHTML();

    document.getElementById('jnt-digest-regenerate').onclick = generateAndRender;

    var copyBtn = document.getElementById('jnt-digest-copy');
    var mailtoLink = document.getElementById('jnt-digest-mailto');
    if (copyBtn) copyBtn.onclick = function () { copyDigestToClipboard(digestJobs, dateLabel); };
    if (mailtoLink) {
      var subject = encodeURIComponent('My 9AM Job Digest');
      var body = encodeURIComponent(formatDigestPlainText(digestJobs, dateLabel));
      mailtoLink.href = 'mailto:?subject=' + subject + '&body=' + body;
    }
  }

  function generateAndRender() {
    var top10 = getTop10Jobs();
    if (top10.length === 0) {
      var container = document.getElementById('jnt-digest-root');
      if (container) {
        container.innerHTML =
          '<div class="jnt-digest-actions">' +
          '<button type="button" class="kn-btn kn-btn--primary" id="jnt-digest-generate">Generate Today\'s 9AM Digest (Simulated)</button>' +
          '</div>' +
          '<p class="jnt-digest-note">Demo Mode: Daily 9AM trigger simulated manually.</p>' +
          '<div class="kn-empty" style="margin-top: 24px;">' +
          '<h2 class="kn-empty__title">No matching roles today</h2>' +
          '<p class="kn-empty__body">Check again tomorrow.</p>' +
          '</div>' + renderStatusUpdatesHTML();
        document.getElementById('jnt-digest-generate').onclick = generateAndRender;
      }
      return;
    }

    saveDigest(top10);
    render();
  }

  function copyDigestToClipboard(jobs, dateLabel) {
    var text = formatDigestPlainText(jobs, dateLabel);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        var btn = document.getElementById('jnt-digest-copy');
        if (btn) { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy Digest to Clipboard'; }, 2000); }
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      var btn = document.getElementById('jnt-digest-copy');
      if (btn) { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy Digest to Clipboard'; }, 2000); }
    }
  }

  function init() {
    var existing = getStoredDigest();
    if (existing && existing.length > 0) {
      render();
      return;
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
