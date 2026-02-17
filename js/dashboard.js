/**
 * Job Notification Tracker — Dashboard functionality with match scoring
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'jobTrackerPreferences';

  // Get unique values for filters
  const locations = [...new Set(JOBS_DATA.map(j => j.location))].sort();
  const modes = [...new Set(JOBS_DATA.map(j => j.mode))].sort();
  const experiences = [...new Set(JOBS_DATA.map(j => j.experience))].sort();
  const sources = [...new Set(JOBS_DATA.map(j => j.source))].sort();
  const statusOptions = ['Not Applied', 'Applied', 'Rejected', 'Selected'];

  let filteredJobs = [];
  let jobsWithScores = [];
  let currentModalJob = null;
  let userPreferences = null;

  // Initialize
  function init() {
    loadPreferences();
    calculateMatchScores();
    renderBanner();
    renderFilters();
    renderJobs(filteredJobs);
    setupModal();
  }

  // Load preferences from localStorage
  function loadPreferences() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        userPreferences = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading preferences:', e);
      userPreferences = null;
    }
  }

  // Calculate match scores for all jobs
  function calculateMatchScores() {
    if (!userPreferences || !userPreferences.roleKeywords) {
      jobsWithScores = JOBS_DATA.map(job => ({ ...job, matchScore: 0 }));
      filteredJobs = [...JOBS_DATA];
      return;
    }

    jobsWithScores = JOBS_DATA.map(job => {
      const matchScore = window.MatchScoreEngine.calculate(job, userPreferences);
      return { ...job, matchScore };
    });

    // Apply match score threshold if toggle is enabled
    applyFilters();
  }

  // Render preferences banner
  function renderBanner() {
    const bannerEl = document.getElementById('jnt-preferences-banner');
    if (!bannerEl) return;

    if (!userPreferences || !userPreferences.roleKeywords) {
      bannerEl.innerHTML = `
        <div class="jnt-banner">
          <p class="jnt-banner__text">Set your preferences to activate intelligent matching.</p>
          <a href="../settings/" class="kn-btn kn-btn--secondary" style="text-decoration: none;">Go to Settings</a>
        </div>
      `;
      bannerEl.style.display = 'block';
    } else {
      bannerEl.style.display = 'none';
    }
  }

  // Render filter bar
  function renderFilters() {
    const filtersEl = document.getElementById('jnt-filters');
    if (!filtersEl) return;

    const hasPreferences = userPreferences && userPreferences.roleKeywords;
    const minScore = userPreferences ? (userPreferences.minMatchScore || 40) : 40;

    filtersEl.innerHTML = `
      ${hasPreferences ? `
        <div class="jnt-filters__group jnt-filters__group--toggle">
          <label class="jnt-toggle-label">
            <input type="checkbox" id="filter-match-only" />
            <span>Show only jobs above my threshold</span>
          </label>
        </div>
      ` : ''}
      <div class="jnt-filters__group jnt-filters__group--search">
        <label for="filter-keyword">Search</label>
        <input type="text" id="filter-keyword" class="kn-input" placeholder="Title or company..." />
      </div>
      <div class="jnt-filters__group">
        <label for="filter-location">Location</label>
        <select id="filter-location" class="kn-select">
          <option value="">All locations</option>
          ${locations.map(loc => `<option value="${loc}">${loc}</option>`).join('')}
        </select>
      </div>
      <div class="jnt-filters__group">
        <label for="filter-mode">Mode</label>
        <select id="filter-mode" class="kn-select">
          <option value="">All modes</option>
          ${modes.map(m => `<option value="${m}">${m}</option>`).join('')}
        </select>
      </div>
      <div class="jnt-filters__group">
        <label for="filter-experience">Experience</label>
        <select id="filter-experience" class="kn-select">
          <option value="">All levels</option>
          ${experiences.map(e => `<option value="${e}">${e}</option>`).join('')}
        </select>
      </div>
      <div class="jnt-filters__group">
        <label for="filter-source">Source</label>
        <select id="filter-source" class="kn-select">
          <option value="">All sources</option>
          ${sources.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="jnt-filters__group">
        <label for="filter-status">Status</label>
        <select id="filter-status" class="kn-select">
          <option value="">All</option>
          ${statusOptions.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="jnt-filters__group jnt-filters__group--sort">
        <label for="filter-sort">Sort</label>
        <select id="filter-sort" class="kn-select">
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="match-score">Match Score</option>
          <option value="salary">Salary</option>
        </select>
      </div>
    `;

    // Attach event listeners
    if (hasPreferences) {
      document.getElementById('filter-match-only').addEventListener('change', applyFilters);
    }
    document.getElementById('filter-keyword').addEventListener('input', applyFilters);
    document.getElementById('filter-location').addEventListener('change', applyFilters);
    document.getElementById('filter-mode').addEventListener('change', applyFilters);
    document.getElementById('filter-experience').addEventListener('change', applyFilters);
    document.getElementById('filter-source').addEventListener('change', applyFilters);
    document.getElementById('filter-status').addEventListener('change', applyFilters);
    document.getElementById('filter-sort').addEventListener('change', applyFilters);
  }

  // Apply filters
  function applyFilters() {
    const keyword = document.getElementById('filter-keyword').value.toLowerCase();
    const location = document.getElementById('filter-location').value;
    const mode = document.getElementById('filter-mode').value;
    const experience = document.getElementById('filter-experience').value;
    const source = document.getElementById('filter-source').value;
    const sort = document.getElementById('filter-sort').value;
    const statusFilter = document.getElementById('filter-status') ? document.getElementById('filter-status').value : '';
    const matchOnly = userPreferences && document.getElementById('filter-match-only') && document.getElementById('filter-match-only').checked;
    const minScore = userPreferences ? (userPreferences.minMatchScore || 40) : 0;

    filteredJobs = jobsWithScores.filter(job => {
      const matchesKeyword = !keyword || 
        job.title.toLowerCase().includes(keyword) || 
        job.company.toLowerCase().includes(keyword);
      const matchesLocation = !location || job.location === location;
      const matchesMode = !mode || job.mode === mode;
      const matchesExperience = !experience || job.experience === experience;
      const matchesSource = !source || job.source === source;
      const matchesScore = !matchOnly || job.matchScore >= minScore;
      const jobStatus = window.JobStatus ? window.JobStatus.getStatus(job.id) : 'Not Applied';
      const matchesStatus = !statusFilter || jobStatus === statusFilter;

      return matchesKeyword && matchesLocation && matchesMode && matchesExperience && matchesSource && matchesScore && matchesStatus;
    });

    // Sort
    if (sort === 'latest') {
      filteredJobs.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    } else if (sort === 'oldest') {
      filteredJobs.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
    } else if (sort === 'match-score') {
      filteredJobs.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sort === 'salary') {
      filteredJobs.sort((a, b) => {
        const aNum = extractSalaryNumber(a.salaryRange);
        const bNum = extractSalaryNumber(b.salaryRange);
        return bNum - aNum; // Descending
      });
    }

    renderJobs(filteredJobs);
  }

  // Extract numeric value from salary range for sorting
  function extractSalaryNumber(salaryRange) {
    if (!salaryRange) return 0;
    // Try to extract first number (e.g., "3–5 LPA" -> 3, "₹15k–₹40k/month" -> 15)
    const match = salaryRange.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  // Render jobs
  function renderJobs(jobs) {
    const container = document.getElementById('jnt-jobs-container');
    if (!container) return;

    if (jobs.length === 0) {
      const hasPreferences = userPreferences && userPreferences.roleKeywords;
      const matchOnly = userPreferences && document.getElementById('filter-match-only') && document.getElementById('filter-match-only').checked;
      
      container.innerHTML = `
        <div class="kn-empty" style="grid-column: 1 / -1;">
          <h2 class="kn-empty__title">No roles match your criteria</h2>
          <p class="kn-empty__body">${matchOnly ? 'Adjust filters or lower threshold.' : 'Try adjusting your filters.'}</p>
        </div>
      `;
      return;
    }

    container.innerHTML = jobs.map(job => renderJobCard(job)).join('');
    
    // Attach event listeners
    jobs.forEach(job => {
      const card = document.querySelector(`[data-job-id="${job.id}"]`);
      if (card) {
        const viewBtn = card.querySelector('.jnt-job-card__view');
        const saveBtn = card.querySelector('.jnt-job-card__save');
        const applyBtn = card.querySelector('.jnt-job-card__apply');
        card.querySelectorAll('.jnt-status-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const newStatus = btn.getAttribute('data-status');
            if (window.JobStatus) {
              window.JobStatus.setStatus(job.id, newStatus);
              if (['Applied', 'Rejected', 'Selected'].indexOf(newStatus) >= 0 && window.JobStatus.showToast) {
                window.JobStatus.showToast('Status updated: ' + newStatus);
              }
              applyFilters();
            }
          });
        });
        if (viewBtn) viewBtn.addEventListener('click', () => openModal(job));
        if (saveBtn) saveBtn.addEventListener('click', () => saveJob(job.id));
        if (applyBtn) applyBtn.addEventListener('click', () => window.open(job.applyUrl, '_blank'));
      }
    });

    updateSaveButtons();
  }

  // Render single job card
  function renderJobCard(job) {
    const postedText = job.postedDaysAgo === 0 ? 'Today' : 
                       job.postedDaysAgo === 1 ? '1 day ago' : 
                       `${job.postedDaysAgo} days ago`;
    
    const sourceClass = job.source.toLowerCase();
    const isSaved = isJobSaved(job.id);
    const matchScore = job.matchScore || 0;
    const badgeClass = window.MatchScoreEngine ? window.MatchScoreEngine.getBadgeClass(matchScore) : '';
    const showMatchBadge = userPreferences && userPreferences.roleKeywords && matchScore > 0;
    const status = window.JobStatus ? window.JobStatus.getStatus(job.id) : 'Not Applied';
    const statusClass = 'jnt-status-btn--' + status.toLowerCase().replace(/\s/g, '-');

    return `
      <div class="jnt-job-card" data-job-id="${job.id}">
        <div class="jnt-job-card__header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--kn-space-2);">
            <div style="flex: 1;">
              <h3 class="jnt-job-card__title">${escapeHtml(job.title)}</h3>
              <div class="jnt-job-card__company">${escapeHtml(job.company)}</div>
            </div>
            ${showMatchBadge ? `<span class="jnt-match-badge ${badgeClass}">${matchScore}</span>` : ''}
          </div>
        </div>
        <div class="jnt-job-card__meta">
          <span class="jnt-job-card__meta-item">📍 ${escapeHtml(job.location)}</span>
          <span class="jnt-job-card__meta-item">•</span>
          <span class="jnt-job-card__meta-item">${escapeHtml(job.mode)}</span>
          <span class="jnt-job-card__meta-item">•</span>
          <span class="jnt-job-card__meta-item">${escapeHtml(job.experience)}</span>
        </div>
        <div class="jnt-job-card__salary">${escapeHtml(job.salaryRange)}</div>
        <div class="jnt-job-card__status">
          <span class="jnt-status-label">Status:</span>
          <div class="jnt-status-group">
            ${statusOptions.map(s => `<button type="button" class="jnt-status-btn ${s === status ? statusClass : ''}" data-job-id="${job.id}" data-status="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
          </div>
        </div>
        <div class="jnt-job-card__footer">
          <span class="jnt-job-card__badge jnt-job-card__badge--${sourceClass}">${escapeHtml(job.source)}</span>
          <span class="jnt-job-card__posted">${postedText}</span>
          <div style="width: 100%; margin-top: var(--kn-space-2); display: flex; gap: var(--kn-space-1); flex-wrap: wrap;">
            <button type="button" class="kn-btn kn-btn--secondary jnt-job-card__view" style="flex: 1; min-width: 80px;">View</button>
            <button type="button" class="kn-btn kn-btn--secondary jnt-job-card__save" data-save-id="${job.id}" style="flex: 1; min-width: 80px;">${isSaved ? 'Saved' : 'Save'}</button>
            <a href="${escapeHtml(job.applyUrl)}" target="_blank" class="kn-btn kn-btn--primary jnt-job-card__apply" style="flex: 1; min-width: 80px; text-decoration: none;">Apply</a>
          </div>
        </div>
      </div>
    `;
  }

  // Open modal
  function openModal(job) {
    currentModalJob = job;
    const modal = document.getElementById('jnt-modal');
    if (!modal) return;

    const matchScore = job.matchScore || 0;
    const showMatchScore = userPreferences && userPreferences.roleKeywords && matchScore > 0;
    const badgeClass = window.MatchScoreEngine ? window.MatchScoreEngine.getBadgeClass(matchScore) : '';

    const content = modal.querySelector('.jnt-modal__content');
    content.innerHTML = `
      <button type="button" class="jnt-modal__close" aria-label="Close">✕</button>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--kn-space-2);">
        <div style="flex: 1;">
          <h2 class="jnt-modal__title">${escapeHtml(job.title)}</h2>
          <div class="jnt-modal__company">${escapeHtml(job.company)}</div>
        </div>
        ${showMatchScore ? `<span class="jnt-match-badge ${badgeClass}">${matchScore}</span>` : ''}
      </div>
      <div class="jnt-modal__section">
        <div class="jnt-modal__section-title">Location & Details</div>
        <div style="font-size: var(--kn-text-small); color: var(--kn-text-muted);">
          ${escapeHtml(job.location)} • ${escapeHtml(job.mode)} • ${escapeHtml(job.experience)} • ${escapeHtml(job.salaryRange)}
        </div>
      </div>
      <div class="jnt-modal__section">
        <div class="jnt-modal__section-title">Description</div>
        <p class="jnt-modal__description">${escapeHtml(job.description)}</p>
      </div>
      <div class="jnt-modal__section">
        <div class="jnt-modal__section-title">Skills</div>
        <div class="jnt-modal__skills">
          ${job.skills.map(skill => `<span class="jnt-modal__skill">${escapeHtml(skill)}</span>`).join('')}
        </div>
      </div>
      <div class="jnt-modal__section">
        <div class="jnt-modal__section-title">Source</div>
        <div style="font-size: var(--kn-text-small); color: var(--kn-text-muted);">
          ${escapeHtml(job.source)} • Posted ${job.postedDaysAgo === 0 ? 'today' : job.postedDaysAgo === 1 ? '1 day ago' : `${job.postedDaysAgo} days ago`}
        </div>
      </div>
      <div class="jnt-modal__actions">
        <button type="button" class="kn-btn kn-btn--secondary" id="modal-save">${isJobSaved(job.id) ? 'Saved' : 'Save'}</button>
        <a href="${escapeHtml(job.applyUrl)}" target="_blank" class="kn-btn kn-btn--primary" style="text-decoration: none;">Apply Now</a>
      </div>
    `;

    modal.classList.add('is-open');
    
    // Attach listeners
    modal.querySelector('.jnt-modal__close').addEventListener('click', closeModal);
    modal.querySelector('#modal-save').addEventListener('click', () => {
      saveJob(job.id);
      closeModal();
    });
  }

  // Close modal
  function closeModal() {
    const modal = document.getElementById('jnt-modal');
    if (modal) {
      modal.classList.remove('is-open');
      currentModalJob = null;
    }
  }

  // Setup modal
  function setupModal() {
    const modal = document.getElementById('jnt-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
          closeModal();
        }
      });
    }
  }

  // Save job
  function saveJob(jobId) {
    const saved = getSavedJobs();
    if (saved.includes(jobId)) {
      saved.splice(saved.indexOf(jobId), 1);
    } else {
      saved.push(jobId);
    }
    localStorage.setItem('jnt-saved-jobs', JSON.stringify(saved));
    updateSaveButtons();
    
    // Update modal button if open
    if (currentModalJob && currentModalJob.id === jobId) {
      const btn = document.getElementById('modal-save');
      if (btn) btn.textContent = isJobSaved(jobId) ? 'Saved' : 'Save';
    }
  }

  // Check if job is saved
  function isJobSaved(jobId) {
    return getSavedJobs().includes(jobId);
  }

  // Get saved jobs
  function getSavedJobs() {
    try {
      return JSON.parse(localStorage.getItem('jnt-saved-jobs') || '[]');
    } catch {
      return [];
    }
  }

  // Update save buttons
  function updateSaveButtons() {
    const saved = getSavedJobs();
    document.querySelectorAll('.jnt-job-card__save').forEach(btn => {
      const jobId = parseInt(btn.getAttribute('data-save-id'));
      btn.textContent = saved.includes(jobId) ? 'Saved' : 'Save';
    });
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
