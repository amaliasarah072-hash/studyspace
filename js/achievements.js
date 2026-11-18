/**
 * STUDYSPACE - Achievements & Badges Controller
 * Displays unlockable badges, criteria, progress, and celebrations.
 */

class AchievementsController {
  render() {
    const data = window.store.userData;
    if (!data) return;

    const container = document.getElementById('achievements-grid-container');
    const unlockedCountEl = document.getElementById('achievements-unlocked-count');
    if (!container) return;

    const achs = data.achievements || [];
    const unlockedCount = achs.filter(a => a.unlocked).length;

    if (unlockedCountEl) {
      unlockedCountEl.textContent = `${unlockedCount} / ${achs.length} Terbuka`;
    }

    container.innerHTML = achs.map(a => {
      return `
        <div class="soft-card p-5 rounded-2xl border transition-all flex flex-col justify-between ${
          a.unlocked 
            ? 'bg-white border-lavender-300 shadow-xs hover:border-lavender-400' 
            : 'bg-slate-50/70 border-cream-200 opacity-60'
        }">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="w-14 h-14 rounded-2xl ${a.unlocked ? 'bg-lavender-100' : 'bg-slate-200 grayscale'} flex items-center justify-center text-3xl shadow-2xs">
                ${a.icon}
              </span>
              <span class="px-2.5 py-1 rounded-full text-xs font-bold ${
                a.unlocked ? 'bg-sage-100 text-sage-800' : 'bg-slate-200 text-slate-500'
              }">
                ${a.unlocked ? 'Terbuka ✨' : 'Terkunci 🔒'}
              </span>
            </div>

            <h4 class="font-bold text-base text-main mb-1">${a.title}</h4>
            <p class="text-xs text-muted leading-relaxed mb-3">${a.desc}</p>
          </div>

          <div class="pt-3 border-t border-cream-100 text-[11px] text-muted flex items-center justify-between">
            <span>${a.unlocked ? 'Dibuka pada: ' + new Date(a.unlockedAt).toLocaleDateString('id-ID') : 'Belum tercapai'}</span>
            <span class="font-bold text-amber-600">+30 SP</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

window.achievementsController = new AchievementsController();

