// Staged listening exercises. Original quiz IDs remain available through history.
const CURRICULUM_STAGES = [
  { id: 'tonic-guide', mode: 'transpose', title: '② 主音を聴く · 音名と度数あり', family: 'tonic', guide: true },
  { id: 'tonic-ear', mode: 'transpose', title: '② 主音を聴く · 表示なし', family: 'tonic' },
  { id: 'role-two', mode: 'function', title: '③ 役割を聴く · 2択', family: 'role', count: 2 },
  { id: 'role-three', mode: 'function', title: '③ 役割を聴く · 3択', family: 'role', count: 3 },
  { id: 'pair-guide', mode: 'progression', title: '④ 2コード · 比較音あり', family: 'pair', guide: true },
  { id: 'pair-ear', mode: 'progression', title: '④ 2コード · 問題音だけ', family: 'pair' },
  { id: 'pair-minor', mode: 'progression', title: '④ 2コード · Amを含む', family: 'pair', minor: true },
  { id: 'pair-keys', mode: 'progression', title: '④ 2コード · 別のキー', family: 'pair', minor: true, keys: true },
  { id: 'one-two', mode: 'harmonyOne', title: '⑤ 1小節 · 2択・音名あり', family: 'harmony', count: 2, guide: true },
  { id: 'one-three', mode: 'harmonyOne', title: '⑤ 1小節 · 3択・音名あり', family: 'harmony', count: 3, guide: true },
  { id: 'one-ear', mode: 'harmonyOne', title: '⑤ 1小節 · 音名なし', family: 'harmony', count: 3 },
  { id: 'one-color', mode: 'harmonyOne', title: '⑤ 1小節 · 非和声音を含む', family: 'harmony', count: 3, color: true },
  { id: 'gap-two', mode: 'harmonize', title: '⑥ 4小節の穴埋め · 2択', family: 'harmony', count: 2, gap: true, guide: true },
  { id: 'gap-three', mode: 'harmonize', title: '⑥ 4小節の穴埋め · 3択', family: 'harmony', count: 3, gap: true },
  { id: 'four-basic', mode: 'harmonize', title: '⑦ 4小節 · C・F・G', family: 'harmony', count: 3 },
  { id: 'four-minor', mode: 'harmonize', title: '⑦ 4小節 · Amを含む', family: 'harmony', count: 4, minor: true },
  { id: 'four-keys', mode: 'harmonize', title: '⑦ 4小節 · 別のキー', family: 'harmony', count: 4, minor: true, keys: true },
  { id: 'detect-one', mode: 'harmonyOne', title: '発展 · 1小節のキーも推定', legacy: true },
  { id: 'detect-four', mode: 'harmonize', title: '発展 · 4小節のキーも推定', legacy: true },
];
function curriculumStage(id) { return CURRICULUM_STAGES.find(stage => stage.id === id); }
function quizStageId(quiz) {
  return quiz.payload.stage || (quiz.mode === 'harmonyOne' ? 'detect-one' : quiz.mode === 'harmonize' ? 'detect-four' : 'theory');
}
function curriculumGroup(mode) { return isHarmonyMode(mode) ? 'harmony' : mode; }
function stagesForMode(mode) { return CURRICULUM_STAGES.filter(stage => curriculumGroup(stage.mode) === curriculumGroup(mode)); }
function activeCurriculumStage(mode) {
  return experience.settings.curriculum?.[curriculumGroup(mode)] || (isHarmonyMode(mode) ? 'one-two' : 'theory');
}
function quizAvailableInCurriculum(quiz) { return !stagesForMode(quiz.mode).length || quizStageId(quiz) === activeCurriculumStage(quiz.mode); }
function buildCurriculumQuizzes() {
  return CURRICULUM_STAGES.filter(stage => !stage.legacy).flatMap((stage, order) =>
    Array.from({ length: stage.family === 'harmony' ? 8 : 6 }, (_, index) => ({
      id: `listen-${stage.id}-${index}`, mode: stage.mode, order: order * 100 + index,
      payload: { stage: stage.id, index },
    })));
}
function curriculumTarget(quiz) {
  const stage = curriculumStage(quiz.payload.stage), i = quiz.payload.index;
  const key = stage.keys ? ['G', 'D', 'A'][i % 3] : 'C';
  const chords = diatonicChords(key);
  const chord = degree => chords.find(item => item.degree === degree);
  const base = { id: quiz.id, stage: stage.id, root: key, key, guide: Boolean(stage.guide), type: 'listening', family: stage.family };
  if (stage.family === 'tonic') {
    const degrees = [[3,2,1], [1,3,5], [5,7,8], [3,2,7], [5,3,1], [1,2,3]][i];
    const notes = degrees.map(d => transposePitch(`${key}4`, [0,2,4,5,7,9,11,12][d-1]));
    return { ...base, notes, melodyDegrees: degrees, answer: [1,8].includes(degrees.at(-1)) ? 'yes' : 'no',
      options: [{ id: 'yes', label: '主音に戻った' }, { id: 'no', label: '主音以外で終わった' }],
      prompt: '最後の音は主音に戻りましたか？', copy: `${key}メジャーです。基準の主音と主和音を聴いてから、短い旋律の着地点を比べましょう。` };
  }
  if (stage.family === 'role') {
    const choices = stage.count === 2 ? (i < 3 ? ['I','V'] : ['IV','V']) : ['I','IV','V'];
    const answer = choices[i % choices.length];
    return { ...base, notes: chordTonePitches(chord(answer), 4), answer, degrees: [answer],
      options: choices.map(d => ({ id: d, label: `${roleName(chord(d).role)} · ${chord(d).role}` })),
      prompt: '基準のIのあと、どの役割のコードが鳴りましたか？', copy: `${key}メジャー。最初のIでキーを確認し、その次の響きを聴き分けます。` };
  }
  if (stage.family === 'pair') {
    const choices = stage.minor ? [['I','vi'], ['I','V']] : (i < 3 ? [['I','IV'], ['I','V']] : [['IV','I'], ['V','I']]);
    const options = choices.map((ds, n) => ({ id: String(n), degrees: ds, label: ds.map(d => chord(d).symbol).join(' → ') }));
    const answer = String(i % 2), degrees = options[Number(answer)].degrees;
    return { ...base, notes: degrees.flatMap(d => chordTonePitches(chord(d),4)), degrees, answer, options,
      prompt: '実際に鳴った2つのコードはどちら？', copy: `${key}メジャー。${stage.guide ? '候補の音も聴き比べられます。' : '問題音を聴いて回答してください。採点後に候補を比較できます。'}` };
  }
  const one = stage.mode === 'harmonyOne';
  const patterns = stage.minor ? [['I','vi','IV','V'], ['I','IV','vi','V']] : [['I','IV','V','I'], ['I','V','IV','I']];
  const degrees = one ? [['I','IV','V'][i % 3]] : patterns[i % 2];
  const bars = degrees.map((d, n) => {
    const pitches = chordTonePitches(chord(d), 4);
    const rotation = (i + n) % 3;
    const notes = [pitches[rotation], pitches[(rotation+1)%3], pitches[(rotation+2)%3], pitches[rotation]];
    if (stage.color) {
      const scale = scalePitches(key,4,SCALES.major.intervals);
      const at = scale.indexOf(notes[1]);
      notes[0] = at > 0 ? scale[at-1] : transposePitch(`${key}4`,-1);
    }
    return notes;
  });
  const challenge = { key, degrees, bars, name: `伴奏練習 ${i+1}` };
  const target = harmonyTargetFromChallenge(quiz, challenge);
  const gapIndex = stage.gap ? i % 4 : null;
  const expectedDegree = degrees[gapIndex ?? 0];
  const pool = ['I','IV','V', ...(stage.minor ? ['vi'] : [])];
  const candidates = stage.count === 2 ? pool.filter(d => d !== expectedDegree).slice(i % 2, i % 2 + 1).concat(expectedDegree) : pool;
  return { ...target, stage: stage.id, guide: Boolean(stage.guide), keyProvided: true, gapIndex,
    candidateDegrees: pool.filter(d => candidates.includes(d)),
    prompt: stage.gap ? `${gapIndex+1}小節目の伴奏を選ぶ` : `${one ? '1' : '4'}小節のメロディーに伴奏をつける`,
    copy: `${key}メジャー。${stage.gap ? '表示済みの3小節は固定です。' : ''}${stage.color ? '非和声音から構成音へ進む動きも聴きます。' : 'まずコードの構成音とメロディーを結びつけましょう。'} 模範例との一致で確認します。別の伴奏も成立し得ます。` };
}
function initializeCurriculumAnswer() {
  const target = state.target;
  if (!target?.keyProvided) return;
  state.harmonyKey = target.key;
  if (target.gapIndex !== null) {
    state.selected = target.expected.map((chord, index) => index === target.gapIndex ? undefined : chord.id);
    state.activeBar = target.gapIndex;
  }
}
function curriculumNotesVisible() { return state.target?.stage ? Boolean(state.curriculumNotes) : experience.settings.showMelodyNotes; }
function curriculumSupport() {
  return { stage: state.target?.stage || (isHarmonyMode() ? (state.mode === 'harmonyOne' ? 'detect-one' : 'detect-four') : null),
    extraHelp: Boolean(state.curriculumExtraHelp),
    keyProvided: Boolean(state.target?.keyProvided || state.target?.type === 'listening'),
    notesShown: isHarmonyMode() ? curriculumNotesVisible() : Boolean(state.target?.guide),
    comparisonProvided: Boolean(state.target?.type === 'listening' && state.target?.guide) };
}
function renderCurriculumSelector() {
  const stages = stagesForMode(state.mode);
  if (!stages.length) return '';
  return `<label class="curriculum-selector">練習の段階<select id="curriculum-stage" ${state.saving || experience.session ? 'disabled' : ''}>${!isHarmonyMode() ? '<option value="theory">見る・作る（理論の練習）</option>' : ''}${stages.map(stage => `<option value="${stage.id}">${stage.title}</option>`).join('')}</select></label>`;
}
async function selectCurriculumStage(id) {
  if (state.saving || experience.session) return;
  const stage = curriculumStage(id);
  experience.settings.curriculum ||= {};
  experience.settings.curriculum[curriculumGroup(state.mode)] = id;
  saveExperience();
  await setMode(stage?.mode || state.mode);
}
function renderListeningBoard() {
  const t = state.target;
  els.keyboard.classList.add('hidden');
  els.conceptBoard.classList.remove('hidden');
  els.conceptBoard.innerHTML = `<div class="listening-board"><p><strong>${t.key}メジャー</strong></p><div class="button-row"><button class="quiet-button" data-cq="listen-reference">▶ 主音と主和音</button><button class="quiet-button" data-cq="listen-question">▶ 問題を聴く</button></div>${t.family === 'tonic' && (t.guide || state.solved) ? `<p class="listening-notes">${t.notes.map((note,index) => `${note.replace('#','♯')}（${t.melodyDegrees[index]}度）`).join(' → ')}</p>` : ''}<div class="listening-options">${t.options.map(option => `<div><button class="chord-card" data-cq="listen-choice" data-value="${option.id}" aria-pressed="${state.selected[0] === option.id}" ${state.solved || state.saving ? 'disabled' : ''}>${option.label}</button>${t.family === 'pair' && (t.guide || state.solved) ? `<button class="quiet-button" data-cq="listen-option" data-value="${option.id}">▶ ${option.label}を聴く</button>` : ''}</div>`).join('')}</div>${t.family === 'role' && state.solved ? '<button class="quiet-button" data-cq="listen-resolution">▶ このコード → I の解決を聴く</button>' : ''}</div>`;
}
function listeningEvents(choice = state.target.answer) {
  const t = state.target, events = [];
  const addChord = (degree, at) => chordTonePitches(diatonicChords(t.key).find(c => c.degree === degree),4).forEach(pitch => events.push({pitch,at,duration:.65}));
  if (t.family === 'tonic') t.notes.forEach((pitch,i) => events.push({pitch,at:i*.45,duration:.4}));
  if (t.family === 'role') { addChord('I',0); addChord(choice,1); }
  if (t.family === 'pair') t.options.find(o => o.id === choice).degrees.forEach((degree,i) => addChord(degree,i*.85));
  return events;
}
function playListening(kind = 'question', choice) {
  stopAudio(); ensureAudio();
  const t = state.target;
  let events;
  if (kind === 'reference') events = [{pitch:`${t.key}4`,at:0,duration:.5}, ...chordTonePitches(diatonicChords(t.key)[0],4).map(pitch => ({pitch,at:.8,duration:.7}))];
  else if (kind === 'resolution') events = [t.answer,'I'].flatMap((degree,i) => chordTonePitches(diatonicChords(t.key).find(c => c.degree === degree),4).map(pitch => ({pitch,at:i*.85,duration:.7})));
  else events = listeningEvents(choice);
  events.forEach(e => playNote(pitchNote(e.pitch),pitchOctave(e.pitch),e.at,e.duration));
  finishPlayback(() => playListening(kind,choice), '聴き取り練習を再生中');
}
function gradeListening() {
  const t = state.target;
  if (!state.selected.length) return { incomplete:true, detail:'問題を聴いて、候補をひとつ選んでください。' };
  const answer = t.options.find(o => o.id === t.answer);
  const detail = t.family === 'tonic' ? `最後は${t.notes.at(-1)}。${answer.label}旋律です。主音${t.key}と比べて聴きましょう。`
    : t.family === 'role' ? `${t.key}メジャーの${diatonicChords(t.key).find(c=>c.degree===t.answer).symbol}（${t.answer}）です。${answer.label}の響きと、Iへの動きを比べましょう。`
    : `実際に鳴った進行は ${answer.label} です。この問題は再生したコードとの一致で判定します。`;
  return {ok:state.selected[0] === t.answer,detail,missing:[],extra:[]};
}
function curriculumMastered(stage, quizzes, progress) {
  return quizzes.filter(q => quizStageId(q) === stage.id && progress.get(q.id)?.unassistedSolved).length >= 3;
}
function nextCurriculumStage(quizzes, progress) { return CURRICULUM_STAGES.find(stage => !curriculumMastered(stage,quizzes,progress)); }
function renderCurriculumPath(quizzes, progress) {
  const next = nextCurriculumStage(quizzes,progress);
  return `<section class="journey-section"><h3>和声を聴くまでの練習</h3><p>① メジャー／マイナーの聴き分けから始め、各段階で3問できたら次へ。各段階の標準条件で達成を記録し、音名などを追加した回答は「補助あり」として区別します。</p><button class="quiet-button" data-cq="mode" data-mode="ear">① 響きの聞き取り</button><div class="curriculum-path">${CURRICULUM_STAGES.map(stage => {
    const done = quizzes.filter(q => quizStageId(q) === stage.id && progress.get(q.id)?.unassistedSolved).length;
    return `<button class="quiet-button" data-cq="curriculum-open" data-value="${stage.id}">${stage.title}<small>${done >= 3 ? '達成' : `${done} / 3問`}${stage.id === next?.id ? ' · 次の練習' : ''}</small></button>`;
  }).join('')}</div></section>`;
}
