/**
 * GISSUF AI Avatar — Version 0.1
 * Conversation Stream & Message Manager
 * Company: GISSUF Technology
 * Character: Rukky (AI Student)
 */

class ChatManager {
  constructor() {
    this.chatMessagesContainer = document.getElementById('chatMessages');
    this.btnClearChat = document.getElementById('btnClearChat');
    this.conversationHistory = [];
    this.activeTypingElement = null;

    this.init();
  }

  init() {
    if (this.btnClearChat) {
      this.btnClearChat.addEventListener('click', () => this.clearHistory());
    }

    // Attach read aloud event listener for existing welcome message
    this.attachReadAloudHandlers();
  }

  attachReadAloudHandlers() {
    if (!this.chatMessagesContainer) return;
    const buttons = this.chatMessagesContainer.querySelectorAll('.btn-read-aloud');
    buttons.forEach((btn) => {
      if (!btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', (e) => {
          const body = e.target.closest('.msg-body');
          if (body) {
            const textElem = body.querySelector('.msg-text');
            if (textElem && window.speechEngine) {
              window.speechEngine.speak(textElem.innerText);
            }
          }
        });
      }
    });
  }

  addUserMessage(text) {
    const timeStr = this.getFormattedTime();
    const msgElement = document.createElement('div');
    msgElement.className = 'chat-message user-message';
    msgElement.innerHTML = `
      <div class="msg-avatar-icon">
        <span>U</span>
      </div>
      <div class="msg-body">
        <div class="msg-meta">
          <span class="msg-time">${timeStr}</span>
          <span class="msg-sender">You</span>
        </div>
        <div class="msg-text">${this.escapeHtml(text)}</div>
      </div>
    `;

    this.chatMessagesContainer.appendChild(msgElement);
    this.scrollToBottom();

    this.conversationHistory.push({ role: 'user', content: text });
  }

  showTypingIndicator() {
    if (this.activeTypingElement) return;

    const timeStr = this.getFormattedTime();
    const typingElem = document.createElement('div');
    typingElem.className = 'chat-message rukky-message typing-indicator-msg';
    typingElem.innerHTML = `
      <div class="msg-avatar-icon">
        <span>R</span>
      </div>
      <div class="msg-body">
        <div class="msg-meta">
          <span class="msg-sender">Rukky</span>
          <span class="msg-badge">AI Student</span>
          <span class="msg-time">${timeStr}</span>
        </div>
        <div class="msg-text">
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;

    this.chatMessagesContainer.appendChild(typingElem);
    this.activeTypingElement = typingElem;
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    if (this.activeTypingElement) {
      this.activeTypingElement.remove();
      this.activeTypingElement = null;
    }
  }

  addRukkyMessage(replyText, source = 'demo_curated', modeLabel = 'Demonstration Persona') {
    this.hideTypingIndicator();

    const timeStr = this.getFormattedTime();
    const isLive = source === 'live_llm';
    const tagClass = isLive ? 'live-ai-tag' : 'demo-tag';
    const tagText = isLive ? 'Live AI Connected' : 'Curated Demonstration';

    const msgElement = document.createElement('div');
    msgElement.className = 'chat-message rukky-message';
    msgElement.innerHTML = `
      <div class="msg-avatar-icon">
        <span>R</span>
      </div>
      <div class="msg-body">
        <div class="msg-meta">
          <span class="msg-sender">Rukky</span>
          <span class="msg-badge">AI Student</span>
          <span class="msg-tag ${tagClass}">${tagText}</span>
          <span class="msg-time">${timeStr}</span>
        </div>
        <div class="msg-text">${this.formatMessageBody(replyText)}</div>
        <div class="msg-actions">
          <button class="msg-action-btn btn-read-aloud" title="Read aloud">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <span>Listen</span>
          </button>
        </div>
      </div>
    `;

    this.chatMessagesContainer.appendChild(msgElement);
    this.attachReadAloudHandlers();
    this.scrollToBottom();

    this.conversationHistory.push({ role: 'assistant', content: replyText });
  }

  clearHistory() {
    if (confirm("Are you sure you want to clear the conversation history?")) {
      this.conversationHistory = [];
      this.chatMessagesContainer.innerHTML = '';
      
      // Re-insert initial welcome message
      this.addRukkyMessage(
        "Conversation cleared! I am Rukky, ready for our next AI training topic. What would you like to explore?",
        'demo_curated'
      );
    }
  }

  scrollToBottom() {
    if (this.chatMessagesContainer) {
      this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
    }
  }

  getFormattedTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
  }

  formatMessageBody(rawText) {
    // Basic safe formatting: bold, line breaks, code spans
    let text = this.escapeHtml(rawText);
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\n\n/g, '<br><br>');
    text = text.replace(/\n/g, '<br>');
    return text;
  }
}

// Global Chat Manager instance
window.chatManager = new ChatManager();
