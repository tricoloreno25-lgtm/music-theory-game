// Learning journeys, interactive lessons and the composition workspace.
const LEARNING_UNITS = [
  { id: 'interval', short: '音程', title: '音の距離をつかむ', modes: ['interval'], section: 'interval-basics', copy: '半音から、長3度・短3度へ。', starter: 'interval-C-4' },
  { id: 'chord', short: 'コード', title: 'コードの響きを知る', modes: ['chord', 'ear'], section: 'chord', copy: '3つの音が、ひとつの響きに。', starter: 'chord-C-major' },
  { id: 'scale', short: 'スケール', title: '音階とキーをつなぐ', modes: ['scale', 'transpose', 'lesson'], section: 'interval', copy: '音の並びを、別のキーでも。', starter: 'scale-C-major' },
  { id: 'function', short: '機能', title: 'コードの役割を知る', modes: ['diatonic', 'function'], section: 'diatonic', copy: '安定、展開、緊張を聴く。', starter: 'diatonic-C' },
  { id: 'progression', short: '進行', title: '音楽の流れをつくる', modes: ['progression'], section: 'progression', copy: '定番の進行を自分のものに。', starter: 'progression-C-0' },
  { id: 'harmony', short: '和声', title: 'メロディーに和声を', modes: ['harmonyOne', 'harmonize'], section: 'one-bar-harmony', copy: '1小節から、4小節の伴奏へ。', starter: 'harmony-one-0' },
];

const DEFAULT_SETTINGS = { tone: 'piano', volume: 60, tempo: 100, earLevel: 1, studyStyle: 'practice' };
const experience = {
  settings: { ...DEFAULT_SETTINGS }, data: {}, session: null, sessionComplete: false,
  octave: 4, loop: false, loopTimer: null, playRegion: 'all', activeSection: 'interval-basics',
  demoAnswer: null, toastTimer: null, dragSlot: null,
};

function learningUnitForMode(mode) {
  return LEARNING_UNITS.find(unit => unit.modes.includes(mode)) || LEARNING_UNITS[0];
}

function experienceStorageKey() { return `chordQuest:experience:${state.account?.id}`; }

function loadExperienceAccount() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(experienceStorageKey()) || '{}') || {}; } catch {}
  if (typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  experience.data = saved;
  const prefs = { ...DEFAULT_SETTINGS, ...saved.settings };
  experience.settings = {
    tone: ['piano', 'electric', 'triangle'].includes(prefs.tone) ? prefs.tone : 'piano',
    volume: clampNumber(prefs.volume, 0, 100, 60), tempo: clampNumber(prefs.tempo, 50, 160, 100),
    earLevel: [1, 2, 3].includes(prefs.earLevel) ? prefs.earLevel : 1,
    studyStyle: prefs.studyStyle === 'challenge' ? 'challenge' : 'practice',
  };
  experience.session = null;
  experience.sessionComplete = false;
  experience.loop = false;
  experience.playRegion = 'all';
  experience.octave = 4;
  state.followQuizOrder = false;
  document.querySelector('#sound-loop').checked = false;
  experience.data.favorites = Array.isArray(saved.favorites) ? saved.favorites.filter(validComposition).slice(0, 50) : [];
  experience.data.draft = validComposition(saved.draft) ? saved.draft : defaultComposition();
  syncSoundSettings();
}

function clampNumber(value, min, max, fallback) {
  return Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
}

function saveExperience() {
  if (!state.account) return false;
  experience.data.settings = { ...experience.settings };
  try { localStorage.setItem(experienceStorageKey(), JSON.stringify(experience.data)); return true; }
  catch { toast('保存できませんでした。ブラウザの空き容量を確認してください。'); return false; }
}

function rememberQuiz(id) {
  experience.data.lastQuiz = id;
  experience.data.lastMode = state.mode;
  if (experience.session) experience.data.session = structuredClone(experience.session);
  saveExperience();
}

function initExperience() {
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-cq]');
    if (button && !button.disabled) handleExperienceAction(button).catch(error => { console.error(error); toast('操作を完了できませんでした。もう一度お試しください。'); });
  });
  document.addEventListener('change', handleExperienceChange);
  document.querySelector('#sound-volume').addEventListener('input', event => {
    experience.settings.volume = Number(event.target.value);
    sound.setVolume(experience.settings.volume / 100);
    document.querySelector('#volume-value').value = `${experience.settings.volume}%`;
  });
  document.querySelector('#sound-tempo').addEventListener('input', event => {
    document.querySelector('#tempo-value').value = `${event.target.value} BPM`;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { stopAudio(); closeTrainingMenu(); document.querySelector('.sound-settings').open = false; }
    if (event.key === 'Enter' && event.target === document.body && PLAY_MODES.includes(state.mode)) state.solved ? nextChallenge() : checkAnswer();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAudio(); });
  window.addEventListener('pagehide', stopAudio);
  window.matchMedia('(max-width: 820px)').addEventListener('change', updateKeyboardRange);
  document.querySelector('#studio-panel').addEventListener('dragstart', event => {
    const slot = event.target.closest('[data-studio-slot]');
    if (!slot) return;
    experience.dragSlot = Number(slot.dataset.studioSlot);
    event.dataTransfer.setData('text/plain', String(experience.dragSlot));
    event.dataTransfer.effectAllowed = 'move';
  });
  document.querySelector('#studio-panel').addEventListener('dragover', event => {
    if (experience.dragSlot !== null && event.target.closest('[data-studio-slot]')) event.preventDefault();
  });
  document.querySelector('#studio-panel').addEventListener('drop', event => {
    const slot = event.target.closest('[data-studio-slot]');
    if (!slot || experience.dragSlot === null) return;
    event.preventDefault();
    moveStudioSlot(experience.dragSlot, Number(slot.dataset.studioSlot));
    experience.dragSlot = null;
  });
  document.addEventListener('dragend', () => { experience.dragSlot = null; });
}

