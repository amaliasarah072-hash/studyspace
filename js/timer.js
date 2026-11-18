/**
 * STUDYSPACE - Focus Timer Controller
 * Features 3 cozy themes (Candle with realistic glowing flicker, Ice with frosty crystal & melting puddle, Clock),
 * Fullscreen Focus Mode, 'E' key exit confirmation dialog, background timestamp accuracy, Study Points reward,
 * and CUSTOM DURATION CHOOSER (set any minutes you want!).
 */

class TimerController {
  constructor() {
    this.durationMinutes = 25;
    this.totalSeconds = 25 * 60;
    this.remainingSeconds = 25 * 60;
    this.theme = 'candle'; // 'clock', 'candle', 'ice'
    this.isRunning = false;
    this.intervalId = null;
    this.targetEndTime = null;
    this.isFocusMode = false;
    this.isBreakMode = false;

    // Listen for 'E' key or ESC to exit Focus Mode
    window.addEventListener('keydown', (e) => {
      if (this.isFocusMode) {
        if (e.key === 'e' || e.key === 'E' || e.key === 'Escape') {
          this.promptExitFocusMode();
        }
      }
    });
  }

  setDuration(min) {
    if (this.isRunning) {
      if (!confirm('Ubah durasi dan reset timer yang sedang berjalan?')) return;
      this.pause();
    }
    this.durationMinutes = parseInt(min, 10) || 25;
    this.totalSeconds = this.durationMinutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.isBreakMode = false;
    this.render();
  }

  applyCustomDuration() {
    const input = document.getElementById('timer-custom-minutes');
    if (!input) return;

    const val = parseInt(input.value, 10);
    if (!val || val <= 0 || val > 300) {
      window.app.showToast('Masukkan durasi belajar antara 1 sampai 300 menit', 'warning');
      return;
    }

    this.setDuration(val);
    window.soundEngine.playClick();
    window.app.showToast(`Durasi fokus diatur ke ${val} menit ✨`, 'success');
  }

  setTheme(themeName) {
    this.theme = themeName;
    window.soundEngine.playClick();
    this.renderThemeVisual();
  }

  start() {
    if (this.isRunning) return;
    window.soundEngine.playClick();
    this.isRunning = true;
    this.targetEndTime = Date.now() + this.remainingSeconds * 1000;

    this.intervalId = setInterval(() => {
      const now = Date.now();
      const diff = Math.round((this.targetEndTime - now) / 1000);

      if (diff <= 0) {
        this.remainingSeconds = 0;
        this.renderTimeDisplay();
        this.completeSession();
      } else {
        this.remainingSeconds = diff;
        this.renderTimeDisplay();
      }
    }, 250);

    this.updateControlsUI();
  }

  pause() {
    if (!this.isRunning) return;
    window.soundEngine.playClick();
    this.isRunning = false;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.updateControlsUI();
  }

  reset() {
    window.soundEngine.playClick();
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.renderTimeDisplay();
  }

  completeSession() {
    this.pause();
    window.soundEngine.playTimerComplete();

    if (this.isBreakMode) {
      window.app.showToast('Waktu istirahat selesai! Siap untuk sesi fokus berikutnya? ✨', 'info');
      this.isBreakMode = false;
      this.setDuration(25);
      return;
    }

    const spEarned = Math.max(5, Math.round((this.durationMinutes / 25) * 10));
    const data = window.store.userData;

    if (data) {
      const sessionKey = `timer_${Date.now()}`;
      window.store.awardSP(spEarned, `Sesi Focus Timer (${this.durationMinutes} menit)`, sessionKey, 'timer');

      data.timerHistory.unshift({
        id: 'th_' + Date.now(),
        durationMin: this.durationMinutes,
        theme: this.theme,
        timestamp: new Date().toISOString(),
        spEarned
      });

      window.store.updateQuestProgress('timer', this.durationMinutes);

      if (data.timerHistory.length >= 5) {
        window.store.unlockAchievement('focus_master');
      }

      window.store.saveUserData();
    }

    if (window.confetti) {
      window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }

    this.showCompletionModal(spEarned);
  }

  showCompletionModal(spEarned) {
    const modal = document.getElementById('timer-complete-modal');
    const msg = document.getElementById('timer-complete-sp');
    if (msg) msg.textContent = `+${spEarned} SP`;
    if (modal) modal.classList.remove('hidden');
  }

  startBreak(min = 5) {
    const modal = document.getElementById('timer-complete-modal');
    if (modal) modal.classList.add('hidden');

    this.isBreakMode = true;
    this.durationMinutes = min;
    this.totalSeconds = min * 60;
    this.remainingSeconds = min * 60;
    this.render();
    this.start();
    window.app.showToast(`Memulai waktu istirahat ${min} menit 🍵`, 'info');
  }

