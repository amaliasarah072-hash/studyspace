/**
 * STUDYSPACE - Goals & Target Controller
 * Tracks daily & weekly study targets, progress bars, completion history,
 * and awards bonus Study Points.
 */

class GoalsController {
  constructor() {
    this.activeTab = 'daily'; // 'daily', 'weekly', 'history'
  }

  render() {
    const data = window.store.userData;
    if (!data) return;

    const dailyList = document.getElementById('goals-daily-list');
    const weeklyList = document.getElementById('goals-weekly-list');
    const historyList = document.getElementById('goals-history-list');

    if (dailyList) {
      if (data.goals.daily.length === 0) {
        dailyList.innerHTML = `
          <div class="p-6 text-center bg-cream-50/60 rounded-2xl border border-dashed border-cream-200">
            <span class="text-2xl mb-1 inline-block">🌅</span>
            <p class="text-xs font-semibold text-main">Belum ada target harian</p>
            <p class="text-[11px] text-muted mb-2">Tentukan target kecil belajarmu hari ini.</p>
            <button onclick="window.goalsController.openAddModal('daily')" class="text-xs font-bold text-lavender-700 hover:underline">
              + Tambah Target Harian (+30 SP)
            </button>
          </div>
        `;
      } else {
        dailyList.innerHTML = data.goals.daily.map(g => this.renderGoalCard(g, 'daily')).join('');
      }
    }

    if (weeklyList) {
      if (data.goals.weekly.length === 0) {
        weeklyList.innerHTML = `
          <div class="p-6 text-center bg-cream-50/60 rounded-2xl border border-dashed border-cream-200">
            <span class="text-2xl mb-1 inline-block">📆</span>
            <p class="text-xs font-semibold text-main">Belum ada target mingguan</p>
            <p class="text-[11px] text-muted mb-2">Bangun konsistensi belajarmu minggu ini.</p>
            <button onclick="window.goalsController.openAddModal('weekly')" class="text-xs font-bold text-lavender-700 hover:underline">
              + Tambah Target Mingguan (+50 SP)
            </button>
          </div>
        `;
      } else {
        weeklyList.innerHTML = data.goals.weekly.map(g => this.renderGoalCard(g, 'weekly')).join('');
      }
    }

    if (historyList) {
      if (data.goals.history.length === 0) {
        historyList.innerHTML = `
          <div class="py-12 text-center text-muted">
            <span class="text-3xl">🏅</span>
            <p class="text-sm font-semibold mt-2">Belum ada riwayat target yang selesai</p>
            <p class="text-xs">Selesaikan target harian atau mingguan untuk mencatat prestasimu di sini.</p>
          </div>
        `;
      } else {
        historyList.innerHTML = data.goals.history.map(item => `
          <div class="flex items-center justify-between p-4 rounded-xl bg-white border border-cream-200">
            <div class="flex items-center gap-3">
              <span class="text-xl">🌟</span>
              <div>
                <h4 class="font-bold text-sm text-main">${item.title}</h4>
                <p class="text-xs text-muted">Selesai pada ${new Date(item.completedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
              +${item.spEarned} SP
            </span>
          </div>
        `).join('');
      }
    }
  }

  renderGoalCard(goal, type) {
    const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
    const isComplete = goal.completed || pct >= 100;

    return `
      <div class="p-5 rounded-2xl bg-white border border-cream-200 shadow-2xs hover:border-lavender-300 transition-all">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full ${isComplete ? 'bg-sage-100 text-sage-800' : 'bg-lavender-100 text-lavender-800'}">
                ${isComplete ? '✓ Selesai' : 'Dalam Proses'}
              </span>
              <span class="text-xs text-muted font-medium">${type === 'daily' ? 'Target Harian' : 'Target Mingguan'}</span>
            </div>
            <h4 class="font-bold text-base text-main ${isComplete ? 'line-through text-slate-400' : ''}">
              ${goal.title}
            </h4>
          </div>

          <button onclick="window.goalsController.deleteGoal('${type}', '${goal.id}')" class="text-slate-300 hover:text-pink-600 text-xs p-1">
            🗑️
          </button>
        </div>

        <div class="space-y-1.5 mb-4">
          <div class="flex justify-between text-xs font-semibold">
            <span class="text-muted">Progres: ${goal.current} / ${goal.target} ${goal.unit}</span>
            <span class="text-lavender-700 font-bold">${pct}%</span>
          </div>
          <div class="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-300 ${isComplete ? 'bg-sage-500' : 'bg-lavender-500'}" style="width: ${pct}%"></div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-cream-100">
          <div class="flex items-center gap-2">
            <button 
              onclick="window.goalsController.adjustProgress('${type}', '${goal.id}', -1)"
              class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors"
              ${goal.current <= 0 ? 'disabled opacity-40' : ''}>
              -
            </button>
            <button 
              onclick="window.goalsController.adjustProgress('${type}', '${goal.id}', 1)"
              class="w-7 h-7 rounded-lg bg-lavender-100 hover:bg-lavender-200 text-lavender-800 font-bold flex items-center justify-center text-xs transition-colors">
              +
            </button>
            <span class="text-xs text-muted ml-1">+1 ${goal.unit}</span>
          </div>

          ${!isComplete ? `
            <button 
              onclick="window.goalsController.markComplete('${type}', '${goal.id}')"
              class="px-3 py-1.5 rounded-lg bg-sage-100 hover:bg-sage-200 text-sage-800 text-xs font-bold transition-colors">
              Selesaikan Sekarang
            </button>
          ` : `
            <span class="text-xs text-sage-700 font-bold flex items-center gap-1">
              ✨ Hadiah Diberikan
            </span>
          `}
        </div>
      </div>
    `;
  }