async function handleExperienceAction(button) {
  const { cq, id, mode, value } = button.dataset;
  if (state.saving && !['stop', 'octave'].includes(cq)) return;
  if (cq === 'stop') return stopAudio();
  if (cq === 'home') return setMode('mypage');
  if (cq === 'mode') return setMode(mode);
  if (cq === 'daily' || cq === 'review') return startSession(cq);
  if (cq === 'resume') return resumeLearning();
  if (cq === 'unit') { experience.session = null; return openQuizFromHistory(LEARNING_UNITS.find(unit => unit.id === id).starter); }
  if (cq === 'read') { await setMode('textbook'); renderTextbook(id); return; }
  if (cq === 'octave') { experience.octave = Number(button.dataset.octave); updateKeyboardRange(); return; }
  if (cq === 'ear-choice') {
    if (state.solved) return;
    state.earChoice = value;
    resetExplanation();
    renderAnswer(`選択：${CHORDS[value].name}`);
    renderExperienceControls();
    updateControls();
    return;
  }
  if (cq === 'compare') return playComparison();
  if (cq === 'demo') return playLessonDemo(value);
  if (cq === 'demo-key') {
    const pitch = button.dataset.pitch;
    stopAudio(); sound.note(pitchNote(pitch), pitchOctave(pitch), 0, .5, true); return;
  }
  if (cq === 'mini-answer') return answerMiniLesson(value, button);
  if (cq === 'studio-slot') { experience.data.draft.active = Number(button.dataset.slot); renderStudio(); return; }
  if (cq === 'studio-chord') {
    const draft = experience.data.draft;
    draft.slots[draft.active] = Number(value);
    previewStudioChord(Number(value));
    draft.active = (draft.active + 1) % 4;
    saveExperience(); renderStudio(); return;
  }
  if (cq === 'studio-move') return moveStudioSlot(Number(button.dataset.from), Number(button.dataset.to));
  if (cq === 'studio-play') return playStudio();
  if (cq === 'studio-save') return saveComposition();
  if (cq === 'studio-load') {
    const favorite = experience.data.favorites.find(item => item.id === id);
    if (!favorite) return;
    stopAudio(); experience.data.draft = structuredClone(favorite); experience.data.draft.active = 0;
    experience.settings.tempo = favorite.tempo;
    syncSoundSettings(); saveExperience(); renderStudio(); toast('保存した進行を開きました'); return;
  }
}

function handleExperienceChange(event) {
  const element = event.target;
  if (state.saving && ['study-style', 'ear-level'].includes(element.id)) { renderExperienceControls(); return; }
  if (element.id === 'sound-tone') experience.settings.tone = element.value;
  else if (element.id === 'sound-volume') experience.settings.volume = Number(element.value);
  else if (element.id === 'sound-tempo') experience.settings.tempo = Number(element.value);
  else if (element.id === 'sound-loop') { experience.loop = element.checked; stopAudio(); return; }
  else if (element.id === 'study-style') { experience.settings.studyStyle = element.value; updateHintVisibility(); }
  else if (element.id === 'ear-level') {
    experience.settings.earLevel = Number(element.value);
    experience.session = null;
    experience.data.session = null;
    state.followQuizOrder = false;
    saveExperience(); nextChallenge(); return;
  } else if (element.id === 'play-region') { stopAudio(); experience.playRegion = element.value; return; }
  else if (element.id === 'studio-key') { stopAudio(); experience.data.draft.key = element.value; saveExperience(); renderStudio(); return; }
  else if (element.id === 'studio-name') { experience.data.draft.name = element.value.trim().slice(0, 60); saveExperience(); return; }
  else if (element.id === 'studio-loop') { experience.data.draft.loop = element.checked; stopAudio(); saveExperience(); return; }
  else if (element.id === 'studio-preset') {
    const presets = { pop: [0, 4, 5, 3], cadence: [0, 3, 4, 0], royal: [3, 4, 2, 5], circle: [0, 5, 1, 4] };
    if (presets[element.value]) experience.data.draft.slots = [...presets[element.value]];
    stopAudio(); saveExperience(); renderStudio(); return;
  } else return;
  stopAudio(); syncSoundSettings(); saveExperience();
}

function syncSoundSettings() {
  sound.tone = experience.settings.tone;
  sound.setVolume(experience.settings.volume / 100);
  document.querySelector('#sound-tone').value = experience.settings.tone;
  document.querySelector('#sound-volume').value = experience.settings.volume;
  document.querySelector('#sound-tempo').value = experience.settings.tempo;
  document.querySelector('#volume-value').value = `${experience.settings.volume}%`;
  document.querySelector('#tempo-value').value = `${experience.settings.tempo} BPM`;
}

function tempoRatio() { return 100 / experience.settings.tempo; }

function stopAudio() {
  clearTimeout(experience.loopTimer);
  experience.loopTimer = null;
  sound.stop();
  const status = document.querySelector('#audio-status');
  if (status) status.textContent = '音から、わかる。';
}

function finishPlayback(replay, label, shouldLoop = experience.loop, minDuration = 0) {
  document.querySelector('#audio-status').textContent = shouldLoop ? `${label} · リピート` : label;
  const duration = Math.max(minDuration, sound.endTime - (sound.context?.currentTime || 0), 0.1);
  experience.loopTimer = setTimeout(() => {
    experience.loopTimer = null;
    if (shouldLoop) replay();
    else document.querySelector('#audio-status').textContent = '音から、わかる。';
  }, duration * 1000 + (shouldLoop ? 80 : 0));
}

function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.remove('hidden');
  clearTimeout(experience.toastTimer);
  experience.toastTimer = setTimeout(() => element.classList.add('hidden'), 4200);
}