  toggleFocusMode() {
    this.isFocusMode = !this.isFocusMode;
    const body = document.body;
    const container = document.getElementById('view-timer');
    const overlay = document.getElementById('focus-mode-backdrop');

    if (this.isFocusMode) {
      body.classList.add('overflow-hidden');
      if (overlay) overlay.classList.remove('hidden');
      if (container) container.classList.add('focus-mode-active');
      window.app.showToast('Mode Fokus Aktif. Tekan tombol "E" untuk keluar.', 'info');
    } else {
      body.classList.remove('overflow-hidden');
      if (overlay) overlay.classList.add('hidden');
      if (container) container.classList.remove('focus-mode-active');
    }
    this.render();
  }

  promptExitFocusMode() {
    const exitModal = document.getElementById('focus-exit-modal');
    if (exitModal) exitModal.classList.remove('hidden');
  }

  confirmExitFocusMode() {
    const exitModal = document.getElementById('focus-exit-modal');
    if (exitModal) exitModal.classList.add('hidden');
    this.isFocusMode = false;
    document.body.classList.remove('overflow-hidden');
    const overlay = document.getElementById('focus-mode-backdrop');
    const container = document.getElementById('view-timer');
    if (overlay) overlay.classList.add('hidden');
    if (container) container.classList.remove('focus-mode-active');
    this.render();
  }

  cancelExitFocusMode() {
    const exitModal = document.getElementById('focus-exit-modal');
    if (exitModal) exitModal.classList.add('hidden');
  }

  renderTimeDisplay() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const displayEl = document.getElementById('timer-time-display');
    if (displayEl) displayEl.textContent = formatted;

    if (this.isRunning) {
      document.title = `(${formatted}) StudySpace Focus`;
    } else {
      document.title = 'StudySpace - Personal Student Platform';
    }

