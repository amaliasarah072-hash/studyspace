/**
 * STUDYSPACE - Notes Controller
 * Personal study notebook with categories, real-time search, color themes,
 * pin capability, and auto-save indicators.
 */

class NotesController {
  constructor() {
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.activeNoteId = null;
    this.autoSaveTimer = null;
  }

  render() {
    const data = window.store.userData;
    if (!data) return;

    let notes = [...data.notes];

    // Filter category
    if (this.currentCategory !== 'all') {
      notes = notes.filter(n => n.category.toLowerCase() === this.currentCategory.toLowerCase());
    }

    // Filter search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      notes = notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }

    // Sort: pinned first, then newest
    notes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

    const container = document.getElementById('notes-grid-container');
    if (!container) return;

    if (notes.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-cream-200 p-8">
          <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-butter-100 flex items-center justify-center text-3xl">
            📝
          </div>
          <h3 class="text-lg font-bold text-main mb-1">Belum Ada Catatan</h3>
          <p class="text-sm text-muted max-w-sm mx-auto mb-5">
            ${this.searchQuery ? 'Tidak ada catatan yang cocok dengan pencarianmu.' : 'Catat rumus penting, rangkuman bab, atau ide belajarmu di sini.'}
          </p>
          <button onclick="window.notesController.createNewNote()" class="btn-primary text-sm">
            + Tulis Catatan Baru
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = notes.map(n => {
      const colorBg = 
        n.color === 'sage' ? 'bg-sage-50/70 border-sage-200' :
        n.color === 'pink' ? 'bg-pink-50/70 border-pink-200' :
        n.color === 'butter' ? 'bg-butter-50/70 border-butter-200' :
        'bg-lavender-50/70 border-lavender-200';

      return `
        <div class="p-5 rounded-2xl border transition-all hover:shadow-md cursor-pointer flex flex-col justify-between ${colorBg}" onclick="window.notesController.openNoteEditor('${n.id}')">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 text-slate-700 shadow-2xs">
                ${n.category}
              </span>
              <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
                <button 
                  onclick="window.notesController.togglePin('${n.id}')"
                  class="p-1 rounded hover:bg-white/60 transition-colors text-xs ${n.pinned ? 'text-amber-500 font-bold' : 'text-slate-400'}"
                  title="${n.pinned ? 'Lepas pin' : 'Sematkan catatan'}">
                  📌
                </button>
                <button 
                  onclick="window.notesController.deleteNote('${n.id}')"
                  class="p-1 rounded hover:bg-white/60 transition-colors text-xs text-slate-400 hover:text-pink-600"
                  title="Hapus catatan">
                  🗑️
                </button>
              </div>
            </div>

            <h4 class="font-bold text-base text-main mb-2 line-clamp-1">${n.title}</h4>
            <p class="text-xs text-slate-600 whitespace-pre-line line-clamp-4 leading-relaxed font-normal">
              ${n.content}
            </p>
          </div>

          <div class="pt-4 mt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-muted">
            <span>${n.content.trim().split(/\\s+/).filter(Boolean).length} kata</span>
            <span>${new Date(n.updatedAt || n.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  createNewNote() {
    const data = window.store.userData;
    if (!data) return;

    const newNote = {
      id: 'note_' + Date.now(),
      title: 'Catatan Baru Tanpa Judul',
      content: 'Mulai menulis catatan atau rangkuman materi di sini...',
      category: 'General',
      color: 'lavender',
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.notes.unshift(newNote);
    window.store.saveUserData();
    this.openNoteEditor(newNote.id);
  }

  openNoteEditor(id) {
    const data = window.store.userData;
    if (!data) return;
    const note = data.notes.find(n => n.id === id);
    if (!note) return;

    this.activeNoteId = id;
    const modal = document.getElementById('note-editor-modal');
    if (!modal) return;

    document.getElementById('note-edit-title').value = note.title;
    document.getElementById('note-edit-content').value = note.content;
    document.getElementById('note-edit-category').value = note.category;
    document.getElementById('note-edit-color').value = note.color;

    const saveStatus = document.getElementById('note-save-status');
    if (saveStatus) saveStatus.textContent = 'Semua perubahan tersimpan';

    modal.classList.remove('hidden');
  }

  closeEditor() {
    const modal = document.getElementById('note-editor-modal');
    if (modal) modal.classList.add('hidden');
    this.activeNoteId = null;
    this.render();
  }

  onInputContent() {
    const saveStatus = document.getElementById('note-save-status');
    if (saveStatus) saveStatus.textContent = 'Menyimpan...';

    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => {
      this.saveActiveNote();
    }, 600);
  }

  saveActiveNote() {
    if (!this.activeNoteId) return;
    const data = window.store.userData;
    if (!data) return;

    const note = data.notes.find(n => n.id === this.activeNoteId);
    if (!note) return;

    note.title = document.getElementById('note-edit-title').value.trim() || 'Tanpa Judul';
    note.content = document.getElementById('note-edit-content').value;
    note.category = document.getElementById('note-edit-category').value.trim() || 'General';
    note.color = document.getElementById('note-edit-color').value;
    note.updatedAt = new Date().toISOString();

    window.store.saveUserData();

    const saveStatus = document.getElementById('note-save-status');
    if (saveStatus) saveStatus.textContent = 'Tersimpan otomatis ✓';
  }

  togglePin(id) {
    const data = window.store.userData;
    if (!data) return;
    const note = data.notes.find(n => n.id === id);
    if (note) {
      note.pinned = !note.pinned;
      window.soundEngine.playClick();
      window.store.saveUserData();
      this.render();
    }
  }

  deleteNote(id) {
    const data = window.store.userData;
    if (!data) return;

    if (confirm('Hapus catatan ini?')) {
      data.notes = data.notes.filter(n => n.id !== id);
      window.store.saveUserData();
      window.app.showToast('Catatan dihapus', 'info');
      if (this.activeNoteId === id) {
        this.closeEditor();
      } else {
        this.render();
      }
    }
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

window.notesController = new NotesController();