function updateKeyboardRange() {
  const mobile = window.matchMedia('(max-width: 820px)').matches;
  const octave = experience.octave;
  document.querySelectorAll('#keyboard .key').forEach(key => {
    const pitchOct = Number(key.dataset.octave);
    const inRange = pitchOct === octave || (pitchOct === octave + 1 && key.dataset.note === 'C');
    key.classList.toggle('outside-range', mobile && !inRange);
    if (key.classList.contains('black')) {
      const slot = Number(key.dataset.slot);
      key.style.left = mobile ? `${((slot - (octave === 5 ? 7 : 0)) / 8) * 100}%` : `${(slot / 15) * 100}%`;
    }
  });
  document.querySelectorAll('[data-cq="octave"]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.octave) === octave)));
}

function earKinds() {
  if (experience.settings.earLevel === 1) return ['major', 'minor'];
  if (experience.settings.earLevel === 2) return ['major', 'minor', 'major7', 'dominant7', 'minor7'];
  return Object.keys(CHORDS);
}

function quizAvailableAtEarLevel(quiz) {
  return quiz.mode !== 'ear' || earKinds().includes(quiz.payload.kind);
}

function renderExperienceControls() {
  document.body.classList.toggle('session-finished', experience.sessionComplete);
  const playing = PLAY_MODES.includes(state.mode);
  const options = document.querySelector('#exercise-options');
  options.classList.toggle('hidden', !playing);
  options.innerHTML = playing ? `<label>取り組み方<select id="study-style" ${state.saving || state.hintCount || state.solved ? 'disabled' : ''}><option value="practice" ${experience.settings.studyStyle === 'practice' ? 'selected' : ''}>練習 · 減点なし</option><option value="challenge" ${experience.settings.studyStyle === 'challenge' ? 'selected' : ''}>チャレンジ · 得点に挑戦</option></select></label>
    ${state.mode === 'ear' ? `<label>耳トレのステップ<select id="ear-level" ${experience.session || state.saving ? 'disabled' : ''}><option value="1" ${experience.settings.earLevel === 1 ? 'selected' : ''}>1 · メジャー / マイナー</option><option value="2" ${experience.settings.earLevel === 2 ? 'selected' : ''}>2 · セブンスを含む5種類</option><option value="3" ${experience.settings.earLevel === 3 ? 'selected' : ''}>3 · 鍵盤で再現</option></select></label>` : ''}
    ${isHarmonyMode() ? '<label>再生範囲<select id="play-region"><option value="all">全体</option><option value="bar">選択中の1小節</option></select></label>' : ''}
    ${state.mode === 'ear' && experience.settings.earLevel < 3 ? `<div class="ear-choices" role="group" aria-label="聞こえたコードの種類">${earKinds().map(kind => `<button type="button" data-cq="ear-choice" data-value="${kind}" aria-pressed="${state.earChoice === kind}" ${state.solved || state.saving ? 'disabled' : ''}>${CHORDS[kind].name}</button>`).join('')}</div>` : ''}` : '';
  if (document.querySelector('#play-region')) document.querySelector('#play-region').value = experience.playRegion;
  if (state.mode === 'ear' && state.target && experience.settings.earLevel < 3) els.prompt.textContent = 'どんな響きが聞こえましたか？';
  document.querySelector('#studio-panel').classList.toggle('hidden', state.mode !== 'practice');
  const strip = document.querySelector('#session-strip');
  if (!experience.sessionComplete) {
    strip.classList.toggle('hidden', !experience.session);
    strip.innerHTML = experience.session ? `<div><span>${escapeHtml(experience.session.title)}</span><strong>${experience.session.index + 1} / ${experience.session.ids.length} 問</strong></div><progress value="${experience.session.index}" max="${experience.session.ids.length}" aria-label="レッスンの進捗"></progress>` : '';
  }
  els.next.textContent = !state.solved ? 'あとで復習' : experience.session && experience.session.index === experience.session.ids.length - 1 ? '結果を見る →' : '次の問題へ →';
  updateKeyboardRange();
}

function isReviewDue(record, now = Date.now()) {
  if (!record) return false;
  if (record.reviewRequestedAt) return true;
  if (record.lastResult === false || !record.solved) return true;
  const due = record.nextReviewAt || (record.lastCorrectAt && new Date(new Date(record.lastCorrectAt).getTime() + 3 * 86400000).toISOString());
  return Boolean(due && new Date(due).getTime() <= now);
}

function chooseAdaptiveQuiz(quizzes, progressRecords, random = Math.random) {
  if (!quizzes.length) throw new Error('No quizzes available');
  const byId = new Map(progressRecords.map(record => [record.quizId, record]));
  const due = quizzes.filter(quiz => isReviewDue(byId.get(quiz.id)));
  const fresh = quizzes.filter(quiz => !byId.has(quiz.id));
  const pool = due.length && (random() < .65 || !fresh.length) ? due : fresh.length ? fresh : quizzes;
  const alternatives = pool.filter(quiz => quiz.id !== state.target?.id);
  const candidates = alternatives.length ? alternatives : pool;
  return candidates[Math.floor(random() * candidates.length)];
}

async function startSession(kind) {
  if (state.saving) return;
  const openingHome = setMode('mypage');
  const navigationId = state.navigationId;
  await openingHome;
  const { quizzes, progress } = await loadLearningRecords();
  if (navigationId !== state.navigationId) return;
  const records = [...progress.values()];
  const available = quizzes.filter(quizAvailableAtEarLevel);
  const due = available.filter(quiz => isReviewDue(progress.get(quiz.id)))
    .sort((a, b) => Number(progress.get(a.id)?.lastResult !== false) - Number(progress.get(b.id)?.lastResult !== false) || new Date(progress.get(a.id)?.lastAttemptAt || 0) - new Date(progress.get(b.id)?.lastAttemptAt || 0));
  let candidates;
  if (kind === 'review') {
    candidates = [...due, ...available.filter(quiz => progress.has(quiz.id)), ...available.filter(quiz => ['interval-C-3', 'interval-C-4', 'chord-C-major'].includes(quiz.id))];
  } else {
    const unit = LEARNING_UNITS.find(item => records.filter(record => record.solved && item.modes.includes(record.mode)).length < 3) || learningUnitForMode(experience.data.lastMode);
    const focused = available.filter(quiz => unit.modes.includes(quiz.mode))
      .sort((a, b) => Number(progress.has(a.id)) - Number(progress.has(b.id)) || Number(b.id === unit.starter) - Number(a.id === unit.starter) || a.id.localeCompare(b.id));
    candidates = [ ...focused.slice(0, 3), ...due.slice(0, 2), ...focused.slice(3) ];
  }
  const ids = [...new Set(candidates.map(quiz => quiz.id))].slice(0, kind === 'review' ? 3 : 5);
  experience.session = { ids, index: 0, results: {}, title: kind === 'review' ? '苦手を3問復習' : '今日の5分', startedAt: Date.now() };
  experience.data.session = structuredClone(experience.session);
  saveExperience();
  await openQuizFromHistory(ids[0]);
}

async function resumeLearning() {
  const saved = experience.data.session;
  const bank = new Set(buildQuizBank().map(quiz => quiz.id));
  if (saved && Array.isArray(saved.ids) && saved.ids.length && saved.ids.every(id => bank.has(id)) && Number.isInteger(saved.index) && saved.index >= 0 && saved.index < saved.ids.length) {
    experience.sessionComplete = false;
    experience.session = structuredClone(saved);
    return openQuizFromHistory(saved.ids[saved.index]);
  }
  experience.session = null;
  if (bank.has(experience.data.lastQuiz)) return openQuizFromHistory(experience.data.lastQuiz);
  return startSession('daily');
}

function noteSessionAnswer(ok) {
  const session = experience.session;
  if (!session) return;
  const id = session.ids[session.index];
  const previous = session.results[id];
  session.results[id] = {
    correct: ok || Boolean(previous?.correct), tries: (previous?.tries || 0) + 1,
    answer: { selected: [...state.selected], earChoice: state.earChoice, harmonyKey: state.harmonyKey, hintCount: state.hintCount, assignments: { ...state.target.assignments } },
  };
  experience.data.session = structuredClone(session);
  saveExperience();
}

async function deferCurrentQuiz() {
  state.saving = true;
  updateControls(); renderExperienceControls();
  try {
    const previous = await getProgressForQuiz(state.target.id);
    const now = new Date().toISOString();
    const progress = {
      id: progressKey(state.account.id, state.target.id), accountId: state.account.id,
      quizId: state.target.id, mode: state.mode, attempts: 0, correct: 0, solved: false,
      ...previous, reviewRequestedAt: now, nextReviewAt: now,
    };
    await storeRequest('progress', 'readwrite', store => store.put(progress));
    state.target.progress = progress;
    toast('あとで復習する問題に追加しました');
    return true;
  } catch (error) {
    console.error('Failed to defer quiz', error);
    toast('復習する問題を保存できませんでした。もう一度お試しください。');
    return false;
  } finally {
    state.saving = false;
    updateControls(); renderExperienceControls();
  }
}

async function advanceSession() {
  const session = experience.session;
  session.index += 1;
  if (session.index < session.ids.length) {
    experience.data.session = structuredClone(session);
    saveExperience();
    return openQuizFromHistory(session.ids[session.index]);
  }
  const correct = Object.values(session.results).filter(result => result.correct).length;
  const firstTry = Object.values(session.results).filter(result => result.correct && result.tries === 1).length;
  const minutes = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));
  experience.data.session = null;
  experience.data.lastSession = { correct, total: session.ids.length, finishedAt: new Date().toISOString() };
  experience.session = null;
  experience.sessionComplete = true;
  saveExperience();
  document.querySelector('#session-strip').innerHTML = `<div class="session-result"><span class="result-symbol" aria-hidden="true">✦</span><p class="label">${escapeHtml(session.title)} · おつかれさま</p><h2>今日も、音が少し身近に。</h2><p>${minutes}分で${session.ids.length}問に取り組み、${correct}問正解。うち${firstTry}問は一度で解けました。</p><p>迷ったところは、また復習で確かめましょう。</p><div class="button-row"><button class="primary-button" data-cq="home">ホームへ</button><button class="quiet-button" data-cq="review">苦手を復習</button><button class="quiet-button" data-cq="mode" data-mode="practice">作曲室で試す</button></div></div>`;
  renderExperienceControls();
}