    const progress = (this.totalSeconds - this.remainingSeconds) / this.totalSeconds;
    this.updateThemeVisualProgress(progress);
  }

  updateControlsUI() {
    const startBtn = document.getElementById('timer-btn-start');
    const pauseBtn = document.getElementById('timer-btn-pause');

    if (startBtn && pauseBtn) {
      if (this.isRunning) {
        startBtn.classList.add('hidden');
        pauseBtn.classList.remove('hidden');
      } else {
        startBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
      }
    }
  }

  renderThemeVisual() {
    const visualContainer = document.getElementById('timer-theme-visual');
    if (!visualContainer) return;

    document.querySelectorAll('.timer-theme-tab').forEach(tab => {
      if (tab.dataset.theme === this.theme) {
        tab.classList.add('bg-white', 'shadow-xs', 'text-slate-800');
        tab.classList.remove('text-slate-500');
      } else {
        tab.classList.remove('bg-white', 'shadow-xs', 'text-slate-800');
        tab.classList.add('text-slate-500');
      }
    });

    if (this.theme === 'candle') {
      // Realistic Glowing Candle with Flickering Double Core & Wax Drips
      visualContainer.innerHTML = `
        <div class="relative w-44 h-56 flex flex-col items-center justify-end select-none">
          <!-- Warm Ambient Glow Halo -->
          <div class="w-32 h-32 rounded-full bg-amber-200/40 filter blur-xl absolute -top-2 z-0 animate-pulse"></div>

          <!-- Flame Container -->
          <div class="relative flex flex-col items-center top-6 z-20">
            <!-- Outer Flame Halo -->
            <div class="w-7 h-12 rounded-full bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-200 flame-anim flex items-center justify-center shadow-lg">
              <!-- Inner Hot Core -->
              <div class="w-3.5 h-6 rounded-full bg-gradient-to-t from-blue-300 via-white to-yellow-100 flame-inner"></div>
            </div>
            <!-- Black Twisted Wick -->
            <div class="w-1.5 h-4 bg-stone-900 rounded-t -mt-1"></div>
          </div>

          <!-- Candle Body with dynamic melting height -->
          <div id="candle-wax-body" class="w-24 bg-gradient-to-r from-amber-50 via-pink-50 to-orange-50 rounded-t-2xl rounded-b-lg border-2 border-amber-200/80 shadow-md transition-all duration-700 relative z-10 flex flex-col justify-start overflow-hidden" style="height: 120px;">
            <!-- Dripping wax beads -->
            <div class="w-full flex justify-around px-2 pt-1 opacity-80">
              <span class="w-2 h-5 bg-pink-100 rounded-full shadow-2xs"></span>
              <span class="w-2.5 h-7 bg-pink-100 rounded-full shadow-2xs"></span>
              <span class="w-2 h-4 bg-pink-100 rounded-full shadow-2xs"></span>
            </div>
            <div class="mt-auto pb-1 text-center text-[9px] font-bold text-amber-700/60 uppercase tracking-widest">
              Cozy Warmth
            </div>
          </div>

          <!-- Candle Ceramic Saucer Base -->
          <div class="w-36 h-4 bg-gradient-to-r from-stone-200 via-cream-300 to-stone-200 rounded-full -mt-2 border border-stone-300 z-10 shadow-xs"></div>
        </div>
      `;
    } else if (this.theme === 'ice') {
      // 3D Translucent Frosted Crystal Cube with Glint & Expanding Puddle
      visualContainer.innerHTML = `
        <div class="relative w-48 h-56 flex flex-col items-center justify-end select-none">
          <!-- Frost Cold Glow Halo -->
          <div class="w-36 h-36 rounded-full bg-sky-200/40 filter blur-xl absolute top-6 z-0 animate-pulse"></div>

          <!-- Floating Frost Sparkles -->
          <div class="absolute top-4 flex justify-between w-32 px-1 text-base z-20 pointer-events-none">
            <span class="animate-bounce" style="animation-duration: 2.5s;">❄️</span>
            <span class="animate-bounce" style="animation-duration: 3.2s; animation-delay: 0.5s;">✨</span>
          </div>

          <!-- 3D Frosted Crystal Ice Cube -->
          <div id="ice-cube-body" class="w-28 h-28 bg-gradient-to-br from-white/90 via-sky-100/90 to-blue-200/90 rounded-3xl border-2 border-sky-300 shadow-xl ice-anim flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md z-10 transition-all duration-700">
            <!-- Glass glare / diagonal sheen -->
            <div class="absolute -top-10 -left-10 w-24 h-24 bg-white/40 rounded-full filter blur-sm transform rotate-45 pointer-events-none"></div>
            <!-- Crystal Facet Lines -->
            <svg class="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100">
              <line x1="20" y1="20" x2="80" y2="80" stroke="#0284C7" stroke-width="2" />
              <line x1="80" y1="20" x2="20" y2="80" stroke="#0284C7" stroke-width="2" />
            </svg>
            <span class="text-3xl relative z-10 filter drop-shadow-xs">🧊</span>
            <span class="text-[10px] font-black tracking-wider text-sky-800 uppercase mt-1 relative z-10">Cool Focus</span>
          </div>

          <!-- Melting Water Pool with Soft Ripple -->
          <div id="ice-puddle" class="w-32 h-5 bg-gradient-to-r from-sky-300/40 via-blue-300/60 to-sky-300/40 rounded-full filter blur-2xs mt-3 water-ripple-anim z-0 transition-all duration-700"></div>
        </div>
      `;
    } else {
      // Clock Theme
      visualContainer.innerHTML = `
        <div class="relative w-44 h-44 flex items-center justify-center select-none">
          <div class="w-full h-full rounded-full border-4 border-dashed border-lavender-300 flex items-center justify-center clock-ring-anim">
            <div class="w-32 h-32 rounded-full bg-lavender-50 border-2 border-lavender-200 flex flex-col items-center justify-center shadow-inner">
              <span class="text-3xl mb-1">⏰</span>
              <span class="text-[11px] font-bold text-lavender-700 uppercase tracking-wider">Tick Tock</span>
            </div>
          </div>
        </div>
      `;
    }

    this.renderTimeDisplay();
  }

  updateThemeVisualProgress(progress) {
    if (this.theme === 'candle') {
      const wax = document.getElementById('candle-wax-body');
      if (wax) {
        // Wax burns down from 120px to 45px smoothly
        const currentHeight = Math.max(45, Math.round(120 - (progress * 75)));
        wax.style.height = `${currentHeight}px`;
      }
    } else if (this.theme === 'ice') {
      const cube = document.getElementById('ice-cube-body');
      const puddle = document.getElementById('ice-puddle');
      if (cube && puddle) {
        // Ice cube shrinks slightly from 1.0 to 0.72
        const scale = Math.max(0.72, 1 - (progress * 0.28));
        cube.style.transform = `scale(${scale})`;
        // Puddle expands from 128px to 175px
        puddle.style.width = `${Math.round(128 + progress * 47)}px`;
      }
    }
  }

  render() {
    this.renderThemeVisual();
    this.renderTimeDisplay();
    this.updateControlsUI();

    document.querySelectorAll('.timer-preset-btn').forEach(btn => {
      const min = parseInt(btn.dataset.min, 10);
      if (min === this.durationMinutes) {
        btn.classList.add('bg-lavender-500', 'text-white', 'shadow-xs');
        btn.classList.remove('bg-white', 'text-slate-700');
      } else {
        btn.classList.remove('bg-lavender-500', 'text-white', 'shadow-xs');
        btn.classList.add('bg-white', 'text-slate-700');
      }
    });

    const historyList = document.getElementById('timer-history-list');
    const data = window.store.userData;
    if (historyList && data) {
      if (data.timerHistory.length === 0) {
        historyList.innerHTML = `<p class="col-span-full text-xs text-muted text-center py-4">Belum ada sesi belajar hari ini. Mulai sesi pertamamu!</p>`;
      } else {
        historyList.innerHTML = data.timerHistory.slice(0, 4).map(th => `
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-cream-200 text-xs">
            <div class="flex items-center gap-2">
              <span>${th.theme === 'candle' ? '🕯️' : th.theme === 'ice' ? '🧊' : '⏰'}</span>
              <div>
                <p class="font-bold text-main">${th.durationMin} Menit Fokus</p>
                <p class="text-[10px] text-muted">${new Date(th.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <span class="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">+${th.spEarned} SP</span>
          </div>
        `).join('');
      }
    }
  }
}

window.timerController = new TimerController();
