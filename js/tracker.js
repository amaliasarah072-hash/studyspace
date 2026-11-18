/**
 * STUDYSPACE - Study Tracker & Analytics Controller
 * Level progression, Study Points analytics, streak calendar,
 * activity history log, and weekly study time charts.
 */

class TrackerController {
  constructor() {
    this.chartInstance = null;
  }

  render() {
    const data = window.store.userData;
    if (!data) return;

    const lvlInfo = window.store.getLevelInfo();

    // 1. Level & Total SP Cards
    const totalSPEl = document.getElementById('tracker-total-sp');
    const levelNameEl = document.getElementById('tracker-level-name');
    const levelBadgeEl = document.getElementById('tracker-level-badge');
    const progressBarEl = document.getElementById('tracker-progress-bar');
    const progressTextEl = document.getElementById('tracker-progress-text');
    const streakEl = document.getElementById('tracker-streak-days');
    const highestStreakEl = document.getElementById('tracker-highest-streak');

    if (totalSPEl) totalSPEl.textContent = `${lvlInfo.currentSP} SP`;
    if (levelNameEl) levelNameEl.textContent = `Level ${lvlInfo.currentLevel} • ${lvlInfo.name}`;
    if (levelBadgeEl) levelBadgeEl.textContent = lvlInfo.badge;
    if (progressBarEl) progressBarEl.style.width = `${lvlInfo.progressPercent}%`;
    if (progressTextEl) {
      progressTextEl.textContent = lvlInfo.nextLevelSP === 'MAX'
        ? 'Level Maksimum Dicapai! 👑'
        : `${lvlInfo.neededForNext} SP lagi untuk naik ke Level ${lvlInfo.currentLevel + 1}`;
    }

    if (streakEl) streakEl.textContent = `${data.streak.current} Hari`;
    if (highestStreakEl) highestStreakEl.textContent = `Tertinggi: ${data.streak.highest} Hari`;

    // 2. Levels Tier Table
    const tiersContainer = document.getElementById('tracker-tiers-list');
    if (tiersContainer) {
      tiersContainer.innerHTML = LEVEL_THRESHOLDS.map(t => {
        const isCurrent = t.level === lvlInfo.currentLevel;
        const isUnlocked = lvlInfo.currentLevel >= t.level;

        return `
          <div class="flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
            isCurrent 
              ? 'bg-lavender-100/80 border-lavender-400 shadow-xs ring-1 ring-lavender-400' 
              : isUnlocked 
                ? 'bg-sage-50/60 border-sage-200' 
                : 'bg-white border-cream-200 opacity-60'
          }">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${t.badge}</span>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-bold text-sm text-main">Level ${t.level}: ${t.name}</h4>
                  ${isCurrent ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-lavender-600 text-white font-bold">Level Saat Ini</span>' : ''}
                </div>
                <p class="text-xs text-muted">Syarat: ${t.minSP} SP ${t.maxSP !== Infinity ? `- ${t.maxSP} SP` : '+'}</p>
              </div>
            </div>

            <span class="text-xs font-bold ${isUnlocked ? 'text-sage-700' : 'text-slate-400'}">
              ${isUnlocked ? 'Terbuka ✓' : 'Terkunci 🔒'}
            </span>
          </div>
        `;
      }).join('');
    }

    // 3. Activity History Log
    const historyContainer = document.getElementById('tracker-activity-history');
    if (historyContainer) {
      if (data.activityHistory.length === 0) {
        historyContainer.innerHTML = `<p class="text-xs text-muted text-center py-6">Belum ada catatan aktivitas.</p>`;
      } else {
        historyContainer.innerHTML = data.activityHistory.map(act => {
          const icon = 
            act.type === 'task' ? '📝' :
            act.type === 'timer' ? '⏳' :
            act.type === 'game' ? '🧩' :
            act.type === 'goal' ? '🎯' :
            act.type === 'streak' ? '🔥' :
            act.type === 'achievement' ? '🏆' : '✨';

          return `
            <div class="flex items-center justify-between p-3 rounded-xl bg-white border border-cream-200 hover:border-cream-300 transition-colors">
              <div class="flex items-center gap-3 min-w-0 pr-2">
                <span class="text-lg shrink-0">${icon}</span>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-main truncate">${act.text}</p>
                  <p class="text-[11px] text-muted">${new Date(act.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
              </div>
              <span class="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg shrink-0">
                +${act.sp} SP
              </span>
            </div>
          `;
        }).join('');
      }
    }

    // 4. Render Weekly Study Chart
    this.renderChart();
  }

  renderChart() {
    const canvas = document.getElementById('tracker-weekly-chart');
    if (!canvas || !window.Chart) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    // Estimated weekly minutes distributed
    const studyMinutes = [45, 60, 25, 50, 75, 40, 60];
    const tasksDone = [2, 3, 1, 2, 4, 1, 3];

    const ctx = canvas.getContext('2d');
    this.chartInstance = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Menit Belajar (Fokus)',
            data: studyMinutes,
            backgroundColor: '#B8A7E0',
            borderRadius: 8,
            borderSkipped: false
          },
          {
            label: 'Tugas Selesai',
            data: tasksDone.map(n => n * 15), // scale for visible pairing
            backgroundColor: '#A3B899',
            borderRadius: 8,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: {
                family: 'Plus Jakarta Sans',
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.datasetIndex === 1) {
                  return `Tugas Selesai: ${Math.round(context.raw / 15)} tugas`;
                }
                return `Fokus: ${context.raw} menit`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#F0ECE4'
            },
            ticks: {
              font: { family: 'Plus Jakarta Sans', size: 10 }
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Plus Jakarta Sans', size: 10 }
            }
          }
        }
      }
    });
  }
}

window.trackerController = new TrackerController();