async function renderDashboard() {
  const accountId = state.account.id;
  const { quizzes, progress } = await loadLearningRecords();
  const logs = await requestToPromise(state.db.transaction('attemptsLog', 'readonly').objectStore('attemptsLog').index('accountId').getAll(accountId));
  if (state.account.id !== accountId || state.mode !== 'mypage') return;
  const today = logs.filter(record => isToday(record.createdAt));
  const solved = [...progress.values()].filter(record => record.solved);
  const due = quizzes.filter(quiz => quizAvailableAtEarLevel(quiz) && isReviewDue(progress.get(quiz.id))).length;
  const nextUnit = LEARNING_UNITS.find(unit => solved.filter(record => unit.modes.includes(record.mode)).length < 3) || LEARNING_UNITS[5];
  const achievements = calculateAchievements(logs, quizzes);
  const summaries = PLAY_MODES.map(mode => summarizeMode(mode, quizzes, progress));
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - 6 + index);
    const count = logs.filter(record => new Date(record.createdAt).toDateString() === date.toDateString()).length;
    return `<div class="week-day ${count ? 'practiced' : ''}"><span>${['日','月','火','水','木','金','土'][date.getDay()]}</span><i style="--activity:${Math.min(count, 10) * 10}%" aria-hidden="true"></i><small>${count}問</small></div>`;
  }).join('');
  els.mypagePanel.innerHTML = `
    <section class="daily-hero">
      <div class="hero-copy"><p class="label">YOUR DAILY SOUND · 毎日5分</p><h2>音から、わかる。<br>少しずつ、できる。</h2><p>${escapeHtml(state.account.name)}さん、${today.length ? '今日の続きも、自分のペースで。' : '今日はひとつ、新しい響きに出会いましょう。'}</p><button class="primary-button hero-start" data-cq="daily">今日のレッスンを始める <span aria-hidden="true">→</span></button><small>5問 · 約5分 · ${nextUnit.short}を中心に</small></div>
      <div class="hero-sound"><span class="orbit orbit-one"></span><span class="orbit orbit-two"></span><div class="sound-disc" aria-hidden="true"><span>♪</span></div><p>どちらも3音。でも、違う表情。</p><div class="button-row"><button data-cq="demo" data-value="major">▶ C メジャー</button><button data-cq="demo" data-value="minor">▶ C マイナー</button></div><small>タップして、聴き比べてみよう</small></div>
    </section>
    <div class="quick-actions"><button data-cq="resume"><span class="action-icon">↗</span><div><strong>前回の続き</strong><span>${experience.data.session ? '途中のレッスンを再開' : experience.data.lastQuiz ? '最後に取り組んだ問題へ' : '最初の5問から始める'}</span></div></button><button data-cq="review"><span class="action-icon mint">↻</span><div><strong>苦手を3問復習</strong><span>${due ? `${due}問が復習のタイミング` : '覚えたことを確かめる'}</span></div></button><button data-cq="mode" data-mode="practice"><span class="action-icon peach">♫</span><div><strong>音で遊ぶ</strong><span>4小節の作曲室へ</span></div></button></div>
    <div class="dashboard-columns"><section class="journey-section"><div class="section-heading"><div><p class="label">LEARNING PATH</p><h3>音楽がつながる、6つのステップ</h3></div><span>${solved.length} / ${quizzes.length}問</span></div><div class="learning-path">${LEARNING_UNITS.map((unit, index) => {
      const count = solved.filter(record => unit.modes.includes(record.mode)).length;
      return `<article class="path-step ${unit.id === nextUnit.id ? 'current' : ''}"><span class="step-number">${count >= 3 ? '✓' : String(index + 1).padStart(2, '0')}</span><div><h4>${unit.title}</h4><p>${unit.copy}</p><small>${count >= 3 ? `基礎の3問をクリア · ${count}問正解済み` : `${count} / 3問で最初のチェックポイント`}</small></div><div class="step-actions"><button class="quiet-button" data-cq="read" data-id="${unit.section}">学ぶ</button><button class="quiet-button" data-cq="unit" data-id="${unit.id}">練習 →</button></div></article>`;
    }).join('')}</div></section><aside class="growth-section"><section class="growth-card"><p class="label">YOUR RHYTHM</p><h3>今週のリズム</h3><div class="week-chart" aria-label="直近7日間の学習回数">${week}</div><div class="today-summary"><strong>${today.length}<small> 今日の挑戦</small></strong><strong>${today.length ? Math.round(today.filter(record => record.ok).length / today.length * 100) + '%' : '—'}<small> 今日の正解率</small></strong></div></section><section class="growth-card"><p class="label">SMALL WINS</p><h3>できるようになったこと</h3><div class="achievements">${achievements.map(item => `<div class="achievement ${item.done ? 'earned' : ''}"><span aria-hidden="true">${item.done ? '✦' : '○'}</span><div><strong>${item.title}</strong><small>${item.copy}</small></div></div>`).join('')}</div></section></aside></div>
    <details class="all-training"><summary>すべての練習と学習履歴 <span>11メニュー</span></summary><div class="mypage-grid">${summaries.map(item => `<article class="menu-score-card"><strong>${escapeHtml(MODES[item.mode].title)}</strong><div class="score-metrics"><div><span>正解済み</span><b>${item.solved}/${item.total}</b></div><div><span>挑戦</span><b>${item.attempts}</b></div><div><span>正解率</span><b>${item.accuracy}</b></div></div><div class="button-row"><button class="quiet-button" data-cq="mode" data-mode="${item.mode}">練習する</button><button class="quiet-button" data-history-mode="${item.mode}">履歴</button></div></article>`).join('')}</div></details>`;
}

