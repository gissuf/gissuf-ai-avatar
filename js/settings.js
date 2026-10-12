/**
 * GISSUF AI Avatar — Version 0.1
 * Settings & Modal Dialog Controller
 * Company: GISSUF Technology
 */

class SettingsManager {
  constructor() {
    // Modals
    this.settingsModal = document.getElementById('settingsModal');
    this.zoomGuideModal = document.getElementById('zoomGuideModal');

    // Modal buttons
    this.btnOpenSettings = document.getElementById('btnOpenSettings');
    this.btnCloseSettings = document.getElementById('btnCloseSettings');
    this.btnSaveSettings = document.getElementById('btnSaveSettings');

    this.btnZoomGuide = document.getElementById('btnZoomGuide');
    this.btnCloseZoomGuide = document.getElementById('btnCloseZoomGuide');
    this.btnOkZoomGuide = document.getElementById('btnOkZoomGuide');

    // Form controls
    this.chkAutoSpeak = document.getElementById('chkAutoSpeak');
    this.chkAutoSendOnSpeech = document.getElementById('chkAutoSendOnSpeech');
    this.themeButtons = document.querySelectorAll('.theme-btn');

    // State
    this.autoSpeak = true;
    this.autoSendOnSpeech = true;
    this.currentTheme = 'theme-cyan';

    this.init();
  }

  init() {
    this.loadSavedPreferences();
    this.setupEvents();
  }

  loadSavedPreferences() {
    const savedAutoSpeak = localStorage.getItem('gissuf_auto_speak');
    if (savedAutoSpeak !== null) {
      this.autoSpeak = savedAutoSpeak === 'true';
      if (this.chkAutoSpeak) this.chkAutoSpeak.checked = this.autoSpeak;
    }

    const savedAutoSend = localStorage.getItem('gissuf_auto_send');
    if (savedAutoSend !== null) {
      this.autoSendOnSpeech = savedAutoSend === 'true';
      if (this.chkAutoSendOnSpeech) this.chkAutoSendOnSpeech.checked = this.autoSendOnSpeech;
    }

    const savedTheme = localStorage.getItem('gissuf_theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  setTheme(themeName) {
    document.body.classList.remove('theme-cyan', 'theme-violet', 'theme-emerald');
    document.body.classList.add(themeName);
    this.currentTheme = themeName;
    localStorage.setItem('gissuf_theme', themeName);

    this.themeButtons.forEach((btn) => {
      if (btn.dataset.theme === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  setupEvents() {
    // Settings modal open/close
    if (this.btnOpenSettings) {
      this.btnOpenSettings.addEventListener('click', () => {
        this.openModal(this.settingsModal);
      });
    }

    if (this.btnCloseSettings) {
      this.btnCloseSettings.addEventListener('click', () => {
        this.closeModal(this.settingsModal);
      });
    }

    if (this.btnSaveSettings) {
      this.btnSaveSettings.addEventListener('click', () => {
        this.savePreferences();
        this.closeModal(this.settingsModal);
      });
    }

    // Zoom guide modal open/close
    if (this.btnZoomGuide) {
      this.btnZoomGuide.addEventListener('click', () => {
        this.openModal(this.zoomGuideModal);
      });
    }

    if (this.btnCloseZoomGuide) {
      this.btnCloseZoomGuide.addEventListener('click', () => {
        this.closeModal(this.zoomGuideModal);
      });
    }

    if (this.btnOkZoomGuide) {
      this.btnOkZoomGuide.addEventListener('click', () => {
        this.closeModal(this.zoomGuideModal);
      });
    }

    // Close on backdrop click
    [this.settingsModal, this.zoomGuideModal].forEach((modal) => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.closeModal(modal);
          }
        });
      }
    });

    // Theme selector buttons
    this.themeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setTheme(btn.dataset.theme);
      });
    });

    // Checkboxes
    if (this.chkAutoSpeak) {
      this.chkAutoSpeak.addEventListener('change', (e) => {
        this.autoSpeak = e.target.checked;
        localStorage.setItem('gissuf_auto_speak', this.autoSpeak);
      });
    }

    if (this.chkAutoSendOnSpeech) {
      this.chkAutoSendOnSpeech.addEventListener('change', (e) => {
        this.autoSendOnSpeech = e.target.checked;
        localStorage.setItem('gissuf_auto_send', this.autoSendOnSpeech);
      });
    }
  }

  openModal(modal) {
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  closeModal(modal) {
    if (modal) {
      modal.style.display = 'none';
    }
  }

  savePreferences() {
    if (this.chkAutoSpeak) {
      this.autoSpeak = this.chkAutoSpeak.checked;
      localStorage.setItem('gissuf_auto_speak', this.autoSpeak);
    }
    if (this.chkAutoSendOnSpeech) {
      this.autoSendOnSpeech = this.chkAutoSendOnSpeech.checked;
      localStorage.setItem('gissuf_auto_send', this.autoSendOnSpeech);
    }
    console.log("[GISSUF] Settings saved.");
  }
}

// Global Settings Manager instance
window.settingsManager = new SettingsManager();
