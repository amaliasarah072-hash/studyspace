/**
 * STUDYSPACE - Tasks Manager Controller
 * Full CRUD, priority filtering, category tags, search, and Study Points reward engine.
 */

class TasksController {
  constructor() {
    this.currentFilter = 'all'; // all, todo, inprogress, done
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.editingTaskId = null;
  }

  // Render Tasks View
  render() {
    const data = window.store.userData;
    if (!data) return;

    let tasks = [...data.tasks];

    // Filter by status
    if (this.currentFilter !== 'all') {
      tasks = tasks.filter(t => t.status === this.currentFilter);
    }

    // Filter by category
    if (this.currentCategory !== 'all') {
      tasks = tasks.filter(t => t.category.toLowerCase() === this.currentCategory.toLowerCase());
    }

    // Search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }

    const container = document.getElementById('tasks-list-container');
    const totalCount = document.getElementById('tasks-count-total');
    if (totalCount) totalCount.textContent = `${tasks.length} Tugas`;

    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-cream-200 p-8 shadow-xs">
          <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-lavender-100 flex items-center justify-center text-3xl">
            🌱
          </div>
          <h3 class="text-lg font-bold text-main mb-1">Tidak ada tugas ditemukan</h3>
          <p class="text-sm text-muted max-w-sm mx-auto mb-5">
            ${this.searchQuery ? 'Coba ubah kata kunci pencarianmu atau ganti filter.' : 'Semua rencana tugas sudah selesai atau belum ditambahkan.'}
          </p>
          <button onclick="window.tasksController.openAddModal()" class="btn-primary text-sm">
            + Tambah Tugas Baru
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = tasks.map(t => {
      const isDone = t.status === 'done';
      const isHigh = t.priority === 'high';
      const isMed = t.priority === 'medium';

      return `
        <div class="soft-card p-5 rounded-2xl border transition-all hover:border-lavender-300 relative group ${isDone ? 'bg-slate-50/70 border-slate-200 opacity-80' : 'bg-white border-cream-200'}">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <button 
                onclick="window.tasksController.toggleComplete('${t.id}')"
                class="mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                  isDone 
                    ? 'bg-sage-500 border-sage-500 text-white shadow-xs' 
                    : 'border-slate-300 hover:border-lavender-500 hover:bg-lavender-50'
                }"
                title="${isDone ? 'Tandai belum selesai' : 'Tandai selesai (+20 SP)'}">
                ${isDone ? '✓' : ''}
              </button>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isHigh ? 'bg-pink-100 text-pink-700' :
                    isMed ? 'bg-butter-100 text-butter-700' :
                    'bg-sage-100 text-sage-700'
                  }">
                    ${t.priority.toUpperCase()}
                  </span>
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    ${t.category}
                  </span>
                  ${t.status === 'inprogress' ? '<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Sedang Dikerjakan</span>' : ''}
                </div>

                <h4 class="font-bold text-main text-base mb-1 ${isDone ? 'line-through text-slate-400' : ''}">
                  ${t.title}
                </h4>

                ${t.description ? `
                  <p class="text-xs text-muted mb-3 line-clamp-2 ${isDone ? 'text-slate-400' : ''}">
                    ${t.description}
                  </p>
                ` : ''}

                <div class="flex items-center gap-4 text-xs text-muted pt-2 border-t border-cream-100">
                  <span class="flex items-center gap-1">
                    📅 Deadline: <strong class="text-slate-700">${t.deadline || 'Hari ini'}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
              <button 
                onclick="window.tasksController.openEditModal('${t.id}')"
                class="p-1.5 text-slate-400 hover:text-lavender-700 hover:bg-lavender-50 rounded-lg transition-colors"
                title="Edit tugas">
                ✏️
              </button>
              <button 
                onclick="window.tasksController.deleteTask('${t.id}')"
                class="p-1.5 text-slate-400 hover:text-pink-700 hover:bg-pink-50 rounded-lg transition-colors"
                title="Hapus tugas">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Toggle complete & award points
  toggleComplete(id) {
    const data = window.store.userData;
    if (!data) return;

    const task = data.tasks.find(t => t.id === id);
    if (!task) return;

    window.soundEngine.playClick();

    if (task.status !== 'done') {
      task.status = 'done';
      task.completedAt = new Date().toISOString();

      // Award +20 SP for finishing task (guarded against re-awarding with key)
      const awarded = window.store.awardSP(20, `Menyelesaikan tugas: ${task.title}`, `task_${task.id}`, 'task');
      if (awarded) {
        window.soundEngine.playSuccess();
        if (window.confetti) {
          window.confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        }
        window.app.showToast(`Tugas selesai! +20 Study Points (SP) 🎉`, 'success');
      }

      // Update Daily Quests progress
      window.store.updateQuestProgress('task', 1);

      // Check if goals need updating
      data.goals.daily.forEach(g => {
        if (!g.completed && g.unit === 'tugas') {
          g.current += 1;
          if (g.current >= g.target) {
            g.completed = true;
            window.store.awardSP(30, `Target harian tercapai: ${g.title}`, `goal_${g.id}`, 'goal');
          }
        }
      });
    } else {
      task.status = 'todo';
      task.completedAt = null;
      window.app.showToast('Status tugas dikembalikan ke To Do', 'info');
    }

    window.store.saveUserData();
    this.render();
    window.dashboardController.render();
  }

  openAddModal() {
    this.editingTaskId = null;
    const modal = document.getElementById('task-modal');
    const titleEl = document.getElementById('task-modal-title');
    const form = document.getElementById('task-form');

    if (titleEl) titleEl.textContent = 'Tambah Tugas Baru';
    if (form) form.reset();

    const deadlineInput = document.getElementById('task-input-deadline');
    if (deadlineInput) {
      deadlineInput.value = getTodayString();
    }

    if (modal) modal.classList.remove('hidden');
  }

  openEditModal(id) {
    const data = window.store.userData;
    if (!data) return;
    const task = data.tasks.find(t => t.id === id);
    if (!task) return;

    this.editingTaskId = id;
    const modal = document.getElementById('task-modal');
    const titleEl = document.getElementById('task-modal-title');

    if (titleEl) titleEl.textContent = 'Edit Tugas';

    document.getElementById('task-input-title').value = task.title;
    document.getElementById('task-input-desc').value = task.description || '';
    document.getElementById('task-input-deadline').value = task.deadline || getTodayString();
    document.getElementById('task-input-priority').value = task.priority;
    document.getElementById('task-input-category').value = task.category;
    document.getElementById('task-input-status').value = task.status;

    if (modal) modal.classList.remove('hidden');
  }

  closeModal() {
    const modal = document.getElementById('task-modal');
    if (modal) modal.classList.add('hidden');
    this.editingTaskId = null;
  }

  saveTaskFromForm(e) {
    e.preventDefault();
    const data = window.store.userData;
    if (!data) return;

    const title = document.getElementById('task-input-title').value.trim();
    const description = document.getElementById('task-input-desc').value.trim();
    const deadline = document.getElementById('task-input-deadline').value;
    const priority = document.getElementById('task-input-priority').value;
    const category = document.getElementById('task-input-category').value.trim() || 'General';
    const status = document.getElementById('task-input-status').value;

    if (!title) {
      window.app.showToast('Judul tugas wajib diisi!', 'warning');
      return;
    }

    if (this.editingTaskId) {
      // Update
      const task = data.tasks.find(t => t.id === this.editingTaskId);
      if (task) {
        task.title = title;
        task.description = description;
        task.deadline = deadline;
        task.priority = priority;
        task.category = category;
        task.status = status;
        window.app.showToast('Tugas berhasil diperbarui ✨', 'success');
      }
    } else {
      // Add
      const newTask = {
        id: 'task_' + Date.now(),
        title,
        description,
        deadline,
        priority,
        category,
        status,
        completedAt: status === 'done' ? new Date().toISOString() : null,
        createdAt: new Date().toISOString()
      };
      data.tasks.unshift(newTask);
      window.app.showToast('Tugas baru berhasil ditambahkan! 📝', 'success');
    }

    window.soundEngine.playSuccess();
    window.store.saveUserData();
    this.closeModal();
    this.render();
    window.dashboardController.render();
  }

  deleteTask(id) {
    const data = window.store.userData;
    if (!data) return;

    if (confirm('Yakin ingin menghapus tugas ini?')) {
      data.tasks = data.tasks.filter(t => t.id !== id);
      window.store.saveUserData();
      window.app.showToast('Tugas telah dihapus', 'info');
      this.render();
      window.dashboardController.render();
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll('.task-filter-btn').forEach(btn => {
      if (btn.dataset.filter === filter) {
        btn.classList.add('bg-lavender-500', 'text-white');
        btn.classList.remove('bg-white', 'text-slate-600');
      } else {
        btn.classList.remove('bg-lavender-500', 'text-white');
        btn.classList.add('bg-white', 'text-slate-600');
      }
    });
    this.render();
  }

  setCategory(cat) {
    this.currentCategory = cat;
    this.render();
  }

  setSearch(q) {
    this.searchQuery = q;
    this.render();
  }
}

window.tasksController = new TasksController();

