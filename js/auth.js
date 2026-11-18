/**
 * STUDYSPACE - Authentication & Floating Tutorial Controller
 * Registration by username, kelas, motto (manual or auto-suggested), and password.
 * Automatic browser device linking & non-blocking floating tutorial guide.
 */

const STUDENT_MOTTOS = [
  "Belajar santai tapi pasti, konsisten setiap hari ✨",
  "Langkah kecil hari ini, masa depan gemilang besok 🌸",
  "Tetap tenang, percaya pada proses belajarmu 📚",
  "Rasa ingin tahu adalah kekuatan super terbesarku 💡",
  "Fokus pada kemajuan diri, bukan kesempurnaan 🌱",
  "Belajar dengan senang hati, raih impian setinggi langit 🚀",
  "Konsistensi selalu mengalahkan bakat yang malas 🏆",
  "Satu jam fokus lebih bermakna dari seribu jam melamun ⏳",
  "Jadikan setiap kesalahan sebagai guru terbaikmu 📖",
  "Semangat membara di balik ketenangan pikiran ☕",
  "Disiplin adalah jembatan antara impian dan pencapaian 🎯",
  "Hari ini membaca dan memahami, besok memimpin dan menginspirasi 🌟"
];

class AuthController {
  constructor() {
    this.currentStep = 0;
    this.tutorialSteps = [
      {
        elementId: 'dashboard-greeting-card',
        title: 'Dashboard Pribadimu ✨',
        text: 'Ini adalah pusat ruang belajarmu. Pantau streak harian (🔥), study points (SP), level, dan kutipan motivasi.'
      },
      {
        elementId: 'dashboard-quick-actions',
        title: 'Akses Cepat Belajar 🚀',
        text: 'Mulai timer fokus atau putar musik instrumental santai langsung dari sini tanpa ribet.'
      },
      {
        elementId: 'sidebar-nav-tasks',
        title: 'Kelola Tugas di My Tasks 📝',
        text: 'Catat tugas, tentukan prioritas, dan kumpulkan +20 Study Points setiap kali menyelesaikan tugas!'
      },
      {
        elementId: 'sidebar-nav-timer',
        title: 'Focus Timer & Cozy Themes ⏳',
        text: 'Pilih waktu belajarmu semau kita dengan tema visual Lilin menyala, Es beku, atau Jam minimalis.'
      },
      {
        elementId: 'sidebar-nav-music',
        title: 'Study Music Instrumental 🎧',
        text: 'Dengarkan alunan melodi piano lembut, lo-fi beats, dan campur suara hujan atau kafe.'
      },
      {
        elementId: 'sidebar-nav-brain',
        title: 'Brain Corner Mini Games 🧩',
        text: 'Segarkan pikiran dengan Word Search (kata acak berganti), Sudoku, Memory Match, dan Teka-teki Menara Buku.'
      },
      {
        elementId: 'user-profile-widget',
        title: 'Avatar & Karaktermu 🌸',
        text: 'Kustomisasi karakter perempuan/laki-laki, ganti hijab, rambut, busana, dan aksesori belajar kapan saja.'
      }
    ];
  }

  // Get random inspiring student motto
  getRandomMotto() {
    const idx = Math.floor(Math.random() * STUDENT_MOTTOS.length);
    return STUDENT_MOTTOS[idx];
  }

  // Auto fill randomized motto into the register input
  randomizeMottoInput() {
    const mottoInput = document.getElementById('reg-motto');
    if (mottoInput) {
      mottoInput.value = this.getRandomMotto();
      window.soundEngine.playClick();
      window.app.showToast('Motto keren dipilihkan sistem! ✨', 'info');
    }
  }

  // Register with username, kelas, motto, and password
  register(username, kelas, motto, password) {
    if (!username || !password) {
      window.app.showToast('Username dan password wajib diisi!', 'warning');
      return false;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername.length < 3) {
      window.app.showToast('Username minimal 3 karakter', 'warning');
      return false;
    }

    const users = window.store.getAllUsers();
    // Rule: Jika akun sudah terdaftar tidak bisa daftar lagi
    if (users.find(u => u.username.toLowerCase() === cleanUsername)) {
      window.app.showToast(`Username "${cleanUsername}" sudah terdaftar! Silakan login di tab Masuk.`, 'warning');
      return false;
    }

    const finalMotto = motto && motto.trim() ? motto.trim() : this.getRandomMotto();
    const finalKelas = kelas && kelas.trim() ? kelas.trim() : 'Pelajar';

    // Auto-bind to local Chrome browser identity
    let browserIdentity = localStorage.getItem('studyspace_browser_identity');
    if (!browserIdentity) {
      browserIdentity = `${cleanUsername}@chrome-student.id`;
      localStorage.setItem('studyspace_browser_identity', browserIdentity);
    }

    const newUser = {
      id: 'student_' + Date.now(),
      username: cleanUsername,
      name: username.trim(),
      grade: finalKelas,
      bio: finalMotto,
      browserAccount: browserIdentity,
      passwordHash: password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    window.store.saveUsers(users);

    window.store.currentUser = newUser;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);

    // Initial clean & empty data
    const newUserData = window.store.createInitialUserData(newUser);
    window.store.saveUserData(newUser.id, newUserData);
    window.store.userData = newUserData;

    window.soundEngine.playSuccess();
    window.app.showToast(`Akun @${newUser.username} berhasil dibuat! Selamat belajar ✨`, 'success');

    window.app.closeAuthModal();

    // Step 1: Open Avatar Creator so user can select Female/Male & style
    window.app.openAvatarModal(true);

    return true;
  }

