/**
 * STUDYSPACE - Dashboard Controller
 * Clean, cozy, minimalist Soft Academic layout.
 * Displays personal greeting, quick stats, avatar, tasks, schedule,
 * instrumental music widget, focus timer shortcut, and daily quests.
 */

const STUDY_QUOTES = [
  { text: "Langkah kecil setiap hari akan membawamu ke tujuan besar.", author: "StudySpace Reminder" },
  { text: "Belajarlah dengan tenang, pahami dengan senang hati.", author: "Cozy Academic" },
  { text: "Fokus bukanlah tentang kesempurnaan, tapi tentang kemajuan hari ini.", author: "Mindful Study" },
  { text: "Istirahat sejenak adalah bagian penting dari proses belajar.", author: "Student Care" },
  { text: "Jadikan belajar sebagai ruang nyaman untuk rasa ingin tahumu.", author: "Study Sanctuary" }
];

class DashboardController {
  constructor() {
    this.quoteIndex = 0;
  }

  getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return { text: "Selamat Pagi", icon: "🌅", desc: "Awali harimu dengan tenang dan penuh semangat baru." };
    if (hour >= 11 && hour < 15) return { text: "Selamat Siang", icon: "☀️", desc: "Jaga konsentrasi dan jangan lupa minum air putih." };
    if (hour >= 15 && hour < 18) return { text: "Selamat Sore", icon: "🌇", desc: "Waktu yang tepat untuk mengulang materi atau istirahat santai." };
    return { text: "Selamat Malam", icon: "🌙", desc: "Belajar santai dan istirahatlah yang cukup malam ini." };
  }

  nextQuote() {
    this.quoteIndex = (this.quoteIndex + 1) % STUDY_QUOTES.length;
    this.renderQuote();
  }

  renderQuote() {
    const quoteEl = document.getElementById('dash-quote-text');
    const authorEl = document.getElementById('dash-quote-author');
    if (quoteEl && authorEl) {
      const q = STUDY_QUOTES[this.quoteIndex];
      quoteEl.textContent = `"${q.text}"`;
      authorEl.textContent = `— ${q.author}`;
    }
  }

  render() {
    const data = window.store.userData;
    const user = window.store.currentUser;

    if (!data || !user) {
      return;
    }

    const greeting = this.getGreeting();
    const lvlInfo = window.store.getLevelInfo();

    // 1. Hero Card
    const greetingText = document.getElementById('dash-greeting-text');
    const greetingName = document.getElementById('dash-greeting-name');
    const greetingDesc = document.getElementById('dash-greeting-desc');
    const statStreak = document.getElementById('dash-stat-streak');
    const statSP = document.getElementById('dash-stat-sp');
    const statLevel = document.getElementById('dash-stat-level');
    const spBar = document.getElementById('dash-sp-bar');
    const spNeeded = document.getElementById('dash-sp-needed');

    if (greetingText) greetingText.textContent = `${greeting.text} ${greeting.icon}`;
    if (greetingName) greetingName.textContent = user.name;
    if (greetingDesc) greetingDesc.textContent = greeting.desc;

    if (statStreak) statStreak.textContent = `${data.streak.current} Hari 🔥`;
    if (statSP) statSP.textContent = `${lvlInfo.currentSP} SP ✨`;
    if (statLevel) statLevel.textContent = `Level ${lvlInfo.currentLevel} • ${lvlInfo.name} ${lvlInfo.badge}`;

    if (spBar) spBar.style.width = `${lvlInfo.progressPercent}%`;
    if (spNeeded) {
      spNeeded.textContent = lvlInfo.nextLevelSP === 'MAX' 
        ? 'Level Tertinggi Dicapai! 👑' 
        : `${lvlInfo.neededForNext} SP lagi menuju Level ${lvlInfo.currentLevel + 1}`;
    }

    // Avatar preview in Hero
    const avatarContainer = document.getElementById('dash-avatar-container');
    if (avatarContainer && window.AvatarRenderer) {
      avatarContainer.innerHTML = window.AvatarRenderer.renderSVG(data.avatar, 100);
    }

    // 2. Tasks Summary & List (Clean Empty State if New)
    const taskList = document.getElementById('dash-task-list');
    const pendingTasks = data.tasks.filter(t => t.status !== 'done');

    if (taskList) {
      if (pendingTasks.length === 0) {
        taskList.innerHTML = `
          <div class="py-10 px-6 text-center bg-cream-50/60 rounded-2xl border border-dashed border-cream-200">
            <span class="text-3xl mb-2 inline-block">🌱</span>
            <p class="text-sm font-semibold text-main">Belum ada tugas hari ini</p>
            <p class="text-xs text-muted max-w-sm mx-auto mt-1 mb-4">
              Mulai harimu dengan santai atau catat hal kecil yang ingin kamu selesaikan.
            </p>
            <button onclick="window.tasksController.openAddModal()" class="btn-primary text-xs shadow-xs">
              + Catat Tugas Pertamamu
            </button>
          </div>
        `;
      } else {
        taskList.innerHTML = pendingTasks.slice(0, 4).map(task => `
          <div class="flex items-center justify-between p-3.5 rounded-xl bg-white border border-cream-200 hover:border-lavender-300 transition-all">
            <div class="flex items-center gap-3 min-w-0 pr-2">
              <button 
                onclick="window.tasksController.toggleComplete('${task.id}')"
                class="w-5 h-5 rounded-lg border-2 border-slate-300 hover:border-lavender-500 hover:bg-lavender-50 flex items-center justify-center transition-all shrink-0"
                title="Tandai Selesai (+20 SP)">
              </button>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-main truncate">${task.title}</p>
                <div class="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    task.priority === 'high' ? 'bg-pink-100 text-pink-700' :
                    task.priority === 'medium' ? 'bg-butter-100 text-amber-800' :
                    'bg-sage-100 text-sage-800'
                  }">${task.priority.toUpperCase()}</span>
                  <span>${task.category}</span>
                </div>
              </div>
            </div>
            <span class="text-xs text-slate-500 shrink-0">${task.deadline || 'Hari ini'}</span>
          </div>
        `).join('');
      }
    }

    // 3. Upcoming Schedule (Clean Empty State if New)
    const schList = document.getElementById('dash-schedule-list');
    if (schList) {
      if (data.schedule.length === 0) {
        schList.innerHTML = `
          <div class="py-8 px-5 text-center bg-cream-50/60 rounded-2xl border border-dashed border-cream-200">
            <span class="text-2xl mb-1 inline-block">📅</span>
            <p class="text-xs font-semibold text-main">Belum ada agenda belajar</p>
            <p class="text-[11px] text-muted mt-0.5 mb-3">Atur jam belajar atau waktu istirahatmu.</p>
            <button onclick="window.scheduleController.openAddModal()" class="text-xs text-lavender-700 font-bold hover:underline">
              + Tambah Jadwal Kegiatan
            </button>
          </div>
        `;
      } else {
        schList.innerHTML = data.schedule.slice(0, 3).map(item => `
          <div class="flex items-start gap-3 p-3 rounded-xl bg-sage-50/50 border border-sage-100">
            <div class="px-2 py-1 rounded-lg bg-sage-200 text-sage-800 text-xs font-bold shrink-0">
              ${item.startTime}
            </div>
            <div class="min-w-0 flex-1">
              <h5 class="text-xs font-bold text-main truncate">${item.title}</h5>
              <p class="text-[11px] text-muted truncate">${item.location || 'Ruang Belajar'} • ${item.category}</p>
            </div>
          </div>
        `).join('');
      }
    }

    // 4. Daily Quests Progress
    const questsList = document.getElementById('dash-quests-list');
    if (questsList) {
      questsList.innerHTML = data.quests.daily.map(q => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-cream-200">
          <div class="min-w-0 pr-2">
            <h5 class="text-xs font-bold ${q.completed ? 'line-through text-muted' : 'text-main'} truncate">${q.title}</h5>
            <p class="text-[11px] text-muted truncate">${q.description}</p>
          </div>
          <div>
            ${q.completed && !q.claimed ? `
              <button 
                onclick="window.questsController.claimReward('daily', '${q.id}')"
                class="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 text-[11px] font-bold rounded-lg shadow-xs animate-bounce">
                Klaim +${q.spReward} SP
              </button>
            ` : q.claimed ? `
              <span class="text-[10px] px-2 py-0.5 rounded bg-sage-100 text-sage-700 font-bold">Terklaim ✓</span>
            ` : `
              <span class="text-[10px] text-lavender-700 font-bold bg-lavender-100 px-2 py-0.5 rounded-full">
                ${q.progress}/${q.target}
              </span>
            `}
          </div>
        </div>
      `).join('');
    }

    // 5. Instrumental Music Mini-player Widget
    const curTrack = window.INSTRUMENTAL_TRACKS[window.soundEngine.currentTrackIndex] || window.INSTRUMENTAL_TRACKS[0];
    const isPlaying = window.soundEngine.isPlayingMusic;
    const miniTrackTitle = document.getElementById('dash-music-track-title');
    const miniPlayBtn = document.getElementById('dash-music-play-btn');

    if (miniTrackTitle) miniTrackTitle.textContent = curTrack.title;
    if (miniPlayBtn) miniPlayBtn.innerHTML = isPlaying ? '⏸' : '▶';

    this.renderQuote();
  }
}

window.dashboardController = new DashboardController();
