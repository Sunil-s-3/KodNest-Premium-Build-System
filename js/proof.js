/**
 * Job Notification Tracker — Proof artifacts and project status (localStorage)
 */

(function () {
  'use strict';

  var ARTIFACTS_KEY = 'jtProofArtifacts';
  var STATUS_KEY = 'jtProject1Status';

  function isValidUrl(s) {
    if (!s || typeof s !== 'string') return false;
    s = s.trim();
    if (s.length === 0) return false;
    try {
      var u = new URL(s);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function getArtifacts() {
    try {
      var raw = localStorage.getItem(ARTIFACTS_KEY);
      return raw ? JSON.parse(raw) : { lovableLink: '', githubLink: '', deployedUrl: '' };
    } catch {
      return { lovableLink: '', githubLink: '', deployedUrl: '' };
    }
  }

  function setArtifacts(obj) {
    localStorage.setItem(ARTIFACTS_KEY, JSON.stringify(obj));
  }

  function setArtifact(key, value) {
    var a = getArtifacts();
    a[key] = value ? String(value).trim() : '';
    setArtifacts(a);
  }

  function getProjectStatus() {
    try {
      var s = localStorage.getItem(STATUS_KEY);
      return s === 'Shipped' || s === 'In Progress' || s === 'Not Started' ? s : 'Not Started';
    } catch {
      return 'Not Started';
    }
  }

  function setProjectStatus(status) {
    if (status === 'Shipped' || status === 'In Progress' || status === 'Not Started') {
      localStorage.setItem(STATUS_KEY, status);
    }
  }

  function canMarkShipped() {
    var a = getArtifacts();
    var hasLinks = isValidUrl(a.lovableLink) && isValidUrl(a.githubLink) && isValidUrl(a.deployedUrl);
    var allTestsPassed = window.JTChecklist && window.JTChecklist.areAllPassed();
    return hasLinks && allTestsPassed;
  }

  function updateStatusFromConditions() {
    if (getProjectStatus() === 'Shipped') return;
    var a = getArtifacts();
    var hasAny = (a.lovableLink && a.lovableLink.length) || (a.githubLink && a.githubLink.length) || (a.deployedUrl && a.deployedUrl.length);
    var testsPassed = window.JTChecklist && window.JTChecklist.getPassedCount() > 0;
    if (hasAny || testsPassed) setProjectStatus('In Progress');
    else setProjectStatus('Not Started');
  }

  window.JTProof = {
    isValidUrl: isValidUrl,
    getArtifacts: getArtifacts,
    setArtifacts: setArtifacts,
    setArtifact: setArtifact,
    getProjectStatus: getProjectStatus,
    setProjectStatus: setProjectStatus,
    canMarkShipped: canMarkShipped,
    updateStatusFromConditions: updateStatusFromConditions
  };
})();
