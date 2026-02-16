/**
 * ============================================================================
 * MEETING SCHEDULER WIDGET — klinteng.com Integration
 * ============================================================================
 * Floating chat widget that lets recruiters schedule meetings with Klinten.
 * Matches the site's Navy + Gold design system with dark-mode support.
 * ============================================================================
 */

class MeetingSchedulerWidget {
  constructor(config = {}) {
    this.config = {
      apiUrl:  config.apiUrl  || 'http://localhost:8001',
      wsUrl:   config.wsUrl   || 'ws://localhost:8001/ws',
      position: config.position || 'bottom-left',
      ...config,
    };

    this.isOpen = false;
    this.isConnected = false;
    this.isTyping = false;
    this.messages = [];
    this.ws = null;
    this.sessionId = null;
    this.reconnectAttempts = 0;
    this.maxReconnect = 5;

    this.init();
  }

  init() {
    this.injectStyles();
    this.createWidget();
    this.attachListeners();
    this.observeTheme();
  }

  /* ────────────────────────────────────────────────────
     STYLES — uses site's CSS variables for consistency
     ──────────────────────────────────────────────────── */

  injectStyles() {
    if (document.getElementById('mtg-widget-styles')) return;

    const s = document.createElement('style');
    s.id = 'mtg-widget-styles';
    s.textContent = `
      /* ── Container ─────────────── */
      .mtg-widget {
        position: fixed;
        bottom: 24px;
        left: 24px;
        z-index: 10000;
        font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
      }

      /* ── Floating Button ────────── */
      .mtg-fab {
        width: 58px; height: 58px; border-radius: 50%;
        background: var(--gradient-primary, linear-gradient(135deg, #1b2d4e 0%, #2a4470 100%));
        border: 2px solid var(--accent, #c9a84c);
        cursor: pointer;
        box-shadow: var(--shadow-lg), 0 0 20px rgba(201, 168, 76, 0.2);
        display: flex; align-items: center; justify-content: center;
        transition: var(--transition, all 0.3s ease);
        position: relative;
      }
      .mtg-fab:hover {
        transform: scale(1.08);
        box-shadow: var(--shadow-xl), 0 0 30px rgba(201, 168, 76, 0.35);
      }
      .mtg-fab svg {
        width: 26px; height: 26px; fill: var(--accent, #c9a84c);
        transition: var(--transition);
      }
      .mtg-fab:hover svg { fill: var(--accent-light, #d4b86a); }

      .mtg-fab-label {
        position: absolute;
        top: -8px; right: -8px;
        background: var(--accent, #c9a84c);
        color: var(--primary-dark, #0f1e36);
        font-size: 9px; font-weight: 700; text-transform: uppercase;
        padding: 2px 7px; border-radius: 10px;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 6px rgba(201,168,76,.4);
      }

      /* Pulse ring */
      .mtg-fab::before {
        content: '';
        position: absolute;
        width: 100%; height: 100%;
        border-radius: 50%;
        border: 2px solid var(--accent, #c9a84c);
        animation: mtgPulse 2.5s infinite;
        pointer-events: none;
      }
      @keyframes mtgPulse {
        0%   { transform: scale(1);   opacity: 0.6; }
        100% { transform: scale(1.7); opacity: 0; }
      }

      /* ── Chat Window ────────────── */
      .mtg-window {
        width: 400px; height: 600px;
        background: var(--bg-card, #ffffff);
        border: 1px solid var(--border, #e2e0dc);
        border-radius: var(--radius-lg, 16px);
        box-shadow: var(--shadow-xl);
        display: none; flex-direction: column;
        overflow: hidden;
        animation: mtgSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
        margin-bottom: 12px;
      }
      .mtg-window.open { display: flex; }

      @keyframes mtgSlideUp {
        from { opacity: 0; transform: translateY(16px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

      /* ── Header ────────────────── */
      .mtg-header {
        background: var(--gradient-primary, linear-gradient(135deg, #1b2d4e 0%, #2a4470 100%));
        padding: 18px 20px;
        display: flex; justify-content: space-between; align-items: center;
      }
      .mtg-header-left {
        display: flex; align-items: center; gap: 12px;
      }
      .mtg-header-icon {
        width: 42px; height: 42px; border-radius: var(--radius-md, 12px);
        background: rgba(201, 168, 76, 0.15);
        border: 1px solid rgba(201, 168, 76, 0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px;
      }
      .mtg-header h3 {
        margin: 0; font-size: 15px; font-weight: 600;
        color: #ffffff;
      }
      .mtg-header-status {
        font-size: 12px; margin-top: 2px; display: flex;
        align-items: center; gap: 4px;
      }
      .mtg-header-status .dot {
        width: 7px; height: 7px; border-radius: 50%;
        display: inline-block;
      }
      .mtg-header-status .dot.online  { background: #34d399; box-shadow: 0 0 6px #34d399; }
      .mtg-header-status .dot.offline { background: #f87171; }
      .mtg-header-status span { color: rgba(255,255,255,.75); }

      .mtg-close {
        background: rgba(255,255,255,.08); border: none; color: #fff;
        width: 32px; height: 32px; border-radius: var(--radius-sm, 8px);
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        font-size: 18px; transition: background .2s;
      }
      .mtg-close:hover { background: rgba(255,255,255,.18); }

      /* ── Messages ──────────────── */
      .mtg-messages {
        flex: 1; overflow-y: auto; padding: 20px;
        display: flex; flex-direction: column; gap: 14px;
        background: var(--bg-secondary, #f2f0ec);
      }
      .mtg-messages::-webkit-scrollbar { width: 5px; }
      .mtg-messages::-webkit-scrollbar-track { background: transparent; }
      .mtg-messages::-webkit-scrollbar-thumb {
        background: var(--border, #e2e0dc); border-radius: 10px;
      }

      /* Bubbles */
      .mtg-bubble {
        display: flex; flex-direction: column;
        max-width: 82%; animation: mtgFadeIn 0.3s ease;
      }
      @keyframes mtgFadeIn {
        from { opacity:0; transform:translateY(8px); }
        to   { opacity:1; transform:translateY(0); }
      }

      .mtg-bubble.user      { align-self: flex-end; }
      .mtg-bubble.assistant  { align-self: flex-start; }

      .mtg-bubble-body {
        padding: 12px 16px; border-radius: var(--radius-md, 12px);
        font-size: 14px; line-height: 1.6; word-wrap: break-word;
      }
      .mtg-bubble.user .mtg-bubble-body {
        background: var(--gradient-primary, linear-gradient(135deg, #1b2d4e 0%, #2a4470 100%));
        color: #ffffff;
        border-bottom-right-radius: 4px;
      }
      .mtg-bubble.assistant .mtg-bubble-body {
        background: var(--bg-card, #ffffff);
        color: var(--text-primary, #1a1a1a);
        border: 1px solid var(--border, #e2e0dc);
        border-bottom-left-radius: 4px;
      }

      /* Markdown inside bubbles */
      .mtg-bubble-body strong { font-weight: 600; color: var(--accent, #c9a84c); }
      .mtg-bubble.user .mtg-bubble-body strong { color: var(--accent-light, #d4b86a); }
      .mtg-bubble-body ul, .mtg-bubble-body ol {
        margin: 6px 0; padding-left: 18px;
      }
      .mtg-bubble-body li { margin: 3px 0; }

      .mtg-bubble-time {
        font-size: 10px; color: var(--text-tertiary, #8a8a8a);
        margin-top: 4px; padding: 0 4px;
      }
      .mtg-bubble.user .mtg-bubble-time { text-align: right; }

      /* Typing dots */
      .mtg-dots { display: flex; gap: 5px; padding: 12px 16px; align-items: center; }
      .mtg-dots span {
        width: 7px; height: 7px; border-radius: 50%;
        background: var(--text-tertiary, #8a8a8a);
        animation: mtgBounce 1.4s infinite;
      }
      .mtg-dots span:nth-child(2) { animation-delay: .15s; }
      .mtg-dots span:nth-child(3) { animation-delay: .3s; }
      @keyframes mtgBounce {
        0%,60%,100% { transform:translateY(0); opacity:.3; }
        30%         { transform:translateY(-6px); opacity:1; }
      }

      /* ── Input Area ────────────── */
      .mtg-input-area {
        padding: 14px 16px;
        background: var(--bg-card, #ffffff);
        border-top: 1px solid var(--border, #e2e0dc);
        display: flex; gap: 10px; align-items: center;
      }

      .mtg-input {
        flex: 1; padding: 11px 16px;
        border: 1px solid var(--border, #e2e0dc);
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-secondary, #f2f0ec);
        color: var(--text-primary, #1a1a1a);
        font-size: 14px; font-family: inherit;
        outline: none; transition: var(--transition);
      }
      .mtg-input::placeholder { color: var(--text-tertiary, #8a8a8a); }
      .mtg-input:focus {
        border-color: var(--accent, #c9a84c);
        background: var(--bg-card, #ffffff);
        box-shadow: 0 0 0 3px var(--accent-glow, rgba(201,168,76,.15));
      }

      .mtg-send {
        width: 40px; height: 40px; border-radius: 50%;
        background: var(--gradient-primary);
        border: 1px solid var(--accent, #c9a84c);
        color: var(--accent, #c9a84c);
        cursor: pointer; display: flex;
        align-items: center; justify-content: center;
        font-size: 16px; transition: var(--transition);
      }
      .mtg-send:hover:not(:disabled) {
        box-shadow: var(--shadow-glow);
        transform: scale(1.06);
      }
      .mtg-send:disabled { opacity: .4; cursor: not-allowed; }

      /* ── Responsive ────────────── */
      @media (max-width: 480px) {
        .mtg-widget { left: 0; bottom: 0; right: 0; }
        .mtg-window {
          width: 100%; height: 100vh;
          border-radius: 0; margin-bottom: 0;
          position: fixed; top: 0; left: 0;
        }
        .mtg-fab { bottom: 16px; left: 16px; position: fixed; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ────────────────────────────────────────────────────
     DOM
     ──────────────────────────────────────────────────── */

  createWidget() {
    const el = document.createElement('div');
    el.className = 'mtg-widget';
    el.id = 'mtg-widget';
    el.innerHTML = `
      <div class="mtg-window" id="mtg-window">
        <div class="mtg-header">
          <div class="mtg-header-left">
            <div class="mtg-header-icon">📅</div>
            <div>
              <h3>Schedule a Meeting</h3>
              <div class="mtg-header-status">
                <span class="dot offline" id="mtg-dot"></span>
                <span id="mtg-status-text">Connecting…</span>
              </div>
            </div>
          </div>
          <button class="mtg-close" id="mtg-close" aria-label="Close scheduler">✕</button>
        </div>
        <div class="mtg-messages" id="mtg-messages"></div>
        <div class="mtg-input-area">
          <input class="mtg-input" id="mtg-input" type="text"
                 placeholder="Type your message…" disabled autocomplete="off" />
          <button class="mtg-send" id="mtg-send" disabled aria-label="Send">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
      <button class="mtg-fab" id="mtg-fab" aria-label="Schedule a meeting with Klinten">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
        </svg>
        <span class="mtg-fab-label">Meet</span>
      </button>
    `;
    document.body.appendChild(el);
  }

  attachListeners() {
    document.getElementById('mtg-fab').addEventListener('click', () => this.toggle());
    document.getElementById('mtg-close').addEventListener('click', () => this.toggle());
    document.getElementById('mtg-send').addEventListener('click', () => this.send());
    document.getElementById('mtg-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
    });
  }

  /** Watch for theme changes to keep widget in sync */
  observeTheme() {
    const html = document.documentElement;
    const obs = new MutationObserver(() => this.render());
    obs.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* ────────────────────────────────────────────────────
     Toggle open / close
     ──────────────────────────────────────────────────── */

  toggle() {
    this.isOpen = !this.isOpen;
    const win = document.getElementById('mtg-window');
    const fab = document.getElementById('mtg-fab');

    if (this.isOpen) {
      win.classList.add('open');
      fab.style.display = 'none';
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) this.connect();
      setTimeout(() => document.getElementById('mtg-input').focus(), 300);
    } else {
      win.classList.remove('open');
      fab.style.display = 'flex';
    }
  }

  /* ────────────────────────────────────────────────────
     WebSocket connection with auto-reconnect
     ──────────────────────────────────────────────────── */

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(this.config.wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.updateStatus(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.sessionId = data.session_id;
          this.addMessage('assistant', data.message, data.timestamp);
        } catch (e) {
          console.error('[MeetingWidget] Parse error:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.updateStatus(false);
        this.ws = null;
        if (this.isOpen && this.reconnectAttempts < this.maxReconnect) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.updateStatus(false);
      };
    } catch (err) {
      console.error('[MeetingWidget] Connection error:', err);
      this.updateStatus(false);
    }
  }

  updateStatus(online) {
    const dot = document.getElementById('mtg-dot');
    const txt = document.getElementById('mtg-status-text');
    const inp = document.getElementById('mtg-input');
    const btn = document.getElementById('mtg-send');

    if (online) {
      dot.className = 'dot online';
      txt.textContent = 'Online';
      inp.disabled = false;
      btn.disabled = false;
    } else {
      dot.className = 'dot offline';
      txt.textContent = this.reconnectAttempts > 0 ? 'Reconnecting…' : 'Offline';
      inp.disabled = true;
      btn.disabled = true;
    }
  }

  /* ────────────────────────────────────────────────────
     Messaging
     ──────────────────────────────────────────────────── */

  send() {
    const inp = document.getElementById('mtg-input');
    const text = inp.value.trim();
    if (!text || !this.ws || !this.isConnected) return;

    this.addMessage('user', text);
    this.ws.send(JSON.stringify({ message: text }));
    inp.value = '';
    this.isTyping = true;
    this.render();
  }

  addMessage(role, content, timestamp) {
    this.messages.push({
      role,
      content,
      timestamp: timestamp || new Date().toISOString(),
    });
    this.isTyping = false;
    this.render();
  }

  /* ────────────────────────────────────────────────────
     Render messages
     ──────────────────────────────────────────────────── */

  render() {
    const c = document.getElementById('mtg-messages');
    if (!c) return;

    c.innerHTML = this.messages.map(m => `
      <div class="mtg-bubble ${m.role}">
        <div class="mtg-bubble-body">${this.formatContent(m.content)}</div>
        <div class="mtg-bubble-time">${this.formatTime(m.timestamp)}</div>
      </div>
    `).join('');

    if (this.isTyping) {
      c.innerHTML += `
        <div class="mtg-bubble assistant">
          <div class="mtg-bubble-body">
            <div class="mtg-dots"><span></span><span></span><span></span></div>
          </div>
        </div>`;
    }

    c.scrollTop = c.scrollHeight;
  }

  /** Simple markdown → HTML (bold, lists, newlines) */
  formatContent(text) {
    let html = this.escapeHtml(text);
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    // Bullet lists: lines starting with * or -
    html = html.replace(/^[*\-]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/gs, '<ul>$&</ul>');
    // Newlines
    html = html.replace(/\n/g, '<br>');
    // Clean up <br> inside <ul>
    html = html.replace(/<ul><br>/g, '<ul>');
    html = html.replace(/<br><\/ul>/g, '</ul>');
    html = html.replace(/<\/li><br><li>/g, '</li><li>');
    return html;
  }

  escapeHtml(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  formatTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }
}


/* ── Auto-initialize ───────────────────────────────────────────────────────── */
(function () {
  function boot() {
    window.meetingSchedulerWidget = new MeetingSchedulerWidget({
      // ⚠ Change these URLs when you deploy the backend
      apiUrl: 'http://localhost:8001',
      wsUrl:  'ws://localhost:8001/ws',
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
