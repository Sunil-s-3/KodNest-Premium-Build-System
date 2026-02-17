/**
 * Job Notification Tracker — Job status tracking (localStorage)
 * jobTrackerStatus = { jobId: status }
 * jobTrackerStatusUpdates = [ { jobId, status, dateChanged } ] for Applied/Rejected/Selected
 */

(function () {
  'use strict';

  const STATUS_KEY = 'jobTrackerStatus';
  const UPDATES_KEY = 'jobTrackerStatusUpdates';
  const VALID = ['Not Applied', 'Applied', 'Rejected', 'Selected'];

  function getStatusMap() {
    try {
      const raw = localStorage.getItem(STATUS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function getStatus(jobId) {
    const map = getStatusMap();
    const s = map[String(jobId)];
    return VALID.indexOf(s) >= 0 ? s : 'Not Applied';
  }

  function setStatus(jobId, status) {
    if (VALID.indexOf(status) < 0) return;
    const map = getStatusMap();
    map[String(jobId)] = status;
    localStorage.setItem(STATUS_KEY, JSON.stringify(map));

    if (status !== 'Not Applied') {
      const list = getStatusUpdatesRaw();
      list.unshift({ jobId: jobId, status: status, dateChanged: new Date().toISOString() });
      localStorage.setItem(UPDATES_KEY, JSON.stringify(list.slice(0, 50)));
    }
  }

  function getStatusUpdatesRaw() {
    try {
      const raw = localStorage.getItem(UPDATES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function getStatusUpdates() {
    return getStatusUpdatesRaw();
  }

  function showToast(message) {
    const id = 'jnt-toast';
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.className = 'jnt-toast';
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('jnt-toast--visible');
    clearTimeout(el._toastTimer);
    el._toastTimer = setTimeout(function () {
      el.classList.remove('jnt-toast--visible');
    }, 2500);
  }

  window.JobStatus = {
    getStatus: getStatus,
    setStatus: setStatus,
    getStatusMap: getStatusMap,
    getStatusUpdates: getStatusUpdates,
    showToast: showToast,
    VALID: VALID
  };
})();
