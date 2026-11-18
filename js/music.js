/**
 * STUDYSPACE - Study Music & Ambience Controller
 * Features 6 distinct procedural instrumental compositions (piano, lo-fi, harp, classical)
 * with play/pause/skip, volume control, favorites, and ambient mixer. Zero YouTube links!
 */

class MusicController {
  constructor() {
    this.favorites = JSON.parse(localStorage.getItem('studyspace_music_favs') || '[]');
    this.ambientStates = {
      rain: { active: false, vol: 0.5 },
      library: { active: false, vol: 0.5 },
      cafe: { active: false, vol: 0.5 },
      nature: { active: false, vol: 0.5 }
    };
  }

  togglePlay() {
    window.soundEngine.toggleMusic();
    this.updatePlayerUI();
  }

  playTrack(index) {
    window.soundEngine.playMusic(index);
    this.updatePlayerUI();
  }

  nextTrack() {
    window.soundEngine.nextTrack();
    this.updatePlayerUI();
  }

  prevTrack() {
    window.soundEngine.prevTrack();
    this.updatePlayerUI();
  }

  setVolume(val) {
    window.soundEngine.setMusicVolume(val);
  }

  toggleFavorite(id) {
    if (this.favorites.includes(id)) {
      this.favorites = this.favorites.filter(f => f !== id);
    } else {
      this.favorites.push(id);
    }
    localStorage.setItem('studyspace_music_favs', JSON.stringify(this.favorites));
    window.soundEngine.playClick();
    this.renderTrackList();
  }

  toggleAmbience(id) {
    const amb = this.ambientStates[id];
    if (!amb) return;

    amb.active = !amb.active;
    window.soundEngine.playClick();

    if (amb.active) {
      window.soundEngine.startAmbience(id, amb.vol);
      window.app.showToast(`Suara ${id.toUpperCase()} diaktifkan 🍃`, 'info');
    } else {
      window.soundEngine.stopAmbience(id);
    }

    this.renderAmbienceControls();
  }

  setAmbienceVolume(id, val) {
    const amb = this.ambientStates[id];
    if (!amb) return;
    amb.vol = parseFloat(val);
    if (amb.active) {
      window.soundEngine.setAmbienceVolume(id, amb.vol);
    }
  }

  render() {
    this.updatePlayerUI();
    this.renderTrackList();
    this.renderAmbienceControls();
  }

  updatePlayerUI() {
    const isPlaying = window.soundEngine.isPlayingMusic;
    const curIdx = window.soundEngine.currentTrackIndex;
    const track = window.INSTRUMENTAL_TRACKS[curIdx] || window.INSTRUMENTAL_TRACKS[0];

    const titleEl = document.getElementById('music-current-title');
    const artistEl = document.getElementById('music-current-artist');
    const genreEl = document.getElementById('music-current-genre');
    const playBtn = document.getElementById('music-btn-play');
    const visBox = document.getElementById('music-visualizer-box');

    if (titleEl) titleEl.textContent = track.title;
    if (artistEl) artistEl.textContent = track.artist;
    if (genreEl) genreEl.textContent = track.genre;

    if (playBtn) {
      playBtn.innerHTML = isPlaying ? '⏸' : '▶';
      playBtn.title = isPlaying ? 'Jeda Lagu' : 'Putar Lagu';
    }

    if (visBox) {
      if (isPlaying) {
        visBox.classList.remove('opacity-40');
      } else {
        visBox.classList.add('opacity-40');
      }
    }

    // Also update mini player in Dashboard if present
    const dashPlayBtn = document.getElementById('dash-music-play-btn');
    const dashTrackTitle = document.getElementById('dash-music-track-title');
    if (dashPlayBtn) dashPlayBtn.innerHTML = isPlaying ? '⏸' : '▶';
    if (dashTrackTitle) dashTrackTitle.textContent = track.title;

    this.renderTrackList();
  }

  renderTrackList() {
    const list = document.getElementById('music-track-list');
    if (!list) return;

    const curIdx = window.soundEngine.currentTrackIndex;
    const isPlaying = window.soundEngine.isPlayingMusic;

    list.innerHTML = window.INSTRUMENTAL_TRACKS.map((t, idx) => {
      const isCur = curIdx === idx;
      const isFav = this.favorites.includes(t.id);

      return `
        <div class="flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
          isCur 
            ? 'bg-lavender-100/80 border-lavender-400 shadow-xs' 
            : 'bg-white border-cream-200 hover:border-lavender-200 hover:bg-slate-50/60'
        }" onclick="window.musicController.playTrack(${idx})">
          <div class="flex items-center gap-3.5 min-w-0 pr-2">
            <span class="w-10 h-10 rounded-xl bg-white border border-cream-200 flex items-center justify-center text-xl shadow-2xs shrink-0">
              ${t.icon}
            </span>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-bold text-main truncate">${t.title}</h4>
                ${isCur && isPlaying ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-lavender-600 text-white font-bold animate-pulse">Playing</span>' : ''}
              </div>
              <p class="text-xs text-muted truncate">${t.artist} • ${t.genre}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0" onclick="event.stopPropagation()">
            <button 
              onclick="window.musicController.toggleFavorite('${t.id}')"
              class="p-2 text-slate-300 hover:text-pink-500 transition-colors text-base ${isFav ? 'text-pink-500 font-bold' : ''}"
              title="Favorit">
              ${isFav ? '❤️' : '🤍'}
            </button>
            <button 
              onclick="window.musicController.playTrack(${idx})"
              class="w-9 h-9 rounded-xl ${isCur && isPlaying ? 'bg-lavender-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-lavender-200'} flex items-center justify-center text-sm font-bold shadow-2xs hover:scale-105 transition-all">
              ${isCur && isPlaying ? '⏸' : '▶'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderAmbienceControls() {
    const container = document.getElementById('music-ambience-mixer');
    if (!container) return;

    const ambiences = [
      { id: 'rain', name: 'Rintik Hujan', icon: '🌧️', desc: 'Pink noise lembut terfilter' },
      { id: 'library', name: 'Perpustakaan', icon: '📚', desc: 'Keheningan ruang hangat' },
      { id: 'cafe', name: 'Kafe Santai', icon: '☕', desc: 'Desir hangat coffee shop' },
      { id: 'nature', name: 'Angin Alam', icon: '🍃', desc: 'Gemersik dedaunan & angin' }
    ];

    container.innerHTML = ambiences.map(a => {
      const state = this.ambientStates[a.id];
      return `
        <div class="p-4 rounded-2xl border transition-all ${
          state.active 
            ? 'bg-sage-50 border-sage-300 shadow-2xs' 
            : 'bg-white border-cream-200 opacity-90'
        }">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">${a.icon}</span>
              <div>
                <h5 class="text-sm font-bold text-main">${a.name}</h5>
                <p class="text-[10px] text-muted">${a.desc}</p>
              </div>
            </div>
            <button 
              onclick="window.musicController.toggleAmbience('${a.id}')"
              class="px-3 py-1 rounded-full text-xs font-bold transition-all ${
                state.active 
                  ? 'bg-sage-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }">
              ${state.active ? 'Aktif' : 'Mati'}
            </button>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <span class="text-[10px] text-muted">🔈</span>
            <input 
              type="range" 
              min="0.05" 
              max="1" 
              step="0.05" 
              value="${state.vol}" 
              oninput="window.musicController.setAmbienceVolume('${a.id}', this.value)"
              class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sage-600"
              ${!state.active ? 'disabled opacity-50' : ''}>
            <span class="text-[10px] text-muted">🔊</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

window.musicController = new MusicController();
