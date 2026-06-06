import { CONFIG, getTotalQuestions } from './data.js';
import { AudioManager } from './audio.js';
import { SettingsManager } from './settings.js';
import { GameEngine } from './game.js';
import { UIManager } from './ui.js';

const settings = new SettingsManager();
const audio = new AudioManager(settings.data);
const game = new GameEngine();
const ui = new UIManager(game, audio, settings);

function applySettings() {
  document.body.classList.toggle('no-anim', !settings.get('animations'));
  if (settings.get('music') && !audio.bgmOn) audio.startBGM();
  else if (!settings.get('music')) audio.stopBGM();
  ui.syncMusicBtn();
}

function startQuiz() {
  const name = (ui.els['player-name']?.value || settings.get('name') || '').trim();
  const stage = game.stage;
  game.reset();
  game.name = name || 'Nhà cách mạng';
  game.stage = stage;
  settings.set('name', game.name);
  settings.save();

  ui.displayedScore = 0;
  ui.showScreen('screen-quiz');
  ui.showLoader(true);

  setTimeout(() => {
    ui.showLoader(false);
    ui.renderQuestion();
    startQuestionTimer();
  }, CONFIG.LOADING_MS);

  if (settings.get('music')) audio.startBGM();
}

function startQuestionTimer() {
  game.startTimer(
    (sec, ratio) => ui.updateTimer(sec, ratio),
    () => handleTimeout()
  );
}

function handleTimeout() {
  if (game.answered) return;
  const result = game.checkAnswer(-1);
  if (!result) return;
  audio.wrong();
  ui.revealAnswer(result, null);
  ui.updateHUD();
}

function handleAnswer(choiceIndex, clickedBtn) {
  clickedBtn.classList.add('selected');
  audio.click();

  setTimeout(() => {
    const result = game.checkAnswer(choiceIndex);
    if (!result) return;

    if (result.isCorrect) audio.correct();
    else audio.wrong();

    ui.revealAnswer(result, clickedBtn);
    ui.updateHUD();
  }, 280);
}

function goNext() {
  audio.click();
  const next = game.nextQuestion();

  if (next === 'stage-clear') {
    ui.showStageClear();
    return;
  }
  if (next === 'end') {
    game.stagesDone = [0, 1, 2];
    ui.showEndScreen();
    return;
  }

  ui.showLoader(true);
  setTimeout(() => {
    ui.showLoader(false);
    ui.renderQuestion();
    startQuestionTimer();
  }, CONFIG.LOADING_MS);
}

function continueStage() {
  audio.click();
  game.goToNextStage();
  ui.showScreen('screen-quiz');
  ui.showLoader(true);
  setTimeout(() => {
    ui.showLoader(false);
    ui.renderQuestion();
    startQuestionTimer();
  }, CONFIG.LOADING_MS);
}

function backToStart() {
  audio.click();
  game.stopTimer();
  ui.showScreen('screen-start');
  ui.renderStageCards();
}

function playAgain() {
  audio.click();
  game.reset();
  game.name = settings.get('name') || 'Nhà cách mạng';
  ui.displayedScore = 0;
  if (ui.els['player-name']) ui.els['player-name'].value = game.name;
  ui.renderStageCards();
  ui.showScreen('screen-start');
}

function saveSettings() {
  settings.set('name', ui.els['set-name']?.value.trim() || '');
  settings.set('music', ui.els['set-music']?.checked ?? true);
  settings.set('sfx', ui.els['set-sfx']?.checked ?? true);
  settings.set('animations', ui.els['set-anim']?.checked ?? true);
  settings.set('volume', +ui.els['set-volume']?.value || 80);
  settings.save();
  game.name = settings.get('name') || game.name;
  if (ui.els['player-name']) ui.els['player-name'].value = game.name;
  applySettings();
  ui.closeSettings();
  audio.click();
}

function resetProgress() {
  if (!confirm('Đặt lại toàn bộ tiến độ?')) return;
  game.reset();
  ui.displayedScore = 0;
  ui.renderStageCards();
  ui.closeSettings();
  ui.showScreen('screen-start');
  audio.click();
}

function bindEvents() {
  ui.els['btn-start']?.addEventListener('click', startQuiz);
  ui.els['btn-next']?.addEventListener('click', goNext);
  ui.els['btn-stage-continue']?.addEventListener('click', continueStage);
  ui.els['btn-play-again']?.addEventListener('click', playAgain);
  ui.els['btn-back']?.addEventListener('click', backToStart);
  ui.els['btn-back-end']?.addEventListener('click', backToStart);

  ui.els['btn-settings-start']?.addEventListener('click', () => ui.openSettings());
  ui.els['btn-settings-quiz']?.addEventListener('click', () => ui.openSettings());
  ui.els['settings-close']?.addEventListener('click', () => ui.closeSettings());
  ui.els['set-save']?.addEventListener('click', saveSettings);
  ui.els['set-reset']?.addEventListener('click', resetProgress);
  ui.els['settings-overlay']?.addEventListener('click', (e) => {
    if (e.target === ui.els['settings-overlay']) ui.closeSettings();
  });

  ui.els['set-volume']?.addEventListener('input', (e) => {
    ui.els['vol-label'].textContent = `${e.target.value}%`;
  });

  ui.els['btn-music']?.addEventListener('click', () => {
    settings.set('music', audio.toggleBGM());
    settings.save();
    ui.syncMusicBtn();
    audio.click();
  });

  ui.bindAnswerClicks(handleAnswer);
}

document.addEventListener('DOMContentLoaded', () => {
  ui.init();
  bindEvents();

  const savedName = settings.get('name');
  if (savedName) {
    game.name = savedName;
    if (ui.els['player-name']) ui.els['player-name'].value = savedName;
  }

  const totalEl = document.querySelector('[data-total-questions]');
  if (totalEl) totalEl.textContent = getTotalQuestions();

  applySettings();
  ui.showScreen('screen-start');

  document.addEventListener('click', () => {
    if (settings.get('music') && !audio.bgmOn) audio.startBGM();
  }, { once: true });
});