function calculateAchievements(logs, quizzes) {
  const bank = new Map(quizzes.map(quiz => [quiz.id, quiz]));
  const correct = logs.filter(record => record.ok);
  const intervals = new Set(correct.filter(record => record.mode === 'interval').map(record => bank.get(record.quizId)?.payload.semitones));
  const keys = new Set(correct.filter(record => record.mode === 'chord').map(record => bank.get(record.quizId)?.payload.root).filter(Boolean));
  const ear = new Set(correct.filter(record => record.mode === 'ear').map(record => bank.get(record.quizId)?.payload.kind));
  const days = new Set(logs.map(record => new Date(record.createdAt).toDateString()));
  return [
    { done: intervals.has(3) && intervals.has(4), title: '長3度・短3度を作れた', copy: '2つの距離を鍵盤で正解しよう' },
    { done: ear.has('major') && ear.has('minor'), title: '明るい響きと暗い響き', copy: 'メジャー・マイナーを耳で正解しよう' },
    { done: keys.size >= 3, title: '3つのキーでコードを作れた', copy: `${keys.size} / 3キーに挑戦できました` },
    { done: days.size >= 3, title: '音楽に触れる習慣', copy: `${days.size} / 3日、学習の記録` },
  ];
}

function noteLabel(note) {
  return String(note).replaceAll('C#', 'C♯ / D♭').replaceAll('D#', 'D♯ / E♭').replaceAll('F#', 'F♯ / G♭').replaceAll('G#', 'G♯ / A♭').replaceAll('A#', 'A♯ / B♭');
}

function spelledChordNotes(root, kind) {
  const letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const steps = kind === 'sus2' ? [0, 1, 4] : kind === 'sus4' ? [0, 3, 4] : [0, 2, 4, 6];
  const intervals = CHORDS[kind]?.intervals || CHORDS.major.intervals;
  return intervals.map((interval, index) => {
    const letter = letters[(letters.indexOf(root[0]) + steps[index]) % 7];
    const pitch = (NOTES.indexOf(root) + interval) % 12;
    const difference = ((pitch - NOTES.indexOf(letter) + 18) % 12) - 6;
    return letter + (difference > 0 ? '♯'.repeat(difference) : '♭'.repeat(-difference));
  });
}

function gradeAnswer() {
  const target = state.target;
  if (state.mode === 'ear' && experience.settings.earLevel < 3) {
    if (!state.earChoice) return { incomplete: true, detail: 'お手本を聴いて、コードの種類を選んでください。' };
    return { ok: state.earChoice === target.kind, detail: `お手本は${target.root} ${target.name}。${CHORDS[target.kind].copy} ${state.earChoice !== target.kind ? `選んだ${CHORDS[state.earChoice].name}と聴き比べてみましょう。` : '同じルートで、響きの特徴を確かめましょう。'}`, missing: [], extra: [] };
  }
  if (state.mode === 'function') {
    if (Object.keys(target.assignments).length < target.chords.length) return { incomplete: true, detail: `まず7つのコードを仕分けましょう（あと${7 - Object.keys(target.assignments).length}つ）。` };
    const wrong = target.chords.filter(chord => target.assignments[chord.id] !== chord.role);
    return { ok: !wrong.length, detail: wrong.length ? wrong.map(chord => `${chord.symbol}は${roleName(chord.role)}（${FUNCTION_LABELS[chord.role].copy}）。選んだ役割は${roleName(target.assignments[chord.id])}です。`).join(' ') : '安定のT、展開のSD、緊張のD。コード名と役割がつながりました。', missing: [], extra: [] };
  }
  if (isHarmonyMode()) {
    const chords = Array.from({ length: target.bars.length }, (_, index) => harmonyChordById(state.selected[index]));
    if (!state.harmonyKey || chords.some(chord => !chord)) return { incomplete: true, detail: 'キーと、すべての小節のコードを選んでください。' };
    const wrong = chords.flatMap((chord, index) => chord.degree !== target.degrees[index] || state.harmonyKey !== target.key ? [`${index + 1}小節目：${chord.symbol} → 模範例 ${target.expected[index].symbol}`] : []);
    return { ok: !wrong.length, detail: `${state.harmonyKey === target.key ? 'キーは合っています。' : `模範例のキーは${target.key}メジャーです。`}${wrong.join('。')}。${!wrong.length ? 'メロディーと伴奏の関係を聴いてみましょう。' : 'この課題は模範例との一致で判定します。他の伴奏もあり得るので、響きの違いを比べましょう。'}`, missing: [], extra: [] };
  }
  if (state.mode === 'diatonic' || state.mode === 'progression') {
    const expected = state.mode === 'diatonic' ? target.chords : target.progression;
    if (state.selected.length < expected.length) return { incomplete: true, detail: `コードをあと${expected.length - state.selected.length}つ並べてください。` };
    const wrong = expected.flatMap((chord, index) => chord.id !== state.selected[index] ? [`${index + 1}番目は${chord.degree}、${chord.symbol}`] : []);
    return { ok: !wrong.length, detail: wrong.length ? `${wrong.join('。')}です。キーの主音から度数をたどってみましょう。` : target.pattern?.why || `${target.root}メジャーの音を1音おきに重ねると、この7つのコードになります。`, missing: [], extra: [] };
  }
  if (!state.selected.length) return { incomplete: true, detail: '鍵盤で音を選んでから、答え合わせをしましょう。' };
  const ordered = state.mode === 'scale' || state.mode === 'interval' || (state.mode === 'lesson' && target.answerMode !== 'chord');
  const expected = ordered ? target.notes : target.notes.map(pitchNote);
  const selected = ordered ? state.selected : state.selected.map(pitchNote);
  const ok = ordered ? arraysEqual(selected, expected) : samePitchSet(selected, expected);
  const missing = expected.filter(note => !selected.includes(note));
  const extra = selected.filter(note => !expected.includes(note));
  let detail;
  if (state.mode === 'interval' || state.mode === 'transpose') {
    const root = target.root || target.targetKey;
    const distance = state.mode === 'interval' ? target.interval.semitones : target.degree.semitones;
    detail = `${root}から${distance}半音上が${noteLabel(target.notes[0])}です。${state.mode === 'interval' ? `これは${target.interval.name}の距離です。` : `メジャースケールの第${target.degree.degree}音になります。`}`;
    if (!ok) {
      const shift = midiFor(pitchNote(target.notes[0]), pitchOctave(target.notes[0])) - midiFor(pitchNote(state.selected[0]), pitchOctave(state.selected[0]));
      detail += ` 選んだ${noteLabel(state.selected[0])}から${Math.abs(shift)}半音${shift > 0 ? '上' : '下'}を試してみましょう。`;
    }
  } else if (ordered) {
    const wrongAt = expected.findIndex((note, index) => note !== selected[index]);
    detail = ok ? `${target.pattern || '音の順番'}の並びができました。低い音から高い音への流れを聴きましょう。`
      : `${wrongAt + 1}番目は${noteLabel(expected[wrongAt])}です。${!missing.length && !extra.length ? '音は揃っているので、選ぶ順番を確かめましょう。' : '低い主音から順番にたどりましょう。'} 選び直すと最初から入力できます。`;
  } else {
    const kind = target.kind && CHORDS[target.kind] ? target.kind : Object.keys(CHORDS).find(key => arraysEqual(CHORDS[key].intervals, target.intervals || []));
    const tones = kind ? spelledChordNotes(target.root, kind) : expected.map(noteLabel);
    detail = `${target.root} ${target.name}は ${tones.join('・')}。${kind ? CHORDS[kind].copy : ''}`;
    if (missing.length) detail += ` 足りない音：${missing.map(noteLabel).join('、')}。`;
    if (extra.length) detail += ` 今回は使わない音：${extra.map(noteLabel).join('、')}。`;
  }
  return { ok, detail, missing, extra };
}

