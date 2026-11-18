/**
 * STUDYSPACE - Web Audio Instrumental Music & Sound Engine
 * Synthesizes 6 distinct genuine instrumental music compositions (piano, lo-fi, harp, classical)
 * plus procedural ambient soundscapes (Rain, Cafe, Library, Nature) 100% offline with zero external audio assets!
 */

// Musical note frequencies (Hz)
const NOTE_FREQ = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50
};

// 6 Distinct Instrumental Compositions
const INSTRUMENTAL_TRACKS = [
  {
    id: 'track_morning',
    title: 'Morning Piano Serenade',
    artist: 'StudySpace Instrumental',
    genre: 'Soft Piano',
    bpm: 66,
    icon: '🎹',
    instrument: 'piano',
    sequence: [
      { note: 'C4', dur: 0.6 }, { note: 'E4', dur: 0.6 }, { note: 'G4', dur: 0.6 }, { note: 'C5', dur: 1.2 },
      { note: 'B4', dur: 0.6 }, { note: 'G4', dur: 0.6 }, { note: 'E4', dur: 0.6 }, { note: 'A4', dur: 1.2 },
      { note: 'F4', dur: 0.6 }, { note: 'A4', dur: 0.6 }, { note: 'C5', dur: 0.6 }, { note: 'E5', dur: 1.2 },
      { note: 'D5', dur: 0.6 }, { note: 'G4', dur: 0.6 }, { note: 'B4', dur: 0.6 }, { note: 'C5', dur: 1.8 }
    ]
  },
  {
    id: 'track_lofi',
    title: 'Cozy Lo-fi Chords & Beats',
    artist: 'StudySpace Lo-fi',
    genre: 'Mellow Lo-fi',
    bpm: 74,
    icon: '☕',
    instrument: 'rhodes',
    sequence: [
      { note: 'A3', dur: 0.8 }, { note: 'C4', dur: 0.4 }, { note: 'E4', dur: 0.8 }, { note: 'G4', dur: 1.0 },
      { note: 'F3', dur: 0.8 }, { note: 'A3', dur: 0.4 }, { note: 'C4', dur: 0.8 }, { note: 'E4', dur: 1.0 },
      { note: 'D3', dur: 0.8 }, { note: 'F3', dur: 0.4 }, { note: 'A3', dur: 0.8 }, { note: 'C4', dur: 1.0 },
      { note: 'E3', dur: 0.8 }, { note: 'G3', dur: 0.4 }, { note: 'B3', dur: 0.8 }, { note: 'D4', dur: 1.0 }
    ]
  },
  {
    id: 'track_rain',
    title: 'Midnight Rain Reflection',
    artist: 'Peaceful Academic',
    genre: 'Calm Melancholy',
    bpm: 58,
    icon: '🌧️',
    instrument: 'warm_pad',
    sequence: [
      { note: 'D4', dur: 1.0 }, { note: 'F4', dur: 1.0 }, { note: 'A4', dur: 1.2 }, { note: 'D5', dur: 1.5 },
      { note: 'C5', dur: 1.0 }, { note: 'A4', dur: 1.0 }, { note: 'F4', dur: 1.0 }, { note: 'E4', dur: 1.5 },
      { note: 'G4', dur: 1.0 }, { note: 'B4', dur: 1.0 }, { note: 'D5', dur: 1.2 }, { note: 'A4', dur: 2.0 }
    ]
  },
  {
    id: 'track_classical',
    title: 'Classical Mind (Baroque Focus)',
    artist: 'Academy Ensemble',
    genre: 'Classical Chamber',
    bpm: 82,
    icon: '🎻',
    instrument: 'classical',
    sequence: [
      { note: 'G4', dur: 0.4 }, { note: 'B4', dur: 0.4 }, { note: 'D5', dur: 0.4 }, { note: 'G5', dur: 0.8 },
      { note: 'F5', dur: 0.4 }, { note: 'D5', dur: 0.4 }, { note: 'B4', dur: 0.4 }, { note: 'C5', dur: 0.8 },
      { note: 'E4', dur: 0.4 }, { note: 'G4', dur: 0.4 }, { note: 'C5', dur: 0.4 }, { note: 'E5', dur: 0.8 },
      { note: 'D5', dur: 0.4 }, { note: 'B4', dur: 0.4 }, { note: 'A4', dur: 0.4 }, { note: 'G4', dur: 1.4 }
    ]
  },
  {
    id: 'track_harp',
    title: 'Forest Stream & Harp Walk',
    artist: 'Nature Sanctuary',
    genre: 'Acoustic Harp',
    bpm: 68,
    icon: '🍃',
    instrument: 'harp',
    sequence: [
      { note: 'E4', dur: 0.5 }, { note: 'G4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'B4', dur: 0.8 },
      { note: 'D5', dur: 0.5 }, { note: 'B4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'G4', dur: 1.0 },
      { note: 'E4', dur: 0.5 }, { note: 'A4', dur: 0.5 }, { note: 'B4', dur: 0.5 }, { note: 'E5', dur: 1.5 }
    ]
  },
  {
    id: 'track_alpha',
    title: 'Deep Focus Alpha Waves',
    artist: 'Mindful Space',
    genre: 'Ambient Harmony',
    bpm: 50,
    icon: '🧘',
    instrument: 'ambient_drone',
    sequence: [
      { note: 'A3', dur: 1.8 }, { note: 'E4', dur: 1.8 }, { note: 'A4', dur: 2.2 },
      { note: 'F3', dur: 1.8 }, { note: 'C4', dur: 1.8 }, { note: 'F4', dur: 2.2 },
      { note: 'G3', dur: 1.8 }, { note: 'D4', dur: 1.8 }, { note: 'G4', dur: 2.4 }
    ]
  }
];

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;

    // Music Player State
    this.isPlayingMusic = false;
    this.currentTrackIndex = 0;
    this.musicVolume = 0.6;
    this.musicTimer = null;
    this.stepIndex = 0;
    this.masterMusicGain = null;

    // Ambient Nodes
    this.ambientNodes = {};
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterMusicGain = this.ctx.createGain();
        this.masterMusicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.masterMusicGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft UI Click
  playClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.035);
  }

  // Success Chime
  playSuccess() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const st = this.ctx.currentTime + idx * 0.065;
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.1, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.45);
    });
  }

  // Timer Ding (Tibetan Bell)
  playTimerComplete() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    [440, 880, 1320, 1760].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12 / (i + 1), this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.5);
    });
  }

  // Fanfare for level-up & achievements
  playFanfare() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const chord = [
      { f: 523.25, t: 0 }, { f: 659.25, t: 0.1 }, { f: 783.99, t: 0.2 },
      { f: 1046.50, t: 0.35 }, { f: 1318.51, t: 0.45 }, { f: 1567.98, t: 0.6 }
    ];
    chord.forEach(item => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const st = this.ctx.currentTime + item.t;
      osc.frequency.setValueAtTime(item.f, st);
      gain.gain.setValueAtTime(0.1, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.55);
    });
  }

  /* ========================================================
     INSTRUMENTAL MUSIC SYNTHESIZER
  ======================================================== */
  playMusic(trackIndex = null) {
    this.init();
    if (!this.ctx) return;

    if (trackIndex !== null) {
      this.currentTrackIndex = (trackIndex + INSTRUMENTAL_TRACKS.length) % INSTRUMENTAL_TRACKS.length;
      this.stepIndex = 0;
    }

    this.isPlayingMusic = true;
    clearTimeout(this.musicTimer);
    this.scheduleNextNote();
    window.musicController && window.musicController.updatePlayerUI();
  }

  pauseMusic() {
    this.isPlayingMusic = false;
    clearTimeout(this.musicTimer);
    this.musicTimer = null;
    window.musicController && window.musicController.updatePlayerUI();
  }

  toggleMusic() {
    if (this.isPlayingMusic) {
      this.pauseMusic();
    } else {
      this.playMusic();
    }
  }

  nextTrack() {
    this.playMusic(this.currentTrackIndex + 1);
  }

  prevTrack() {
    this.playMusic(this.currentTrackIndex - 1);
  }

  setMusicVolume(vol) {
    this.musicVolume = parseFloat(vol);
    if (this.masterMusicGain && this.ctx) {
      this.masterMusicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  scheduleNextNote() {
    if (!this.isPlayingMusic || !this.ctx) return;

    const track = INSTRUMENTAL_TRACKS[this.currentTrackIndex];
    if (!track) return;

    const item = track.sequence[this.stepIndex];
    const freq = NOTE_FREQ[item.note] || 261.63;
    const durSeconds = item.dur;

    this.synthesizeInstrumentNote(track.instrument, freq, durSeconds);

    this.stepIndex = (this.stepIndex + 1) % track.sequence.length;

    // Time until next note
    const delayMs = durSeconds * 1000;
    this.musicTimer = setTimeout(() => {
      this.scheduleNextNote();
    }, delayMs);
  }

  synthesizeInstrumentNote(type, freq, duration) {
    if (!this.ctx || !this.masterMusicGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (type === 'piano') {
      // Soft Acoustic Piano
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + duration);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.2);
    } else if (type === 'rhodes') {
      // Lo-fi Warm Rhodes Piano
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(950, now);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.4);
    } else if (type === 'classical') {
      // Classical Baroque Pluck
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.9);
    } else if (type === 'harp') {
      // Acoustic Harp
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, now);
      filter.Q.setValueAtTime(1.2, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.5);
    } else {
      // Ambient warm drone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + duration * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.3);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterMusicGain);

    osc.start(now);
    osc.stop(now + duration * 1.5);
  }

  /* ========================================================
     PROCEDURAL AMBIENCE GENERATOR
  ======================================================== */
  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  startAmbience(id, volume = 0.5) {
    this.init();
    if (!this.ctx) return;

    if (this.ambientNodes[id]) {
      this.setAmbienceVolume(id, volume);
      return;
    }

    const noiseBuffer = this.createNoiseBuffer();
    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.25, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();

    if (id === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, this.ctx.currentTime);
    } else if (id === 'cafe') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.6, this.ctx.currentTime);
    } else if (id === 'library') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);
    } else if (id === 'nature') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.9, this.ctx.currentTime);
    }

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    source.start();
    this.ambientNodes[id] = { source, gainNode, filter };
  }

  stopAmbience(id) {
    if (this.ambientNodes[id]) {
      try {
        this.ambientNodes[id].source.stop();
        this.ambientNodes[id].source.disconnect();
      } catch (e) {}
      delete this.ambientNodes[id];
    }
  }

  setAmbienceVolume(id, volume) {
    if (this.ambientNodes[id] && this.ctx) {
      this.ambientNodes[id].gainNode.gain.setValueAtTime(volume * 0.25, this.ctx.currentTime);
    }
  }

  stopAllAmbiences() {
    Object.keys(this.ambientNodes).forEach(id => this.stopAmbience(id));
  }
}

window.INSTRUMENTAL_TRACKS = INSTRUMENTAL_TRACKS;
window.soundEngine = new SoundEngine();
