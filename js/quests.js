/**
 * STUDYSPACE - Quests System Controller
 * Handles Daily Quests, Weekly Quests, Special Quests, and Reward claiming.
 */

class QuestsController {
  constructor() {
    this.activeTab = 'daily'; // 'daily', 'weekly', 'special'
  }

  setTab(tab) {
    this.activeTab = tab;
    window.soundEngine.playClick();
    this.render();
  }

  render() {
    const data = window.store.userData;
    if (!data) return;

    // Update tab buttons
    document.querySelectorAll('.quest-tab-btn').forEach(btn => {
      if (btn.dataset.tab === this.activeTab) {
        btn.classList.add('bg-lavender-500', 'text-white', 'shadow-xs');
        btn.classList.remove('bg-white', 'text-slate-600');
      } else {
        btn.classList.remove('bg-lavender-500', 'text-white', 'shadow-xs');
        btn.classList.add('bg-white', 'text-slate-600');
      }
    });

    const container = document.getElementById('quests-list-container');
    if (!container) return;

    const quests = data.quests[this.activeTab] || [];

    if (quests.length === 0) {
      container.innerHTML = `<p class="text-xs text-muted py-8 text-center">Belum ada misi untuk kategori ini.</p>`;
      return;
    }

    container.innerHTML = quests.map(q => {
      const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
      const canClaim = q.completed && !q.claimed;

      return `
        <div class="soft-card p-5 rounded-2xl border transition-all ${
          canClaim 
            ? 'border-amber-300 bg-amber-50/40 shadow-md ring-2 ring-amber-300' 
            : q.claimed 
              ? 'border-slate-200 bg-slate-50/70 opacity-75' 
              : 'border-cream-200 bg-white'
        }">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-start gap-3.5 flex-1 min-w-0">
              <div class="w-12 h-12 rounded-2xl ${q.claimed ? 'bg-sage-100 text-sage-700' : 'bg-lavender-100 text-lavender-700'} flex items-center justify-center text-2xl shrink-0">
                ${q.claimed ? '✓' : '🎯'}
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-bold text-base text-main truncate">${q.title}</h4>
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full ${q.claimed ? 'bg-sage-100 text-sage-800' : 'bg-butter-100 text-butter-800'}">
                    +${q.spReward} SP
                  </span>
                </div>
                <p class="text-xs text-muted mb-2">${q.description}</p>

                <!-- Progress bar -->
                <div class="w-full max-w-md">
                  <div class="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Progress: ${q.progress} / ${q.target}</span>
                    <span>${pct}%</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-300 ${q.claimed ? 'bg-sage-500' : 'bg-lavender-500'}" style="width: ${pct}%"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action button -->
            <div class="shrink-0 self-end sm:self-center">
              ${canClaim ? `
                <button 
                  onclick="window.questsController.claimReward('${this.activeTab}', '${q.id}')"
                  class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 animate-bounce">
                  Klaim +${q.spReward} SP 🎉
                </button>
              ` : q.claimed ? `
                <span class="px-4 py-2 rounded-xl bg-sage-100 text-sage-800 font-bold text-xs flex items-center gap-1.5">
                  <span>✓</span> Terklaim
                </span>
              ` : `
                <span class="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-semibold text-xs">
                  Sedang Berjalan
                </span>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  claimReward(tab, questId) {
    const data = window.store.userData;
    if (!data) return;

    const list = data.quests[tab] || [];
    const quest = list.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    quest.claimed = true;
    window.store.awardSP(quest.spReward, `Menyelesaikan Misi: ${quest.title}`, `quest_${quest.id}`, 'quest');

    window.soundEngine.playSuccess();
    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    window.app.showToast(`Misi selesai! Kamu mendapatkan +${quest.spReward} SP ✨`, 'success');

    window.store.saveUserData();
    this.render();
    window.dashboardController.render();
  }
}

window.questsController = new QuestsController();