function resetExplanation() {
  document.querySelector('#explanation-panel')?.classList.add('hidden');
  document.querySelectorAll('.key.needed, .key.unneeded').forEach(key => key.classList.remove('needed', 'unneeded'));
}

function renderExplanation(result) {
  const panel = document.querySelector('#explanation-panel');
  panel.classList.remove('hidden');
  panel.innerHTML = `<div><p class="label">${result.ok ? '響きと仕組み' : 'ここを確かめよう'}</p><p>${escapeHtml(result.detail)}</p></div><div class="button-row">${state.mode !== 'function' ? '<button class="quiet-button" data-cq="compare">▶ 自分の回答 → お手本</button>' : ''}<button class="quiet-button" data-cq="read" data-id="${learningUnitForMode(state.mode).section}">関連する解説へ</button></div>${result.missing?.length || result.extra?.length ? '<small>鍵盤の＋は足りない音、−は今回使わない音です。</small>' : ''}`;
  document.querySelectorAll('#keyboard .key').forEach(key => {
    const pitch = `${key.dataset.note}${key.dataset.octave}`;
    key.classList.toggle('needed', result.missing?.includes(pitch) || result.missing?.includes(key.dataset.note));
    key.classList.toggle('unneeded', result.extra?.includes(pitch) || result.extra?.includes(key.dataset.note));
  });
}

function comparisonEvents(correct) {
  const target = state.target;
  const events = [];
  const add = (pitch, at = 0, duration = .65) => events.push({ pitch, at, duration });
  if (isHarmonyMode()) {
    const firstBar = experience.playRegion === 'bar' ? state.activeBar : 0;
    const bars = experience.playRegion === 'bar' ? [target.bars[firstBar]] : target.bars;
    bars.forEach((bar, index) => {
      bar.forEach((pitch, n) => add(pitch, index * .9 + n * (.9 / bar.length), .3));
      const chord = correct ? target.expected[firstBar + index] : harmonyChordById(state.selected[firstBar + index]);
      if (chord) chordTonePitches(chord, 3).forEach(pitch => add(pitch, index * .9, .8));
    });
  } else if (state.mode === 'diatonic' || state.mode === 'progression') {
    const chords = correct ? target.progression || target.chords : state.selected.map(id => diatonicChoiceById(id));
    chords.filter(Boolean).forEach((chord, index) => chordTonePitches(chord, 4).forEach(pitch => add(pitch, index * .7)));
  } else if (state.mode === 'ear' && experience.settings.earLevel < 3) {
    scalePitches(target.root, 4, CHORDS[correct ? target.kind : state.earChoice].intervals).forEach(pitch => add(pitch));
  } else if (state.mode === 'interval' || state.mode === 'transpose') {
    add(target.rootPitch || `${target.targetKey}4`, 0, .4);
    (correct ? target.notes : state.selected).forEach(pitch => add(pitch, .5));
  } else {
    const sequence = state.mode === 'scale' || (state.mode === 'lesson' && target.answerMode !== 'chord');
    const pitches = correct ? (sequence ? target.notes : chordPitchesFromTarget(target)) : state.selected;
    pitches.forEach((pitch, index) => add(pitch, sequence ? index * .28 : 0));
  }
  return events;
}

function playComparison() {
  if (!state.target) return;
  stopAudio(); ensureAudio();
  const own = comparisonEvents(false);
  const expected = comparisonEvents(true);
  const offset = Math.max(0, ...own.map(event => event.at + event.duration)) + .65;
  own.forEach(event => playNote(pitchNote(event.pitch), pitchOctave(event.pitch), event.at, event.duration));
  expected.forEach(event => playNote(pitchNote(event.pitch), pitchOctave(event.pitch), event.at + offset, event.duration));
  document.querySelector('#audio-status').textContent = '① 自分の回答';
  sound.later(() => { document.querySelector('#audio-status').textContent = '② お手本'; }, offset * tempoRatio());
  experience.loopTimer = setTimeout(() => { document.querySelector('#audio-status').textContent = '音から、わかる。'; }, Math.max(0, sound.endTime - sound.context.currentTime) * 1000);
}

const LESSON_DEMOS = {
  'interval-basics': { a: 'major-interval', aLabel: '長3度 · C → E', b: 'minor-interval', bLabel: '短3度 · C → E♭', question: 'Cから短3度上の音は？', options: ['E', 'E♭', 'F'], answer: 'E♭', explanation: 'Cから半音3つでE♭。長3度のEより半音低い音です。' },
  interval: { a: 'major-scale', aLabel: 'Cメジャー', b: 'minor-scale', bLabel: 'Cマイナー', question: 'CメジャーのEとFの距離は？', options: ['半音', '全音', '短3度'], answer: '半音', explanation: 'EとFの間には黒鍵がありません。隣り合う鍵盤なので半音です。' },
  chord: { a: 'major', aLabel: 'Cメジャー', b: 'minor', bLabel: 'Cマイナー', question: 'CメジャーをCマイナーにするには？', options: ['EをE♭にする', 'GをAにする', 'CをDにする'], answer: 'EをE♭にする', explanation: '3度を半音下げると、C・E♭・Gのマイナーコードになります。' },
  diatonic: { a: 'cadence', aLabel: 'I → IV → V → I', b: 'circle', bLabel: 'I → vi → ii → V', question: 'CメジャーのVのコードは？', options: ['F', 'G', 'Am'], answer: 'G', explanation: 'Cから5番目の音Gをルートに、G・B・Dを重ねます。' },
  'degree-transpose': { a: 'c-fifth', aLabel: 'Cの第5音 · G', b: 'g-fifth', bLabel: 'Gの第5音 · D', question: 'Cの第3音Eを、Gメジャーへ移調すると？', options: ['A', 'B', 'D'], answer: 'B', explanation: 'G・A・Bと数えると、第3音はB。役割を保ってキーを変えます。' },
  'one-bar-harmony': { a: 'one-melody', aLabel: 'メロディーだけ', b: 'one-harmony', bLabel: 'Cの伴奏をつける', question: 'C・E・Gを構成音に持つコードは？', options: ['C', 'Dm', 'F'], answer: 'C', explanation: 'Cメジャーの構成音です。BからCへの動きと、C・E・Gの着地を聴いてみましょう。' },
  'melody-harmony': { a: 'four-melody', aLabel: '4小節のメロディー', b: 'four-harmony', bLabel: '伴奏を重ねる', question: 'この例の I → vi → IV → V をCメジャーで表すと？', options: ['C → Am → F → G', 'C → Dm → Em → F', 'Am → G → F → Em'], answer: 'C → Am → F → G', explanation: '度数の役割を保つと、キーが変わっても同じ進行を作れます。' },
  function: { a: 'dominant-tonic', aLabel: 'G → C · 緊張から安定', b: 'sub-tonic', bLabel: 'F → C · 展開から安定', question: 'CメジャーのGの基本的な役割は？', options: ['トニック', 'サブドミナント', 'ドミナント'], answer: 'ドミナント', explanation: 'GはVのコードで、基本的にはドミナント。Iへ戻る動きを聴いてみましょう。' },
  progression: { a: 'royal', aLabel: '王道進行', b: 'pop', bLabel: 'ポップ進行', question: '王道進行の度数は？', options: ['IV → V → iii → vi', 'I → IV → V → I', 'ii → V → I'], answer: 'IV → V → iii → vi', explanation: 'CメジャーならF → G → Em → Am。最後のAmへの着地を聴いてみましょう。' },
  cliche: { a: 'cliche', aLabel: 'C → Cmaj7 → C7 → F', b: 'cliche-line', bLabel: 'C → B → B♭ → A の線', question: 'このクリシェの下降する声部は？', options: ['C → B → B♭ → A', 'C → D → E → F', 'G → A → B → C'], answer: 'C → B → B♭ → A', explanation: 'コードが変わる間に、ひとつの声部が少しずつ下降します。' },
};

