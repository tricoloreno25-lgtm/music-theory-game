const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const WHITE_SEQUENCE = ["C", "D", "E", "F", "G", "A", "B", "C", "D", "E", "F", "G", "A", "B", "C"];
const BLACK_KEYS = [
  { note: "C#", slot: 1 },
  { note: "D#", slot: 2 },
  { note: "F#", slot: 4 },
  { note: "G#", slot: 5 },
  { note: "A#", slot: 6 },
  { note: "C#", slot: 8 },
  { note: "D#", slot: 9 },
  { note: "F#", slot: 11 },
  { note: "G#", slot: 12 },
  { note: "A#", slot: 13 },
];

const CHORDS = {
  major: { name: "メジャー", intervals: [0, 4, 7], copy: "明るい響き。ルート、長3度、完全5度。" },
  minor: { name: "マイナー", intervals: [0, 3, 7], copy: "少し暗い響き。ルート、短3度、完全5度。" },
  diminished: { name: "ディミニッシュ", intervals: [0, 3, 6], copy: "緊張感のある響き。短3度を2つ重ねます。" },
  augmented: { name: "オーギュメント", intervals: [0, 4, 8], copy: "浮遊感のある響き。長3度を2つ重ねます。" },
  sus2: { name: "sus2", intervals: [0, 2, 7], copy: "3度を2度に置き換えた、開いた響き。" },
  sus4: { name: "sus4", intervals: [0, 5, 7], copy: "3度を4度に置き換えた、解決感のある響き。" },
  major7: { name: "メジャーセブンス", intervals: [0, 4, 7, 11], copy: "透明感のある響き。メジャー三和音に長7度。" },
  dominant7: { name: "セブンス", intervals: [0, 4, 7, 10], copy: "解決したくなる響き。メジャー三和音に短7度。" },
  minor7: { name: "マイナーセブンス", intervals: [0, 3, 7, 10], copy: "落ち着いた響き。マイナー三和音に短7度。" },
  halfDiminished: { name: "ハーフディミニッシュ", intervals: [0, 3, 6, 10], copy: "不安定な響き。ディミニッシュ三和音に短7度。" },
};

const SCALES = {
  major: { name: "メジャー", intervals: [0, 2, 4, 5, 7, 9, 11, 12], copy: "全全半全全全半の並び。" },
  naturalMinor: { name: "ナチュラルマイナー", intervals: [0, 2, 3, 5, 7, 8, 10, 12], copy: "全半全全半全全の並び。" },
  pentatonic: { name: "ペンタトニック", intervals: [0, 2, 4, 7, 9, 12], copy: "5音中心でメロディを作りやすい並び。" },
};

const DIATONIC_DEGREES = [
  { degree: "I", quality: "", offset: 0, role: "T" },
  { degree: "ii", quality: "m", offset: 2, role: "SD" },
  { degree: "iii", quality: "m", offset: 4, role: "T" },
  { degree: "IV", quality: "", offset: 5, role: "SD" },
  { degree: "V", quality: "", offset: 7, role: "D" },
  { degree: "vi", quality: "m", offset: 9, role: "T" },
  { degree: "vii°", quality: "dim", offset: 11, role: "D" },
];

const FUNCTION_LABELS = {
  T: { name: "トニック", copy: "安定" },
  SD: { name: "サブドミナント", copy: "展開" },
  D: { name: "ドミナント", copy: "緊張" },
};

const PROGRESSION_PATTERNS = [
  { name: "基本カデンツ", degrees: ["I", "IV", "V", "I"], roles: ["T", "SD", "D", "T"], copy: "安定から展開、緊張を通って安定へ戻る形です。" },
  { name: "ii - V - I", degrees: ["ii", "V", "I"], roles: ["SD", "D", "T"], copy: "ジャズやポップスでよく使われる、解決感の強い進行です。" },
  { name: "王道進行", degrees: ["IV", "V", "iii", "vi"], roles: ["SD", "D", "T", "T"], copy: "明るさから緊張を作り、少し切ない着地へ向かう定番進行です。" },
  { name: "循環進行", degrees: ["I", "vi", "ii", "V"], roles: ["T", "T", "SD", "D"], copy: "安定から遠回りしてドミナントへ向かう、循環しやすい進行です。" },
  { name: "ポップ進行", degrees: ["I", "V", "vi", "IV"], roles: ["T", "D", "T", "SD"], copy: "明るい始まりから展開へ戻れる、歌ものに多い進行です。" },
];

const INTRO_LESSON_CHALLENGES = [
  {
    root: "C",
    name: "メジャースケール",
    answerMode: "scale",
    intervals: SCALES.major.intervals,
    pattern: "全・全・半・全・全・全・半",
    prompt: "C メジャースケールを鳴らしてみよう",
    copy: "白鍵だけで弾ける基本のスケールです。全音と半音の並びを確認します。",
    cards: [
      ["半音と全音", "鍵盤でとなり合う音の距離が <strong>半音</strong> です。全音は半音2つ分です。"],
      ["メジャーの公式", "メジャースケールは <strong>全・全・半・全・全・全・半</strong> の順で進みます。"],
      ["Cから始める理由", "Cから始めると黒鍵を使わずに C D E F G A B C と進めます。"],
      ["答え方", "低いCから高いCまで、左から右へ順番に押します。"],
    ],
  },
  {
    root: "G",
    name: "メジャースケール",
    answerMode: "scale",
    intervals: SCALES.major.intervals,
    pattern: "全・全・半・全・全・全・半",
    prompt: "G メジャースケールを鳴らしてみよう",
    copy: "C以外のルートでメジャーの公式を使います。F# が出てくるのがポイントです。",
    cards: [
      ["公式は同じ", "ルートがGに変わっても、メジャーの公式は <strong>全・全・半・全・全・全・半</strong> のままです。"],
      ["スライドの考え方", "Cで覚えた形をGへ移します。始点が変わると、必要な黒鍵も変わります。"],
      ["黒鍵が必要になる理由", "Gから公式どおりに数えると、7番目の音はFではなくF#になります。"],
      ["答え方", "Gから始めて、F#を忘れずに高いGまで進みます。"],
    ],
  },
  {
    root: "D",
    name: "メジャースケール",
    answerMode: "scale",
    intervals: SCALES.major.intervals,
    pattern: "全・全・半・全・全・全・半",
    prompt: "D メジャースケールを鳴らしてみよう",
    copy: "メジャーの公式をさらに別のルートへ移します。F# と C# が出ます。",
    cards: [
      ["同じ公式をもう一度使う", "Dから始めても、メジャーの公式は <strong>全・全・半・全・全・全・半</strong> です。"],
      ["黒鍵が増える", "DメジャーではF#とC#が必要です。公式を守ると自然に見つかります。"],
      ["半音で確認する", "Dから +0 / +2 / +4 / +5 / +7 / +9 / +11 / +12 を探します。"],
      ["答え方", "D E F# G A B C# D の順で進みます。"],
    ],
  },
  {
    root: "C",
    name: "メジャーペンタトニック",
    answerMode: "scale",
    intervals: SCALES.pentatonic.intervals,
    pattern: "全・全・短3度・全・短3度",
    prompt: "C メジャーペンタトニックを鳴らしてみよう",
    copy: "メジャースケールから音を抜いて、5音のスケールにします。",
    cards: [
      ["ペンタは抜く発想", "Cメジャースケール C D E F G A B C から、FとBを抜くとCメジャーペンタになります。"],
      ["5音にする理由", "音数が少ないので、メロディを作るときに扱いやすくなります。"],
      ["公式", "メジャーペンタトニックは <strong>全・全・短3度・全・短3度</strong> です。"],
      ["答え方", "C D E G A C の順で進みます。"],
    ],
  },
  {
    root: "A",
    name: "ナチュラルマイナー",
    answerMode: "scale",
    intervals: SCALES.naturalMinor.intervals,
    pattern: "全・半・全・全・半・全・全",
    prompt: "A ナチュラルマイナーを鳴らしてみよう",
    copy: "メジャーとペンタのあとに、マイナーの響きへ進みます。",
    cards: [
      ["同じ白鍵でも始点が変わる", "Aから白鍵を順に弾くと、Cメジャーとは違う暗めの響きになります。"],
      ["マイナーの公式", "ナチュラルマイナーは <strong>全・半・全・全・半・全・全</strong> です。"],
      ["3つ目の音", "Aから数えると3つ目はCです。この短3度がマイナーらしさを作ります。"],
      ["答え方", "A B C D E F G A の順で、最後は1オクターブ上のAまで進みます。"],
    ],
  },
];

