/**
 * Job Notification Tracker — Match Score Engine
 * Deterministic scoring rules exactly as specified.
 */

(function () {
  'use strict';

  window.MatchScoreEngine = {
    /**
     * Calculate match score for a job based on user preferences
     * @param {Object} job - Job object from JOBS_DATA
     * @param {Object} prefs - User preferences object
     * @returns {number} Match score (0-100)
     */
    calculate: function (job, prefs) {
      if (!prefs || !prefs.roleKeywords) {
        return 0;
      }

      let score = 0;

      // Parse preferences
      const roleKeywords = prefs.roleKeywords
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);
      
      const preferredLocations = prefs.preferredLocations || [];
      const preferredModes = prefs.preferredMode || [];
      const experienceLevel = prefs.experienceLevel || '';
      const userSkills = (prefs.skills || '')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);

      // +25 if any roleKeyword appears in job.title (case-insensitive)
      const titleLower = job.title.toLowerCase();
      if (roleKeywords.some(keyword => titleLower.includes(keyword))) {
        score += 25;
      }

      // +15 if any roleKeyword appears in job.description
      const descLower = (job.description || '').toLowerCase();
      if (roleKeywords.some(keyword => descLower.includes(keyword))) {
        score += 15;
      }

      // +15 if job.location matches preferredLocations
      if (preferredLocations.includes(job.location)) {
        score += 15;
      }

      // +10 if job.mode matches preferredMode
      if (preferredModes.includes(job.mode)) {
        score += 10;
      }

      // +10 if job.experience matches experienceLevel
      if (job.experience === experienceLevel) {
        score += 10;
      }

      // +15 if overlap between job.skills and user.skills (any match)
      const jobSkillsLower = (job.skills || []).map(s => s.toLowerCase());
      if (userSkills.some(us => jobSkillsLower.some(js => js.includes(us) || us.includes(js)))) {
        score += 15;
      }

      // +5 if postedDaysAgo <= 2
      if (job.postedDaysAgo <= 2) {
        score += 5;
      }

      // +5 if source is LinkedIn
      if (job.source === 'LinkedIn') {
        score += 5;
      }

      // Cap score at 100
      return Math.min(score, 100);
    },

    /**
     * Get badge color class based on score
     * @param {number} score - Match score (0-100)
     * @returns {string} CSS class name
     */
    getBadgeClass: function (score) {
      if (score >= 80) return 'jnt-match-badge--high';
      if (score >= 60) return 'jnt-match-badge--medium';
      if (score >= 40) return 'jnt-match-badge--neutral';
      return 'jnt-match-badge--low';
    }
  };
})();
