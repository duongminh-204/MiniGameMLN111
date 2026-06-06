import { STAGES, CONFIG, getTotalQuestions } from './data.js';
import { ACHIEVEMENTS } from './avatar-data.js';
import { AvatarController } from './avatar-controller.js';

const $ = (id) => document.getElementById(id);

const SCREENS = [
  'screen-start', 'screen-creator', 'screen-profile',
  'screen-quiz', 'screen-stage', 'screen-end',
];

export class UIManager {
  constructor(game, audio, settings, avatarStorage, effects) {
    this.game = game;
    this.audio = audio;
    this.settings = settings;
    this.avatarStorage = avatarStorage;
    this.effects = effects;
    this.els = {};
    this.scoreAnimId = null;
    this.displayedScore = 0;
    this.quizAvatar = null;
    this.endAvatar = null;
  }

  init() {
    this.cacheElements();
    this.buildParticles();
    this.renderStageCards();
    this.initAvatars();
    this.renderStartAvatarPreview();
  }

  initAvatars() {
    const quizEl = $('quiz-avatar');
    const endEl = $('end-avatar');
    if (quizEl) {
      this.quizAvatar = new AvatarController(quizEl, this.effects);
      this.quizAvatar.setEnabled(this.settings.get('animations'));
    }
    if (endEl) {
      this.endAvatar = new AvatarController(endEl, this.effects);
      this.endAvatar.setEnabled(this.settings.get('animations'));
    }
  }

  mountQuizAvatar() {
    const av = this.avatarStorage.getAvatar();
    this.quizAvatar?.init(av, av.skinId);
    this.updateStreakBadge(0);
  }

  renderStartAvatarPreview() {
    const el = $('start-avatar-mini');
    if (!el || !this.avatarStorage.hasAvatar()) return;
    const av = this.avatarStorage.getAvatar();
    const ctrl = new AvatarController(el, this.effects);
    ctrl.init(av, av.skinId);
  }

  cacheElements() {
    const ids = [
      'particles', 'player-name', 'stage-cards', 'btn-start', 'btn-settings-start',
      'btn-music', 'btn-settings-quiz', 'btn-back', 'score-value', 'score-badge',
      'progress-fill', 'progress-text', 'stage-label', 'question-num', 'question-text',
      'answers-grid', 'feedback', 'btn-next', 'loader', 'timer-ring', 'timer-value',
      'timer-progress', 'settings-overlay', 'set-name', 'set-music', 'set-sfx',
      'set-volume', 'vol-label', 'set-anim', 'settings-close', 'set-save', 'set-reset',
      'stage-clear-icon', 'stage-clear-title', 'stage-clear-sub', 'stage-clear-score',
      'btn-stage-continue', 'end-title', 'end-player', 'end-score',
      'end-percent', 'end-correct', 'end-rank-grade', 'end-rank-msg', 'leaderboard',
      'btn-play-again', 'btn-back-end', 'quiz-hero-name', 'streak-badge',
      'btn-create-avatar', 'btn-profile',
    ];
    ids.forEach((id) => { this.els[id] = $(id); });
  }

  showScreen(id) {
    SCREENS.forEach((s) => $(s)?.classList.toggle('active', s === id));
    if (id === 'screen-quiz') this.mountQuizAvatar();
    if (id === 'screen-start') this.renderStartAvatarPreview();
  }

  updateStreakBadge(streak) {
    const badge = this.els['streak-badge'];
    if (!badge) return;
    if (streak >= 3) {
      badge.textContent = `🔥 Chuỗi ${streak}!`;
      badge.classList.add('show', 'fire');
    } else if (streak >= 2) {
      badge.textContent = `⚡ ${streak} liên tiếp`;
      badge.classList.add('show');
      badge.classList.remove('fire');
    } else {
      badge.classList.remove('show', 'fire');
    }
  }

