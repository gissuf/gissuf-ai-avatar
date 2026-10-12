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
      console.warn("[GISSUF] Server request fallback, using local client knowledge base:", err);
      const reply = this.getClientSideResponse(userText);
      
      if (window.chatManager) {
        window.chatManager.addRukkyMessage(reply, 'demo_curated', 'Demo Mode');
      }

      if (window.settingsManager && window.settingsManager.autoSpeak && window.speechEngine) {
        window.speechEngine.speak(reply);
      } else if (window.rukkyAvatar) {
        window.rukkyAvatar.setState(window.rukkyAvatar.STATES.IDLE);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  getClientSideResponse(userText) {
    const text = userText.toLowerCase().trim();
    
    if (text.includes('who are you') || text.includes('your name') || text.includes('introduce')) {
      return "Hello! I am Rukky, an AI student and conversational virtual companion created by GISSUF Technology. I am designed to participate in artificial intelligence training classes, ask thoughtful questions, and explore cutting-edge concepts alongside human learners!";
    }
    if (text.includes('gissuf') || text.includes('company')) {
      return "GISSUF Technology is an innovative tech enterprise dedicated to advancing artificial intelligence, virtual human interaction, and educational technology. The GISSUF AI Avatar platform gives institutions and businesses their own intelligent virtual humans.";
    }
    if (text.includes('what is ai') || text.includes('artificial intelligence')) {
      return "Artificial Intelligence refers to computer systems engineered to perform tasks that typically require human intelligence, such as learning from experience, recognizing speech, and solving complex problems.";
    }
    if (text.includes('machine learning') || text.includes('what is ml')) {
      return "Machine Learning is a branch of AI where computers learn from data instead of following rigid, hardcoded rules. The algorithms detect patterns in large datasets to make predictions on new data!";
    }
    if (text.includes('neural') || text.includes('deep learning')) {
      return "Deep Learning is a subset of Machine Learning inspired by the biological brain! It uses multi-layered neural networks with input, hidden, and output layers to detect intricate features in data.";
    }
    if (text.includes('zoom') || text.includes('meeting') || text.includes('class')) {
      return "In Version 0.1, you can bring me into your Zoom meetings right now using OBS Studio's Virtual Camera and a Virtual Audio Cable! In future versions, GISSUF Technology will implement autonomous Zoom meeting bots.";
    }
    if (text.includes('quiz') || text.includes('question') || text.includes('test me')) {
      return "Here is a question for you: If an AI model performs exceptionally well on training data but poorly on unseen test data, what is this phenomenon called, and how would you fix it?";
    }
    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      return "Greetings! I'm Rukky, ready for our training session. What AI concept or project would you like to explore together today?";
    }
    if (text.includes('thank')) {
      return "You're very welcome! As an AI student, I am always eager to learn and collaborate. Let me know if you have any other questions!";
    }

    return `That is an interesting inquiry regarding '${userText}'. As an AI student, I explore concepts by breaking them down into core principles. In future versions with a live LLM connected, I will provide deep real-time technical analysis for this exact prompt! Feel free to ask me about Machine Learning, Neural Networks, or GISSUF Technology.`;
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.gissufApp = new GissufApp();
});
