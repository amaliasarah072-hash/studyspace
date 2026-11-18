/**
 * STUDYSPACE - Settings Controller
 * Handles user profile edits, theme switcher (Cream, Lavender, Sage, Peach),
 * audio toggles, tutorial re-triggers, data backup, and Firebase connector configuration.
 */

class SettingsController {
  render() {
    const data = window.store.userData;
    const user = window.store.currentUser;
    if (!data || !user) return;

    const nameInput = document.getElementById('settings-input-name');
    const emailInput = document.getElementById('settings-input-email');
    const gradeInput = document.getElementById('settings-input-grade');
    const bioInput = document.getElementById('settings-input-bio');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) {
      const uTag = user.username ? `@${user.username}` : user.name;
      const bTag = user.browserAccount || 'Chrome Connected';
      emailInput.value = `${uTag} (${bTag})`;
    }
    if (gradeInput) gradeInput.value = user.grade || '';
    if (bioInput) bioInput.value = user.bio || '';

    const avatarEl = document.getElementById('settings-avatar-preview');
    if (avatarEl && window.AvatarRenderer) {
      avatarEl.innerHTML = window.AvatarRenderer.renderSVG(data.avatar, 90);
    }

    const sfxCheckbox = document.getElementById('settings-sfx-toggle');
    if (sfxCheckbox) {
      sfxCheckbox.checked = window.soundEngine.soundEnabled;
    }

    const themeSelect = document.getElementById('settings-theme-select');
    if (themeSelect) {
      themeSelect.value = data.theme || localStorage.getItem('studyspace_active_theme') || 'cream';
    }
  }

  saveProfile(e) {
    e.preventDefault();
    const user = window.store.currentUser;
    const data = window.store.userData;
    if (!user || !data) return;

    const name = document.getElementById('settings-input-name').value.trim();
    const grade = document.getElementById('settings-input-grade').value.trim();
    const bio = document.getElementById('settings-input-bio').value.trim();

    if (!name) {
      window.app.showToast('Nama pengguna tidak boleh kosong', 'warning');
      return;
    }

    user.name = name;
    user.grade = grade;
    user.bio = bio;

    const users = window.store.getAllUsers();
    const uIdx = users.findIndex(u => u.id === user.id);
    if (uIdx !== -1) {
      users[uIdx] = user;
      window.store.saveUsers(users);
    }

    window.store.saveUserData();
    window.soundEngine.playSuccess();
    window.app.showToast('Profil berhasil diperbarui ✨', 'success');

    window.app.renderAll();
  }

  toggleSFX(checked) {
    window.soundEngine.soundEnabled = checked;
    if (window.store.userData) {
      window.store.userData.soundEffects = checked;
      window.store.saveUserData();
    }
    if (checked) {
      window.soundEngine.playClick();
      window.app.showToast('Efek suara diaktifkan 🔔', 'info');
    } else {
      window.app.showToast('Efek suara dimatikan', 'info');
    }
  }

  setTheme(themeName) {
    // 1. Update HTML and Body attributes
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.setAttribute('data-theme', themeName);

    // 2. Persist in storage and user data
    localStorage.setItem('studyspace_active_theme', themeName);
    if (window.store.userData) {
      window.store.userData.theme = themeName;
      window.store.saveUserData();
    }

    const themeLabels = {
      cream: 'Soft Cream (Default)',
      lavender: 'Cozy Lavender 💜',
      sage: 'Sage Garden 🍃',
      peach: 'Sunset Peach 🍑'
    };

    window.soundEngine.playClick();
    window.app.showToast(`Tema diubah ke: ${themeLabels[themeName] || themeName}`, 'info');
  }

  replayTutorial() {
    window.authController.startTutorial(0);
  }

  exportData() {
    const data = window.store.userData;
    if (!data) return;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudySpace_Backup_${data.userId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.app.showToast('Cadangan data berhasil diunduh 💾', 'success');
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed && parsed.userId) {
          window.store.userData = parsed;
          window.store.saveUserData();
          window.app.renderAll();
          window.app.showToast('Data berhasil dipulihkan! 🎉', 'success');
        } else {
          window.app.showToast('Format berkas tidak valid', 'error');
        }
      } catch (err) {
        window.app.showToast('Gagal membaca berkas cadangan', 'error');
      }
    };
    reader.readAsText(file);
  }

  resetAllData() {
    if (confirm('PERINGATAN: Apakah kamu yakin ingin mereset semua data tugas, jadwal, poin, dan target? Tindakan ini tidak dapat dibatalkan.')) {
      const user = window.store.currentUser;
      if (user) {
        const fresh = window.store.createInitialUserData(user);
        window.store.saveUserData(user.id, fresh);
        window.store.userData = fresh;
        window.app.renderAll();
        window.app.showToast('Data telah dibersihkan ke setelan awal kosong ✨', 'info');
      }
    }
  }
}

window.settingsController = new SettingsController();
