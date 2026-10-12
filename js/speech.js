/**
 * GISSUF AI Avatar — Version 0.1
 * Speech Engine: Speech Recognition (STT) & Speech Synthesis (TTS)
 * Company: GISSUF Technology
 *
 * Utilizes standard Web Speech APIs for low-latency, zero-cost, and zero-GPU operation.
 */

class SpeechEngine {
  constructor() {
    // DOM Elements
    this.btnToggleMic = document.getElementById('btnToggleMic');
    this.speechRecognitionStatus = document.getElementById('speechRecognitionStatus');
    this.srStatusText = document.getElementById('srStatusText');
    this.liveTranscriptionBar = document.getElementById('liveTranscriptionBar');
    this.liveTranscriptionText = document.getElementById('liveTranscriptionText');
    this.selectVoice = document.getElementById('selectVoice');
    this.rangeSpeechRate = document.getElementById('rangeSpeechRate');
    this.rangeSpeechPitch = document.getElementById('rangeSpeechPitch');
    this.rangeSpeechVolume = document.getElementById('rangeSpeechVolume');
    this.valSpeechRate = document.getElementById('valSpeechRate');
    this.valSpeechPitch = document.getElementById('valSpeechPitch');
    this.valSpeechVolume = document.getElementById('valSpeechVolume');
    this.btnStopSpeaking = document.getElementById('btnStopSpeaking');

    // Speech Recognition
    this.recognition = null;
    this.isListening = false;
    this.onFinalSpeech = null; // Callback when user stops speaking

    // Speech Synthesis
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this.speechRate = 1.0;
    this.speechPitch = 1.05;
    this.speechVolume = 1.0;
    this.isSpeaking = false;

    this.init();
  }

  init() {
    this.initSpeechRecognition();
    this.initSpeechSynthesis();
    this.setupEvents();
  }

  /* ==========================================================================
     Speech Recognition (STT)
     ========================================================================== */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("[GISSUF] Web Speech Recognition is not supported by this browser.");
      if (this.srStatusText) {
        this.srStatusText.textContent = "Mic Not Supported (Use Text)";
      }
      if (this.btnToggleMic) {
        this.btnToggleMic.disabled = true;
        this.btnToggleMic.title = "Speech recognition is not supported in this browser. Please use Chrome or Edge.";
      }
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // Capture per utterance
      this.recognition.interimResults = true; // Show live transcription
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateMicUI(true);
        if (window.rukkyAvatar) {
          window.rukkyAvatar.setState(window.rukkyAvatar.STATES.LISTENING);
        }
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Show live interim text
        if (this.liveTranscriptionBar && this.liveTranscriptionText) {
          const previewText = interimTranscript || finalTranscript;
          if (previewText) {
            this.liveTranscriptionBar.style.display = 'flex';
            this.liveTranscriptionText.textContent = previewText;
          }
        }

