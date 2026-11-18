/**
 * STUDYSPACE - Main Application Orchestrator
 * Coordinates Navigation, Routing, Modals, Avatar Creator (with Female/Male distinctions),
 * Toasts, Themes, and UI Updates.
 */

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.tempAvatarConfig = null;
    this.isFirstTimeAvatarSetup = false;
  }

  init() {
    // 1. Initialize data store
    window.store.init();

    // 2. Set theme immediately
    const savedTheme = localStorage.getItem('studyspace_active_theme') || (window.store.userData ? window.store.userData.theme : 'cream');
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);

    // 3. Setup avatar temp config
    if (window.store.userData) {
      this.tempAvatarConfig = { ...window.store.userData.avatar };
    } else {
      this.tempAvatarConfig = { ...window.DEFAULT_AVATAR };
    }

    // 4. Render initial view
    this.navigate('dashboard');
    this.renderAll();

    // 5. If no logged in user, open auth modal
    if (!window.store.currentUser) {
      setTimeout(() => {
        this.openAuthModal('login');
      }, 200);
    }

    // 6. Setup global event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    const drawerBackdrop = document.getElementById('mobile-drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', () => this.closeMobileDrawer());
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  // Navigation Router
  navigate(viewName) {
    window.soundEngine.playClick();
    this.currentView = viewName;

    // Hide all view containers
    document.querySelectorAll('.view-container').forEach(el => {
      el.classList.add('hidden');
    });

    // Show target view
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active state in desktop sidebar
    document.querySelectorAll('.nav-link-btn').forEach(btn => {
      if (btn.dataset.view === viewName) {
        btn.classList.add('bg-lavender-100', 'text-lavender-900', 'font-bold');
        btn.classList.remove('text-slate-600', 'hover:bg-slate-100/60');
      } else {
        btn.classList.remove('bg-lavender-100', 'text-lavender-900', 'font-bold');
        btn.classList.add('text-slate-600', 'hover:bg-slate-100/60');
      }
    });

    // Update active state in mobile bottom bar
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      if (btn.dataset.view === viewName) {
        btn.classList.add('text-lavender-600', 'font-bold');
        btn.classList.remove('text-slate-400');
      } else {
        btn.classList.remove('text-lavender-600', 'font-bold');
        btn.classList.add('text-slate-400');
      }
    });

    this.closeMobileDrawer();
    this.renderCurrentView();
  }

  renderCurrentView() {
    switch (this.currentView) {
      case 'dashboard':
        window.dashboardController.render();
        break;
      case 'tasks':
        window.tasksController.render();
        break;
      case 'schedule':
        window.scheduleController.render();
        break;
      case 'notes':
        window.notesController.render();
        break;
      case 'goals':
        window.goalsController.render();
        break;
      case 'timer':
        window.timerController.render();
        break;
      case 'music':
        window.musicController.render();
        break;
      case 'brain':
        window.brainCornerController.render();
        break;
      case 'tracker':
        window.trackerController.render();
        break;
      case 'quests':
        window.questsController.render();
        break;
      case 'achievements':
        window.achievementsController.render();
        break;
      case 'avatar':
        this.renderAvatarPage();
        break;
      case 'settings':
        window.settingsController.render();
        break;
    }
  }

  renderAll() {
    const data = window.store.userData;
    const user = window.store.currentUser;

    if (!user || !data) {
      // Unauthenticated view
      const userHeaderName = document.getElementById('header-user-name');
      const headerStreak = document.getElementById('header-streak-pill');
      const headerSP = document.getElementById('header-sp-pill');
      if (userHeaderName) userHeaderName.textContent = 'Tamu (Belum Masuk)';
      if (headerStreak) headerStreak.textContent = '0 🔥';
      if (headerSP) headerSP.textContent = '0 SP';
      return;
    }

    // Header updates
    const userHeaderName = document.getElementById('header-user-name');
    const headerAvatar = document.getElementById('header-avatar-circle');
    const headerStreak = document.getElementById('header-streak-pill');
    const headerSP = document.getElementById('header-sp-pill');

    if (userHeaderName) userHeaderName.textContent = user.name;
    if (headerAvatar && window.AvatarRenderer) {
      headerAvatar.innerHTML = window.AvatarRenderer.renderSVG(data.avatar, 38);
    }
    if (headerStreak) headerStreak.textContent = `${data.streak.current} 🔥`;
    if (headerSP) headerSP.textContent = `${data.studyPoints} SP`;

    // Sidebar Avatar & Level Info
    const sidebarAvatar = document.getElementById('sidebar-avatar-circle');
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarLvl = document.getElementById('sidebar-user-level');
    const lvlInfo = window.store.getLevelInfo();

    if (sidebarAvatar && window.AvatarRenderer) {
      sidebarAvatar.innerHTML = window.AvatarRenderer.renderSVG(data.avatar, 44);
    }
    if (sidebarName) sidebarName.textContent = user.name;
    if (sidebarLvl) sidebarLvl.textContent = `Lvl ${lvlInfo.currentLevel} • ${lvlInfo.name}`;

    this.renderCurrentView();
  }

  toggleMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (drawer && backdrop) {
      const isHidden = drawer.classList.contains('-translate-x-full');
      if (isHidden) {
        drawer.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
      } else {
        this.closeMobileDrawer();
      }
    }
  }

  closeMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (drawer) drawer.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✨',
      warning: '⚠️',
      error: '❌',
      info: '🌸'
    };

    const borderColors = {
      success: 'border-sage-300',
      warning: 'border-butter-300',
      error: 'border-pink-300',
      info: 'border-lavender-300'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${borderColors[type] || 'border-cream-200'}`;
    toast.innerHTML = `
      <span class="text-xl shrink-0">${icons[type] || '🌸'}</span>
      <p class="text-xs sm:text-sm font-semibold text-main flex-1">${message}</p>
      <button onclick="this.parentElement.remove()" class="text-slate-300 hover:text-slate-600 text-sm ml-2">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3800);
  }

  showLevelUpModal(newLevel) {
    const modal = document.getElementById('level-up-modal');
    const lvlText = document.getElementById('modal-level-text');
    const tier = LEVEL_THRESHOLDS.find(t => t.level === newLevel);

    if (lvlText && tier) {
      lvlText.textContent = `Level ${newLevel}: ${tier.name} ${tier.badge}`;
    }
    if (modal) modal.classList.remove('hidden');

    window.soundEngine.playFanfare();
    if (window.confetti) {
      window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  }

  closeLevelUpModal() {
    const modal = document.getElementById('level-up-modal');
    if (modal) modal.classList.add('hidden');
  }

  showAchievementToast(ach) {
    window.soundEngine.playFanfare();
    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    this.showToast(`Achievement Terbuka: ${ach.title} ${ach.icon}! (+30 SP)`, 'success');
    this.renderAll();
  }

  openAuthModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.switchAuthTab(tab);
    }
  }

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('hidden');
  }

  switchAuthTab(tab) {
    const loginForm = document.getElementById('auth-form-login');
    const regForm = document.getElementById('auth-form-register');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabReg = document.getElementById('auth-tab-register');

    if (tab === 'login') {
      if (loginForm) loginForm.classList.remove('hidden');
      if (regForm) regForm.classList.add('hidden');
      if (tabLogin) tabLogin.className = 'w-1/2 py-2 rounded-xl text-xs font-bold bg-white text-main shadow-xs';
      if (tabReg) tabReg.className = 'w-1/2 py-2 rounded-xl text-xs font-semibold text-muted hover:text-main';
    } else {
      if (loginForm) loginForm.classList.add('hidden');
      if (regForm) regForm.classList.remove('hidden');
      if (tabReg) tabReg.className = 'w-1/2 py-2 rounded-xl text-xs font-bold bg-white text-main shadow-xs';
      if (tabLogin) tabLogin.className = 'w-1/2 py-2 rounded-xl text-xs font-semibold text-muted hover:text-main';
    }
  }

  loginAsGuest() {
    // Quick demo student login
    const demoUsername = 'siswa_demo';
    const users = window.store.getAllUsers();
    let demoUser = users.find(u => u.username === demoUsername);

    if (!demoUser) {
      demoUser = {
        id: 'student_demo_' + Date.now(),
        username: demoUsername,
        name: 'Siswa Tamu',
        grade: 'Pelajar',
        bio: 'Mencoba fitur seru StudySpace ✨',
        browserAccount: 'siswa_demo@chrome-student.id',
        passwordHash: 'demo123',
        createdAt: new Date().toISOString()
      };
      users.push(demoUser);
      window.store.saveUsers(users);
      const cleanData = window.store.createInitialUserData(demoUser);
      window.store.saveUserData(demoUser.id, cleanData);
    }

    window.authController.login(demoUsername, 'demo123');
  }

  // ==========================================
  // AVATAR CREATOR WITH DYNAMIC GENDER SWITCH
  // ==========================================
  openAvatarModal(isFirstTime = false) {
    this.isFirstTimeAvatarSetup = isFirstTime;
    const data = window.store.userData;
    this.tempAvatarConfig = data ? { ...data.avatar } : { ...window.DEFAULT_AVATAR };

    const modal = document.getElementById('avatar-modal');
    if (modal) {
      modal.classList.remove('hidden');
      this.renderAvatarCreatorControls('avatar-modal-controls', 'avatar-modal-preview');
    }
  }

  closeAvatarModal() {
    const modal = document.getElementById('avatar-modal');
    if (modal) modal.classList.add('hidden');

    if (this.isFirstTimeAvatarSetup) {
      this.isFirstTimeAvatarSetup = false;
      setTimeout(() => {
        window.authController.startTutorial(0);
      }, 400);
    }
  }

  renderAvatarPage() {
    const data = window.store.userData;
    if (!data) return;
    this.tempAvatarConfig = { ...data.avatar };
    this.renderAvatarCreatorControls('avatar-page-controls', 'avatar-page-preview');
  }

  updateTempAvatar(key, value, controlsId = null, previewId = null) {
    if (!this.tempAvatarConfig) this.tempAvatarConfig = { ...window.DEFAULT_AVATAR };

    this.tempAvatarConfig[key] = value;

    // Special logic when Gender switches: auto adapt default hair & outfit
    if (key === 'gender') {
      if (value === 'male') {
        this.tempAvatarConfig.hairStyle = 'short';
        this.tempAvatarConfig.outfit = 'hoodie_m';
      } else {
        this.tempAvatarConfig.hairStyle = 'hijab';
        this.tempAvatarConfig.outfit = 'cardigan';
      }
    }

    window.soundEngine.playClick();

    // Re-render preview immediately
    const modalPreview = document.getElementById('avatar-modal-preview');
    const pagePreview = document.getElementById('avatar-page-preview');

    if (modalPreview && window.AvatarRenderer) {
      modalPreview.innerHTML = window.AvatarRenderer.renderSVG(this.tempAvatarConfig, 180);
    }
    if (pagePreview && window.AvatarRenderer) {
      pagePreview.innerHTML = window.AvatarRenderer.renderSVG(this.tempAvatarConfig, 180);
    }

    // Re-render controls to reflect selected button highlights!
    if (controlsId && previewId) {
      this.renderAvatarCreatorControls(controlsId, previewId);
    } else {
      if (modalPreview) this.renderAvatarCreatorControls('avatar-modal-controls', 'avatar-modal-preview');
      if (pagePreview) this.renderAvatarCreatorControls('avatar-page-controls', 'avatar-page-preview');
    }
  }

  saveAvatarChanges() {
    const data = window.store.userData;
    if (!data) return;

    data.avatar = { ...this.tempAvatarConfig };
    window.store.saveUserData();
    window.store.unlockAchievement('first_step');

    window.soundEngine.playSuccess();
    if (window.confetti) {
      window.confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
    this.showToast('Avatar barumu berhasil disimpan! 🌸', 'success');

    this.renderAll();
    this.closeAvatarModal();
  }

  renderAvatarCreatorControls(controlsId, previewId) {
    const controlsContainer = document.getElementById(controlsId);
    const previewContainer = document.getElementById(previewId);
    if (!controlsContainer || !previewContainer) return;

    const c = this.tempAvatarConfig || window.DEFAULT_AVATAR;
    const isFemale = c.gender === 'female';
    const userLvl = window.store.getLevelInfo().currentLevel;

    previewContainer.innerHTML = window.AvatarRenderer.renderSVG(c, 180);

    // Filter hair styles and outfits based on selected gender
    const availableHair = AVATAR_PRESETS.hairStyles.filter(h => h.gender === c.gender);
    const availableOutfits = AVATAR_PRESETS.outfits.filter(o => o.gender === c.gender);

    controlsContainer.innerHTML = `
      <!-- Gender Selector -->
      <div class="mb-5 pb-4 border-b border-cream-200">
        <label class="block text-xs font-bold text-main uppercase tracking-wider mb-2">Pilih Karakter (Gender)</label>
        <div class="grid grid-cols-2 gap-3">
          ${AVATAR_PRESETS.genders.map(g => `
            <button 
              type="button"
              onclick="window.app.updateTempAvatar('gender', '${g.id}', '${controlsId}', '${previewId}')"
              class="py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                c.gender === g.id 
                  ? 'bg-lavender-500 text-white shadow-md ring-2 ring-lavender-400' 
                  : 'bg-cream-50 text-slate-700 hover:bg-slate-100 border border-cream-200'
              }">
              ${g.name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Skin Tone -->
      <div class="mb-5">
        <label class="block text-xs font-bold text-main uppercase tracking-wider mb-2">Warna Kulit</label>
        <div class="flex gap-3">
          ${AVATAR_PRESETS.skinTones.map(s => `
            <button 
              type="button"
              onclick="window.app.updateTempAvatar('skinTone', '${s.id}', '${controlsId}', '${previewId}')"
              class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                c.skinTone === s.id ? 'ring-2 ring-lavender-600 scale-110 shadow-xs' : 'border-slate-300'
              }" 
              style="background-color: ${s.hex}"
              title="${s.name}">
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Hair Style / Hijab (Gender-specific) -->
      <div class="mb-5">
        <label class="block text-xs font-bold text-main uppercase tracking-wider mb-2">
          ${isFemale ? 'Gaya Rambut & Hijab' : 'Gaya Rambut Laki-Laki'}
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          ${availableHair.map(h => `
            <button 
              type="button"
              onclick="window.app.updateTempAvatar('hairStyle', '${h.id}', '${controlsId}', '${previewId}')"
              class="py-2.5 px-3 rounded-xl text-xs font-semibold truncate transition-all text-center ${
                c.hairStyle === h.id 
                  ? 'bg-lavender-500 text-white shadow-xs ring-2 ring-lavender-300' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }">
              ${h.name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Hair / Hijab Color -->
      <div class="mb-5">
        <label class="block text-xs font-bold text-main uppercase tracking-wider mb-2">
          ${isFemale && c.hairStyle === 'hijab' ? 'Warna Hijab' : 'Warna Rambut'}
        </label>
        <div class="flex gap-3">
          ${AVATAR_PRESETS.hairColors.map(hc => `
            <button 
              type="button"
              onclick="window.app.updateTempAvatar('hairColor', '${hc.id}', '${controlsId}', '${previewId}')"
              class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                c.hairColor === hc.id ? 'ring-2 ring-lavender-600 scale-110 shadow-xs' : 'border-slate-300'
              }" 
              style="background-color: ${hc.hex}"
              title="${hc.name}">
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Facial Expression -->
      <div class="mb-5">
        <label class="block text-xs font-bold text-main uppercase tracking-wider mb-2">Ekspresi Wajah & Mata</label>
        <div class="grid grid-cols-2 gap-2">
          ${AVATAR_PRESETS.expressions.map(e => `
            <button 
              type="button"
              onclick="window.app.updateTempAvatar('expression', '${e.id}', '${controlsId}', '${previewId}')"
              class="py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                c.expression === e.id 
                  ? 'bg-lavender-500 text-white shadow-xs ring-2 ring-lavender-300' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }">
              ${e.name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Outfits (Gender-specific) -->
      <div class="mb-5">
        <label class="block text-xs font-bold text-main uppercase tracking-wider mb-2">Pakaian Belajar</label>
        <div class="grid grid-cols-2 gap-2">
          ${availableOutfits.map(o => {
            const isLocked = o.reqLevel && userLvl < o.reqLevel;
            return `
              <button 
                type="button"
                onclick="${isLocked ? `window.app.showToast('Item butuh Level ${o.reqLevel}', 'warning')` : `window.app.updateTempAvatar('outfit', '${o.id}', '${controlsId}', '${previewId}')`}"
                class="py-2.5 px-3 rounded-xl text-xs font-semibold transition-all truncate flex items-center justify-between ${
                  c.outfit === o.id 
                    ? 'bg-lavender-500 text-white shadow-xs ring-2 ring-lavender-300' 
                    : isLocked 
                      ? 'bg-slate-100 text-slate-400 opacity-60' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }">
                <span>${o.name}</span>
                ${isLocked ? `<span class="text-[10px] text-amber-600 font-bold">Lvl ${o.reqLevel} 🔒</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Outfit Color -->
      <div class="mb-5">
        <label class="block text-xs font-bold text-main uppercase tracking-wider mb-2">Warna Pakaian</label>
        <div class="flex gap-3">
          ${AVATAR_PRESETS.outfitColors.map(oc => `
            <button 
              type="button"
              onclick="window.app.updateTempAvatar('outfitColor', '${oc.id}', '${controlsId}', '${previewId}')"
              class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                c.outfitColor === oc.id ? 'ring-2 ring-lavender-600 scale-110 shadow-xs' : 'border-slate-300'
              }" 
              style="background-color: ${oc.hex}"
              title="${oc.name}">
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Glasses -->
      <div class="mb-5">
        <label class="block text-xs font-bold text-main uppercase tracking-wider mb-2">Kacamata</label>
        <div class="grid grid-cols-2 gap-2">
          ${AVATAR_PRESETS.glasses.map(g => {
            const isLocked = g.reqLevel && userLvl < g.reqLevel;
            return `
              <button 
                type="button"
                onclick="${isLocked ? `window.app.showToast('Butuh Level ${g.reqLevel}', 'warning')` : `window.app.updateTempAvatar('glasses', '${g.id}', '${controlsId}', '${previewId}')`}"
                class="py-2 px-3 rounded-xl text-xs font-semibold truncate transition-all flex items-center justify-between ${
                  c.glasses === g.id 
                    ? 'bg-lavender-500 text-white shadow-xs ring-2 ring-lavender-300' 
                    : isLocked 
                      ? 'bg-slate-100 text-slate-400 opacity-60' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }">
                <span>${g.name}</span>
                ${isLocked ? `<span class="text-[10px] text-amber-600 font-bold">Lvl ${g.reqLevel} 🔒</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Hats & Hairpins -->
      <div class="mb-5">
        <label class="block text-xs font-bold text-main uppercase tracking-wider mb-2">Topi & Aksesori Rambut</label>
        <div class="grid grid-cols-2 gap-2">
          ${AVATAR_PRESETS.hats.map(h => {
            const isLocked = h.reqLevel && userLvl < h.reqLevel;
            return `
              <button 
                type="button"
                onclick="${isLocked ? `window.app.showToast('Butuh Level ${h.reqLevel}', 'warning')` : `window.app.updateTempAvatar('hat', '${h.id}', '${controlsId}', '${previewId}')`}"
                class="py-2 px-3 rounded-xl text-xs font-semibold truncate transition-all flex items-center justify-between ${
                  c.hat === h.id 
                    ? 'bg-lavender-500 text-white shadow-xs ring-2 ring-lavender-300' 
                    : isLocked 
                      ? 'bg-slate-100 text-slate-400 opacity-60' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }">
                <span>${h.name}</span>
                ${isLocked ? `<span class="text-[10px] text-amber-600 font-bold">Lvl ${h.reqLevel} 🔒</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Headphones -->
      <div class="mb-5">
        <label class="block text-xs font-bold text-main uppercase tracking-wider mb-2">Headphone</label>
        <div class="grid grid-cols-2 gap-2">
          ${AVATAR_PRESETS.headphones.map(hp => {
            const isLocked = hp.reqLevel && userLvl < hp.reqLevel;
            return `
              <button 
                type="button"
                onclick="${isLocked ? `window.app.showToast('Butuh Level ${hp.reqLevel}', 'warning')` : `window.app.updateTempAvatar('headphones', '${hp.id}', '${controlsId}', '${previewId}')`}"
                class="py-2 px-3 rounded-xl text-xs font-semibold truncate transition-all flex items-center justify-between ${
                  c.headphones === hp.id 
                    ? 'bg-lavender-500 text-white shadow-xs ring-2 ring-lavender-300' 
                    : isLocked 
                      ? 'bg-slate-100 text-slate-400 opacity-60' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }">
                <span>${hp.name}</span>
                ${isLocked ? `<span class="text-[10px] text-amber-600 font-bold">Lvl ${hp.reqLevel} 🔒</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Bags -->
      <div class="mb-6">
        <label class="block text-xs font-bold text-main uppercase tracking-wider mb-2">Tas Belajar</label>
        <div class="grid grid-cols-3 gap-2">
          ${AVATAR_PRESETS.bags.map(b => `
            <button 
              type="button"
              onclick="window.app.updateTempAvatar('bag', '${b.id}', '${controlsId}', '${previewId}')"
              class="py-2 px-2 rounded-xl text-xs font-semibold truncate transition-all text-center ${
                c.bag === b.id 
                  ? 'bg-lavender-500 text-white shadow-xs ring-2 ring-lavender-300' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }">
              ${b.name}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  closeAllModals() {
    ['task-modal', 'schedule-modal', 'goal-modal', 'note-editor-modal', 'timer-complete-modal', 'focus-exit-modal', 'level-up-modal', 'avatar-modal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  }
}

window.app = new App();

window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