const GENERATED_LESSON_TYPES = [
  {
    name: "メジャースケール",
    answerMode: "scale",
    intervals: SCALES.major.intervals,
    pattern: "全・全・半・全・全・全・半",
    copy: "メジャースケールの公式を、いろいろなルートから使う練習です。",
    cards(root) {
      return [
        ["ルートを確認する", `今回の始点は <strong>${root}</strong> です。まずこの音を基準にします。`],
        ["メジャーの公式", "公式は <strong>全・全・半・全・全・全・半</strong> です。ルートが変わっても形は同じです。"],
        ["半音で数える", `黒鍵も1ステップとして数え、${root} から +0 / +2 / +4 / +5 / +7 / +9 / +11 / +12 を探します。`],
        ["答え方", `低い ${root} から始めて、1オクターブ上の ${root} まで順番に押します。`],
      ];
    },
  },
  {
    name: "ナチュラルマイナー",
    answerMode: "scale",
    intervals: SCALES.naturalMinor.intervals,
    pattern: "全・半・全・全・半・全・全",
    copy: "ナチュラルマイナーの暗めの響きと、半音位置を覚える練習です。",
    cards(root) {
      return [
        ["ルートを確認する", `今回の始点は <strong>${root}</strong> です。マイナーもルートから半音で数えます。`],
        ["マイナーの公式", "ナチュラルマイナーは <strong>全・半・全・全・半・全・全</strong> です。"],
        ["3度を見る", "ルートから3半音上の短3度が、マイナーらしい響きを作ります。"],
        ["答え方", `低い ${root} から始めて、1オクターブ上の ${root} まで順番に押します。`],
      ];
    },
  },
  {
    name: "メジャーペンタトニック",
    answerMode: "scale",
    intervals: SCALES.pentatonic.intervals,
    pattern: "全・全・短3度・全・短3度",
    copy: "5音で作る明るいペンタトニックを、各ルートで見つける練習です。",
    cards(root) {
      return [
        ["ペンタは5音", "ペンタトニックは1オクターブ内で主に5つの音を使います。"],
        ["公式", "メジャーペンタトニックは <strong>全・全・短3度・全・短3度</strong> です。"],
        ["半音数", `半音数では ${root} から <strong>+0 / +2 / +4 / +7 / +9 / +12</strong> を探します。`],
        ["答え方", `低い ${root} から始め、途中の抜ける音を意識して上へ進みます。`],
      ];
    },
  },
  {
    name: "マイナーペンタトニック",
    answerMode: "scale",
    intervals: [0, 3, 5, 7, 10, 12],
    pattern: "短3度・全・全・短3度・全",
    copy: "暗めで使いやすい5音スケールを、各ルートで見つける練習です。",
    cards(root) {
      return [
        ["マイナー系の5音", "マイナーペンタトニックは、短3度を含む暗めの5音スケールです。"],
        ["公式", "マイナーペンタトニックは <strong>短3度・全・全・短3度・全</strong> です。"],
        ["半音数", `半音数では ${root} から <strong>+0 / +3 / +5 / +7 / +10 / +12</strong> を探します。`],
        ["答え方", `低い ${root} から始めて、1オクターブ上の ${root} まで順番に押します。`],
      ];
    },
  },
];

const GENERATED_LESSON_CHORD_TYPES = Object.entries(CHORDS).map(([kind, chord]) => ({
  kind,
  name: chord.name,
  answerMode: "chord",
  intervals: chord.intervals,
  copy: chord.copy,
  cards(root) {
    return [
      ["ルートを確認する", `今回の土台になる音は <strong>${root}</strong> です。ここから半音で構成音を探します。`],
      [`${chord.name} の公式`, `${chord.name} は <strong>${chordIntervalText(kind)}</strong> で作ります。`],
      ["順番は気にしない", "コード問題では押す順番ではなく、必要な音名がそろっているかを判定します。"],
      ["聞いて覚える", "選んだ音は同時に鳴らして、響きの明るさ、暗さ、緊張感を確認します。"],
    ];
  },
}));

const LESSON_CHALLENGES = buildLessonChallenges();