  adjustProgress(type, id, delta) {
    const data = window.store.userData;
    if (!data) return;

    const list = type === 'daily' ? data.goals.daily : data.goals.weekly;
    const goal = list.find(g => g.id === id);
    if (!goal) return;

    goal.current = Math.max(0, goal.current + delta);
    window.soundEngine.playClick();

    if (goal.current >= goal.target && !goal.completed) {
      this.markComplete(type, id);
      return;
    }

    window.store.saveUserData();
    this.render();
    window.dashboardController.render();
  }

  markComplete(type, id) {
    const data = window.store.userData;
    if (!data) return;

    const list = type === 'daily' ? data.goals.daily : data.goals.weekly;
    const goal = list.find(g => g.id === id);
    if (!goal || goal.completed) return;

    goal.completed = true;
    goal.current = goal.target;

    const spAward = type === 'daily' ? 30 : 50;
    const awarded = window.store.awardSP(spAward, `Menyelesaikan target: ${goal.title}`, `goal_comp_${goal.id}`, 'goal');

    // Add to history
    data.goals.history.unshift({
      id: 'gh_' + Date.now(),
      title: goal.title,
      type,
      completedAt: new Date().toISOString(),
      spEarned: spAward
    });

    if (awarded) {
      window.soundEngine.playSuccess();
      if (window.confetti) {
        window.confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      }
      window.app.showToast(`Target tercapai! +${spAward} SP 🎉`, 'success');
    }

    window.store.saveUserData();
    this.render();
    window.dashboardController.render();
  }

  openAddModal(type = 'daily') {
    const modal = document.getElementById('goal-modal');
    const typeSelect = document.getElementById('goal-input-type');
    const form = document.getElementById('goal-form');

    if (form) form.reset();
    if (typeSelect) typeSelect.value = type;
    if (modal) modal.classList.remove('hidden');
  }

  closeModal() {
    const modal = document.getElementById('goal-modal');
    if (modal) modal.classList.add('hidden');
  }

  saveGoalFromForm(e) {
    e.preventDefault();
    const data = window.store.userData;
    if (!data) return;

    const title = document.getElementById('goal-input-title').value.trim();
    const type = document.getElementById('goal-input-type').value;
    const target = parseInt(document.getElementById('goal-input-target').value, 10) || 1;
    const unit = document.getElementById('goal-input-unit').value.trim() || 'kali';

    if (!title) {
      window.app.showToast('Judul target wajib diisi!', 'warning');
      return;
    }

    const newGoal = {
      id: 'g_' + Date.now(),
      title,
      target,
      current: 0,
      unit,
      completed: false,
      date: getTodayString()
    };

    if (type === 'daily') {
      data.goals.daily.push(newGoal);
    } else {
      data.goals.weekly.push(newGoal);
    }

    window.soundEngine.playSuccess();
    window.store.saveUserData();
    window.app.showToast('Target baru berhasil ditambahkan! 🎯', 'success');
    this.closeModal();
    this.render();
    window.dashboardController.render();
  }

  deleteGoal(type, id) {
    const data = window.store.userData;
    if (!data) return;

    if (confirm('Hapus target ini?')) {
      if (type === 'daily') {
        data.goals.daily = data.goals.daily.filter(g => g.id !== id);
      } else {
        data.goals.weekly = data.goals.weekly.filter(g => g.id !== id);
      }
      window.store.saveUserData();
      this.render();
      window.dashboardController.render();
    }
  }
}

window.goalsController = new GoalsController();

