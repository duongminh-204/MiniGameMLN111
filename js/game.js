import { STAGES, CONFIG, FAKE_LB, RANKS, getTotalQuestions } from './data.js';

export class GameEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.name = 'Nhà cách mạng';
    this.stage = 0;
    this.qi = 0;
    this.score = 0;
    this.correct = 0;
    this.answered = false;
    this.stagesDone = [];
    this.timerLeft = CONFIG.TIMER_SEC;
    this.timerId = null;
    this.onTimeout = null;
  }

  get currentStage() {
    return STAGES[this.stage];
  }

  get currentQuestion() {
    return this.currentStage?.questions[this.qi];
  }

  get totalQuestions() {
    return getTotalQuestions();
  }

  get globalQuestionIndex() {
    let n = 0;
    for (let i = 0; i < this.stage; i++) n += STAGES[i].questions.length;
    return n + this.qi;
  }

  get progressPercent() {
    return Math.round((this.globalQuestionIndex / this.totalQuestions) * 100);
  }

  isStageUnlocked(index) {
    return index === 0 || this.stagesDone.includes(index - 1);
  }

  selectStage(index) {
    if (this.isStageUnlocked(index)) {
      this.stage = index;
      this.qi = 0;
      return true;
    }
    return false;
  }

  startTimer(onTick, onEnd) {
    this.stopTimer();
    this.timerLeft = CONFIG.TIMER_SEC;
    this.onTimeout = onEnd;
    onTick(this.timerLeft, 1);

    this.timerId = setInterval(() => {
      this.timerLeft--;
      const ratio = this.timerLeft / CONFIG.TIMER_SEC;
      onTick(this.timerLeft, ratio);

      if (this.timerLeft <= 0) {
        this.stopTimer();
        onEnd();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  checkAnswer(choiceIndex) {
    if (this.answered) return null;
    this.answered = true;
    this.stopTimer();

    const q = this.currentQuestion;
    const isCorrect = choiceIndex === q.a;
    let points = 0;

    if (isCorrect) {
      this.correct++;
      const speedBonus = this.timerLeft > CONFIG.TIMER_SEC * 0.5 ? CONFIG.POINTS_SPEED_BONUS : 0;
      points = CONFIG.POINTS_BASE + speedBonus;
      this.score += points;
    }

    return { isCorrect, points, explanation: q.exp, correctIndex: q.a };
  }

  canGoNext() {
    return this.answered;
  }

  isLastQuestionInStage() {
    return this.qi >= this.currentStage.questions.length - 1;
  }

  isLastStage() {
    return this.stage >= STAGES.length - 1;
  }

  completeStage() {
    if (!this.stagesDone.includes(this.stage)) {
      this.stagesDone.push(this.stage);
    }
  }

  nextQuestion() {
    this.answered = false;
    if (this.qi < this.currentStage.questions.length - 1) {
      this.qi++;
      return 'question';
    }
    this.completeStage();
    if (this.isLastStage()) return 'end';
    return 'stage-clear';
  }

  goToNextStage() {
    this.stage++;
    this.qi = 0;
    this.answered = false;
  }

  getResults() {
    const total = this.totalQuestions;
    const pct = Math.round((this.correct / total) * 100);
    const rank = RANKS.find((r) => pct >= r.min) || RANKS[RANKS.length - 1];
    return { total, pct, rank, score: this.score, correct: this.correct };
  }

  getLeaderboard() {
    return [...FAKE_LB, { name: `${this.name} (bạn)`, s: this.score, me: true }]
      .sort((a, b) => b.s - a.s);
  }
}