        // Handle final speech result
        if (finalTranscript.trim()) {
          console.log("[GISSUF] Final speech recognized:", finalTranscript);
          if (typeof this.onFinalSpeech === 'function') {
            this.onFinalSpeech(finalTranscript.trim());
          }
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("[GISSUF] Speech recognition error:", event.error);
        this.updateMicUI(false);
        if (this.liveTranscriptionBar) {
          this.liveTranscriptionBar.style.display = 'none';
        }

        if (event.error === 'not-allowed') {
          alert("Microphone access was denied. Please allow microphone permissions in your browser address bar.");
        }

        if (window.rukkyAvatar && window.rukkyAvatar.currentState === window.rukkyAvatar.STATES.LISTENING) {
          window.rukkyAvatar.setState(window.rukkyAvatar.STATES.IDLE);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateMicUI(false);
        if (this.liveTranscriptionBar) {
          this.liveTranscriptionBar.style.display = 'none';
        }

        // If avatar was listening and not transition to thinking/speaking, revert to idle
        if (window.rukkyAvatar && window.rukkyAvatar.currentState === window.rukkyAvatar.STATES.LISTENING) {
          window.rukkyAvatar.setState(window.rukkyAvatar.STATES.IDLE);
        }
      };

    } catch (e) {
      console.error("[GISSUF] Error initializing Speech Recognition:", e);
    }
  }

  toggleMicrophone() {
    if (!this.recognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge for voice input.");
      return;
    }

    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    if (!this.recognition) return;
    try {
      // If Rukky is currently speaking, stop her before listening
      this.stopSpeaking();
      this.recognition.start();
    } catch (e) {
      console.warn("[GISSUF] Recognition start exception:", e);
    }
  }

  stopListening() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {
      console.warn("[GISSUF] Recognition stop exception:", e);
    }
  }

  updateMicUI(active) {
    if (this.btnToggleMic) {
      if (active) {
        this.btnToggleMic.classList.add('listening');
      } else {
        this.btnToggleMic.classList.remove('listening');
      }
    }

    if (this.speechRecognitionStatus && this.srStatusText) {
      if (active) {
        this.speechRecognitionStatus.classList.add('active');
        this.srStatusText.textContent = "Listening to you...";
      } else {
        this.speechRecognitionStatus.classList.remove('active');
        this.srStatusText.textContent = "Mic Standby";
      }
    }
  }

  /* ==========================================================================
     Speech Synthesis (TTS)
     ========================================================================== */
  initSpeechSynthesis() {
    if (!this.synth) {
      console.warn("[GISSUF] Speech Synthesis is not supported in this browser.");
      return;
    }

    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      this.populateVoiceList();
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  populateVoiceList() {
    if (!this.selectVoice || this.voices.length === 0) return;

    this.selectVoice.innerHTML = '';

    // Filter and sort English voices first
    const englishVoices = this.voices.filter(v => v.lang.startsWith('en'));
    const otherVoices = this.voices.filter(v => !v.lang.startsWith('en'));
    const allSorted = [...englishVoices, ...otherVoices];

    // Priority candidates for Rukky (female/clear English voices)
    let bestMatch = null;

    allSorted.forEach((voice) => {
      const option = document.createElement('option');
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})${voice.default ? ' [System Default]' : ''}`;
      this.selectVoice.appendChild(option);

      // Look for natural female/clear English voices
      const nameLower = voice.name.toLowerCase();
      if (!bestMatch && voice.lang.startsWith('en')) {
        if (nameLower.includes('zira') || nameLower.includes('samantha') || 
            nameLower.includes('female') || nameLower.includes('natural') || 
            nameLower.includes('google us english')) {
          bestMatch = voice;
        }
      }
    });

    if (bestMatch) {
      this.selectedVoice = bestMatch;
      this.selectVoice.value = bestMatch.name;
    } else if (englishVoices.length > 0) {
      this.selectedVoice = englishVoices[0];
      this.selectVoice.value = englishVoices[0].name;
    } else if (this.voices.length > 0) {
      this.selectedVoice = this.voices[0];
      this.selectVoice.value = this.voices[0].name;
    }

    // Load saved preference if available
    const savedVoice = localStorage.getItem('gissuf_voice');
    if (savedVoice) {
      const found = this.voices.find(v => v.name === savedVoice);
      if (found) {
        this.selectedVoice = found;
        this.selectVoice.value = found.name;
      }
    }
  }

  speak(text, onComplete = null) {
    if (!this.synth) {
      if (onComplete) onComplete();
      return;
    }

    // Stop any existing utterance
    this.stopSpeaking();

    // Clean text for speech (strip markdown asterisks, hashes, backticks, HTML tags)
    const cleanedText = text
      .replace(/<[^>]*>/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!cleanedText) {
      if (onComplete) onComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.speechRate;
    utterance.pitch = this.speechPitch;
    utterance.volume = this.speechVolume;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (window.rukkyAvatar) {
        window.rukkyAvatar.setState(window.rukkyAvatar.STATES.SPEAKING);
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (window.rukkyAvatar) {
        window.rukkyAvatar.setState(window.rukkyAvatar.STATES.IDLE);
      }
      if (onComplete) onComplete();
    };

    utterance.onerror = (event) => {
      console.warn("[GISSUF] Speech synthesis error:", event);
      this.isSpeaking = false;
      if (window.rukkyAvatar) {
        window.rukkyAvatar.setState(window.rukkyAvatar.STATES.IDLE);
      }
      if (onComplete) onComplete();
    };

    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    if (window.rukkyAvatar && window.rukkyAvatar.currentState === window.rukkyAvatar.STATES.SPEAKING) {
      window.rukkyAvatar.setState(window.rukkyAvatar.STATES.IDLE);
    }
  }

  setupEvents() {
    // Mic Toggle Button
    if (this.btnToggleMic) {
      this.btnToggleMic.addEventListener('click', () => {
        this.toggleMicrophone();
      });
    }

    // Stop Speaking Button
    if (this.btnStopSpeaking) {
      this.btnStopSpeaking.addEventListener('click', () => {
        this.stopSpeaking();
      });
    }

    // Voice Selection Changed
    if (this.selectVoice) {
      this.selectVoice.addEventListener('change', (e) => {
        const voiceName = e.target.value;
        const found = this.voices.find(v => v.name === voiceName);
        if (found) {
          this.selectedVoice = found;
          localStorage.setItem('gissuf_voice', found.name);
        }
      });
    }

    // Speech Rate Slider
    if (this.rangeSpeechRate) {
      this.rangeSpeechRate.addEventListener('input', (e) => {
        this.speechRate = parseFloat(e.target.value);
        if (this.valSpeechRate) this.valSpeechRate.textContent = `${this.speechRate.toFixed(2)}x`;
        localStorage.setItem('gissuf_speech_rate', this.speechRate);
      });
    }

    // Speech Pitch Slider
    if (this.rangeSpeechPitch) {
      this.rangeSpeechPitch.addEventListener('input', (e) => {
        this.speechPitch = parseFloat(e.target.value);
        if (this.valSpeechPitch) this.valSpeechPitch.textContent = this.speechPitch.toFixed(2);
        localStorage.setItem('gissuf_speech_pitch', this.speechPitch);
      });
    }

    // Speech Volume Slider
    if (this.rangeSpeechVolume) {
      this.rangeSpeechVolume.addEventListener('input', (e) => {
        this.speechVolume = parseFloat(e.target.value);
        const pct = Math.round(this.speechVolume * 100);
        if (this.valSpeechVolume) this.valSpeechVolume.textContent = `${pct}%`;
        localStorage.setItem('gissuf_speech_volume', this.speechVolume);
      });
    }
  }
}

// Global Speech Engine instance
window.speechEngine = new SpeechEngine();