const MODES = {
  lesson: {
    title: "音程の地図",
    copy: "鍵盤を押すと音名が並びます。C から半音で数える感覚をつかむと、コードとスケールが同じルールで見えてきます。",
    label: "自由練習",
  },
  chord: {
    title: "コードビルダー",
    copy: "指定されたルートとコード種を見て、構成音を鍵盤から選びます。順番は問いません。",
    label: "コードを作る",
  },
  scale: {
    title: "スケールラン",
    copy: "指定されたスケールを低い音から順番に押します。半音の並びを体で覚えるモードです。",
    label: "スケールを弾く",
  },
  diatonic: {
    title: "ダイアトニック・ビルダー",
    copy: "キーの7音から自然にできるコードを、度数の順番に並べます。音名とローマ数字をまとめて覚えます。",
    label: "コードを並べる",
  },
  function: {
    title: "役割仕分け",
    copy: "ダイアトニックコードをトニック、サブドミナント、ドミナントへ分類します。コード進行の土台になる役割を見ます。",
    label: "機能を選ぶ",
  },
  dominant: {
    title: "D / SD フォーカス",
    copy: "ドミナントとサブドミナントを見分けます。解決へ向かう力と、その前に展開を作る力を分けて覚えます。",
    label: "機能を見分ける",
  },
  progression: {
    title: "コード進行",
    copy: "度数で示された進行を、実際のキーのコード名へ変換して並べます。キーが変わっても同じ型で考える練習です。",
    label: "進行を完成",
  },
  ear: {
    title: "響きの聞き取り",
    copy: "お手本の響きを聞いて、メジャーかマイナーかを選びます。最初は音の高さより明暗に集中します。",
    label: "耳で選ぶ",
  },
};

const state = {
  mode: "lesson",
  selected: [],
  target: null,
  score: 0,
  streak: 0,
  correct: 0,
  attempts: 0,
  audio: null,
  hintCount: 0,
  lessonStep: 0,
  solved: false,
};

const els = {
  keyboard: document.querySelector("#keyboard"),
  answerStrip: document.querySelector("#answer-strip"),
  tabs: document.querySelectorAll(".tab"),
  modeTitle: document.querySelector("#mode-title"),
  modeCopy: document.querySelector("#mode-copy"),
  promptLabel: document.querySelector("#prompt-label"),
  prompt: document.querySelector("#prompt"),
  playTarget: document.querySelector("#play-target"),
  toggleHint: document.querySelector("#toggle-hint"),
  hintPanel: document.querySelector("#hint-panel"),
  hintCost: document.querySelector("#hint-cost"),
  conceptBoard: document.querySelector("#concept-board"),
  check: document.querySelector("#check-answer"),
  clear: document.querySelector("#clear-answer"),
  next: document.querySelector("#next-challenge"),
  score: document.querySelector("#score"),
  streak: document.querySelector("#streak"),
  correct: document.querySelector("#correct"),
  attempts: document.querySelector("#attempts"),
  accuracy: document.querySelector("#accuracy"),
};

function init() {
  renderKeyboard();
  bindEvents();
  setMode("lesson");
}

function bindEvents() {
  els.tabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode));
  });
  els.playTarget.addEventListener("click", () => playTarget());
  els.toggleHint.addEventListener("click", () => toggleHint());
  els.check.addEventListener("click", () => checkAnswer());
  els.clear.addEventListener("click", () => {
    state.selected = [];
    if (state.mode === "function" && state.target) {
      state.target.assignments = {};
    }
    state.solved = false;
    renderAnswer();
    renderConceptBoard();
    renderHint();
    updateControls();
    updateKeyState();
  });
  els.next.addEventListener("click", () => nextChallenge());
}

function renderKeyboard() {
  WHITE_SEQUENCE.forEach((note, index) => {
    const button = document.createElement("button");
    button.className = "key white";
    button.dataset.note = note;
    button.dataset.octave = index < 7 ? "4" : "5";
    button.innerHTML = `<span>${note}</span>`;
    button.addEventListener("click", () => selectNote(note, button.dataset.octave));
    els.keyboard.appendChild(button);
  });

  BLACK_KEYS.forEach(({ note, slot }) => {
    const button = document.createElement("button");
    button.className = "key black";
    button.dataset.note = note;
    button.dataset.octave = slot < 7 ? "4" : "5";
    button.style.left = `${(slot / 15) * 100}%`;
    button.innerHTML = `<span>${note}</span>`;
    button.addEventListener("click", () => selectNote(note, button.dataset.octave));
    els.keyboard.appendChild(button);
  });
}

function setMode(mode) {
  state.mode = mode;
  state.selected = [];
  if (mode === "lesson") {
    state.lessonStep = 0;
  }
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  els.modeTitle.textContent = MODES[mode].title;
  els.modeCopy.textContent = MODES[mode].copy;
  els.promptLabel.textContent = MODES[mode].label;
  nextChallenge();
}

function nextChallenge() {
  state.selected = [];
  state.hintCount = 0;
  state.solved = false;

  if (state.mode === "lesson") {
    state.target = lessonTargetForStep();
    els.prompt.textContent = state.target.prompt;
    els.promptLabel.textContent = `${MODES.lesson.label} ${state.target.step}/100`;
    els.modeCopy.textContent = state.target.copy;
  }

  if (state.mode === "chord") {
    const root = randomItem(["C", "D", "E", "F", "G", "A", "B"]);
    const chordKey = randomItem(Object.keys(CHORDS));
    const chord = CHORDS[chordKey];
    state.target = {
      root,
      kind: chordKey,
      name: chord.name,
      intervals: chord.intervals,
      notes: chordNotes(root, chord.intervals),
      type: "chord",
    };
    els.prompt.textContent = `${root} ${chord.name} の構成音を選ぶ`;
    els.modeCopy.textContent = chord.copy;
  }

  if (state.mode === "scale") {
    const root = randomItem(["C", "D", "E", "F", "G", "A"]);
    const scaleKey = randomItem(Object.keys(SCALES));
    const scale = SCALES[scaleKey];
    state.target = {
      root,
      kind: scaleKey,
      name: scale.name,
      intervals: scale.intervals,
      notes: scalePitches(root, 4, scale.intervals),
      pattern: scalePattern(scaleKey),
      type: "scale",
    };
    els.prompt.textContent = `${root} ${scale.name} を順番に弾く`;
    els.modeCopy.textContent = scale.copy;
  }

  if (state.mode === "diatonic") {
    const root = randomItem(["C", "G", "D", "A", "E"]);
    const chords = diatonicChords(root);
    state.target = {
      root,
      chords,
      choices: diatonicChoices(root, chords),
      notes: scalePitches(root, 4, SCALES.major.intervals),
      type: "diatonic",
    };
    els.prompt.textContent = `${root}メジャーのダイアトニックコードを順番に並べる`;
    els.modeCopy.textContent = "Iからvii°まで、キーの中だけで作れる7つのコードを並べます。";
  }

  if (state.mode === "function") {
    const root = randomItem(["C", "G", "D", "A", "E"]);
    const chords = diatonicChords(root);
    state.target = {
      root,
      chords,
      assignments: {},
      notes: chordToneNames(chords.find((chord) => chord.degree === "V")),
      type: "function",
    };
    els.prompt.textContent = `${root}メジャーのコードを T / SD / D に仕分ける`;
    els.modeCopy.textContent = "同じキーのコードでも、安定、展開、緊張の役割に分けると進行が読みやすくなります。";
  }

  if (state.mode === "dominant") {
    const root = randomItem(["C", "G", "D", "A", "E", "F"]);
    const role = randomItem(["D", "SD"]);
    const chords = diatonicChords(root);
    state.target = {
      root,
      role,
      chords,
      choices: shuffleRandom(chords),
      notes: chordToneNames(chords.find((chord) => chord.role === role)),
      type: "dominant",
    };
    els.prompt.textContent = `${root}メジャーで ${FUNCTION_LABELS[role].name} を全部選ぶ`;
    els.modeCopy.textContent =
      role === "D"
        ? "ドミナントは I へ戻りたくなる緊張を作ります。V と vii° が中心です。"
        : "サブドミナントは安定から離れて、ドミナントへ向かう展開を作ります。ii と IV が中心です。";
  }

  if (state.mode === "progression") {
    const root = randomItem(["C", "G", "D", "A", "E", "F"]);
    const chords = diatonicChords(root);
    const pattern = randomItem(PROGRESSION_PATTERNS);
    const progression = pattern.degrees.map((degree) => chords.find((chord) => chord.degree === degree));
    state.target = {
      root,
      pattern,
      chords,
      progression,
      choices: diatonicChoices(root, chords),
      notes: progression.flatMap((chord) => chordToneNames(chord)),
      type: "progression",
    };
    els.prompt.textContent = `${root}メジャーで ${pattern.name} を完成`;
    els.modeCopy.textContent = pattern.copy;
  }

  if (state.mode === "ear") {
    const root = randomItem(["C", "D", "E", "F", "G", "A", "B"]);
    const kind = randomItem(Object.keys(CHORDS));
    state.target = {
      root,
      kind,
      name: CHORDS[kind].name,
      notes: chordNotes(root, CHORDS[kind].intervals),
      type: "ear",
    };
    els.prompt.textContent = "聞こえた響きを鍵盤で答える";
    els.modeCopy.textContent = "明るさ、暗さ、緊張感、浮遊感を聞き分けて、構成音を鍵盤で再現します。";
    setTimeout(playTarget, 160);
  }

  renderAnswer();
  renderConceptBoard();
  renderHint();
  updateHintVisibility();
  updateControls();
  updateKeyState();
}

