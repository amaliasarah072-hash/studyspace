/**
 * STUDYSPACE - Brain Corner Mini Games Controller
 * 4 Genuine Playable Games:
 * 1. Word Search (Dynamic Multi-Theme Word Pools on every shuffle!)
 * 2. Sudoku (Easy, Medium, Hard)
 * 3. Memory Match
 * 4. Logic Puzzle (Tower of Study Books)
 * Includes Study Points rewards, stats tracking, and achievements!
 */

const WORD_SEARCH_POOLS = [
  { theme: 'Fokus & Belajar 📚', words: ['FOCUS', 'LEARN', 'STUDY', 'BRAIN', 'NOTES', 'GOAL'] },
  { theme: 'Kecerdasan & Logika 💡', words: ['SMART', 'GENIUS', 'LOGIC', 'THINK', 'SOLVE', 'MIND'] },
  { theme: 'Energi & Kebiasaan 🌱', words: ['ENERGY', 'HABIT', 'EFFORT', 'GROWTH', 'DISCIPLINE', 'POWER'] },
  { theme: 'Sains & Alam Semesta 🪐', words: ['PLANET', 'GALAXY', 'COMET', 'ORBIT', 'STAR', 'ATOM'] },
  { theme: 'Bahasa & Sastra 📖', words: ['POETRY', 'STORY', 'NOVEL', 'ESSAY', 'RHYME', 'DRAMA'] },
  { theme: 'Misteri & Teka-Teki 🔍', words: ['SEARCH', 'SECRET', 'RIDDLE', 'PUZZLE', 'WONDER', 'QUEST'] },
  { theme: 'Kreativitas & Seni 🎨', words: ['CREATE', 'DESIGN', 'VISION', 'SPARK', 'BEAUTY', 'COLOR'] }
];

class BrainCornerController {
  constructor() {
    this.activeGame = 'wordsearch';

    // Dynamic Word Search State
    this.wsThemeIndex = 0;
    this.wsCurrentTheme = WORD_SEARCH_POOLS[0].theme;
    this.wsWords = [...WORD_SEARCH_POOLS[0].words];
    this.wsGridSize = 9;
    this.wsGrid = [];
    this.wsFoundWords = [];
    this.wsSelectedCells = [];

    // Sudoku State
    this.sudokuDifficulty = 'easy';
    this.sudokuBoard = [];
    this.sudokuInitial = [];
    this.sudokuSolution = [];
    this.sudokuSelectedCell = null;

    // Memory Match State
    this.memoryCards = [];
    this.flippedIndices = [];
    this.matchedPairs = 0;
    this.memoryTurns = 0;
    this.isMemoryLocked = false;

    // Logic Puzzle (Tower of Study)
    this.towers = [[], [], []];
    this.selectedTower = null;
    this.logicMoves = 0;
    this.numDisks = 3;
  }

  setGame(gameId) {
    this.activeGame = gameId;
    window.soundEngine.playClick();
    this.render();
  }

  render() {
    document.querySelectorAll('.brain-game-tab').forEach(tab => {
      if (tab.dataset.game === this.activeGame) {
        tab.classList.add('bg-lavender-500', 'text-white', 'shadow-xs');
        tab.classList.remove('bg-white', 'text-slate-600');
      } else {
        tab.classList.remove('bg-lavender-500', 'text-white', 'shadow-xs');
        tab.classList.add('bg-white', 'text-slate-600');
      }
    });

    ['wordsearch', 'sudoku', 'memory', 'logic'].forEach(id => {
      const el = document.getElementById(`game-panel-${id}`);
      if (el) el.classList.toggle('hidden', id !== this.activeGame);
    });

    if (this.activeGame === 'wordsearch') {
      if (this.wsGrid.length === 0) this.initWordSearch();
      this.renderWordSearch();
    } else if (this.activeGame === 'sudoku') {
      if (this.sudokuBoard.length === 0) this.initSudoku(this.sudokuDifficulty);
      this.renderSudoku();
    } else if (this.activeGame === 'memory') {
      if (this.memoryCards.length === 0) this.initMemory();
      this.renderMemory();
    } else if (this.activeGame === 'logic') {
      if (this.towers[0].length === 0 && this.towers[1].length === 0 && this.towers[2].length === 0) {
        this.initLogicPuzzle();
      }
      this.renderLogicPuzzle();
    }

    this.renderStats();
  }