function textbookPracticeMode(section) {
  if (section.practiceMode) return section.practiceMode;
  return { interval: 'scale', chord: 'chord', diatonic: 'diatonic', function: 'function', progression: 'progression', cliche: 'progression' }[section.id] || 'interval';
}

function renderInteractiveLesson(section) {
  const demo = LESSON_DEMOS[section.id];
  const pitches = scalePitches('C', 4, Array.from({ length: 13 }, (_, index) => index));
  const whiteSlots = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  const blackSlots = { 'C#': 1, 'D#': 2, 'F#': 4, 'G#': 5, 'A#': 6 };
  return `<section class="interactive-lesson"><p class="label">LISTEN → PLAY → TRY</p><h3>耳と手で確かめよう</h3><div class="button-row"><button class="quiet-button" data-cq="demo" data-value="${demo.a}">▶ ${demo.aLabel}</button><button class="quiet-button" data-cq="demo" data-value="${demo.b}">▶ ${demo.bLabel}</button></div><div class="mini-piano" aria-label="音を試せる鍵盤">${pitches.map(pitch => {
    const note = pitchNote(pitch), black = note.includes('#');
    return `<button type="button" class="mini-key ${black ? 'mini-black' : ''}" style="${black ? `left:${blackSlots[note] / 8 * 100}%` : `grid-column:${pitch === 'C5' ? 8 : whiteSlots[note] + 1}`}" data-cq="demo-key" data-pitch="${pitch}" data-demo-pitch="${pitch}" aria-label="${noteLabel(pitch)}"><span>${note.replace('#', '♯')}</span></button>`;
  }).join('')}</div><div class="mini-question"><strong>${demo.question}</strong><div class="button-row">${demo.options.map(option => `<button class="quiet-button" data-cq="mini-answer" data-value="${escapeHtml(option)}">${option}</button>`).join('')}</div><p id="mini-feedback" role="status">音を聴いて、ひとつ選んでみましょう。</p></div></section>`;
}

function answerMiniLesson(value, button) {
  const demo = LESSON_DEMOS[experience.activeSection];
  const ok = value === demo.answer;
  document.querySelector('#mini-feedback').textContent = `${ok ? '正解！' : 'もう一度確かめよう。'} ${demo.explanation}`;
  document.querySelectorAll('[data-cq="mini-answer"]').forEach(element => element.setAttribute('aria-pressed', String(element === button)));
  if (ok) {
    experience.data.readSections = [...new Set([...(experience.data.readSections || []), experience.activeSection])];
    saveExperience();
  }
}

function playLessonDemo(kind) {
  stopAudio(); ensureAudio();
  const note = (pitch, at = 0, duration = .65) => sound.note(pitchNote(pitch), pitchOctave(pitch), at * tempoRatio(), duration * tempoRatio(), true);
  const chord = (root, quality, at = 0) => scalePitches(root, 4, CHORDS[quality].intervals).forEach(pitch => note(pitch, at));
  const sequence = pitches => pitches.forEach((pitch, index) => note(pitch, index * .45, .4));
  const degrees = { cadence: [0, 3, 4, 0], circle: [0, 5, 1, 4], royal: [3, 4, 2, 5], pop: [0, 4, 5, 3], 'dominant-tonic': [4, 0], 'sub-tonic': [3, 0] };
  if (kind === 'major' || kind === 'minor') chord('C', kind);
  else if (kind === 'major-interval') sequence(['C4', 'E4']);
  else if (kind === 'minor-interval') sequence(['C4', 'D#4']);
  else if (kind === 'c-fifth') sequence(['C4', 'G4']);
  else if (kind === 'g-fifth') sequence(['G4', 'D5']);
  else if (kind === 'major-scale' || kind === 'minor-scale') sequence(scalePitches('C', 4, SCALES[kind === 'major-scale' ? 'major' : 'naturalMinor'].intervals));
  else if (degrees[kind]) degrees[kind].forEach((degree, index) => chordTonePitches(diatonicChords('C')[degree], 4).forEach(pitch => note(pitch, index * .85)));
  else if (kind === 'cliche') ['major', 'major7', 'dominant7', 'major'].forEach((quality, index) => chord(index === 3 ? 'F' : 'C', quality, index * .85));
  else if (kind === 'cliche-line') sequence(['C5', 'B4', 'A#4', 'A4']);
  else {
    const four = kind.startsWith('four');
    const melody = four ? HARMONIZE_CHALLENGES[0] : ONE_BAR_HARMONY_CHALLENGES[0];
    melody.bars.forEach((bar, index) => {
      bar.forEach((pitch, n) => note(pitch, index * 1.2 + n * .3, .28));
      if (kind.endsWith('harmony')) chordTonePitches(diatonicChords('C').find(item => item.degree === melody.degrees[index]), 3).forEach(pitch => note(pitch, index * 1.2, 1));
    });
  }
  finishPlayback(() => playLessonDemo(kind), '教材の音を再生中');
}

function defaultComposition() {
  return { key: 'C', slots: [0, 4, 5, 3], name: '', tempo: 100, active: 0, loop: true };
}

