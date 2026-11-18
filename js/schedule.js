/**
 * STUDYSPACE - Schedule & Timetable Controller
 * Organizes daily and weekly study routines, event tags, reminders, and agendas.
 */

class ScheduleController {
  constructor() {
    this.viewMode = 'weekly'; // 'daily' or 'weekly'
    this.editingId = null;
    this.daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  }

  render() {
    const data = window.store.userData;
    if (!data) return;

    const container = document.getElementById('schedule-list-container');
    if (!container) return;

    if (data.schedule.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-cream-200 p-8">
          <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-sage-100 flex items-center justify-center text-3xl">
            📅
          </div>
          <h3 class="text-lg font-bold text-main mb-1">Belum Ada Jadwal Belajar</h3>
          <p class="text-sm text-muted max-w-sm mx-auto mb-5">Atur jadwal belajarmu agar rutinitas harianmu lebih teratur dan fokus.</p>
          <button onclick="window.scheduleController.openAddModal()" class="btn-sage text-sm">
            + Tambah Jadwal Pertama
          </button>
        </div>
      `;
      return;
    }

    // Sort by startTime
    const sorted = [...data.schedule].sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (this.viewMode === 'daily') {
      container.innerHTML = `
        <div class="col-span-full space-y-3">
          ${sorted.map(item => this.renderScheduleCard(item)).join('')}
        </div>
      `;
    } else {
      // Group by Day or render in grid
      container.innerHTML = `
        <div class="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${sorted.map(item => this.renderScheduleCard(item)).join('')}
        </div>
      `;
    }
  }

  renderScheduleCard(item) {
    const isStudy = item.category.toLowerCase().includes('study') || item.category.toLowerCase().includes('belajar');
    const isBreak = item.category.toLowerCase().includes('break') || item.category.toLowerCase().includes('istirahat');

    return `
      <div class="soft-card p-5 rounded-2xl border border-cream-200 hover:border-sage-300 transition-all flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${
              isStudy ? 'bg-sage-100 text-sage-800' :
              isBreak ? 'bg-butter-100 text-butter-800' :
              'bg-lavender-100 text-lavender-800'
            }">
              🕒 ${item.startTime} - ${item.endTime}
            </span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              ${item.day || 'Setiap Hari'}
            </span>
          </div>

          <h4 class="font-bold text-base text-main mb-1">${item.title}</h4>

          <div class="space-y-1 text-xs text-muted mb-3">
            <p class="flex items-center gap-1.5">
              <span>📍</span> <span>${item.location || 'Ruang Belajar'}</span>
            </p>
            ${item.notes ? `
              <p class="flex items-center gap-1.5 italic text-slate-500">
                <span>💬</span> <span>${item.notes}</span>
              </p>
            ` : ''}
          </div>
        </div>

        <div class="pt-3 border-t border-cream-100 flex items-center justify-between text-xs">
          <span class="text-muted font-medium">Kategori: <strong>${item.category}</strong></span>
          <div class="flex items-center gap-1">
            <button onclick="window.scheduleController.openEditModal('${item.id}')" class="p-1 text-slate-400 hover:text-lavender-700 rounded transition-colors" title="Edit">
              ✏️
            </button>
            <button onclick="window.scheduleController.deleteSchedule('${item.id}')" class="p-1 text-slate-400 hover:text-pink-700 rounded transition-colors" title="Hapus">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;
  }

  openAddModal() {
    this.editingId = null;
    const modal = document.getElementById('schedule-modal');
    const titleEl = document.getElementById('schedule-modal-title');
    const form = document.getElementById('schedule-form');

    if (titleEl) titleEl.textContent = 'Tambah Jadwal Kegiatan';
    if (form) form.reset();

    if (modal) modal.classList.remove('hidden');
  }

  openEditModal(id) {
    const data = window.store.userData;
    if (!data) return;
    const item = data.schedule.find(s => s.id === id);
    if (!item) return;

    this.editingId = id;
    const modal = document.getElementById('schedule-modal');
    const titleEl = document.getElementById('schedule-modal-title');
    if (titleEl) titleEl.textContent = 'Edit Jadwal Kegiatan';

    document.getElementById('sch-input-title').value = item.title;
    document.getElementById('sch-input-day').value = item.day || 'Setiap Hari';
    document.getElementById('sch-input-start').value = item.startTime;
    document.getElementById('sch-input-end').value = item.endTime;
    document.getElementById('sch-input-category').value = item.category;
    document.getElementById('sch-input-location').value = item.location || '';
    document.getElementById('sch-input-notes').value = item.notes || '';

    if (modal) modal.classList.remove('hidden');
  }

  closeModal() {
    const modal = document.getElementById('schedule-modal');
    if (modal) modal.classList.add('hidden');
    this.editingId = null;
  }

  saveScheduleFromForm(e) {
    e.preventDefault();
    const data = window.store.userData;
    if (!data) return;

    const title = document.getElementById('sch-input-title').value.trim();
    const day = document.getElementById('sch-input-day').value;
    const startTime = document.getElementById('sch-input-start').value;
    const endTime = document.getElementById('sch-input-end').value;
    const category = document.getElementById('sch-input-category').value.trim() || 'Study';
    const location = document.getElementById('sch-input-location').value.trim() || 'Ruang Belajar';
    const notes = document.getElementById('sch-input-notes').value.trim();

    if (!title || !startTime || !endTime) {
      window.app.showToast('Judul dan jam kegiatan wajib diisi!', 'warning');
      return;
    }

    if (this.editingId) {
      const item = data.schedule.find(s => s.id === this.editingId);
      if (item) {
        item.title = title;
        item.day = day;
        item.startTime = startTime;
        item.endTime = endTime;
        item.category = category;
        item.location = location;
        item.notes = notes;
        window.app.showToast('Jadwal berhasil diperbarui ✨', 'success');
      }
    } else {
      const newItem = {
        id: 'sch_' + Date.now(),
        title,
        day,
        startTime,
        endTime,
        category,
        location,
        notes
      };
      data.schedule.push(newItem);
      window.app.showToast('Jadwal baru ditambahkan! 📅', 'success');
    }

    window.soundEngine.playSuccess();
    window.store.saveUserData();
    this.closeModal();
    this.render();
    window.dashboardController.render();
  }

  deleteSchedule(id) {
    const data = window.store.userData;
    if (!data) return;

    if (confirm('Hapus jadwal ini?')) {
      data.schedule = data.schedule.filter(s => s.id !== id);
      window.store.saveUserData();
      window.app.showToast('Jadwal dihapus', 'info');
      this.render();
      window.dashboardController.render();
    }
  }

  setView(mode) {
    this.viewMode = mode;
    document.querySelectorAll('.sch-view-btn').forEach(btn => {
      if (btn.dataset.mode === mode) {
        btn.classList.add('bg-sage-500', 'text-white');
        btn.classList.remove('bg-white', 'text-slate-600');
      } else {
        btn.classList.remove('bg-sage-500', 'text-white');
        btn.classList.add('bg-white', 'text-slate-600');
      }
    });
    this.render();
  }
}

window.scheduleController = new ScheduleController();

