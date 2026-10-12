/**
 * GISSUF AI Avatar — Version 0.1
 * Avatar Engine & Animation Controller for Rukky
 * Company: GISSUF Technology
 *
 * Implements state machine: IDLE, LISTENING, THINKING, SPEAKING, ERROR
 * Controls natural blinking, breathing, mouth viseme animations, and audio waveform.
 */

class RukkyAvatar {
  constructor() {
    // State definitions
    this.STATES = {
      IDLE: 'idle',
      LISTENING: 'listening',
      THINKING: 'thinking',
      SPEAKING: 'speaking',
      ERROR: 'error'
    };

    this.currentState = this.STATES.IDLE;
    
    // DOM Elements
    this.stageContainer = document.getElementById('avatarStageContainer');
    this.characterWrapper = document.getElementById('characterWrapper');
    this.imageAvatarWrapper = document.getElementById('imageAvatarWrapper');
    this.avatarPortraitImg = document.getElementById('avatarPortraitImg');
    this.hudDot = document.getElementById('hudDot');
    this.hudStateLabel = document.getElementById('hudStateLabel');
    this.eyelidLeft = document.getElementById('eyelidLeft');
    this.eyelidRight = document.getElementById('eyelidRight');
    this.mouthShape = document.getElementById('mouthShape');
    this.waveformCanvas = document.getElementById('waveformCanvas');
    this.waveCtx = this.waveformCanvas ? this.waveformCanvas.getContext('2d') : null;
    this.btnToggleFullscreen = document.getElementById('btnToggleFullscreen');

    // Avatar Customizer Elements
    this.btnChangeAvatar = document.getElementById('btnChangeAvatar');
    this.avatarModal = document.getElementById('avatarModal');
    this.btnCloseAvatarModal = document.getElementById('btnCloseAvatarModal');
    this.cardPresetRealistic = document.getElementById('cardPresetRealistic');
    this.cardPresetVector = document.getElementById('cardPresetVector');
    this.cardPresetCustom = document.getElementById('cardPresetCustom');
    this.avatarFileInput = document.getElementById('avatarFileInput');
    this.uploadDropzone = document.getElementById('uploadDropzone');
    this.btnBrowseFile = document.getElementById('btnBrowseFile');
    this.btnApplyAvatarChoice = document.getElementById('btnApplyAvatarChoice');
    this.btnResetAvatarDefault = document.getElementById('btnResetAvatarDefault');
    this.customThumbnailImg = document.getElementById('customThumbnailImg');
    this.customGlyphIcon = document.getElementById('customGlyphIcon');
    this.customPresetDesc = document.getElementById('customPresetDesc');

    // Avatar Modes: 'realistic', 'vector', 'custom'
    this.currentMode = localStorage.getItem('gissuf_avatar_mode') || 'realistic';
    this.customImageData = localStorage.getItem('gissuf_custom_avatar_data') || null;
    this.selectedModalMode = this.currentMode;
    this.tempUploadedImage = null;

    // Viseme / Mouth Shapes (SVG path definitions for dynamic morphing)
    this.mouthShapes = {
      idle: "M-15 0 Q0 6 15 0 Q0 1 -15 0 Z",
      rest: "M-14 0 Q0 4 14 0 Q0 1 -14 0 Z",
      talkOpen: "M-14 -2 Q0 18 14 -2 Q0 2 -14 -2 Z",
      talkWide: "M-18 0 Q0 16 18 0 Q0 -2 -18 0 Z",
      talkRound: "M-8 -6 Q0 14 8 -6 Q0 -10 -8 -6 Z",
      talkSmile: "M-16 -2 Q0 10 16 -2 Q0 -4 -16 -2 Z",
      listenSmile: "M-14 1 Q0 8 14 1 Q0 2 -14 1 Z"
    };

    // Animation & Waveform intervals
    this.blinkTimeout = null;
    this.visemeInterval = null;
    this.waveAnimationId = null;
    this.wavePhase = 0;
    this.isMouthMoving = false;

    this.init();
  }

