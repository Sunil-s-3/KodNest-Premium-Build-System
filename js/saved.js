/**
 * Job Notification Tracker — Saved jobs page
 */

(function () {
  'use strict';

  function init() {
    renderSavedJobs();
  }

  function renderSavedJobs() {
    const container = document.getElementById('jnt-saved-container');
    if (!container) return;

    const savedIds = getSavedJobs();
    const savedJobs = JOBS_DATA.filter(job => savedIds.includes(job.id));

    if (savedJobs.length === 0) {
      container.innerHTML = `
        <div class="kn-empty">
          <h2 class="kn-empty__title">No saved jobs</h2>
          <p class="kn-empty__body">Jobs you save from the dashboard will appear here.</p>
          <div class="kn-empty__action">
            <a href="../dashboard/" class="kn-btn kn-btn--secondary">Go to Dashboard</a>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="jnt-jobs">
        ${savedJobs.map(job => renderJobCard(job)).join('')}
      </div>
    `;

    // Attach event listeners
    savedJobs.forEach(job => {
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
              renderSavedJobs();
            }
          });
        });
        if (viewBtn) viewBtn.addEventListener('click', () => openModal(job));
        if (saveBtn) saveBtn.addEventListener('click', () => {
          removeJob(job.id);
          renderSavedJobs();
        });
        if (applyBtn) applyBtn.addEventListener('click', () => window.open(job.applyUrl, '_blank'));
      }
    });
  }

  const statusOptions = ['Not Applied', 'Applied', 'Rejected', 'Selected'];

  function renderJobCard(job) {
    const postedText = job.postedDaysAgo === 0 ? 'Today' : 
                       job.postedDaysAgo === 1 ? '1 day ago' : 
                       `${job.postedDaysAgo} days ago`;
    
    const sourceClass = job.source.toLowerCase();
    const status = window.JobStatus ? window.JobStatus.getStatus(job.id) : 'Not Applied';
    const statusClass = 'jnt-status-btn--' + status.toLowerCase().replace(/\s/g, '-');

    return `
      <div class="jnt-job-card" data-job-id="${job.id}">
        <div class="jnt-job-card__header">
          <h3 class="jnt-job-card__title">${escapeHtml(job.title)}</h3>
          <div class="jnt-job-card__company">${escapeHtml(job.company)}</div>
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
            <button type="button" class="kn-btn kn-btn--secondary jnt-job-card__save" data-save-id="${job.id}" style="flex: 1; min-width: 80px;">Remove</button>
            <a href="${escapeHtml(job.applyUrl)}" target="_blank" class="kn-btn kn-btn--primary jnt-job-card__apply" style="flex: 1; min-width: 80px; text-decoration: none;">Apply</a>
          </div>
        </div>
      </div>
    `;
  }

  function openModal(job) {
    const modal = document.getElementById('jnt-modal');
    if (!modal) return;

    const content = modal.querySelector('.jnt-modal__content');
    content.innerHTML = `
      <button type="button" class="jnt-modal__close" aria-label="Close">✕</button>
      <h2 class="jnt-modal__title">${escapeHtml(job.title)}</h2>
      <div class="jnt-modal__company">${escapeHtml(job.company)}</div>
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
        <button type="button" class="kn-btn kn-btn--secondary" id="modal-remove">Remove</button>
        <a href="${escapeHtml(job.applyUrl)}" target="_blank" class="kn-btn kn-btn--primary" style="text-decoration: none;">Apply Now</a>
      </div>
    `;

    modal.classList.add('is-open');
    
    modal.querySelector('.jnt-modal__close').addEventListener('click', closeModal);
    modal.querySelector('#modal-remove').addEventListener('click', () => {
      removeJob(job.id);
      closeModal();
      renderSavedJobs();
    });
  }

  function closeModal() {
    const modal = document.getElementById('jnt-modal');
    if (modal) modal.classList.remove('is-open');
  }

  function removeJob(jobId) {
    const saved = getSavedJobs();
    const index = saved.indexOf(jobId);
    if (index > -1) {
      saved.splice(index, 1);
      localStorage.setItem('jnt-saved-jobs', JSON.stringify(saved));
    }
  }

  function getSavedJobs() {
    try {
      return JSON.parse(localStorage.getItem('jnt-saved-jobs') || '[]');
    } catch {
      return [];
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Setup modal click outside
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