function selectNote(note, octave) {
  if (usesConceptBoard()) return;

  ensureAudio();
  const pitch = `${note}${octave}`;
  playNote(note, Number(octave), 0, 0.35);

  if ((state.mode === "lesson" && state.target?.answerMode === "scale") || state.mode === "scale") {
    state.selected = state.selected.includes(pitch)
      ? state.selected.filter((item) => item !== pitch)
      : [...state.selected, pitch];
  } else if (state.selected.some((item) => pitchNote(item) === note)) {
    state.selected = state.selected.filter((item) => pitchNote(item) !== note);
  } else {
    state.selected.push(pitch);
  }

  renderAnswer();
  renderHint();
  updateKeyState();
}

function renderAnswer(message = "") {
  els.answerStrip.innerHTML = "";
  if (message) {
    const feedback = document.createElement("span");
    feedback.className = "hint";
    feedback.textContent = message;
    els.answerStrip.appendChild(feedback);
  }

  if (!message && usesConceptBoard()) {
    if (state.mode === "diatonic" && state.selected.length === 0) {
      const hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = "カードを押して I から順番に並べる";
      els.answerStrip.appendChild(hint);
      return;
    }

    if (state.mode === "dominant") {
      const expectedCount = state.target.chords.filter((chord) => chord.role === state.target.role).length;
      const hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = `${FUNCTION_LABELS[state.target.role].name}をすべて選ぶ ${state.selected.length}/${expectedCount}`;
      els.answerStrip.appendChild(hint);
      return;
    }

    if (state.mode === "progression" && state.selected.length === 0) {
      const hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = "コードカードを押して進行の左から順番に埋める";
      els.answerStrip.appendChild(hint);
      return;
    }

    if (state.mode === "function") {
      const assigned = Object.keys(state.target.assignments).length;
      const hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = state.selected[0]
        ? `${chordById(state.selected[0]).symbol} をどの機能に置くか選ぶ`
        : `仕分け済み ${assigned}/7`;
      els.answerStrip.appendChild(hint);
      return;
    }
  }

  const values = state.selected.length ? state.selected : [];
  if (!message && values.length === 0) {
    const hint = document.createElement("span");
    hint.className = "hint";
    hint.textContent = "鍵盤を押して答えを作る";
    els.answerStrip.appendChild(hint);
  }

  values.forEach((value) => {
    const span = document.createElement("span");
    span.className = "answer-note";
    span.textContent = usesConceptBoard() ? diatonicChoiceById(value)?.symbol || chordById(value)?.symbol || value : displayPitch(value);
    els.answerStrip.appendChild(span);
  });
}

function renderConceptBoard() {
  if (!usesConceptBoard()) {
    els.conceptBoard.classList.add("hidden");
    els.conceptBoard.innerHTML = "";
    els.keyboard.classList.remove("hidden");
    return;
  }

  els.keyboard.classList.add("hidden");
  els.conceptBoard.classList.remove("hidden");

  if (state.mode === "diatonic") {
    renderDiatonicBoard();
    return;
  }

  if (state.mode === "dominant") {
    renderDominantBoard();
    return;
  }

  if (state.mode === "progression") {
    renderProgressionBoard();
    return;
  }

  renderFunctionBoard();
}