function validComposition(item) {
  return item && NOTES.includes(item.key) && Array.isArray(item.slots) && item.slots.length === 4 && item.slots.every(slot => Number.isInteger(slot) && slot >= 0 && slot <= 6)
    && typeof item.name === 'string' && Number.isFinite(item.tempo) && item.tempo >= 50 && item.tempo <= 160;
}

function renderStudio() {
  if (state.mode !== 'practice') return;
  const draft = experience.data.draft;
  if (!Number.isInteger(draft.active) || draft.active < 0 || draft.active > 3) draft.active = 0;
  const chords = diatonicChords(draft.key);
  const favorites = experience.data.favorites;
  document.querySelector('#studio-panel').innerHTML = `<div class="section-heading"><div><p class="label">YOUR LITTLE STUDIO</p><h3>4つのコードから、音楽を。</h3></div><span>4 / 4 拍子</span></div><p>小節を選んでコードを置きます。矢印やドラッグで順番を変え、響きを探してみましょう。</p>
    <div class="studio-toolbar"><label>キー<select id="studio-key">${NOTES.map(key => `<option value="${key}" ${key === draft.key ? 'selected' : ''}>${key.replace('#', '♯')} メジャー</option>`).join('')}</select></label><label>定番から試す<select id="studio-preset"><option value="">進行を選ぶ</option><option value="pop">ポップ進行</option><option value="cadence">基本カデンツ</option><option value="royal">王道進行</option><option value="circle">循環進行</option></select></label><label class="check-label"><input id="studio-loop" type="checkbox" ${draft.loop ? 'checked' : ''} />ループ</label></div>
    <div class="studio-timeline">${draft.slots.map((degree, index) => `<article class="studio-slot ${draft.active === index ? 'selected-slot' : ''}" draggable="true" data-studio-slot="${index}"><button class="studio-slot-select" data-cq="studio-slot" data-slot="${index}" aria-pressed="${draft.active === index}"><span>${index + 1}小節目</span><strong>${chords[degree].symbol}</strong><small>${chords[degree].degree} · ${roleName(chords[degree].role)}</small></button><div class="slot-arrows"><button data-cq="studio-move" data-from="${index}" data-to="${index - 1}" aria-label="${index + 1}小節目を左へ" ${index === 0 ? 'disabled' : ''}>←</button><button data-cq="studio-move" data-from="${index}" data-to="${index + 1}" aria-label="${index + 1}小節目を右へ" ${index === 3 ? 'disabled' : ''}>→</button></div></article>`).join('')}</div>
    <div class="studio-bank" role="group" aria-label="小節に置くコード">${chords.map((chord, index) => `<button data-cq="studio-chord" data-value="${index}"><strong>${chord.symbol}</strong><span>${chord.degree}</span></button>`).join('')}</div>
    <div class="studio-footer"><button class="primary-button" data-cq="studio-play">▶ 進行を再生</button><label>進行の名前<input id="studio-name" value="${escapeHtml(draft.name)}" placeholder="夜の帰り道" maxlength="60" /></label><button class="quiet-button" data-cq="studio-save">＋ お気に入りに保存</button></div>
    <div class="saved-compositions"><h4>お気に入り <span>${favorites.length}</span></h4>${favorites.length ? `<div class="favorite-list">${favorites.map(item => `<button data-cq="studio-load" data-id="${escapeHtml(item.id)}"><strong>${escapeHtml(item.name)}</strong><span>${item.key} · ${item.tempo} BPM · ${item.slots.map(slot => DIATONIC_DEGREES[slot].degree).join(' – ')}</span></button>`).join('')}</div>` : '<p>気に入った響きができたら、名前をつけて残しましょう。</p>'}<small>進行と学習履歴は、このブラウザのユーザーごとに保存されます。</small></div>`;
}

function moveStudioSlot(from, to) {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || from > 3 || to < 0 || to > 3) return;
  stopAudio();
  const draft = experience.data.draft;
  const [degree] = draft.slots.splice(from, 1);
  draft.slots.splice(to, 0, degree);
  draft.active = to;
  saveExperience(); renderStudio();
}

function previewStudioChord(degree) {
  stopAudio(); ensureAudio();
  const chord = diatonicChords(experience.data.draft.key)[degree];
  chordTonePitches(chord, 4).forEach(pitch => sound.note(pitchNote(pitch), pitchOctave(pitch), 0, .7, true));
}

function playStudio() {
  stopAudio(); ensureAudio();
  const draft = structuredClone(experience.data.draft);
  const chords = diatonicChords(draft.key);
  const barDuration = 240 / experience.settings.tempo;
  let cycleStart = sound.context.currentTime + .05;
  const scheduleCycle = () => {
    let previous = null;
    draft.slots.forEach((degree, index) => {
      const chord = chords[degree];
      const pitches = voiceChordNearPrevious(chord, previous);
      previous = pitches;
      const onset = cycleStart + index * barDuration;
      pitches.forEach(pitch => sound.note(pitchNote(pitch), pitchOctave(pitch), 0, barDuration * .85, true, onset));
      sound.note(chord.note, 3, 0, barDuration * .7, true, onset);
      sound.mark(`[data-studio-slot="${index}"]`, onset - sound.context.currentTime, barDuration);
    });
    cycleStart += barDuration * 4;
    if (draft.loop) {
      // Schedule the next cycle ahead of the boundary on the audio clock.
      experience.loopTimer = setTimeout(scheduleCycle, Math.max(0, cycleStart - sound.context.currentTime - .15) * 1000);
    } else {
      finishPlayback(playStudio, `${draft.key} · ${experience.settings.tempo} BPM`, false, cycleStart - sound.context.currentTime);
    }
  };
  scheduleCycle();
  document.querySelector('#audio-status').textContent = `${draft.key} · ${experience.settings.tempo} BPM${draft.loop ? ' · ループ' : ''}`;
}

function saveComposition() {
  const draft = experience.data.draft;
  draft.name = document.querySelector('#studio-name').value.trim().slice(0, 60) || `${draft.key}のスケッチ ${experience.data.favorites.length + 1}`;
  draft.tempo = experience.settings.tempo;
  if (experience.data.favorites.length >= 50) { toast('お気に入りは50件まで保存できます。'); return; }
  experience.data.favorites.unshift({ ...structuredClone(draft), id: `sketch-${crypto.randomUUID()}`, savedAt: new Date().toISOString() });
  if (saveExperience()) { renderStudio(); toast('お気に入りに保存しました'); }
  else experience.data.favorites.shift();
}

init().catch(error => {
  console.error(error);
  els.gamePanel.classList.add('hidden');
  els.mypagePanel.classList.remove('hidden');
  els.mypagePanel.innerHTML = '<section class="growth-card"><h2>学習データを開けませんでした</h2><p>ブラウザの保存領域が利用できるか確認してから、ページを再読み込みしてください。</p><button class="primary-button" onclick="location.reload()">再読み込み</button></section>';
});
