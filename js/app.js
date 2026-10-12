/**
 * GISSUF AI Avatar — Version 0.1
 * Main Application Orchestrator
 * Company: GISSUF Technology
 * Character: Rukky (AI Student)
 */

class GissufApp {
  constructor() {
    // DOM Elements
    this.chatInputForm = document.getElementById('chatInputForm');
    this.chatTextInput = document.getElementById('chatTextInput');
    this.btnSendMessage = document.getElementById('btnSendMessage');
    this.btnTestVoice = document.getElementById('btnTestVoice');
    this.quickPromptsList = document.getElementById('quickPromptsList');
    this.systemStatusPill = document.getElementById('systemStatusPill');
    this.systemStatusText = document.getElementById('systemStatusText');
    this.modeBadge = document.getElementById('modeBadge');
    this.modeText = document.getElementById('modeText');
    this.settingsBackendBadge = document.getElementById('settingsBackendBadge');

    this.backendUrl = window.location.origin;
    this.isProcessing = false;

    this.init();
  }

  init() {
    this.checkBackendStatus();
    this.setupEvents();
    this.setupSpeechIntegration();
    console.log("[GISSUF] GISSUF AI Avatar Version 0.1 loaded successfully.");
  }

  async checkBackendStatus() {
    try {
      const response = await fetch(`${this.backendUrl}/api/status`);
      if (response.ok) {
        const data = await response.json();
        this.updateSystemStatus(true, data);
      } else {
        this.updateSystemStatus(false);
      }
    } catch (e) {
      console.warn("[GISSUF] Backend status check failed (standalone mode):", e);
      this.updateSystemStatus(false);
    }
  }

  updateSystemStatus(isOnline, data = null) {
    if (this.systemStatusText && this.systemStatusPill) {
      if (isOnline) {
        this.systemStatusText.textContent = "System Online";
        this.systemStatusPill.style.backgroundColor = "rgba(16, 185, 129, 0.12)";
        this.systemStatusPill.style.borderColor = "rgba(16, 185, 129, 0.3)";
        this.systemStatusPill.style.color = "var(--color-success)";

        if (data && data.mode === 'live_llm') {
          if (this.modeText) this.modeText.textContent = "Live AI";
          if (this.settingsBackendBadge) this.settingsBackendBadge.textContent = "Live AI Model Active";
        } else {
          if (this.modeText) this.modeText.textContent = "Demo Mode";
          if (this.settingsBackendBadge) this.settingsBackendBadge.textContent = "Demo Persona Mode";
        }
      } else {
        this.systemStatusText.textContent = "Local Client Ready";
        this.systemStatusPill.style.backgroundColor = "rgba(245, 158, 11, 0.12)";
        this.systemStatusPill.style.borderColor = "rgba(245, 158, 11, 0.3)";
        this.systemStatusPill.style.color = "var(--color-warning)";
      }
    }
  }

  setupSpeechIntegration() {
    if (window.speechEngine) {
      // Connect speech recognition to dialogue submission
      window.speechEngine.onFinalSpeech = (recognizedText) => {
        if (!recognizedText) return;
        this.chatTextInput.value = recognizedText;

        if (window.settingsManager && window.settingsManager.autoSendOnSpeech) {
          this.submitMessage(recognizedText);
        }
      };
    }
  }

  setupEvents() {
    // Chat form submit
    if (this.chatInputForm) {
      this.chatInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.chatTextInput.value.trim();
        if (text) {
          this.submitMessage(text);
        }
      });
    }

    // Quick prompt chips
    if (this.quickPromptsList) {
      this.quickPromptsList.addEventListener('click', (e) => {
        const chip = e.target.closest('.prompt-chip');
        if (chip && chip.dataset.prompt) {
          const prompt = chip.dataset.prompt;
          this.chatTextInput.value = prompt;
          this.submitMessage(prompt);
        }
      });
    }

    // Test Voice button
    if (this.btnTestVoice) {
      this.btnTestVoice.addEventListener('click', () => {
        const testIntro = "Greetings! I am Rukky, an AI student developed by GISSUF Technology. My audio synthesis and visual animation are fully operational!";
        if (window.speechEngine) {
          window.speechEngine.speak(testIntro);
        }
      });
    }
  }

  async submitMessage(userText) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // Clear input
    this.chatTextInput.value = '';

    // Add user message to UI
    if (window.chatManager) {
      window.chatManager.addUserMessage(userText);
      window.chatManager.showTypingIndicator();
    }

    // Set Rukky avatar to thinking state
    if (window.rukkyAvatar) {
      window.rukkyAvatar.setState(window.rukkyAvatar.STATES.THINKING);
    }

    try {
      const response = await fetch(`${this.backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: window.chatManager ? window.chatManager.conversationHistory : []
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || "I received your message, but had trouble formulating a response.";
      const source = data.source || "demo_curated";
      const modeLabel = data.mode_label || "Demonstration Persona";

      // Render reply in chat
      if (window.chatManager) {
        window.chatManager.addRukkyMessage(reply, source, modeLabel);
      }

      // Speak response if auto-speak enabled
      if (window.settingsManager && window.settingsManager.autoSpeak && window.speechEngine) {
        window.speechEngine.speak(reply);
      } else {
        // Return avatar to idle
        if (window.rukkyAvatar) {
          window.rukkyAvatar.setState(window.rukkyAvatar.STATES.IDLE);
        }
      }

    } catch (err) {
      console.warn("[GISSUF] Request error:", err);
      const fallbackReply = `Thank you for sharing that thought regarding "${userText}". I am currently running in offline client mode. As Rukky, I look forward to exploring artificial intelligence concepts with you!`;
      
      if (window.chatManager) {
        window.chatManager.addRukkyMessage(fallbackReply, 'demo_curated', 'Client Fallback');
      }

      if (window.settingsManager && window.settingsManager.autoSpeak && window.speechEngine) {
        window.speechEngine.speak(fallbackReply);
      } else if (window.rukkyAvatar) {
        window.rukkyAvatar.setState(window.rukkyAvatar.STATES.IDLE);
      }
    } finally {
      this.isProcessing = false;
    }
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.gissufApp = new GissufApp();
});