function renderDiatonicBoard() {
  const selectedChords = state.selected.map((id) => diatonicChoiceById(id));
  const remaining = state.target.choices.filter((chord) => !state.selected.includes(chord.id));

  els.conceptBoard.innerHTML = `
    <div class="degree-row">
      ${state.target.chords
        .map(
          (chord, index) => `
            <div class="degree-slot ${selectedChords[index]?.id === chord.id ? "filled correct-slot" : selectedChords[index] ? "filled" : ""}">
              <span>${chord.degree}</span>
              <strong>${selectedChords[index]?.symbol || "?"}</strong>
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="step-map" aria-label="全音と半音の位置">
      ${["全", "全", "半", "全", "全", "全", "半"].map((step) => `<span class="${step === "半" ? "half" : ""}">${step}</span>`).join("")}
    </div>
    <div class="card-bank">
      ${remaining
        .map(
          (chord) => `
            <button class="chord-card" data-action="pick-diatonic" data-id="${chord.id}">
              <strong>${chord.symbol}</strong>
            </button>
          `,
        )
        .join("")}
    </div>
  `;

  bindConceptButtons();
}

function renderFunctionBoard() {
  const columns = ["T", "SD", "D"];
  const assignedIds = Object.keys(state.target.assignments);
  const unassigned = state.target.chords.filter((chord) => !assignedIds.includes(chord.id));

  els.conceptBoard.innerHTML = `
    <div class="function-layout">
      <div class="function-bank">
        <p class="mini-label">未分類</p>
        <div class="card-bank compact">
          ${shuffleStable(unassigned, `${state.target.root}-function`)
            .map(
              (chord) => `
                <button class="chord-card" data-action="focus-function" data-id="${chord.id}">
                  <span>${chord.degree}</span>
                  <strong>${chord.symbol}</strong>
                  <small>${chord.note}</small>
                </button>
              `,
            )
            .join("")}
        </div>
      </div>
      ${columns
        .map(
          (role) => `
            <div class="function-column">
              <button class="function-head" data-action="assign-function" data-role="${role}">
                <strong>${role}</strong>
                <span>${FUNCTION_LABELS[role].name}</span>
                <small>${FUNCTION_LABELS[role].copy}</small>
              </button>
              <div class="function-drop">
                ${state.target.chords
                  .filter((chord) => state.target.assignments[chord.id] === role)
                  .map(
                    (chord) => `
                      <button class="assigned-card" data-action="focus-function" data-id="${chord.id}">
                        <span>${chord.degree}</span>
                        <strong>${chord.symbol}</strong>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="function-actions">
      <span>${state.selected[0] ? `${chordById(state.selected[0]).symbol} の置き場所を選択中` : "コードを選んで、T / SD / D の見出しを押す"}</span>
    </div>
  `;

  bindConceptButtons();
}

function renderDominantBoard() {
  const selectedIds = new Set(state.selected);
  els.conceptBoard.innerHTML = `
    <div class="role-focus">
      <div>
        <span>今回の役割</span>
        <strong>${FUNCTION_LABELS[state.target.role].name}</strong>
        <small>${state.target.role}</small>
      </div>
      <p>${state.target.role === "D" ? "V と vii° を探します。" : "ii と IV を探します。"}</p>
    </div>
    <div class="card-bank">
      ${state.target.choices
        .map(
          (chord) => `
            <button class="chord-card selectable ${selectedIds.has(chord.id) ? "selected" : ""}" data-action="toggle-dominant" data-id="${chord.id}">
              <span>${chord.degree}</span>
              <strong>${chord.symbol}</strong>
            </button>
          `,
        )
        .join("")}
    </div>
  `;

  bindConceptButtons();
}

function renderProgressionBoard() {
  const selectedChords = state.selected.map((id) => diatonicChoiceById(id));
  const remaining = state.target.choices.filter((chord) => !state.selected.includes(chord.id));

  els.conceptBoard.innerHTML = `
    <div class="progression-row">
      ${state.target.progression
        .map(
          (chord, index) => `
            <div class="degree-slot ${selectedChords[index]?.id === chord.id ? "filled correct-slot" : selectedChords[index] ? "filled" : ""}">
              <span>${state.target.pattern.roles[index]}</span>
              <strong>${selectedChords[index]?.symbol || "?"}</strong>
              <small>${chord.degree}</small>
            </div>
          `,
        )
        .join("")}
    </div>
    <div class="card-bank">
      ${remaining
        .map(
          (chord) => `
            <button class="chord-card" data-action="pick-progression" data-id="${chord.id}">
              <strong>${chord.symbol}</strong>
            </button>
          `,
        )
        .join("")}
    </div>
  `;

  bindConceptButtons();
}

function bindConceptButtons() {
  els.conceptBoard.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.solved) return;

      const { action, id, role } = button.dataset;

      if (action === "pick-diatonic") {
        if (state.selected.length >= state.target.chords.length) return;
        state.selected.push(id);
        renderAnswer();
        renderConceptBoard();
      }

      if (action === "focus-function") {
        state.selected = state.selected[0] === id ? [] : [id];
        renderAnswer();
        renderConceptBoard();
      }

      if (action === "assign-function" && state.selected[0]) {
        state.target.assignments[state.selected[0]] = role;
        state.selected = [];
        renderAnswer();
        renderConceptBoard();
      }

      if (action === "toggle-dominant") {
        state.selected = state.selected.includes(id) ? state.selected.filter((item) => item !== id) : [...state.selected, id];
        renderAnswer();
        renderConceptBoard();
      }

      if (action === "pick-progression") {
        if (state.selected.length >= state.target.progression.length) return;
        state.selected.push(id);
        renderAnswer();
        renderConceptBoard();
      }
    });
  });
}

function renderHint() {
  if (!state.target) return;

  const cards = theoryCardsForTarget().slice(0, state.hintCount);
  els.hintPanel.innerHTML = cards
    .map(
      (card, index) => `
        <div class="hint-step">
          <strong>ヒント ${index + 1}</strong>
          <h3>${card.title}</h3>
          <span>${card.copy}</span>
        </div>
      `,
    )
    .join("");
}

function theoryCardsForTarget() {
  if (state.mode === "lesson") {
    return state.target.cards.map(([title, copy]) => ({ title, copy }));
  }

  if (state.mode === "scale") {
    return [
      {
        title: "ルートから始める",
        copy: `今回のルートは <strong>${state.target.root}</strong> です。まずこの音を基準にして、右へ進みながら音を探します。`,
      },
      {
        title: `${state.target.name} の公式`,
        copy: `${state.target.name} は <strong>${state.target.pattern}</strong> で作ります。半音数では <strong>${scaleSemitoneText(state.target.intervals)}</strong> です。`,
      },
      {
        title: "全音と短3度の数え方",
        copy: "全音は半音2つ分、短3度は半音3つ分です。黒鍵も1ステップとして数えると迷いにくくなります。",
      },
      {
        title: "答える時の注意",
        copy: `低い <strong>${state.target.root}</strong> から上へ進み、最後は同じ音名の1オクターブ上まで弾きます。`,
      },
    ];
  }

  if (state.mode === "chord") {
    return [
      {
        title: "ルートを決める",
        copy: `今回の土台になる音は <strong>${state.target.root}</strong> です。コードはこの音から半音で数えて作ります。`,
      },
      {
        title: `${state.target.name} の公式`,
        copy: `${state.target.name} は <strong>${chordIntervalText(state.target.kind)}</strong> で構成されます。順番は判定に影響しません。`,
      },
      {
        title: "3度が性格を決める",
        copy: "4半音上ならメジャー寄り、3半音上ならマイナー寄りの響きになります。",
      },
      {
        title: "選び方",
        copy: "鍵盤では必要な音だけを選びます。同じ音を別オクターブで押すより、まず音名をそろえることを優先します。",
      },
    ];
  }

  if (state.mode === "diatonic") {
    return [
      {
        title: "ダイアトニックコード",
        copy: "キーのスケール音だけを使い、1音おきに3つ重ねると7つのコードができます。",
      },
      {
        title: "メジャーキーの型",
        copy: "順番は <strong>I / ii / iii / IV / V / vi / vii°</strong> です。大文字はメジャー、小文字はマイナーを表します。",
      },
      {
        title: "Cで見る",
        copy: "Cメジャーなら <strong>C / Dm / Em / F / G / Am / Bdim</strong> です。ほかのキーでも度数の型は同じです。",
      },
      {
        title: "半音位置",
        copy: "メジャースケールは <strong>全・全・半・全・全・全・半</strong>。3番目と4番目、7番目と8番目が半音です。",
      },
    ];
  }

  if (state.mode === "function") {
    return [
      {
        title: "3つの役割",
        copy: "<strong>T</strong> は安定、<strong>SD</strong> は展開、<strong>D</strong> は緊張と解決への力を作ります。",
      },
      {
        title: "基本の分類",
        copy: "このゲームでは <strong>I / iii / vi = T</strong>、<strong>ii / IV = SD</strong>、<strong>V / vii° = D</strong> として扱います。",
      },
      {
        title: "ドミナント",
        copy: "<strong>V</strong> と <strong>vii°</strong> は I に戻りたくなる響きです。コード進行の山場を作ります。",
      },
      {
        title: "サブドミナント",
        copy: "<strong>IV</strong> と <strong>ii</strong> は T から D へ向かう橋渡しとしてよく使われます。",
      },
    ];
  }

  if (state.mode === "dominant") {
    return [
      {
        title: "ドミナント",
        copy: "<strong>V</strong> と <strong>vii°</strong> は I に戻りたくなる緊張を作ります。曲の区切りや解決前によく出ます。",
      },
      {
        title: "サブドミナント",
        copy: "<strong>ii</strong> と <strong>IV</strong> は T から離れて、D へ向かう準備を作ります。",
      },
      {
        title: "見分け方",
        copy: "まずローマ数字を見ます。D は <strong>V / vii°</strong>、SD は <strong>ii / IV</strong> として覚えます。",
      },
      {
        title: "コード進行での位置",
        copy: "よくある流れは <strong>T → SD → D → T</strong> です。SD が展開し、D が解決へ押し出します。",
      },
    ];
  }

  if (state.mode === "progression") {
    return [
      {
        title: "度数で読む",
        copy: `今回の進行は <strong>${state.target.pattern.degrees.join(" - ")}</strong> です。キーが変わっても度数の並びは同じです。`,
      },
      {
        title: "役割の流れ",
        copy: `<strong>${state.target.pattern.roles.join(" → ")}</strong> の流れとして考えると、どこで展開し、どこで解決するかが見えます。`,
      },
      {
        title: "キーへ変換する",
        copy: `${state.target.root}メジャーのダイアトニックコードから、表示された度数に合うコード名を選びます。`,
      },
      {
        title: "型を覚える",
        copy: "コード名を丸暗記するより、I、IV、V、vi などの度数で型を覚えると移調しやすくなります。",
      },
    ];
  }

  return [
    {
      title: "響きの性格を聞く",
      copy: "明るい、暗い、不安定、浮いている、解決したいなど、まずコード全体の印象をつかみます。",
    },
    {
      title: "3度と5度に集中する",
      copy: "長3度ならメジャー寄り、短3度ならマイナー寄りです。5度が狭いとディミニッシュ、広いとオーギュメントに聞こえます。",
    },
    {
      title: "7度やsusを探す",
      copy: "4音の厚みがあればセブンス系、3度がなく開いた響きならsus系の可能性があります。",
    },
    {
      title: "もう一度聞く",
      copy: "再生ボタンで同じ問題を聞き直せます。聞き直しはヒント使用扱いにはなりません。",
    },
  ];
}

function toggleHint() {
  if (!state.target || state.solved) return;
  const hintTotal = theoryCardsForTarget().length;
  state.hintCount = Math.min(state.hintCount + 1, hintTotal);
  renderHint();
  updateHintVisibility();
}

function updateHintVisibility() {
  const hintTotal = state.target ? theoryCardsForTarget().length : 0;
  const isComplete = hintTotal > 0 && state.hintCount >= hintTotal;
  els.hintPanel.classList.toggle("hidden", state.hintCount === 0);
  els.toggleHint.textContent = isComplete ? "ヒントはすべて表示済み" : `ヒントを1つ見る ${state.hintCount}/${hintTotal}`;
  els.toggleHint.setAttribute("aria-expanded", String(state.hintCount > 0));
  els.toggleHint.disabled = isComplete || state.solved;
  els.hintCost.textContent =
    state.hintCount > 0
      ? `この問題は正解点が${Math.max(0, 100 - state.hintCount * 25)}%`
      : "ヒント1つごとに正解点が25%減";
}

function updateControls() {
  els.check.classList.toggle("hidden", state.solved);
  updateHintVisibility();
}

function updateKeyState() {
  document.querySelectorAll(".key").forEach((key) => {
    key.classList.toggle("selected", state.selected.includes(`${key.dataset.note}${key.dataset.octave}`));
  });
}

function checkAnswer() {
  if (state.mode === "lesson") {
    const ok =
      state.target.answerMode === "chord"
        ? samePitchSet(state.selected.map(pitchNote), state.target.notes)
        : arraysEqual(state.selected, state.target.notes);
    record(ok);
    state.solved = ok;
    const answer =
      state.target.answerMode === "chord"
        ? state.target.notes.join(" ")
        : state.target.notes.map(displayPitch).join(" ");
    renderAnswer(ok ? `${state.target.root} ${state.target.name} 完成` : `答え: ${answer}`);
    updateControls();
    return;
  }

  if (state.mode === "chord") {
    const selectedNotes = state.selected.map(pitchNote);
    const ok = samePitchSet(selectedNotes, state.target.notes);
    record(ok);
    state.solved = ok;
    renderAnswer(ok ? "正解" : `答え: ${state.target.notes.join(" ")}`);
    updateControls();
    return;
  }

  if (state.mode === "ear") {
    const selectedNotes = state.selected.map(pitchNote);
    const ok = samePitchSet(selectedNotes, state.target.notes);
    record(ok);
    state.solved = ok;
    const answer = `${state.target.root} ${state.target.name}`;
    renderAnswer(ok ? `正解: ${answer}` : `答え: ${answer} (${state.target.notes.join(" ")})`);
    updateControls();
    return;
  }

  if (state.mode === "diatonic") {
    const ok = arraysEqual(state.selected, state.target.chords.map((chord) => chord.id));
    record(ok);
    state.solved = ok;
    const answer = state.target.chords.map((chord) => `${chord.degree}:${chord.symbol}`).join(" ");
    renderAnswer(ok ? `${state.target.root}メジャーの7コード完成` : `答え: ${answer}`);
    renderConceptBoard();
    updateControls();
    return;
  }

  if (state.mode === "function") {
    const ok = state.target.chords.every((chord) => state.target.assignments[chord.id] === chord.role);
    record(ok);
    state.solved = ok;
    renderAnswer(ok ? "全コードを正しく仕分けました" : `答え: ${functionAnswerText(state.target.chords)}`);
    renderConceptBoard();
    updateControls();
    return;
  }

  if (state.mode === "dominant") {
    const expected = state.target.chords.filter((chord) => chord.role === state.target.role).map((chord) => chord.id);
    const ok = sameSet(state.selected, expected);
    record(ok);
    state.solved = ok;
    const answer = expected.map((id) => chordById(id).symbol).join(" / ");
    renderAnswer(ok ? `${FUNCTION_LABELS[state.target.role].name}を選べました` : `答え: ${answer}`);
    renderConceptBoard();
    updateControls();
    return;
  }

  if (state.mode === "progression") {
    const expected = state.target.progression.map((chord) => chord.id);
    const ok = arraysEqual(state.selected, expected);
    record(ok);
    state.solved = ok;
    const answer = state.target.progression.map((chord) => `${chord.degree}:${chord.symbol}`).join(" ");
    renderAnswer(ok ? `${state.target.pattern.name} 完成` : `答え: ${answer}`);
    renderConceptBoard();
    updateControls();
    return;
  }

  if (state.mode === "scale") {
    const ok = arraysEqual(state.selected, state.target.notes);
    record(ok);
    state.solved = ok;
    renderAnswer(ok ? "正解" : `答え: ${state.target.notes.map(displayPitch).join(" ")}`);
    updateControls();
  }
}

function record(ok) {
  state.attempts += 1;
  if (ok) {
    state.correct += 1;
    state.streak += 1;
    const baseScore = 100 + Math.min(state.streak * 15, 150);
    state.score += Math.round(baseScore * hintScoreMultiplier());
    playSuccess(state.target);
  } else {
    state.streak = 0;
    state.score = Math.max(0, state.score - 20);
  }
  renderStats();
}

function hintScoreMultiplier() {
  return Math.max(0, 1 - state.hintCount * 0.25);
}

function renderStats() {
  els.score.textContent = state.score;
  els.streak.textContent = state.streak;
  els.correct.textContent = state.correct;
  els.attempts.textContent = state.attempts;
  els.accuracy.textContent = state.attempts ? `${Math.round((state.correct / state.attempts) * 100)}%` : "--";
}

function playTarget() {
  ensureAudio();
  if (!state.target) return;

  if (state.mode === "progression") {
    playChordSequence(state.target.progression, 0.55);
    flashKeys(state.target.progression.flatMap((chord) => chordToneNames(chord)));
    return;
  }

  const notes = state.target.notes;
  if (state.mode === "scale" || state.mode === "diatonic" || (state.mode === "lesson" && state.target.answerMode === "scale")) {
    notes.forEach((pitch, index) => playNote(pitchNote(pitch), pitchOctave(pitch), index * 0.22, 0.2));
  } else {
    notes.forEach((note) => playNote(note, 4, 0, 0.75));
  }
  flashKeys(notes);
}

function playSuccess(target) {
  if (!target) return;
  ensureAudio();

  if (target.type === "progression") {
    playChordSequence(target.progression, 0.22);
    return;
  }

  if ((target.type === "lesson" && target.answerMode === "scale") || target.type === "scale" || target.type === "diatonic") {
    target.notes.forEach((pitch, index) => {
      playNote(pitchNote(pitch), pitchOctave(pitch), index * 0.08, 0.18);
    });
    return;
  }

  target.notes.forEach((note) => playNote(note, 4, 0, 0.55));
}

function playChordSequence(chords, stepDelay) {
  chords.forEach((chord, index) => {
    chordToneNames(chord).forEach((note) => playNote(note, 4, index * stepDelay, 0.42));
  });
}

function ensureAudio() {
  if (!state.audio) {
    state.audio = new AudioContext();
  }
}

function playNote(note, octave = 4, delay = 0, duration = 0.28) {
  const ctx = state.audio;
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.value = frequencyFor(note, octave);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function flashKeys(notes) {
  const noteNames = notes.map(pitchNote);
  document.querySelectorAll(".key").forEach((key) => {
    if (noteNames.includes(key.dataset.note)) {
      key.classList.add("active");
      setTimeout(() => key.classList.remove("active"), 520);
    }
  });
}

function lessonTargetForStep() {
  const challenge = LESSON_CHALLENGES[state.lessonStep % LESSON_CHALLENGES.length];
  state.lessonStep += 1;
  const answerMode = challenge.answerMode || "scale";
  return {
    ...challenge,
    step: ((state.lessonStep - 1) % LESSON_CHALLENGES.length) + 1,
    answerMode,
    notes:
      answerMode === "chord"
        ? chordNotes(challenge.root, challenge.intervals)
        : scalePitches(challenge.root, 4, challenge.intervals),
    type: "lesson",
  };
}

function buildLessonChallenges() {
  const scaleRoots = ["C", "G", "D", "A", "F"];
  const scaleTypes = [
    GENERATED_LESSON_TYPES[0],
    GENERATED_LESSON_TYPES[2],
    GENERATED_LESSON_TYPES[1],
  ];
  const scaleChallenges = [];

  scaleTypes.forEach((type) => {
    scaleRoots.forEach((root) => {
      if (INTRO_LESSON_CHALLENGES.some((challenge) => challenge.root === root && challenge.name === type.name)) return;
      scaleChallenges.push({
        root,
        name: type.name,
        answerMode: type.answerMode,
        intervals: type.intervals,
        pattern: type.pattern,
        prompt: `${root} ${type.name}を鳴らしてみよう`,
        copy: type.copy,
        cards: type.cards(root),
      });
    });
  });

  const chordChallenges = buildChordLessonChallenges();
  const generated = interleaveChallenges(scaleChallenges, chordChallenges).slice(0, 100 - INTRO_LESSON_CHALLENGES.length);
  return [...INTRO_LESSON_CHALLENGES, ...generated].slice(0, 100);
}

function buildChordLessonChallenges() {
  const introMajorRoots = ["C", "G", "D", "A"];
  const chordRoots = ["C", "G", "D", "A", "E", "F", "B", "F#", "C#", "A#", "D#", "G#"];
  const chordOrder = [
    "minor",
    "dominant7",
    "diminished",
    "minor7",
    "major7",
    "sus4",
    "sus2",
    "augmented",
    "halfDiminished",
    "major",
  ];
  const challenges = introMajorRoots.map((root) => createLessonChordChallenge(root, "major"));

  chordRoots.forEach((_, round) => {
    chordOrder.forEach((kind, kindIndex) => {
      const root = chordRoots[(round + kindIndex * 3) % chordRoots.length];
      if (kind === "major" && introMajorRoots.includes(root)) return;
      challenges.push(createLessonChordChallenge(root, kind));
    });
  });

  return challenges;
}

function createLessonChordChallenge(root, kind) {
  const type = GENERATED_LESSON_CHORD_TYPES.find((item) => item.kind === kind);
  return {
    root,
    kind: type.kind,
    name: type.name,
    answerMode: type.answerMode,
    intervals: type.intervals,
    prompt: `${root} ${type.name} の構成音を選ぼう`,
    copy: type.copy,
    cards: type.cards(root),
  };
}

function interleaveChallenges(scaleChallenges, chordChallenges) {
  const list = [];
  let scaleIndex = 0;
  let chordIndex = 0;

  while (list.length < scaleChallenges.length + chordChallenges.length) {
    for (let i = 0; i < 5 && chordIndex < chordChallenges.length; i += 1) {
      list.push(chordChallenges[chordIndex]);
      chordIndex += 1;
    }

    if (scaleIndex < scaleChallenges.length) {
      list.push(scaleChallenges[scaleIndex]);
      scaleIndex += 1;
    }

    if (chordIndex >= chordChallenges.length) {
      list.push(...scaleChallenges.slice(scaleIndex));
      break;
    }
  }

  return list;
}

function usesConceptBoard() {
  return ["diatonic", "function", "dominant", "progression"].includes(state.mode);
}

function diatonicChords(root) {
  return DIATONIC_DEGREES.map((item, index) => {
    const note = transpose(root, item.offset);
    const symbol = `${note}${item.quality === "dim" ? "dim" : item.quality}`;
    return {
      ...item,
      id: `${root}-${index}`,
      note,
      symbol,
    };
  });
}

function diatonicChoices(root, chords) {
  const chordSymbols = new Set(chords.map((chord) => chord.symbol));
  const dummyQualities = ["", "m", "dim"];
  const dummyCandidates = NOTES.map((note) => dummyQualities.map((quality) => ({ note, quality })))
    .flat()
    .map(({ note, quality }) => ({
      id: `${root}-dummy-${note}${quality || "maj"}`,
      note,
      quality,
      symbol: `${note}${quality === "dim" ? "dim" : quality}`,
      isDummy: true,
    }))
    .filter((chord) => !chordSymbols.has(chord.symbol));
  const dummies = shuffleRandom(dummyCandidates).slice(0, 4);

  return shuffleRandom([...chords, ...dummies]);
}

function chordToneNames(chord) {
  if (!chord) return [];
  const intervals = chord.quality === "dim" ? CHORDS.diminished.intervals : chord.quality === "m" ? CHORDS.minor.intervals : CHORDS.major.intervals;
  return chordNotes(chord.note, intervals);
}

function chordById(id) {
  return state.target?.chords?.find((chord) => chord.id === id);
}

function diatonicChoiceById(id) {
  return state.target?.choices?.find((chord) => chord.id === id) || chordById(id);
}

function roleName(role) {
  return FUNCTION_LABELS[role]?.name || role;
}

function functionAnswerText(chords) {
  return ["T", "SD", "D"]
    .map((role) => `${role}: ${chords.filter((chord) => chord.role === role).map((chord) => chord.symbol).join(" / ")}`)
    .join("　");
}

function shuffleStable(items, seed) {
  return [...items].sort((a, b) => stableWeight(`${seed}-${a.id}`) - stableWeight(`${seed}-${b.id}`));
}

function shuffleRandom(items) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}

function sameSet(a, b) {
  return a.length === b.length && a.every((item) => b.includes(item));
}

function stableWeight(value) {
  return [...value].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0) % 997;
}

function chordNotes(root, intervals) {
  return intervals.map((interval) => transpose(root, interval));
}

function scaleNotes(root, intervals) {
  return intervals.map((interval) => transpose(root, interval));
}

function scalePattern(scaleKey) {
  if (scaleKey === "major") return "全・全・半・全・全・全・半";
  if (scaleKey === "naturalMinor") return "全・半・全・全・半・全・全";
  return "全・全・短3度・全・短3度";
}

function scaleSemitoneText(intervals) {
  return intervals.map((interval) => `+${interval}`).join(" / ");
}

function chordIntervalText(chordKey) {
  if (chordKey === "major") return "ルート + 4半音 + 7半音";
  if (chordKey === "minor") return "ルート + 3半音 + 7半音";
  if (chordKey === "diminished") return "ルート + 3半音 + 6半音";
  if (chordKey === "augmented") return "ルート + 4半音 + 8半音";
  if (chordKey === "sus2") return "ルート + 2半音 + 7半音";
  if (chordKey === "sus4") return "ルート + 5半音 + 7半音";
  if (chordKey === "major7") return "ルート + 4半音 + 7半音 + 11半音";
  if (chordKey === "dominant7") return "ルート + 4半音 + 7半音 + 10半音";
  if (chordKey === "minor7") return "ルート + 3半音 + 7半音 + 10半音";
  if (chordKey === "halfDiminished") return "ルート + 3半音 + 6半音 + 10半音";
  return "ルートから半音で構成音を数える";
}

function scalePitches(root, octave, intervals) {
  const rootIndex = NOTES.indexOf(root);
  return intervals.map((interval) => {
    const absolute = rootIndex + interval;
    const note = NOTES[absolute % NOTES.length];
    const noteOctave = octave + Math.floor(absolute / NOTES.length);
    return `${note}${noteOctave}`;
  });
}

function transpose(root, interval) {
  const start = NOTES.indexOf(root);
  return NOTES[(start + interval) % NOTES.length];
}

function pitchNote(pitch) {
  return pitch.replace(/\d+$/, "");
}

function pitchOctave(pitch) {
  return Number(pitch.match(/\d+$/)?.[0] || 4);
}

function displayPitch(pitch) {
  return /\d$/.test(pitch) ? pitch : pitch;
}

function frequencyFor(note, octave) {
  const midi = 12 * (octave + 1) + NOTES.indexOf(note);
  return 440 * 2 ** ((midi - 69) / 12);
}

function samePitchSet(a, b) {
  return a.length === b.length && b.every((note) => a.includes(note));
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

init();