  init() {
    this.applyAvatarMode(this.currentMode, this.customImageData);
    this.startBlinkingLoop();
    this.startWaveformLoop();
    this.setupEvents();
    this.setupAvatarCustomizerModal();
    this.setState(this.STATES.IDLE);
    console.log("[GISSUF] Rukky Avatar Engine initialized.");
  }

  setupEvents() {
    if (this.btnToggleFullscreen) {
      this.btnToggleFullscreen.addEventListener('click', () => {
        this.toggleFullscreenStage();
      });
    }

    // ESC key exits fullscreen stage
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.stageContainer.classList.contains('fullscreen-stage')) {
        this.toggleFullscreenStage();
      }
    });
  }

  toggleFullscreenStage() {
    const isFullscreen = this.stageContainer.classList.toggle('fullscreen-stage');
    if (isFullscreen) {
      this.btnToggleFullscreen.querySelector('span').textContent = 'Exit Stage';
    } else {
      this.btnToggleFullscreen.querySelector('span').textContent = 'Stage View';
    }
  }

  applyAvatarMode(mode, customData = null) {
    this.currentMode = mode;
    localStorage.setItem('gissuf_avatar_mode', mode);

    if (mode === 'vector') {
      if (this.characterWrapper) this.characterWrapper.classList.add('active');
      if (this.imageAvatarWrapper) this.imageAvatarWrapper.classList.remove('active');
    } else if (mode === 'custom') {
      if (this.characterWrapper) this.characterWrapper.classList.remove('active');
      if (this.imageAvatarWrapper) this.imageAvatarWrapper.classList.add('active');
      if (this.avatarPortraitImg && customData) {
        this.avatarPortraitImg.src = customData;
      }
    } else {
      // Default: 'realistic'
      if (this.characterWrapper) this.characterWrapper.classList.remove('active');
      if (this.imageAvatarWrapper) this.imageAvatarWrapper.classList.add('active');
      if (this.avatarPortraitImg) {
        this.avatarPortraitImg.src = 'assets/rukky_realistic.png';
      }
    }
  }

  setupAvatarCustomizerModal() {
    // Open modal button
    if (this.btnChangeAvatar) {
      this.btnChangeAvatar.addEventListener('click', () => {
        this.openAvatarModal();
      });
    }

    // Close modal button
    if (this.btnCloseAvatarModal) {
      this.btnCloseAvatarModal.addEventListener('click', () => {
        this.closeAvatarModal();
      });
    }

    // Close on backdrop click
    if (this.avatarModal) {
      this.avatarModal.addEventListener('click', (e) => {
        if (e.target === this.avatarModal) {
          this.closeAvatarModal();
        }
      });
    }

    // Preset cards
    const cards = [
      { elem: this.cardPresetRealistic, mode: 'realistic' },
      { elem: this.cardPresetVector, mode: 'vector' },
      { elem: this.cardPresetCustom, mode: 'custom' }
    ];

    cards.forEach(({ elem, mode }) => {
      if (elem) {
        elem.addEventListener('click', () => {
          this.selectModalPreset(mode);
        });
      }
    });

    // File input browse button
    if (this.btnBrowseFile && this.avatarFileInput) {
      this.btnBrowseFile.addEventListener('click', () => {
        this.avatarFileInput.click();
      });
    }

    // Dropzone click
    if (this.uploadDropzone && this.avatarFileInput) {
      this.uploadDropzone.addEventListener('click', (e) => {
        if (e.target !== this.btnBrowseFile) {
          this.avatarFileInput.click();
        }
      });

      // Drag and drop events
      this.uploadDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.uploadDropzone.classList.add('dragover');
      });

      this.uploadDropzone.addEventListener('dragleave', () => {
        this.uploadDropzone.classList.remove('dragover');
      });

      this.uploadDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.uploadDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleImageFile(e.dataTransfer.files[0]);
        }
      });
    }

    // File input change
    if (this.avatarFileInput) {
      this.avatarFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleImageFile(e.target.files[0]);
        }
      });
    }

    // Apply button
    if (this.btnApplyAvatarChoice) {
      this.btnApplyAvatarChoice.addEventListener('click', () => {
        if (this.selectedModalMode === 'custom' && this.tempUploadedImage) {
          this.customImageData = this.tempUploadedImage;
          localStorage.setItem('gissuf_custom_avatar_data', this.customImageData);
        }
        this.applyAvatarMode(this.selectedModalMode, this.customImageData);
        this.closeAvatarModal();
      });
    }

    // Reset default button
    if (this.btnResetAvatarDefault) {
      this.btnResetAvatarDefault.addEventListener('click', () => {
        this.selectedModalMode = 'realistic';
        this.applyAvatarMode('realistic');
        this.selectModalPreset('realistic');
        this.closeAvatarModal();
      });
    }
  }

  openAvatarModal() {
    this.selectedModalMode = this.currentMode;
    this.selectModalPreset(this.currentMode);

    // Populate custom preview if exists
    if (this.customImageData && this.customThumbnailImg) {
      this.customThumbnailImg.src = this.customImageData;
      this.customThumbnailImg.style.display = 'block';
      if (this.customGlyphIcon) this.customGlyphIcon.style.display = 'none';
      if (this.customPresetDesc) this.customPresetDesc.textContent = 'Active custom image';
    }

    if (this.avatarModal) {
      this.avatarModal.style.display = 'flex';
    }
  }

  closeAvatarModal() {
    if (this.avatarModal) {
      this.avatarModal.style.display = 'none';
    }
  }

  selectModalPreset(mode) {
    this.selectedModalMode = mode;
    [this.cardPresetRealistic, this.cardPresetVector, this.cardPresetCustom].forEach((card) => {
      if (card) {
        if (card.dataset.mode === mode) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      }
    });
  }

  handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file (PNG, JPG, or WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.tempUploadedImage = e.target.result;
      if (this.customThumbnailImg) {
        this.customThumbnailImg.src = this.tempUploadedImage;
        this.customThumbnailImg.style.display = 'block';
      }
      if (this.customGlyphIcon) this.customGlyphIcon.style.display = 'none';
      if (this.customPresetDesc) this.customPresetDesc.textContent = file.name;
      this.selectModalPreset('custom');
    };
    reader.readAsDataURL(file);
  }

  /**
   * Updates Rukky's state and visual indicators
   * @param {string} state - IDLE, LISTENING, THINKING, SPEAKING, ERROR
   */
  setState(state) {
    this.currentState = state;

    // Reset state classes on stage container
    this.stageContainer.classList.remove(
      'state-idle',
      'state-listening',
      'state-thinking',
      'state-speaking',
      'state-error'
    );
    this.stageContainer.classList.add(`state-${state}`);

    switch (state) {
      case this.STATES.IDLE:
        this.setMouthShape(this.mouthShapes.idle);
        this.stopSpeakingAnimation();
        this.updateHUD('#00d2ff', 'IDLE • READY');
        break;

      case this.STATES.LISTENING:
        this.setMouthShape(this.mouthShapes.listenSmile);
        this.stopSpeakingAnimation();
        this.updateHUD('#ef4444', 'LISTENING • AUDIO IN');
        break;

      case this.STATES.THINKING:
        this.setMouthShape(this.mouthShapes.rest);
        this.stopSpeakingAnimation();
        this.updateHUD('#7928ca', 'PROCESSING • THINKING');
        break;

      case this.STATES.SPEAKING:
        this.startSpeakingAnimation();
        this.updateHUD('#10b981', 'SPEAKING • VOICE OUT');
        break;

      case this.STATES.ERROR:
        this.setMouthShape(this.mouthShapes.rest);
        this.stopSpeakingAnimation();
        this.updateHUD('#f59e0b', 'NOTICE • STANDBY');
        break;
    }
  }

  updateHUD(color, label) {
    if (this.hudDot) {
      this.hudDot.style.backgroundColor = color;
      this.hudDot.style.boxShadow = `0 0 10px ${color}`;
    }
    if (this.hudStateLabel) {
      this.hudStateLabel.textContent = label;
    }
  }

  /**
   * Sets the SVG path for Rukky's mouth
   */
  setMouthShape(dPath) {
    if (this.mouthShape) {
      this.mouthShape.setAttribute('d', dPath);
    }
  }

  /**
   * Simulates dynamic lip movements while speaking
   */
  startSpeakingAnimation() {
    if (this.visemeInterval) clearInterval(this.visemeInterval);

    const shapes = [
      this.mouthShapes.talkOpen,
      this.mouthShapes.talkWide,
      this.mouthShapes.talkRound,
      this.mouthShapes.talkSmile,
      this.mouthShapes.rest
    ];

    let lastIndex = 0;
    this.visemeInterval = setInterval(() => {
      let nextIndex = Math.floor(Math.random() * shapes.length);
      // Avoid repeating the same shape twice
      if (nextIndex === lastIndex) {
        nextIndex = (nextIndex + 1) % shapes.length;
      }
      lastIndex = nextIndex;
      this.setMouthShape(shapes[nextIndex]);
    }, 110); // Natural syllabic cadence (approx 9-10 mouth shapes/sec)
  }

  stopSpeakingAnimation() {
    if (this.visemeInterval) {
      clearInterval(this.visemeInterval);
      this.visemeInterval = null;
    }
    if (this.currentState === this.STATES.IDLE) {
      this.setMouthShape(this.mouthShapes.idle);
    }
  }

  /**
   * Natural human-like eye blinking cycle
   */
  startBlinkingLoop() {
    const triggerBlink = () => {
      // Close eyelids
      if (this.eyelidLeft && this.eyelidRight) {
        this.eyelidLeft.classList.add('blink');
        this.eyelidRight.classList.add('blink');
      }

      // Reopen after 140ms
      setTimeout(() => {
        if (this.eyelidLeft && this.eyelidRight) {
          this.eyelidLeft.classList.remove('blink');
          this.eyelidRight.classList.remove('blink');
        }

        // 20% chance of an immediate quick double blink
        const doubleBlink = Math.random() < 0.2;
        if (doubleBlink) {
          setTimeout(() => {
            this.eyelidLeft.classList.add('blink');
            this.eyelidRight.classList.add('blink');
            setTimeout(() => {
              this.eyelidLeft.classList.remove('blink');
              this.eyelidRight.classList.remove('blink');
            }, 120);
          }, 180);
        }

        // Schedule next blink (between 2.8s and 6.0s)
        const nextBlinkDelay = Math.random() * 3200 + 2800;
        this.blinkTimeout = setTimeout(triggerBlink, nextBlinkDelay);
      }, 140);
    };

    // First blink in 3 seconds
    this.blinkTimeout = setTimeout(triggerBlink, 3000);
  }

  /**
   * Real-time audio waveform visualizer rendered on HTML5 Canvas
   * Zero CPU footprint: uses requestAnimationFrame with lightweight math
   */
  startWaveformLoop() {
    if (!this.waveformCanvas || !this.waveCtx) return;

    const canvas = this.waveformCanvas;
    const ctx = this.waveCtx;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      let amplitude = 2; // subtle idle baseline
      let speed = 0.05;
      let strokeColor = '#00d2ff';

      if (this.currentState === this.STATES.SPEAKING) {
        amplitude = 12 + Math.sin(this.wavePhase * 3) * 4;
        speed = 0.16;
        strokeColor = '#10b981';
      } else if (this.currentState === this.STATES.LISTENING) {
        amplitude = 9 + Math.cos(this.wavePhase * 2) * 3;
        speed = 0.12;
        strokeColor = '#ef4444';
      } else if (this.currentState === this.STATES.THINKING) {
        amplitude = 6;
        speed = 0.08;
        strokeColor = '#7928ca';
      }

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = strokeColor;

      for (let x = 0; x < width; x += 4) {
        // Multi-frequency sine wave
        const y = centerY + Math.sin((x * 0.04) + this.wavePhase) * amplitude 
                          * Math.sin((x * 0.02) + (this.wavePhase * 0.5));
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      this.wavePhase += speed;
      this.waveAnimationId = requestAnimationFrame(render);
    };

    render();
  }

  destroy() {
    if (this.blinkTimeout) clearTimeout(this.blinkTimeout);
    if (this.visemeInterval) clearInterval(this.visemeInterval);
    if (this.waveAnimationId) cancelAnimationFrame(this.waveAnimationId);
  }
}

// Global Avatar instance
window.rukkyAvatar = new RukkyAvatar();
