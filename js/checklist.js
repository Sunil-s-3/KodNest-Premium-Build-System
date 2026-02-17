/**
 * Job Notification Tracker — Built-in test checklist (localStorage)
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'jtChecklist';
  const TOTAL = 10;

  function getState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function setState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getItem(id) {
    var state = getState();
    return state[String(id)] === true;
  }

  function setItem(id, checked) {
    var state = getState();
    state[String(id)] = !!checked;
    setState(state);
  }

  function getPassedCount() {
    var state = getState();
    var count = 0;
    for (var i = 1; i <= TOTAL; i++) {
      if (state[String(i)] === true) count++;
    }
    return count;
  }

  function areAllPassed() {
    return getPassedCount() === TOTAL;
  }

  function reset() {
    setState({});
  }

  window.JTChecklist = {
    TOTAL: TOTAL,
    getItem: getItem,
    setItem: setItem,
    getPassedCount: getPassedCount,
    areAllPassed: areAllPassed,
    reset: reset
  };
})();
