/**
 * Job Notification Tracker — Settings page functionality
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'jobTrackerPreferences';

  // Initialize
  function init() {
    loadPreferences();
    setupFormHandlers();
  }

  // Load preferences from localStorage
  function loadPreferences() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        
        // Prefill form
        if (prefs.roleKeywords) {
          document.getElementById('pref-role').value = prefs.roleKeywords;
        }
        
        if (prefs.preferredLocations && prefs.preferredLocations.length > 0) {
          const locationSelect = document.getElementById('pref-locations');
          if (locationSelect) {
            prefs.preferredLocations.forEach(loc => {
              const option = Array.from(locationSelect.options).find(opt => opt.value === loc);
              if (option) option.selected = true;
            });
          }
        }
        
        if (prefs.preferredMode && prefs.preferredMode.length > 0) {
          prefs.preferredMode.forEach(mode => {
            const checkbox = document.getElementById(`pref-mode-${mode.toLowerCase()}`);
            if (checkbox) checkbox.checked = true;
          });
        }
        
        if (prefs.experienceLevel) {
          const expSelect = document.getElementById('pref-experience');
          if (expSelect) {
            expSelect.value = prefs.experienceLevel;
          }
        }
        
        if (prefs.skills) {
          document.getElementById('pref-skills').value = prefs.skills;
        }
        
        if (prefs.minMatchScore !== undefined) {
          const slider = document.getElementById('pref-min-score');
          const display = document.getElementById('pref-min-score-display');
          if (slider) {
            slider.value = prefs.minMatchScore;
            if (display) display.textContent = prefs.minMatchScore;
          }
        }
      }
    } catch (e) {
      console.error('Error loading preferences:', e);
    }
  }

  // Setup form handlers
  function setupFormHandlers() {
    const form = document.getElementById('jnt-preferences-form');
    if (!form) return;

    // Update slider display
    const slider = document.getElementById('pref-min-score');
    const display = document.getElementById('pref-min-score-display');
    if (slider && display) {
      slider.addEventListener('input', function () {
        display.textContent = this.value;
      });
    }

    // Save on form submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      savePreferences();
    });

    // Auto-save on change (optional, or use submit button)
    // Uncomment if you want auto-save:
    // form.addEventListener('change', savePreferences);
  }

  // Save preferences to localStorage
  function savePreferences() {
    try {
      const roleKeywords = document.getElementById('pref-role').value.trim();
      const locationSelect = document.getElementById('pref-locations');
      const preferredLocations = locationSelect ? 
        Array.from(locationSelect.selectedOptions).map(opt => opt.value) : [];
      
      const preferredMode = [];
      ['Remote', 'Hybrid', 'Onsite'].forEach(mode => {
        const checkbox = document.getElementById(`pref-mode-${mode.toLowerCase()}`);
        if (checkbox && checkbox.checked) {
          preferredMode.push(mode);
        }
      });
      
      const experienceLevel = document.getElementById('pref-experience').value;
      const skills = document.getElementById('pref-skills').value.trim();
      const minMatchScore = parseInt(document.getElementById('pref-min-score').value, 10) || 40;

      const prefs = {
        roleKeywords,
        preferredLocations,
        preferredMode,
        experienceLevel,
        skills,
        minMatchScore
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      
      // Show success feedback
      showFeedback('Preferences saved successfully.');
    } catch (e) {
      console.error('Error saving preferences:', e);
      showFeedback('Error saving preferences.', true);
    }
  }

  // Show feedback message
  function showFeedback(message, isError) {
    const existing = document.getElementById('jnt-settings-feedback');
    if (existing) existing.remove();

    const feedback = document.createElement('div');
    feedback.id = 'jnt-settings-feedback';
    feedback.className = isError ? 'jnt-feedback jnt-feedback--error' : 'jnt-feedback jnt-feedback--success';
    feedback.textContent = message;
    
    const form = document.getElementById('jnt-preferences-form');
    if (form) {
      form.insertBefore(feedback, form.firstChild);
      setTimeout(() => feedback.remove(), 3000);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