  renderStats() {
    const data = window.store.userData;
    if (!data) return;
    const stats = data.brainCorner;

    const statsEl = document.getElementById('brain-stats-summary');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div class="p-3 bg-lavender-50 rounded-2xl border border-lavender-200">
            <span class="text-xs text-muted font-medium">Total Dimainkan</span>
            <p class="text-lg font-bold text-lavender-800">${stats.totalGamesPlayed || 0}</p>
          </div>
          <div class="p-3 bg-sage-50 rounded-2xl border border-sage-200">
            <span class="text-xs text-muted font-medium">Sudoku Menang</span>
            <p class="text-lg font-bold text-sage-800">${(stats.sudokuWins.easy + stats.sudokuWins.medium + stats.sudokuWins.hard) || 0}</p>
          </div>
          <div class="p-3 bg-pink-50 rounded-2xl border border-pink-200">
            <span class="text-xs text-muted font-medium">Memory Match</span>
            <p class="text-lg font-bold text-pink-800">${stats.memoryMatchWins || 0}</p>
          </div>
          <div class="p-3 bg-butter-50 rounded-2xl border border-butter-200">
            <span class="text-xs text-muted font-medium">Poin Diperoleh</span>
            <p class="text-lg font-bold text-amber-800">+${stats.totalPointsEarned || 0} SP</p>
          </div>
        </div>
      `;
    }
  }

  recordGameWin(gameName, spEarned) {
    const data = window.store.userData;
    if (!data) return;

    data.brainCorner.totalGamesPlayed += 1;
    data.brainCorner.totalPointsEarned += spEarned;

    data.brainCorner.history.unshift({
      game: gameName,
      date: new Date().toISOString(),
      spEarned
    });

    window.store.awardSP(spEarned, `Menang game ${gameName} di Brain Corner`, `brain_${gameName}_${Date.now()}`, 'game');
    window.store.updateQuestProgress('game', 1);

    if (data.brainCorner.totalGamesPlayed >= 3) {
      window.store.unlockAchievement('puzzle_lover');
    }

    const bc = data.brainCorner;
    const sudokuAny = (bc.sudokuWins.easy + bc.sudokuWins.medium + bc.sudokuWins.hard) > 0;
    if (bc.wordSearchWins > 0 && sudokuAny && bc.memoryMatchWins > 0 && bc.logicPuzzleWins > 0) {
      window.store.unlockAchievement('brain_champion');
    }

    window.soundEngine.playSuccess();
    if (window.confetti) {
      window.confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    window.app.showToast(`Selamat! Kamu menyelesaikan ${gameName} (+${spEarned} SP) 🎉`, 'success');

    window.store.saveUserData();
    this.renderStats();
  }

  /* ==========================================
     1. WORD SEARCH WITH DYNAMIC THEME POOLS
  ========================================== */
  initWordSearch(pickNextTheme = false) {
    if (pickNextTheme) {
      this.wsThemeIndex = (this.wsThemeIndex + 1) % WORD_SEARCH_POOLS.length;
    }
    const pool = WORD_SEARCH_POOLS[this.wsThemeIndex];
    this.wsCurrentTheme = pool.theme;
    this.wsWords = [...pool.words];

    this.wsFoundWords = [];
    this.wsSelectedCells = [];
    const size = this.wsGridSize;
    this.wsGrid = Array(size).fill(null).map(() => Array(size).fill(''));

    // Place words in the grid
    const words = [...this.wsWords];
    words.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 120) {
        attempts++;
        const dir = Math.random() > 0.5 ? 'H' : 'V';
        const row = Math.floor(Math.random() * (dir === 'V' ? size - word.length : size));
        const col = Math.floor(Math.random() * (dir === 'H' ? size - word.length : size));

        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const r = dir === 'V' ? row + i : row;
          const c = dir === 'H' ? col + i : col;
          if (this.wsGrid[r][c] !== '' && this.wsGrid[r][c] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const r = dir === 'V' ? row + i : row;
            const c = dir === 'H' ? col + i : col;
            this.wsGrid[r][c] = word[i];
          }
          placed = true;
        }
      }
    });

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!this.wsGrid[r][c]) {
          this.wsGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
  }

  renderWordSearch() {
    const gridEl = document.getElementById('ws-grid');
    const wordListEl = document.getElementById('ws-word-list');
    const themeTag = document.getElementById('ws-theme-tag');
    if (!gridEl || !wordListEl) return;

    if (themeTag) {
      themeTag.textContent = `Tema: ${this.wsCurrentTheme}`;
    }

    wordListEl.innerHTML = this.wsWords.map(w => {
      const isFound = this.wsFoundWords.includes(w);
      return `
        <span class="px-3 py-1 rounded-lg text-xs font-bold transition-all ${
          isFound ? 'bg-sage-200 text-sage-800 line-through' : 'bg-slate-100 text-slate-700'
        }">
          ${w} ${isFound ? '✓' : ''}
        </span>
      `;
    }).join('');

    gridEl.innerHTML = '';
    for (let r = 0; r < this.wsGridSize; r++) {
      for (let c = 0; c < this.wsGridSize; c++) {
        const isSelected = this.wsSelectedCells.some(cell => cell.r === r && cell.c === c);
        const cell = document.createElement('div');
        cell.className = `ws-cell border border-cream-200 bg-white ${isSelected ? 'selected' : ''}`;
        cell.textContent = this.wsGrid[r][c];
        cell.onclick = () => this.onWordSearchCellClick(r, c);
        gridEl.appendChild(cell);
      }
    }
  }

  onWordSearchCellClick(r, c) {
    window.soundEngine.playClick();
    const idx = this.wsSelectedCells.findIndex(cell => cell.r === r && cell.c === c);
    if (idx !== -1) {
      this.wsSelectedCells.splice(idx, 1);
    } else {
      this.wsSelectedCells.push({ r, c });
    }

    const currentWord = this.wsSelectedCells.map(cell => this.wsGrid[cell.r][cell.c]).join('');
    const reversedWord = currentWord.split('').reverse().join('');

    const matched = this.wsWords.find(w => w === currentWord || w === reversedWord);
    if (matched && !this.wsFoundWords.includes(matched)) {
      this.wsFoundWords.push(matched);
      this.wsSelectedCells = [];
      window.soundEngine.playSuccess();
      window.app.showToast(`Kata "${matched}" ditemukan! ✨`, 'success');

      if (this.wsFoundWords.length === this.wsWords.length) {
        window.store.userData.brainCorner.wordSearchWins += 1;
        window.store.unlockAchievement('word_hunter');
        this.recordGameWin(`Word Search (${this.wsCurrentTheme})`, 20);
      }
    }

    this.renderWordSearch();
  }

  resetWordSearch() {
    window.soundEngine.playClick();
    this.initWordSearch(true); // Pick next theme!
    this.renderWordSearch();
    window.app.showToast(`Kisi baru dimuat! ${this.wsCurrentTheme}`, 'info');
  }

  /* ==========================================
     2. SUDOKU GAME
  ========================================== */
  initSudoku(diff = 'easy') {
    this.sudokuDifficulty = diff;
    this.sudokuSelectedCell = null;

    const PUZZLES = {
      easy: {
        initial: [
          [5,3,0, 0,7,0, 0,0,0],
          [6,0,0, 1,9,5, 0,0,0],
          [0,9,8, 0,0,0, 0,6,0],

          [8,0,0, 0,6,0, 0,0,3],
          [4,0,0, 8,0,3, 0,0,1],
          [7,0,0, 0,2,0, 0,0,6],

          [0,6,0, 0,0,0, 2,8,0],
          [0,0,0, 4,1,9, 0,0,5],
          [0,0,0, 0,8,0, 0,7,9]
        ],
        solution: [
          [5,3,4, 6,7,8, 9,1,2],
          [6,7,2, 1,9,5, 3,4,8],
          [1,9,8, 3,4,2, 5,6,7],

          [8,5,9, 7,6,1, 4,2,3],
          [4,2,6, 8,5,3, 7,9,1],
          [7,1,3, 9,2,4, 8,5,6],

          [9,6,1, 5,3,7, 2,8,4],
          [2,8,7, 4,1,9, 6,3,5],
          [3,4,5, 2,8,6, 1,7,9]
        ]
      },
      medium: {
        initial: [
          [0,0,0, 6,0,0, 4,0,0],
          [7,0,0, 0,0,3, 6,0,0],
          [0,0,0, 0,9,1, 0,8,0],

          [0,0,0, 0,0,0, 0,0,0],
          [0,5,0, 1,8,0, 0,0,3],
          [0,0,0, 3,0,6, 0,4,5],

          [0,4,0, 2,0,0, 0,6,0],
          [9,0,3, 0,0,0, 0,0,0],
          [0,2,0, 0,0,0, 1,0,0]
        ],
        solution: [
          [5,8,1, 6,7,2, 4,3,9],
          [7,9,2, 8,4,3, 6,5,1],
          [3,6,4, 5,9,1, 7,8,2],

          [4,3,8, 9,5,7, 2,1,6],
          [2,5,6, 1,8,4, 9,7,3],
          [1,7,9, 3,2,6, 8,4,5],

          [8,4,5, 2,1,9, 3,6,7],
          [9,1,3, 7,6,8, 5,2,4],
          [6,2,7, 4,3,5, 1,9,8]
        ]
      },
      hard: {
        initial: [
          [0,0,0, 0,0,0, 0,1,2],
          [0,0,0, 0,0,0, 0,0,3],
          [0,0,2, 3,0,0, 4,0,0],

          [0,0,1, 8,0,0, 0,0,5],
          [0,6,0, 0,7,0, 8,0,0],
          [0,0,0, 0,0,9, 0,0,0],

          [0,0,8, 5,0,0, 0,0,0],
          [9,0,0, 0,4,0, 5,0,0],
          [4,7,0, 0,0,6, 0,0,0]
        ],
        solution: [
          [6,3,4, 7,5,8, 9,1,2],
          [1,8,7, 4,9,2, 6,5,3],
          [5,9,2, 3,6,1, 4,8,7],

          [7,2,1, 8,3,4, 9,6,5],
          [3,6,9, 1,7,5, 8,2,4],
          [8,4,5, 6,2,9, 1,3,7],

          [2,1,8, 5,8,3, 7,4,6],
          [9,4,6, 2,4,7, 5,9,8],
          [4,7,3, 9,1,6, 2,5,8]
        ]
      }
    };

    const p = PUZZLES[diff] || PUZZLES.easy;
    this.sudokuInitial = JSON.parse(JSON.stringify(p.initial));
    this.sudokuBoard = JSON.parse(JSON.stringify(p.initial));
    this.sudokuSolution = JSON.parse(JSON.stringify(p.solution));
  }

  renderSudoku() {
    const gridEl = document.getElementById('sudoku-grid');
    if (!gridEl) return;

    gridEl.innerHTML = '';
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.sudokuBoard[r][c];
        const isFixed = this.sudokuInitial[r][c] !== 0;
        const isSelected = this.sudokuSelectedCell && this.sudokuSelectedCell.r === r && this.sudokuSelectedCell.c === c;
        const isSameNumber = this.sudokuSelectedCell && val !== 0 && this.sudokuBoard[this.sudokuSelectedCell.r][this.sudokuSelectedCell.c] === val;

        const cell = document.createElement('div');
        let classes = 'sudoku-cell border border-cream-300 text-center flex items-center justify-center font-bold ';

        if (c % 3 === 2 && c !== 8) classes += 'border-r-2 border-r-slate-400 ';
        if (r % 3 === 2 && r !== 8) classes += 'border-b-2 border-b-slate-400 ';

        if (isFixed) {
          classes += 'bg-slate-100 text-slate-800 font-extrabold ';
        } else {
          classes += 'bg-white text-lavender-700 ';
        }

        if (isSelected) {
          classes += 'bg-lavender-200 ring-2 ring-lavender-600 ';
        } else if (isSameNumber) {
          classes += 'bg-lavender-50 ';
        }

        cell.className = classes;
        cell.textContent = val !== 0 ? val : '';
        cell.onclick = () => this.selectSudokuCell(r, c);
        gridEl.appendChild(cell);
      }
    }
  }

  selectSudokuCell(r, c) {
    this.sudokuSelectedCell = { r, c };
    window.soundEngine.playClick();
    this.renderSudoku();
  }

  inputSudokuNumber(num) {
    if (!this.sudokuSelectedCell) return;
    const { r, c } = this.sudokuSelectedCell;

    if (this.sudokuInitial[r][c] !== 0) {
      window.app.showToast('Angka bawaan tidak dapat diubah', 'warning');
      return;
    }

    this.sudokuBoard[r][c] = num;
    window.soundEngine.playClick();
    this.renderSudoku();

    let complete = true;
    let correct = true;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.sudokuBoard[row][col] === 0) {
          complete = false;
        } else if (this.sudokuBoard[row][col] !== this.sudokuSolution[row][col]) {
          correct = false;
        }
      }
    }

    if (complete) {
      if (correct) {
        const reward = this.sudokuDifficulty === 'hard' ? 35 : this.sudokuDifficulty === 'medium' ? 25 : 15;
        window.store.userData.brainCorner.sudokuWins[this.sudokuDifficulty] += 1;
        window.store.unlockAchievement('sharp_mind');
        this.recordGameWin(`Sudoku (${this.sudokuDifficulty.toUpperCase()})`, reward);
      } else {
        window.app.showToast('Ada beberapa angka yang belum sesuai. Coba periksa kembali!', 'warning');
      }
    }
  }

  sudokuHint() {
    if (!this.sudokuSelectedCell) {
      window.app.showToast('Pilih kotak kosong terlebih dahulu untuk mendapatkan petunjuk', 'info');
      return;
    }
    const { r, c } = this.sudokuSelectedCell;
    if (this.sudokuInitial[r][c] !== 0) return;

    this.sudokuBoard[r][c] = this.sudokuSolution[r][c];
    window.soundEngine.playSuccess();
    window.app.showToast('Petunjuk angka terisi! 💡', 'info');
    this.renderSudoku();
  }

  /* ==========================================
     3. MEMORY MATCH
  ========================================== */
  initMemory() {
    const icons = ['📚', '☕', '⏳', '🎓', '✏️', '💡', '💻', '🎨'];
    const cards = [...icons, ...icons];

    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    this.memoryCards = cards.map((icon, id) => ({
      id,
      icon,
      isFlipped: false,
      isMatched: false
    }));

    this.flippedIndices = [];
    this.matchedPairs = 0;
    this.memoryTurns = 0;
    this.isMemoryLocked = false;
  }

  renderMemory() {
    const gridEl = document.getElementById('memory-grid');
    const turnsEl = document.getElementById('memory-turns-count');
    const pairsEl = document.getElementById('memory-pairs-count');

    if (turnsEl) turnsEl.textContent = this.memoryTurns;
    if (pairsEl) pairsEl.textContent = `${this.matchedPairs} / 8`;
    if (!gridEl) return;

    gridEl.innerHTML = this.memoryCards.map((card, idx) => `
      <div 
        class="memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''}" 
        onclick="window.brainCornerController.flipMemoryCard(${idx})">
        <div class="memory-card-inner shadow-sm">
          <div class="memory-card-front flex items-center justify-center text-xl text-lavender-500 font-bold">
            ★
          </div>
          <div class="memory-card-back flex items-center justify-center text-3xl ${card.isMatched ? 'bg-sage-100 border-sage-400' : 'bg-white'}">
            ${card.icon}
          </div>
        </div>
      </div>
    `).join('');
  }

  flipMemoryCard(idx) {
    if (this.isMemoryLocked) return;
    const card = this.memoryCards[idx];
    if (card.isFlipped || card.isMatched) return;

    window.soundEngine.playClick();
    card.isFlipped = true;
    this.flippedIndices.push(idx);
    this.renderMemory();

    if (this.flippedIndices.length === 2) {
      this.memoryTurns++;
      const [i1, i2] = this.flippedIndices;
      const c1 = this.memoryCards[i1];
      const c2 = this.memoryCards[i2];

      if (c1.icon === c2.icon) {
        c1.isMatched = true;
        c2.isMatched = true;
        this.matchedPairs++;
        this.flippedIndices = [];
        window.soundEngine.playSuccess();

        if (this.matchedPairs === 8) {
          window.store.userData.brainCorner.memoryMatchWins += 1;
          this.recordGameWin('Memory Match', 15);
        }
      } else {
        this.isMemoryLocked = true;
        setTimeout(() => {
          c1.isFlipped = false;
          c2.isFlipped = false;
          this.flippedIndices = [];
          this.isMemoryLocked = false;
          this.renderMemory();
        }, 900);
      }
    }
  }

  resetMemory() {
    this.initMemory();
    this.renderMemory();
  }

  /* ==========================================
     4. LOGIC PUZZLE
  ========================================== */
  initLogicPuzzle() {
    this.numDisks = 3;
    this.towers = [
      [3, 2, 1],
      [],
      []
    ];
    this.selectedTower = null;
    this.logicMoves = 0;
  }

  renderLogicPuzzle() {
    const container = document.getElementById('logic-towers-container');
    const movesEl = document.getElementById('logic-moves-count');
    if (movesEl) movesEl.textContent = this.logicMoves;
    if (!container) return;

    const deskNames = ['Meja A (Awal)', 'Meja B (Bantuan)', 'Meja C (Tujuan ✨)'];
    const colors = {
      1: 'bg-pink-300 border-pink-400 text-pink-900',
      2: 'bg-lavender-300 border-lavender-400 text-lavender-900',
      3: 'bg-sage-300 border-sage-400 text-sage-900'
    };
    const widths = {
      1: 'w-20',
      2: 'w-32',
      3: 'w-44'
    };

    container.innerHTML = this.towers.map((tower, tIdx) => {
      const isSelected = this.selectedTower === tIdx;

      return `
        <div 
          onclick="window.brainCornerController.onTowerClick(${tIdx})"
          class="flex flex-col items-center justify-end h-56 p-3 rounded-2xl border-2 transition-all cursor-pointer relative ${
            isSelected 
              ? 'border-lavender-500 bg-lavender-50/80 shadow-md ring-2 ring-lavender-300' 
              : 'border-cream-300 bg-white hover:bg-slate-50'
          }">
          <div class="w-3.5 h-36 bg-stone-300 rounded-t-lg absolute bottom-8 z-0"></div>

          <div class="flex flex-col-reverse items-center gap-1.5 z-10 w-full mb-3">
            ${tower.map(disk => `
              <div class="${widths[disk]} h-7 rounded-lg border-2 ${colors[disk]} flex items-center justify-center text-xs font-bold shadow-xs select-none">
                📖 Buku ${disk}
              </div>
            `).join('')}
          </div>

          <div class="w-full h-4 bg-stone-400 rounded-md z-10"></div>
          <span class="text-xs font-bold text-slate-700 mt-2">${deskNames[tIdx]}</span>
        </div>
      `;
    }).join('');
  }

  onTowerClick(tIdx) {
    window.soundEngine.playClick();

    if (this.selectedTower === null) {
      if (this.towers[tIdx].length === 0) {
        window.app.showToast('Meja ini kosong!', 'info');
        return;
      }
      this.selectedTower = tIdx;
      this.renderLogicPuzzle();
    } else {
      const fromIdx = this.selectedTower;
      const toIdx = tIdx;

      if (fromIdx === toIdx) {
        this.selectedTower = null;
        this.renderLogicPuzzle();
        return;
      }

      const fromStack = this.towers[fromIdx];
      const toStack = this.towers[toIdx];
      const movingDisk = fromStack[fromStack.length - 1];
      const topTargetDisk = toStack[toStack.length - 1];

      if (topTargetDisk && movingDisk > topTargetDisk) {
        window.app.showToast('Buku besar tidak boleh ditaruh di atas buku kecil!', 'warning');
        this.selectedTower = null;
        this.renderLogicPuzzle();
        return;
      }

      fromStack.pop();
      toStack.push(movingDisk);
      this.logicMoves++;
      this.selectedTower = null;

      if (this.towers[2].length === 3) {
        window.store.userData.brainCorner.logicPuzzleWins += 1;
        window.store.unlockAchievement('logic_master');
        this.recordGameWin('Logic Puzzle', 25);
      }

      this.renderLogicPuzzle();
    }
  }

  resetLogicPuzzle() {
    this.initLogicPuzzle();
    this.renderLogicPuzzle();
  }
}

window.brainCornerController = new BrainCornerController();