  buildParticles() {
    const wrap = this.els.particles;
    if (!wrap || !this.settings.get('animations')) return;
    wrap.innerHTML = '';
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.animationDuration = `${8 + Math.random() * 12}s`;
      p.style.animationDelay = `${Math.random() * 8}s`;
      p.style.width = p.style.height = `${2 + Math.random() * 4}px`;
      wrap.appendChild(p);
    }
  }

  renderStageCards() {
    const wrap = this.els['stage-cards'];
    if (!wrap) return;
    wrap.innerHTML = STAGES.map((st, i) => {
      const locked = !this.game.isStageUnlocked(i);
      const selected = this.game.stage === i;
      return `
        <div class="stage-card glass ${locked ? 'locked' : ''} ${selected ? 'selected' : ''}"
             data-stage="${i}" role="button" tabindex="${locked ? -1 : 0}">
          <div class="stage-card__icon">${locked ? '🔒' : st.icon}</div>
          <div class="stage-card__name">${st.mapLabel}</div>
        </div>`;
    }).join('');

    wrap.querySelectorAll('.stage-card:not(.locked)').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = +card.dataset.stage;
        if (this.game.selectStage(idx)) {
          wrap.querySelectorAll('.stage-card').forEach((c) => c.classList.remove('selected'));
          card.classList.add('selected');
          this.audio.click();
        }
      });
    });
  }

  animateScore(target) {
    if (this.scoreAnimId) cancelAnimationFrame(this.scoreAnimId);
    const start = this.displayedScore;
    const diff = target - start;
    const startTime = performance.now();
    const duration = 500;

    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = 1 - (1 - t) ** 3;
      this.displayedScore = Math.round(start + diff * ease);
      if (this.els['score-value']) {
        this.els['score-value'].textContent = this.displayedScore;
      }
      if (t < 1) this.scoreAnimId = requestAnimationFrame(step);
    };
    this.scoreAnimId = requestAnimationFrame(step);
    this.els['score-badge']?.classList.add('pop');
    setTimeout(() => this.els['score-badge']?.classList.remove('pop'), 500);
  }

  updateHUD() {
    const g = this.game;
    const st = g.currentStage;
    const total = getTotalQuestions();

    if (this.els['stage-label']) {
      this.els['stage-label'].textContent = `Chặng ${st.id}: ${st.label}`;
    }
    if (this.els['quiz-hero-name']) {
      this.els['quiz-hero-name'].textContent = g.name;
    }
    if (this.els['progress-fill']) {
      this.els['progress-fill'].style.width = `${g.progressPercent}%`;
    }
    if (this.els['progress-text']) {
      this.els['progress-text'].textContent =
        `Câu ${g.globalQuestionIndex + 1} / ${total} · ${g.progressPercent}%`;
    }
    this.updateStreakBadge(g.streak);
    this.animateScore(g.score);
  }

  updateTimer(seconds, ratio) {
    const ring = this.els['timer-ring'];
    const progress = this.els['timer-progress'];
    const value = this.els['timer-value'];
    if (!ring || !progress || !value) return;

    const circumference = 2 * Math.PI * 28;
    progress.style.strokeDasharray = circumference;
    progress.style.strokeDashoffset = circumference * (1 - ratio);
    value.textContent = seconds;
    ring.classList.toggle('urgent', seconds <= 10);
  }

  showLoader(show) {
    this.els.loader?.classList.toggle('show', show);
  }

  renderQuestion() {
    const g = this.game;
    const q = g.currentQuestion;
    const st = g.currentStage;
    if (!q) return;

    this.quizAvatar?.setState('idle');

    const qCard = document.querySelector('.question-card');
    const aWrap = document.querySelector('.answers-wrap');
    qCard?.classList.remove('visible');
    aWrap?.classList.remove('visible');

    setTimeout(() => {
      if (this.els['question-num']) {
        this.els['question-num'].textContent = `Câu ${g.qi + 1} · Chặng ${st.id}`;
      }
      if (this.els['question-text']) {
        this.els['question-text'].textContent = q.q;
      }

      const shuffled = q.ch.map((c, i) => ({ c, orig: i }))
        .sort(() => Math.random() - 0.5);

      const grid = this.els['answers-grid'];
      if (grid) {
        grid.innerHTML = shuffled.map((item, i) => {
          const cls = ['a', 'b', 'c', 'd'][i];
          return `
            <button class="answer-btn answer-btn--${cls}" data-orig="${item.orig}" type="button">
              <span class="answer-btn__shape">${CONFIG.ANSWER_SHAPES[i]}</span>
              <span class="answer-btn__text"><strong>${CONFIG.LETTERS[i]}.</strong> ${item.c}</span>
            </button>`;
        }).join('');
      }

      if (this.els.feedback) {
        this.els.feedback.innerHTML = '';
        this.els.feedback.className = 'feedback';
      }
      if (this.els['btn-next']) {
        this.els['btn-next'].style.display = 'none';
      }

      requestAnimationFrame(() => {
        qCard?.classList.add('visible');
        aWrap?.classList.add('visible');
      });
    }, 80);

    this.updateHUD();
  }

  bindAnswerClicks(handler) {
    this.els['answers-grid']?.addEventListener('click', (e) => {
      const btn = e.target.closest('.answer-btn');
      if (!btn || btn.disabled) return;
      handler(+btn.dataset.orig, btn);
    });
  }

  revealAnswer(result, clickedBtn) {
    const buttons = this.els['answers-grid']?.querySelectorAll('.answer-btn');
    buttons?.forEach((btn) => {
      const orig = +btn.dataset.orig;
      btn.disabled = true;
      if (orig === result.correctIndex) btn.classList.add('correct');
      else if (btn === clickedBtn && !result.isCorrect) btn.classList.add('wrong');
      else btn.classList.add('faded');
    });

    if (result.isCorrect) {
      this.quizAvatar?.onCorrect(result.streak);
    } else {
      this.quizAvatar?.onWrong();
    }

    const fb = this.els.feedback;
    if (fb) {
      fb.className = `feedback ${result.isCorrect ? 'feedback--ok' : 'feedback--fail'}`;
      fb.innerHTML = (result.isCorrect
        ? '<strong>✓ Chính xác!</strong> '
        : '<strong>✗ Chưa đúng!</strong> ') + result.explanation;
    }

    const next = this.els['btn-next'];
    if (next) {
      const g = this.game;
      if (g.isLastQuestionInStage() && g.isLastStage()) {
        next.textContent = '🏆 Xem kết quả';
      } else if (g.isLastQuestionInStage()) {
        next.textContent = '🎖 Hoàn thành chặng';
      } else {
        next.textContent = 'Câu tiếp theo →';
      }
      next.style.display = 'inline-flex';
    }

    this.updateHUD();
  }

  showStageClear() {
    const g = this.game;
    const st = g.currentStage;
    const icons = ['🎖', '🛡', '🌟'];
    if (this.els['stage-clear-icon']) this.els['stage-clear-icon'].textContent = icons[g.stage] || '🎖';
    if (this.els['stage-clear-title']) {
      this.els['stage-clear-title'].textContent = `Chặng ${st.id} hoàn thành!`;
    }
    if (this.els['stage-clear-sub']) {
      this.els['stage-clear-sub'].textContent = st.label;
    }
    if (this.els['stage-clear-score']) {
      this.els['stage-clear-score'].textContent = `${g.score} điểm`;
    }
    this.avatarStorage.checkUnlocks(g);
    this.showScreen('screen-stage');
  }

  showEndScreen(avatarUi) {
    const g = this.game;
    const results = g.getResults();
    const { pct, rank, score, correct, total } = results;

    this.avatarStorage.checkUnlocks(g, results);

    if (this.els['end-player']) this.els['end-player'].textContent = g.name;
    if (this.els['end-score']) this.els['end-score'].textContent = score;
    if (this.els['end-percent']) this.els['end-percent'].textContent = `${pct}%`;
    if (this.els['end-correct']) this.els['end-correct'].textContent = `${correct}/${total}`;
    if (this.els['end-rank-grade']) this.els['end-rank-grade'].textContent = rank.grade;
    if (this.els['end-rank-msg']) this.els['end-rank-msg'].textContent = rank.msg;

    const av = this.avatarStorage.getAvatar();
    this.endAvatar?.init(av, av.skinId);
    setTimeout(() => this.endAvatar?.onVictory(), 400);

    const lb = this.els.leaderboard;
    if (lb) {
      const medals = ['🥇', '🥈', '🥉'];
      lb.innerHTML = g.getLeaderboard().map((p, i) => `
        <div class="lb-row ${p.me ? 'me' : ''}">
          <span class="lb-row__rank">${medals[i] || `${i + 1}.`}</span>
          <span class="lb-row__name">${p.name}</span>
          <span class="lb-row__score">${p.s}</span>
        </div>`).join('');
    }

    this.showScreen('screen-end');
    this.audio.fanfare();
    this.effects.spawn($('end-fx'), 'victory', 50);

    if (g.maxStreak >= 5 && this.avatarStorage.unlockAchievement('streak5')) {
      avatarUi?.showAchievement(ACHIEVEMENTS.streak5);
    }
    if (this.avatarStorage.unlockAchievement('first_win')) {
      setTimeout(() => avatarUi?.showAchievement(ACHIEVEMENTS.first_win), 1500);
    }
  }

  openSettings() {
    this.els['set-name'].value = this.game.name || this.settings.get('name') || '';
    this.els['set-music'].checked = this.settings.get('music');
    this.els['set-sfx'].checked = this.settings.get('sfx');
    this.els['set-anim'].checked = this.settings.get('animations');
    this.els['set-volume'].value = this.settings.get('volume');
    this.els['vol-label'].textContent = `${this.settings.get('volume')}%`;
    this.els['settings-overlay']?.classList.add('open');
  }

  closeSettings() {
    this.els['settings-overlay']?.classList.remove('open');
  }

  syncMusicBtn() {
    const btn = this.els['btn-music'];
    if (btn) btn.textContent = this.audio.bgmOn ? '🎵' : '🔇';
  }
}
