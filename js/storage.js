/**
 * STUDYSPACE - Data Store & State Management
 * Clean state architecture: New student accounts start completely empty!
 * Handles multi-user isolation, persistence, Study Points calculation,
 * anti-cheat validation, quest updates, and achievement unlocks.
 */

const STORAGE_KEYS = {
  USERS: 'studyspace_users_v1',
  CURRENT_USER_ID: 'studyspace_active_user_id',
  USER_PREFIX: 'studyspace_userdata_'
};

const LEVEL_THRESHOLDS = [
  { level: 1, name: 'Beginner', minSP: 0, maxSP: 99, badge: '🌱' },
  { level: 2, name: 'Learner', minSP: 100, maxSP: 249, badge: '📚' },
  { level: 3, name: 'Dedicated', minSP: 250, maxSP: 499, badge: '✨' },
  { level: 4, name: 'Achiever', minSP: 500, maxSP: 999, badge: '🏆' },
  { level: 5, name: 'Master', minSP: 1000, maxSP: Infinity, badge: '👑' }
];

const INITIAL_ACHIEVEMENTS = [
  { id: 'first_step', title: 'First Step', desc: 'Bergabung di StudySpace dan membuat avatar pertama', icon: '🌱', unlocked: false, unlockedAt: null },
  { id: 'little_explorer', title: 'Little Explorer', desc: 'Menjelajahi semua menu di StudySpace', icon: '🧭', unlocked: false, unlockedAt: null },
  { id: 'consistent_learner', title: 'Consistent Learner', desc: 'Mencapai study streak selama 3 hari berturut-turut', icon: '🔥', unlocked: false, unlockedAt: null },
  { id: 'focus_master', title: 'Focus Master', desc: 'Menyelesaikan 5 sesi Focus Timer', icon: '⏳', unlocked: false, unlockedAt: null },
  { id: 'study_champion', title: 'Study Champion', desc: 'Mengumpulkan 500 Study Points (SP)', icon: '🏆', unlocked: false, unlockedAt: null },
  { id: 'puzzle_lover', title: 'Puzzle Lover', desc: 'Memainkan 3 permainan di Brain Corner', icon: '🧩', unlocked: false, unlockedAt: null },
  { id: 'sharp_mind', title: 'Sharp Mind', desc: 'Menyelesaikan permainan Sudoku', icon: '💡', unlocked: false, unlockedAt: null },
  { id: 'logic_master', title: 'Logic Master', desc: 'Memecahkan Logic Puzzle', icon: '🧠', unlocked: false, unlockedAt: null },
  { id: 'word_hunter', title: 'Word Hunter', desc: 'Menemukan semua kata di Word Search', icon: '🔍', unlocked: false, unlockedAt: null },
  { id: 'brain_champion', title: 'Brain Champion', desc: 'Menyelesaikan ke-4 mini games di Brain Corner', icon: '👑', unlocked: false, unlockedAt: null }
];

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekString() {
  const d = new Date();
  const year = d.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
  const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNum}`;
}

class Store {
  constructor() {
    this.currentUser = null;
    this.userData = null;
    this.listeners = [];
  }

  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.userData));
  }

  init() {
    const activeId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const users = this.getAllUsers();

    if (activeId && users.find(u => u.id === activeId)) {
      this.currentUser = users.find(u => u.id === activeId);
      this.loadUserData(activeId);
      this.checkDailyReset();
    } else if (users.length > 0) {
      this.currentUser = users[0];
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, this.currentUser.id);
      this.loadUserData(this.currentUser.id);
      this.checkDailyReset();
    } else {
      // No users yet - keep completely null so user registers with their real email
      this.currentUser = null;
      this.userData = null;
    }
  }

  getAllUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // Pure clean, empty data structure for ANY new student account
  createInitialUserData(user) {
    const today = getTodayString();
    return {
      userId: user.id,
      avatar: { ...window.DEFAULT_AVATAR },
      theme: 'cream',
      soundEffects: true,
      ambientVolume: 0.5,
      tutorialCompleted: false,
      tutorialStep: 0,
      studyPoints: 0, // Starts at 0 SP for new account
      streak: {
        current: 1,
        highest: 1,
        lastActiveDate: today,
        dates: [today]
      },
      tasks: [],      // 100% EMPTY FOR NEW ACCOUNTS
      schedule: [],   // 100% EMPTY FOR NEW ACCOUNTS
      notes: [],      // 100% EMPTY FOR NEW ACCOUNTS
      goals: {
        daily: [],    // 100% EMPTY FOR NEW ACCOUNTS
        weekly: [],   // 100% EMPTY FOR NEW ACCOUNTS
        history: []
      },
      timerHistory: [], // 100% EMPTY FOR NEW ACCOUNTS
      brainCorner: {
        wordSearchWins: 0,
        sudokuWins: { easy: 0, medium: 0, hard: 0 },
        memoryMatchWins: 0,
        logicPuzzleWins: 0,
        totalGamesPlayed: 0,
        totalPointsEarned: 0,
        history: []
      },
      quests: {
        daily: [
          { id: 'qd_1', title: 'Selesaikan 2 tugas', description: 'Tandai 2 tugas selesai di My Tasks', target: 2, progress: 0, spReward: 20, completed: false, claimed: false },
          { id: 'qd_2', title: 'Fokus Belajar 25 Menit', description: 'Gunakan Focus Timer selama minimal 25 menit', target: 25, progress: 0, spReward: 10, completed: false, claimed: false },
          { id: 'qd_3', title: 'Mainkan 1 Game di Brain Corner', description: 'Coba permainan apa saja untuk menyegarkan pikiran', target: 1, progress: 0, spReward: 15, completed: false, claimed: false }
        ],
        weekly: [
          { id: 'qw_1', title: 'Study Champion Mingguan', description: 'Kumpulkan total 150 SP dalam minggu ini', target: 150, progress: 0, spReward: 50, completed: false, claimed: false },
          { id: 'qw_2', title: 'Master of Schedule', description: 'Jadwalkan minimal 3 kegiatan belajar di My Schedule', target: 3, progress: 0, spReward: 30, completed: false, claimed: false }
        ],
        special: [
          { id: 'qs_1', title: 'Eksplorasi Tema Focus', description: 'Coba tema Focus Timer: Clock, Candle, dan Ice', target: 3, progress: 0, spReward: 25, completed: false, claimed: false },
          { id: 'qs_2', title: 'Brain Genius', description: 'Menangkan Sudoku tingkat Medium atau Hard', target: 1, progress: 0, spReward: 40, completed: false, claimed: false }
        ]
      },
      achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
      activityHistory: [
        { id: 'act_init', text: 'Bergabung di StudySpace ✨', sp: 0, timestamp: new Date().toISOString(), type: 'general' }
      ],
      rewardedActions: {}
    };
  }

  loadUserData(userId) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PREFIX + userId);
      if (data) {
        this.userData = JSON.parse(data);
        if (!this.userData.achievements) this.userData.achievements = JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS));
        if (!this.userData.rewardedActions) this.userData.rewardedActions = {};
        if (!this.userData.tasks) this.userData.tasks = [];
        if (!this.userData.schedule) this.userData.schedule = [];
        if (!this.userData.notes) this.userData.notes = [];
        if (!this.userData.goals) this.userData.goals = { daily: [], weekly: [], history: [] };
      } else {
        this.userData = this.createInitialUserData(this.currentUser);
        this.saveUserData(userId, this.userData);
      }
    } catch (e) {
      this.userData = this.createInitialUserData(this.currentUser);
    }
  }

  saveUserData(userId = null, data = null) {
    const uid = userId || (this.currentUser ? this.currentUser.id : null);
    const d = data || this.userData;
    if (uid && d) {
      localStorage.setItem(STORAGE_KEYS.USER_PREFIX + uid, JSON.stringify(d));
      this.notify();
    }
  }

  getLevelInfo(sp = null) {
    const points = sp !== null ? sp : (this.userData ? this.userData.studyPoints : 0);
    let currentTier = LEVEL_THRESHOLDS[0];
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (points >= LEVEL_THRESHOLDS[i].minSP) {
        currentTier = LEVEL_THRESHOLDS[i];
      }
    }
    const nextTier = LEVEL_THRESHOLDS.find(t => t.level === currentTier.level + 1);
    const progressPercent = nextTier 
      ? Math.min(100, Math.round(((points - currentTier.minSP) / (nextTier.minSP - currentTier.minSP)) * 100))
      : 100;

    return {
      currentLevel: currentTier.level,
      name: currentTier.name,
      badge: currentTier.badge,
      currentSP: points,
      minSP: currentTier.minSP,
      nextLevelSP: nextTier ? nextTier.minSP : 'MAX',
      neededForNext: nextTier ? nextTier.minSP - points : 0,
      progressPercent
    };
  }

  awardSP(amount, reason, actionKey = null, type = 'general') {
    if (!this.userData || amount <= 0) return false;

    if (actionKey && this.userData.rewardedActions[actionKey]) {
      return false;
    }

    const prevLevel = this.getLevelInfo().currentLevel;
    this.userData.studyPoints += amount;

    if (actionKey) {
      this.userData.rewardedActions[actionKey] = true;
    }

    this.userData.activityHistory.unshift({
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      text: `${reason} (+${amount} SP)`,
      sp: amount,
      timestamp: new Date().toISOString(),
      type
    });
    if (this.userData.activityHistory.length > 50) {
      this.userData.activityHistory.pop();
    }

    const newLevel = this.getLevelInfo().currentLevel;
    if (newLevel > prevLevel) {
      window.app && window.app.showLevelUpModal(newLevel);
    }

    if (this.userData.studyPoints >= 500) {
      this.unlockAchievement('study_champion');
    }

    this.saveUserData();
    return true;
  }

  checkDailyReset() {
    if (!this.userData) return;
    const today = getTodayString();
    const streak = this.userData.streak;

    if (streak.lastActiveDate === today) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (streak.lastActiveDate === yStr) {
      streak.current += 1;
      if (streak.current > streak.highest) {
        streak.highest = streak.current;
      }
      if (!streak.dates.includes(today)) {
        streak.dates.push(today);
      }
      streak.lastActiveDate = today;

      if (streak.current % 3 === 0) {
        this.awardSP(15, `Streak ${streak.current} Hari! Bonus Konsistensi`, `streak_${streak.current}_${today}`, 'streak');
      }
      if (streak.current >= 3) {
        this.unlockAchievement('consistent_learner');
      }
    } else {
      streak.current = 1;
      streak.lastActiveDate = today;
      if (!streak.dates.includes(today)) {
        streak.dates.push(today);
      }
    }

    this.saveUserData();
  }

  unlockAchievement(id) {
    if (!this.userData) return;
    const ach = this.userData.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      ach.unlockedAt = new Date().toISOString();
      this.awardSP(30, `Buka Achievement: ${ach.title}`, `ach_${id}`, 'achievement');
      this.saveUserData();
      window.app && window.app.showAchievementToast(ach);
    }
  }

  updateQuestProgress(type, count = 1) {
    if (!this.userData) return;
    let changed = false;

    this.userData.quests.daily.forEach(q => {
      if (!q.completed) {
        if (type === 'task' && q.id === 'qd_1') {
          q.progress = Math.min(q.target, q.progress + count);
          if (q.progress >= q.target) q.completed = true;
          changed = true;
        } else if (type === 'timer' && q.id === 'qd_2') {
          q.progress = Math.min(q.target, q.progress + count);
          if (q.progress >= q.target) q.completed = true;
          changed = true;
        } else if (type === 'game' && q.id === 'qd_3') {
          q.progress = Math.min(q.target, q.progress + count);
          if (q.progress >= q.target) q.completed = true;
          changed = true;
        }
      }
    });

    if (changed) {
      this.saveUserData();
    }
  }
}

window.store = new Store();