  // Login with username and password
  login(username, password) {
    if (!username || !password) {
      window.app.showToast('Masukkan username dan password', 'warning');
      return false;
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = window.store.getAllUsers();
    const user = users.find(u => u.username && u.username.toLowerCase() === cleanUsername);

    if (!user) {
      window.app.showToast(`Username "${cleanUsername}" belum terdaftar. Silakan daftar di tab 'Daftar Akun Baru'!`, 'warning');
      return false;
    }

    if (user.passwordHash !== password) {
      window.app.showToast('Password tidak cocok untuk akun ini!', 'error');
      return false;
    }

    window.store.currentUser = user;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    window.store.loadUserData(user.id);
    window.store.checkDailyReset();

    window.soundEngine.playSuccess();
    window.app.showToast(`Selamat datang kembali, @${user.username}! 🌸`, 'success');

    window.app.closeAuthModal();
    window.app.navigate('dashboard');
    window.app.renderAll();

    return true;
  }

  logout() {
    window.soundEngine.playClick();
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    window.store.currentUser = null;
    window.store.userData = null;
    window.app.showToast('Kamu telah berhasil keluar', 'info');
    window.app.openAuthModal('login');
  }

  // ========================================================
  // FLOATING DOCKED TUTORIAL (NEVER COVERS TARGET ELEMENT)
  // ========================================================
  startTutorial(stepIndex = 0) {
    this.currentStep = stepIndex;
    window.app.navigate('dashboard');
    setTimeout(() => {
      this.renderTutorialStep();
    }, 350);
  }

  renderTutorialStep() {
    const step = this.tutorialSteps[this.currentStep];
    if (!step) {
      this.completeTutorial();
      return;
    }

    if (window.store.userData) {
      window.store.userData.tutorialStep = this.currentStep;
      window.store.saveUserData();
    }

    // Remove previous target outlines
    document.querySelectorAll('.tour-target-highlight').forEach(el => el.classList.remove('tour-target-highlight'));

    const targetEl = document.getElementById(step.elementId);
    if (targetEl) {
      targetEl.classList.add('tour-target-highlight');
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const container = document.getElementById('tutorial-overlay');
    if (!container) return;

    container.classList.remove('hidden');
    // Non-blocking docked card at bottom right so target element is 100% visible!
    container.innerHTML = `
      <div class="fixed bottom-6 right-6 z-[9995] max-w-sm w-full px-4 animate-in fade-in slide-in-from-bottom duration-300 pointer-events-auto">
        <div class="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border-2 border-lavender-300">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full badge-lavender">
              Panduan ${this.currentStep + 1} / ${this.tutorialSteps.length}
            </span>
            <button onclick="window.authController.skipTutorial()" class="text-xs text-muted hover:text-main font-semibold px-1 py-0.5">
              Lewati ✕
            </button>
          </div>

          <h3 class="text-base font-bold text-main mb-1">${step.title}</h3>
          <p class="text-xs text-muted leading-relaxed mb-4">${step.text}</p>

          <div class="flex items-center justify-between gap-2 pt-2 border-t border-cream-200">
            <button 
              onclick="window.authController.prevStep()" 
              class="btn-secondary text-xs px-3 py-1.5 ${this.currentStep === 0 ? 'opacity-40 pointer-events-none' : ''}">
              ← Balik
            </button>
            <div class="flex items-center gap-1">
              ${this.tutorialSteps.map((_, i) => `
                <span class="h-1.5 rounded-full transition-all ${i === this.currentStep ? 'w-4 bg-lavender-500' : 'w-1.5 bg-lavender-200'}"></span>
              `).join('')}
            </div>
            <button onclick="window.authController.nextStep()" class="btn-primary text-xs px-4 py-1.5 shadow-xs">
              ${this.currentStep === this.tutorialSteps.length - 1 ? 'Mulai Belajar ✨' : 'Lanjut →'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  nextStep() {
    window.soundEngine.playClick();
    this.currentStep++;
    if (this.currentStep >= this.tutorialSteps.length) {
      this.completeTutorial();
    } else {
      this.renderTutorialStep();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      window.soundEngine.playClick();
      this.currentStep--;
      this.renderTutorialStep();
    }
  }

  completeTutorial() {
    document.querySelectorAll('.tour-target-highlight').forEach(el => el.classList.remove('tour-target-highlight'));
    const container = document.getElementById('tutorial-overlay');
    if (container) container.classList.add('hidden');

    if (window.store.userData) {
      window.store.userData.tutorialCompleted = true;
      window.store.saveUserData();
      window.store.awardSP(25, 'Menyelesaikan Tutorial StudySpace', 'tutorial_done', 'tutorial');
      window.store.unlockAchievement('little_explorer');
    }

    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    window.soundEngine.playSuccess();
    window.app.showToast('Panduan selesai! Kamu mendapatkan +25 SP ✨', 'success');
  }

  skipTutorial() {
    document.querySelectorAll('.tour-target-highlight').forEach(el => el.classList.remove('tour-target-highlight'));
    const container = document.getElementById('tutorial-overlay');
    if (container) container.classList.add('hidden');

    if (window.store.userData) {
      window.store.userData.tutorialCompleted = true;
      window.store.saveUserData();
    }
    window.app.showToast('Panduan ditutup. Kamu bisa mengulanginya kapan saja di Settings.', 'info');
  }
}

window.authController = new AuthController();
