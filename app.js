// 手修正ポイント: 音名と鍵盤配置。鍵盤数や表示オクターブを変える時はこの3つから確認
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

// 手修正ポイント: コード辞書。自由練習のコード候補とコード問題の両方で使う
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

// 手修正ポイント: スケール辞書。通常のスケール問題で使う基本セット
const SCALES = {
  major: { name: "メジャー", intervals: [0, 2, 4, 5, 7, 9, 11, 12], copy: "全全半全全全半の並び。" },
  naturalMinor: { name: "ナチュラルマイナー", intervals: [0, 2, 3, 5, 7, 8, 10, 12], copy: "全半全全半全全の並び。" },
  pentatonic: { name: "ペンタトニック", intervals: [0, 2, 4, 7, 9, 12], copy: "5音中心でメロディを作りやすい並び。" },
};

// 手修正ポイント: 自由練習だけで使う追加スケール。候補を増減するならここ
const PRACTICE_SCALES = {
  ...SCALES,
  minorPentatonic: { name: "マイナーペンタトニック", intervals: [0, 3, 5, 7, 10, 12], copy: "短3度を含む、暗めで扱いやすい5音。" },
  dorian: { name: "ドリアン", intervals: [0, 2, 3, 5, 7, 9, 10, 12], copy: "マイナー系ですが6度が明るく響きます。" },
  mixolydian: { name: "ミクソリディアン", intervals: [0, 2, 4, 5, 7, 9, 10, 12], copy: "メジャー系に短7度を足した、7th感のある響き。" },
  blues: { name: "ブルース", intervals: [0, 3, 5, 6, 7, 10, 12], copy: "マイナーペンタにブルーノートを足した形。" },
};

// 音程問題。半音数と一般的な呼び名を対応させる
const INTERVALS = [
  { semitones: 1, name: "短2度", short: "半音1つ" },
  { semitones: 2, name: "長2度", short: "全音1つ" },
  { semitones: 3, name: "短3度", short: "半音3つ" },
  { semitones: 4, name: "長3度", short: "半音4つ" },
  { semitones: 5, name: "完全4度", short: "半音5つ" },
  { semitones: 7, name: "完全5度", short: "半音7つ" },
  { semitones: 12, name: "完全8度", short: "1オクターブ" },
];

const SCALE_DEGREES = [
  { degree: 1, label: "第1音（主音）", semitones: 0 },
  { degree: 2, label: "第2音", semitones: 2 },
  { degree: 3, label: "第3音", semitones: 4 },
  { degree: 4, label: "第4音", semitones: 5 },
  { degree: 5, label: "第5音", semitones: 7 },
  { degree: 6, label: "第6音", semitones: 9 },
  { degree: 7, label: "第7音", semitones: 11 },
];

// 4小節版の前に、短いフレーズからキーと1コードを推定する課題
const ONE_BAR_HARMONY_CHALLENGES = [
  { name: "Phrase 01", key: "C", degrees: ["I"], bars: [["B4", "C5", "E5", "G5"]] },
  { name: "Phrase 02", key: "G", degrees: ["I"], bars: [["F#4", "G4", "B4", "D5"]] },
  { name: "Phrase 03", key: "D", degrees: ["I"], bars: [["C#5", "D5", "F#5", "A5"]] },
  { name: "Phrase 04", key: "A", degrees: ["I"], bars: [["G#4", "A4", "C#5", "E5"]] },
  { name: "Phrase 05", key: "C", degrees: ["vi"], bars: [["B4", "A4", "C5", "E5"]] },
  { name: "Phrase 06", key: "G", degrees: ["IV"], bars: [["F#4", "G4", "E4", "C5"]] },
  { name: "Phrase 07", key: "D", degrees: ["vi"], bars: [["C#5", "B4", "D5", "F#5"]] },
  { name: "Phrase 08", key: "A", degrees: ["V"], bars: [["F#4", "E4", "G#4", "B4"]] },
];

// メロディーだけを聴き、キーと4小節のコード進行を推定する課題
const HARMONIZE_CHALLENGES = [
  {
    name: "Melody 01",
    key: "C",
    degrees: ["I", "vi", "IV", "V"],
    bars: [["E4", "G4", "A4", "G4"], ["E4", "C5", "B4", "A4"], ["A4", "G4", "F4", "A4"], ["D5", "B4", "G4", "B4"]],
  },
  {
    name: "Melody 02",
    key: "G",
    degrees: ["I", "IV", "ii", "V"],
    bars: [["B4", "D5", "E5", "D5"], ["C5", "E5", "D5", "C5"], ["A4", "C5", "E5", "C5"], ["A4", "F#4", "D5", "F#4"]],
  },
  {
    name: "Melody 03",
    key: "D",
    degrees: ["I", "vi", "ii", "V"],
    bars: [["F#4", "A4", "B4", "A4"], ["F#4", "D5", "C#5", "B4"], ["E4", "G4", "A4", "G4"], ["E4", "C#5", "A4", "C#5"]],
  },
  {
    name: "Melody 04",
    key: "A",
    degrees: ["I", "IV", "vi", "V"],
    bars: [["C#5", "E5", "F#5", "E5"], ["D5", "F#5", "E5", "D5"], ["C#5", "A4", "B4", "C#5"], ["B4", "G#4", "E5", "G#4"]],
  },
];

// 手修正ポイント: ダイアトニックコードの度数・品質・機能。機能分類の正解にも影響
const DIATONIC_DEGREES = [
  { degree: "I", quality: "", offset: 0, role: "T" },
  { degree: "ii", quality: "m", offset: 2, role: "SD" },
  { degree: "iii", quality: "m", offset: 4, role: "T" },
  { degree: "IV", quality: "", offset: 5, role: "SD" },
  { degree: "V", quality: "", offset: 7, role: "D" },
  { degree: "vi", quality: "m", offset: 9, role: "T" },
  { degree: "vii°", quality: "dim", offset: 11, role: "D" },
];

// 手修正ポイント: T / SD / D などの表示名と短い説明
const FUNCTION_LABELS = {
  T: { name: "トニック", copy: "安定" },
  SD: { name: "サブドミナント", copy: "展開" },
  D: { name: "ドミナント", copy: "緊張" },
  SecD: { name: "セカンダリードミナント", copy: "一時的な緊張" },
  Line: { name: "ラインクリシェ", copy: "声部の順次進行" },
};

// 手修正ポイント: コード進行ライブラリ。新しい進行を足すならこの配列へ追加
const PROGRESSION_PATTERNS = [
  {
    name: "基本カデンツ",
    category: "基礎",
    tags: ["diatonic", "cadence"],
    degrees: ["I", "IV", "V", "I"],
    roles: ["T", "SD", "D", "T"],
    copy: "安定から展開、緊張を通って安定へ戻る形です。",
    why: "TからSDで景色を変え、Dで解決欲を作ってIへ戻ります。",
  },
  {
    name: "ii - V - I",
    category: "定番進行",
    tags: ["diatonic", "jazz"],
    degrees: ["ii", "V", "I"],
    roles: ["SD", "D", "T"],
    copy: "ジャズやポップスでよく使われる、解決感の強い進行です。",
    why: "iiがVの準備を作り、VがIへ強く解決します。",
  },
  {
    name: "王道進行",
    category: "J-Pop",
    tags: ["diatonic", "pop"],
    degrees: ["IV", "V", "iii", "vi"],
    roles: ["SD", "D", "T", "T"],
    copy: "明るさから緊張を作り、少し切ない着地へ向かう定番進行です。",
    why: "IVとVで前進感を作り、iiiからviへ落ちることで切なさが出ます。",
  },
  {
    name: "循環進行",
    category: "定番進行",
    tags: ["diatonic", "circle"],
    degrees: ["I", "vi", "ii", "V"],
    roles: ["T", "T", "SD", "D"],
    copy: "安定から遠回りしてドミナントへ向かう、循環しやすい進行です。",
    why: "Iからviへ広げ、iiとVで次のIへ戻る準備をします。",
  },
  {
    name: "ポップ進行",
    category: "Pop",
    tags: ["diatonic", "pop"],
    degrees: ["I", "V", "vi", "IV"],
    roles: ["T", "D", "T", "SD"],
    copy: "明るい始まりから展開へ戻れる、歌ものに多い進行です。",
    why: "IとVの強い輪郭からviへ落ち、IVで開いた余韻を作ります。",
  },
  {
    name: "カノン進行",
    category: "定番進行",
    tags: ["diatonic", "canon"],
    degrees: ["I", "V", "vi", "iii", "IV", "I", "IV", "V"],
    roles: ["T", "D", "T", "T", "SD", "T", "SD", "D"],
    copy: "下降感と解決感を長く引っ張れる、クラシック由来の定番進行です。",
    why: "低音が段階的に巡り、T、SD、Dを長い弧でつなぐため安定した高揚感が出ます。",
  },
  {
    name: "小室進行",
    category: "J-Pop",
    tags: ["diatonic", "pop"],
    degrees: ["vi", "IV", "V", "I"],
    roles: ["T", "SD", "D", "T"],
    copy: "マイナー感から明るい解決へ向かう、90年代J-Pop以降の定番進行です。",
    why: "viで切なく始め、IVとVで押し上げてIへ着地します。",
  },
  {
    name: "丸サ進行",
    category: "ノンダイアトニック",
    tags: ["secondary-dominant", "jazz-pop"],
    degrees: ["IVmaj7", "III7", "vi7", "I7"],
    roles: ["SD", "SecD", "T", "SecD"],
    chords: [
      { degree: "IV", quality: "major7", role: "SD" },
      { degree: "III", quality: "dominant7", role: "SecD" },
      { degree: "vi", quality: "minor7", role: "T" },
      { degree: "I", quality: "dominant7", role: "SecD" },
    ],
    copy: "IVmaj7からIII7でviへ引き寄せる、都会的な響きの進行です。",
    why: "III7がviへ向かうセカンダリードミナントとして働き、I7も次のIVへ戻る力を作ります。",
  },
  {
    name: "クリシェ",
    category: "声部変化",
    tags: ["cliche", "voice-leading"],
    degrees: ["I", "Imaj7", "I7", "IV"],
    roles: ["T", "Line", "Line", "SD"],
    chords: [
      { degree: "I", quality: "major", role: "T", lineTone: "1" },
      { degree: "I", quality: "major7", role: "Line", lineTone: "7" },
      { degree: "I", quality: "dominant7", role: "Line", lineTone: "b7" },
      { degree: "IV", quality: "major", role: "SD", lineTone: "6" },
    ],
    voiceLine: ["1", "7", "b7", "6"],
    copy: "コード内の1声が少しずつ動くことで、同じ場所にいながら景色を変える手法です。",
    why: "ルートの大きな移動よりも、内声の 1 → 7 → b7 → 6 という滑らかな下降が主役です。",
  },
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

// 手修正ポイント: 演習用の自動生成問題セット
const LESSON_CHALLENGES = buildLessonChallenges();

// 手修正ポイント: モードごとのタイトル・説明・ラベル。タブ名は index.html 側
const MODES = {
  textbook: {
    title: "教科書",
    copy: "実習の前に、音程、コード、機能、進行、クリシェの考え方をまとめて読みます。",
    label: "読む",
  },
  lesson: {
    title: "演習",
    copy: "コード、スケール、進行の問題を順番に解きながら、半音の地図を実際の鍵盤で確認します。",
    label: "問題演習",
  },
  interval: {
    title: "音程トレーニング",
    copy: "基準音から半音を数え、指定された音程になる音を鍵盤から選びます。",
    label: "音程を作る",
  },
  transpose: {
    title: "度数と移調",
    copy: "メジャースケールの度数を音名へ変換し、同じ役割を別のキーへ移します。",
    label: "度数で考える",
  },
  harmonize: {
    title: "キーとコードを耳で探す",
    copy: "音名を見ずに4小節のメロディーを聴き、キーとコード進行を推定します。",
    label: "和声を聴き取る",
  },
  harmonyOne: {
    title: "1小節のキーとコード",
    copy: "短いメロディーを聴き、キーと、その小節を支えるコードを1つ推定します。",
    label: "1小節を聴き取る",
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
  practice: {
    title: "自由練習",
    copy: "鍵盤で自由に音を選ぶと、近いコードやスケール候補をリアルタイムに表示します。スコアや学習履歴には反映しません。",
    label: "解析",
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
  mypage: {
    title: "ホーム",
    copy: "今日の学習状況、最近の成績、メニュー別の進捗をまとめて確認します。",
    label: "ホーム",
  },
};

// 手修正ポイント: スコア/履歴対象モード。自由練習はここに入れないので履歴に残らない
const PLAY_MODES = ["interval", "transpose", "harmonyOne", "harmonize", "lesson", "chord", "scale", "diatonic", "function", "progression", "ear"];
// 手修正ポイント: 理論ページの章データ。本文修正や章追加はここ
const TEXTBOOK_SECTIONS = [
  {
    id: "interval-basics",
    title: "音程の基礎",
    kicker: "最初の一歩",
    lead: "音程は2つの音の距離です。鍵盤では白鍵と黒鍵を区別せず、隣へ1つ動くと半音として数えます。",
    points: [
      "短2度は1半音、長2度は2半音です。長短3度はコードの明るさと暗さを決めます。",
      "完全4度は5半音、完全5度は7半音。安定して聞こえやすい重要な距離です。",
      "完全8度は12半音。同じ音名が1オクターブ上で現れます。",
    ],
    example: "Cから長3度上はE、完全5度上はG、完全8度上は高いC",
    practice: "音程トレーニング",
    practiceMode: "interval",
  },
  {
    id: "interval",
    title: "音程とスケール",
    kicker: "基礎",
    lead: "音楽理論の最小単位は、音名そのものではなく音と音の距離です。鍵盤では隣同士が半音、半音2つ分が全音です。",
    points: [
      "メジャースケールは 全・全・半・全・全・全・半 の並びで作ります。",
      "ナチュラルマイナーは 全・半・全・全・半・全・全。3つ目の音が短3度になるため暗く聞こえます。",
      "ペンタトニックは音数を減らして、旋律に使いやすい5音の骨格を作ります。",
    ],
    example: "Cメジャー: C D E F G A B C / Aナチュラルマイナー: A B C D E F G A",
    practice: "基礎 / スケール",
  },
  {
    id: "chord",
    title: "コードの作り方",
    kicker: "コード",
    lead: "コードはルートから半音数で積み上げます。3度が明暗を決め、5度や7度が安定感や緊張感を変えます。",
    points: [
      "メジャーは 0・4・7、マイナーは 0・3・7 で作ります。",
      "セブンス系は4音目を足して、解決したくなる響きや透明感を作ります。",
      "sus、dim、aug は3度や5度を変えて、保留感、緊張、浮遊感を作ります。",
    ],
    example: "C: C E G / Cm: C Eb G / C7: C E G Bb / Cmaj7: C E G B",
    practice: "コード / 耳トレ",
  },
  {
    id: "diatonic",
    title: "ダイアトニックコード",
    kicker: "キー",
    lead: "キーのスケール音だけを使って、1音おきに重ねると7つの基本コードができます。",
    points: [
      "メジャーキーの型は I / ii / iii / IV / V / vi / vii° です。",
      "大文字はメジャー、小文字はマイナー、° はディミニッシュを表します。",
      "キーが変わっても度数の型は同じなので、移調して考えられます。",
    ],
    example: "Cメジャー: C / Dm / Em / F / G / Am / Bdim",
    practice: "ダイアトニック",
  },
  {
    id: "degree-transpose",
    title: "度数と移調",
    kicker: "キーを越える",
    lead: "度数は、キーの主音を1として各音の位置を数字で表す方法です。同じ度数関係を保って別のキーへ移すことを移調と呼びます。",
    points: [
      "メジャースケールの度数は 1・2・3・4・5・6・7。Cメジャーでは C・D・E・F・G・A・B です。",
      "第3音はルートから4半音、第5音は7半音です。キーが変わっても距離は変わりません。",
      "Cメジャーの第3音EをGメジャーへ移調すると、Gの第3音Bになります。",
    ],
    example: "I–IV–VをCからGへ移調: C–F–G → G–C–D",
    practice: "度数と移調",
    practiceMode: "transpose",
  },
  {
    id: "one-bar-harmony",
    title: "1小節からキーとコードを探す",
    kicker: "和声聴き取り 1",
    lead: "まず短い1小節だけを使い、使われている音からキーを仮定し、メロディーを最も自然に支えるコードを1つ探します。",
    points: [
      "半音上から主音へ進む音は、キーを見つける強い手がかりになります。",
      "メロディーの中心音がコードのルート・3度・5度のどれに当たるかを聴きます。",
      "キーとコードを選んだら伴奏を重ね、メロディーが安定して聞こえるか確認します。",
    ],
    example: "短いフレーズを聴く → キーを選ぶ → コードを1つ置く → 伴奏付きで確認する",
    practice: "1小節の和声聴き取り",
    practiceMode: "harmonyOne",
  },
  {
    id: "melody-harmony",
    title: "メロディーから和声を推定する",
    kicker: "和声聴き取り 2",
    lead: "キーもコードも表示されないメロディーを聴き、調の中心と各小節の和音を探します。音階、終止感、強拍音を総合して判断します。",
    points: [
      "繰り返し止まって聞こえる音や、フレーズの着地点からキーの主音を探します。",
      "キーを仮定したら、各小節の強拍や長い音を含むダイアトニックコードを試します。",
      "候補を並べたら、T・SD・Dの流れとメロディーとの響きを再生して検証します。",
    ],
    example: "まずメロディーだけを聴く → キーを仮定する → 1小節ずつコードを置く → 全体を再生して確かめる",
    practice: "キーと4小節のコードを推定",
    practiceMode: "harmonize",
  },
  {
    id: "function",
    title: "コードの機能",
    kicker: "役割",
    lead: "コードは名前だけでなく、曲の中での役割で読むと進行が理解しやすくなります。",
    points: [
      "Tは安定。I、iii、vi が中心です。",
      "SDは展開。ii、IV が中心で、Tから離れてDへ向かう準備をします。",
      "Dは緊張。V、vii° が中心で、Iへ戻りたい力を作ります。",
    ],
    example: "T → SD → D → T は、安定 → 展開 → 緊張 → 解決の流れです。",
    practice: "機能",
  },
  {
    id: "progression",
    title: "定番コード進行",
    kicker: "進行",
    lead: "コード進行は、度数の並びとして覚えるとキーが変わっても使えます。",
    points: [
      "カノン進行は I - V - vi - iii - IV - I - IV - V。",
      "小室進行は vi - IV - V - I。切なさから明るい解決へ向かいます。",
      "丸サ進行は IVmaj7 - III7 - vi7 - I7。セカンダリードミナントを含む都会的な進行です。",
    ],
    example: "Eメジャーの循環進行: E - C#m - F#m - B",
    practice: "進行",
  },
  {
    id: "cliche",
    title: "クリシェと声部",
    kicker: "声部変化",
    lead: "クリシェはコード名だけでなく、コード内の1つの音が少しずつ動くことを聴く手法です。",
    points: [
      "I - Imaj7 - I7 - IV では、1 → 7 → b7 → 6 のような線が生まれます。",
      "ルートが大きく動かなくても、内声が動くことで物語が進みます。",
      "コード進行では、度数位置の理解と実用ボイシングの聴こえ方を分けて学ぶと整理しやすいです。",
    ],
    example: "C - Cmaj7 - C7 - F では C → B → Bb → A の下降線が見えます。",
    practice: "進行",
  },
];
const DB_NAME = "chord-quest-db";
const DB_VERSION = 2;
const DEFAULT_ACCOUNT_NAME = "Guest";
const LAST_ACCOUNT_KEY = "chordQuest:lastAccountId";
const DAILY_GOALS = {
  attempts: 10,
  accuracy: 70,
  progressions: 3,
};
const LEVEL_TITLES = [
  "音程の入口",
  "コード探索中",
  "スケール練習中",
  "耳トレ強化中",
  "コード進行マスター",
];

// 手修正ポイント: 画面全体の状態。自由練習の選択音も selected に入るが record は呼ばない
const state = {
  mode: "mypage",
  selected: [],
  target: null,
  db: null,
  account: null,
  accounts: [],
  score: 0,
  streak: 0,
  correct: 0,
  attempts: 0,
  solvedCount: 0,
  audio: null,
  hintCount: 0,
  lessonStep: 0,
  followQuizOrder: false,
  progressionPlayback: "degree",
  keyLight: true,
  solved: false,
  activeBar: 0,
  harmonyKey: null,
};

// 手修正ポイント: DOM参照一覧。HTMLの id/class を変えたらここも合わせる
const els = {
  gamePanel: document.querySelector(".game-panel"),
  mypagePanel: document.querySelector("#mypage-panel"),
  textbookPanel: document.querySelector("#textbook-panel"),
  keyboard: document.querySelector("#keyboard"),
  answerStrip: document.querySelector("#answer-strip"),
  tabs: document.querySelectorAll(".tab"),
  trainingTrigger: document.querySelector("#training-trigger"),
  trainingPopover: document.querySelector("#training-popover"),
  modeTitle: document.querySelector("#mode-title"),
  modeCopy: document.querySelector("#mode-copy"),
  promptLabel: document.querySelector("#prompt-label"),
  prompt: document.querySelector("#prompt"),
  playTarget: document.querySelector("#play-target"),
  keyLightButtons: document.querySelectorAll("[data-key-light]"),
  solvedStatus: document.querySelector("#solved-status"),
  toggleHint: document.querySelector("#toggle-hint"),
  hintPanel: document.querySelector("#hint-panel"),
  hintCost: document.querySelector("#hint-cost"),
  conceptBoard: document.querySelector("#concept-board"),
  check: document.querySelector("#check-answer"),
  playAnswer: document.querySelector("#play-answer"),
  clear: document.querySelector("#clear-answer"),
  next: document.querySelector("#next-challenge"),
  score: document.querySelector("#score"),
  streak: document.querySelector("#streak"),
  correct: document.querySelector("#correct"),
  attempts: document.querySelector("#attempts"),
  accuracy: document.querySelector("#accuracy"),
  levelRing: document.querySelector("#level-ring"),
  levelNumber: document.querySelector("#level-number"),
  levelTitle: document.querySelector("#level-title"),
  xpText: document.querySelector("#xp-text"),
  xpFill: document.querySelector("#xp-fill"),
  goalAttemptsDot: document.querySelector("#goal-attempts-dot"),
  goalAttemptsValue: document.querySelector("#goal-attempts-value"),
  goalAccuracyDot: document.querySelector("#goal-accuracy-dot"),
  goalAccuracyValue: document.querySelector("#goal-accuracy-value"),
  goalProgressionsDot: document.querySelector("#goal-progressions-dot"),
  goalProgressionsValue: document.querySelector("#goal-progressions-value"),
  solvedCount: document.querySelector("#solved-count"),
  accountSelect: document.querySelector("#account-select"),
  createAccount: document.querySelector("#create-account"),
};

// 手修正ポイント: 起動処理。DB準備、鍵盤生成、イベント登録、初期モード表示の順
async function init() {
  state.db = await openGameDb();
  await seedQuizBank();
  await loadAccounts();
  renderKeyboard();
  bindEvents();
  renderAccountSelect();
  await selectInitialAccount();
  await setMode("mypage");
}

// 手修正ポイント: クリック/変更イベントの入口。UI操作を追加するならまずここ
function bindEvents() {
  els.tabs.forEach((tab) => {
    if (tab.dataset.mode) tab.addEventListener("click", () => setMode(tab.dataset.mode));
  });
  els.trainingTrigger.addEventListener("click", () => {
    const willOpen = els.trainingPopover.classList.contains("hidden");
    els.trainingPopover.classList.toggle("hidden", !willOpen);
    els.trainingTrigger.setAttribute("aria-expanded", String(willOpen));
  });
  els.trainingPopover.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-mode]") : null;
    if (button) setMode(button.dataset.mode);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest?.(".training-menu")) closeTrainingMenu();
  });
  els.accountSelect.addEventListener("change", () => switchAccount(els.accountSelect.value));
  els.createAccount.addEventListener("click", () => createAccountFromPrompt());
  els.mypagePanel.addEventListener("click", async (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const mode = target?.closest("[data-history-mode]")?.dataset.historyMode;
    const quizId = target?.closest("[data-quiz-id]")?.dataset.quizId;
    if (quizId) await openQuizFromHistory(quizId);
    if (mode) await renderMyPageDetail(mode);
    if (target?.closest("[data-history-back]")) await renderMyPageTop();
  });
  els.textbookPanel.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const section = target?.closest("[data-textbook-section]")?.dataset.textbookSection;
    if (section) renderTextbook(section);
    const practiceMode = target?.closest("[data-start-practice]")?.dataset.startPractice;
    if (practiceMode) setMode(practiceMode);
  });
  els.playTarget.addEventListener("click", () => playTarget());
  els.playAnswer.addEventListener("click", () => playSelectedAnswer());
  els.keyLightButtons.forEach((button) => {
    button.addEventListener("click", () => setKeyLight(button.dataset.keyLight === "on"));
  });
  els.toggleHint.addEventListener("click", () => toggleHint());
  els.check.addEventListener("click", () => checkAnswer());
  els.clear.addEventListener("click", () => {
    state.selected = [];
    state.activeBar = 0;
    if (isHarmonyMode()) state.harmonyKey = null;
    if (state.mode === "function" && state.target) {
      state.target.assignments = {};
    }
    state.solved = false;
    renderAnswer();
    renderConceptBoard();
    renderPracticeAnalysis();
    renderHint();
    updateControls();
    updateKeyState();
  });
  els.next.addEventListener("click", () => nextChallenge());
}

function openGameDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("accounts")) {
        db.createObjectStore("accounts", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("quizzes")) {
        const store = db.createObjectStore("quizzes", { keyPath: "id" });
        store.createIndex("mode", "mode", { unique: false });
      } else {
        const store = request.transaction.objectStore("quizzes");
        if (!store.indexNames.contains("mode")) {
          store.createIndex("mode", "mode", { unique: false });
        }
      }

      if (!db.objectStoreNames.contains("progress")) {
        const store = db.createObjectStore("progress", { keyPath: "id" });
        store.createIndex("accountId", "accountId", { unique: false });
        store.createIndex("quizId", "quizId", { unique: false });
      } else {
        const store = request.transaction.objectStore("progress");
        if (!store.indexNames.contains("accountId")) {
          store.createIndex("accountId", "accountId", { unique: false });
        }
        if (!store.indexNames.contains("quizId")) {
          store.createIndex("quizId", "quizId", { unique: false });
        }
      }

      if (!db.objectStoreNames.contains("attemptsLog")) {
        const store = db.createObjectStore("attemptsLog", { keyPath: "id", autoIncrement: true });
        store.createIndex("accountId", "accountId", { unique: false });
        store.createIndex("quizId", "quizId", { unique: false });
      } else {
        const store = request.transaction.objectStore("attemptsLog");
        if (!store.indexNames.contains("accountId")) {
          store.createIndex("accountId", "accountId", { unique: false });
        }
        if (!store.indexNames.contains("quizId")) {
          store.createIndex("quizId", "quizId", { unique: false });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function storeRequest(storeName, mode, action) {
  return new Promise((resolve, reject) => {
    const transaction = state.db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    let result;

    try {
      result = action(store);
    } catch (error) {
      reject(error);
      return;
    }

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
  });
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function seedQuizBank() {
  const quizzes = buildQuizBank();
  await storeRequest("quizzes", "readwrite", (store) => {
    quizzes.forEach((quiz) => store.put(quiz));
  });
}

function buildQuizBank() {
  const quizzes = [];

  LESSON_CHALLENGES.forEach((challenge, index) => {
    quizzes.push({
      id: `lesson-${String(index + 1).padStart(3, "0")}`,
      mode: "lesson",
      order: index,
      payload: {
        root: challenge.root,
        kind: challenge.kind || challenge.name,
        name: challenge.name,
        answerMode: challenge.answerMode || "scale",
        intervals: challenge.intervals,
        pattern: challenge.pattern,
        prompt: challenge.prompt,
        copy: challenge.copy,
        cards: challenge.cards,
      },
    });
  });

  ["C", "D", "E", "F", "G", "A"].forEach((root) => {
    INTERVALS.forEach((interval) => {
      quizzes.push({
        id: `interval-${root}-${interval.semitones}`,
        mode: "interval",
        payload: { root, semitones: interval.semitones },
      });
    });
  });

  ["C", "G", "D", "F"].forEach((key) => {
    SCALE_DEGREES.forEach(({ degree }) => {
      quizzes.push({ id: `transpose-degree-${key}-${degree}`, mode: "transpose", payload: { kind: "degree", key, degree } });
    });
  });
  const transposePairs = [["C", "G"], ["C", "F"], ["G", "D"], ["F", "C"]];
  transposePairs.forEach(([sourceKey, targetKey]) => {
    [1, 3, 4, 5, 6].forEach((degree) => {
      quizzes.push({
        id: `transpose-move-${sourceKey}-${targetKey}-${degree}`,
        mode: "transpose",
        payload: { kind: "move", sourceKey, targetKey, degree },
      });
    });
  });

  HARMONIZE_CHALLENGES.forEach((_, challengeIndex) => {
    quizzes.push({ id: `harmonize-${challengeIndex}`, mode: "harmonize", order: challengeIndex, payload: { challengeIndex } });
  });
  ONE_BAR_HARMONY_CHALLENGES.forEach((_, challengeIndex) => {
    quizzes.push({ id: `harmony-one-${challengeIndex}`, mode: "harmonyOne", order: challengeIndex, payload: { challengeIndex } });
  });

  ["C", "D", "E", "F", "G", "A", "B"].forEach((root) => {
    Object.keys(CHORDS).forEach((kind) => {
      quizzes.push({ id: `chord-${root}-${kind}`, mode: "chord", payload: { root, kind } });
      quizzes.push({ id: `ear-${root}-${kind}`, mode: "ear", payload: { root, kind } });
    });
  });

  ["C", "D", "E", "F", "G", "A"].forEach((root) => {
    Object.keys(SCALES).forEach((kind) => {
      quizzes.push({ id: `scale-${root}-${kind}`, mode: "scale", payload: { root, kind } });
    });
  });

  ["C", "G", "D", "A", "E"].forEach((root) => {
    quizzes.push({ id: `diatonic-${root}`, mode: "diatonic", payload: { root } });
    quizzes.push({ id: `function-${root}`, mode: "function", payload: { root } });
  });

  ["C", "G", "D", "A", "E", "F"].forEach((root) => {
    PROGRESSION_PATTERNS.forEach((_, patternIndex) => {
      quizzes.push({ id: `progression-${root}-${patternIndex}`, mode: "progression", payload: { root, patternIndex } });
    });
  });

  return quizzes;
}

async function loadAccounts() {
  state.accounts = await requestToPromise(state.db.transaction("accounts", "readonly").objectStore("accounts").getAll());
  if (state.accounts.length === 0) {
    const account = createAccountRecord(DEFAULT_ACCOUNT_NAME);
    await storeRequest("accounts", "readwrite", (store) => store.put(account));
    state.accounts = [account];
  }
}

function createAccountRecord(name) {
  const now = new Date().toISOString();
  return {
    id: `account-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    score: 0,
    streak: 0,
    correct: 0,
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function renderAccountSelect() {
  els.accountSelect.innerHTML = state.accounts
    .map((account) => `<option value="${account.id}">${escapeHtml(account.name)}</option>`)
    .join("");
  if (state.account) {
    els.accountSelect.value = state.account.id;
  }
}

async function selectInitialAccount() {
  const savedId = localStorage.getItem(LAST_ACCOUNT_KEY);
  const account = state.accounts.find((item) => item.id === savedId) || state.accounts[0];
  await applyAccount(account);
}

async function switchAccount(accountId) {
  const account = state.accounts.find((item) => item.id === accountId);
  if (!account) return;
  await applyAccount(account);
  if (state.mode === "mypage") {
    await renderMyPageTop();
  } else if (state.mode === "textbook") {
    renderTextbook();
  } else if (state.mode === "practice") {
    showPracticeMode();
  } else {
    await nextChallenge();
  }
}

async function applyAccount(account) {
  state.account = account;
  state.score = account.score || 0;
  state.streak = account.streak || 0;
  state.correct = account.correct || 0;
  state.attempts = account.attempts || 0;
  localStorage.setItem(LAST_ACCOUNT_KEY, account.id);
  els.accountSelect.value = account.id;
  await refreshSolvedCount();
  await refreshLearningSummary();
  renderStats();
}

async function createAccountFromPrompt() {
  const name = prompt("アカウント名を入力してください", `Player ${state.accounts.length + 1}`);
  if (!name?.trim()) return;
  const account = createAccountRecord(name.trim());
  await storeRequest("accounts", "readwrite", (store) => store.put(account));
  state.accounts = [...state.accounts, account];
  renderAccountSelect();
  await applyAccount(account);
  if (state.mode === "mypage") {
    await renderMyPageTop();
  } else if (state.mode === "textbook") {
    renderTextbook();
  } else if (state.mode === "practice") {
    showPracticeMode();
  } else {
    await nextChallenge();
  }
}

async function pickQuizForMode(mode) {
  const quizzes = await requestToPromise(
    state.db.transaction("quizzes", "readonly").objectStore("quizzes").index("mode").getAll(mode),
  );

  if (mode === "lesson") {
    const sorted = quizzes.sort((a, b) => a.order - b.order);
    const quiz = sorted[state.lessonStep % sorted.length];
    state.lessonStep += 1;
    return quiz;
  }

  return randomItem(quizzes);
}

async function pickNextQuizAfter(quizId) {
  const current = await requestToPromise(state.db.transaction("quizzes", "readonly").objectStore("quizzes").get(quizId));
  if (!current) return pickQuizForMode(state.mode);

  const quizzes = await requestToPromise(
    state.db.transaction("quizzes", "readonly").objectStore("quizzes").index("mode").getAll(current.mode),
  );
  const sorted = sortQuizzesForMode(quizzes);
  const index = sorted.findIndex((quiz) => quiz.id === quizId);
  return sorted[(index + 1) % sorted.length] || sorted[0] || current;
}

function sortQuizzesForMode(quizzes) {
  return [...quizzes].sort(compareQuizzes);
}

function compareQuizzes(a, b) {
  return (a.order ?? 9999) - (b.order ?? 9999) || a.id.localeCompare(b.id);
}

function targetFromQuiz(quiz) {
  const { payload } = quiz;

  if (quiz.mode === "lesson") {
    const answerMode = payload.answerMode || "scale";
    return {
      ...payload,
      id: quiz.id,
      step: (quiz.order % LESSON_CHALLENGES.length) + 1,
      answerMode,
      notes: answerMode === "chord" ? chordNotes(payload.root, payload.intervals) : scalePitches(payload.root, 4, payload.intervals),
      type: "lesson",
    };
  }

  if (quiz.mode === "interval") {
    const interval = INTERVALS.find((item) => item.semitones === payload.semitones);
    const rootPitch = `${payload.root}4`;
    const answerPitch = transposePitch(rootPitch, payload.semitones);
    return {
      id: quiz.id,
      root: payload.root,
      rootPitch,
      interval,
      notes: [answerPitch],
      prompt: `${payload.root} から上に ${interval.name} の音を選ぶ`,
      copy: `${payload.root}を出発点に、黒鍵も含めて${interval.short}ぶん上へ進みます。`,
      type: "interval",
    };
  }

  if (quiz.mode === "transpose") {
    const degree = SCALE_DEGREES.find((item) => item.degree === payload.degree);
    const targetKey = payload.kind === "move" ? payload.targetKey : payload.key;
    const answerPitch = transposePitch(`${targetKey}4`, degree.semitones);
    const sourceNote = payload.kind === "move" ? pitchNote(transposePitch(`${payload.sourceKey}4`, degree.semitones)) : null;
    return {
      id: quiz.id,
      kind: payload.kind,
      key: payload.key,
      sourceKey: payload.sourceKey,
      targetKey,
      sourceNote,
      degree,
      notes: [answerPitch],
      prompt: payload.kind === "move"
        ? `${payload.sourceKey}メジャーの${degree.label} ${sourceNote} を、${targetKey}メジャーへ移調する`
        : `${targetKey}メジャースケールの${degree.label}を選ぶ`,
      copy: payload.kind === "move"
        ? `音名ではなく「第${degree.degree}音」という役割を保って別のキーへ移します。`
        : `${targetKey}を第1音として、メジャースケールの並びから第${degree.degree}音を探します。`,
      type: "transpose",
    };
  }

  if (quiz.mode === "harmonize") {
    return harmonyTargetFromChallenge(quiz, HARMONIZE_CHALLENGES[payload.challengeIndex]);
  }

  if (quiz.mode === "harmonyOne") {
    return harmonyTargetFromChallenge(quiz, ONE_BAR_HARMONY_CHALLENGES[payload.challengeIndex]);
  }

  if (quiz.mode === "chord") {
    const chord = CHORDS[payload.kind];
    return {
      id: quiz.id,
      root: payload.root,
      kind: payload.kind,
      name: chord.name,
      intervals: chord.intervals,
      notes: chordNotes(payload.root, chord.intervals),
      prompt: `${payload.root} ${chord.name} の構成音を選ぶ`,
      copy: chord.copy,
      type: "chord",
    };
  }

  if (quiz.mode === "scale") {
    const scale = SCALES[payload.kind];
    return {
      id: quiz.id,
      root: payload.root,
      kind: payload.kind,
      name: scale.name,
      intervals: scale.intervals,
      notes: scalePitches(payload.root, 4, scale.intervals),
      pattern: scalePattern(payload.kind),
      prompt: `${payload.root} ${scale.name} を順番に弾く`,
      copy: scale.copy,
      type: "scale",
    };
  }

  if (quiz.mode === "diatonic") {
    const chords = diatonicChords(payload.root);
    return {
      id: quiz.id,
      root: payload.root,
      chords,
      choices: diatonicChoices(payload.root, chords),
      notes: scalePitches(payload.root, 4, SCALES.major.intervals),
      prompt: `${payload.root}メジャーのダイアトニックコードを順番に並べる`,
      copy: "Iからvii°まで、キーの中だけで作れる7つのコードを並べます。",
      type: "diatonic",
    };
  }

  if (quiz.mode === "function") {
    const chords = diatonicChords(payload.root);
    return {
      id: quiz.id,
      root: payload.root,
      chords,
      assignments: {},
      notes: chordToneNames(chords.find((chord) => chord.degree === "V")),
      prompt: `${payload.root}メジャーのコードを T / SD / D に仕分ける`,
      copy: "同じキーのコードでも、安定、展開、緊張の役割に分けると進行が読みやすくなります。",
      type: "function",
    };
  }

  if (quiz.mode === "progression") {
    const pattern = PROGRESSION_PATTERNS[payload.patternIndex];
    const chords = progressionChords(payload.root, pattern);
    const progression = chords.filter((chord) => !chord.isDummy);
    return {
      id: quiz.id,
      root: payload.root,
      pattern,
      chords,
      progression,
      choices: progressionChoices(payload.root, chords),
      notes: progression.flatMap((chord) => chordToneNames(chord)),
      prompt: `${payload.root}メジャーで ${pattern.name} を完成`,
      copy: pattern.copy,
      type: "progression",
    };
  }

  const chord = CHORDS[payload.kind];
  return {
    id: quiz.id,
    root: payload.root,
    kind: payload.kind,
    name: chord.name,
    notes: chordNotes(payload.root, chord.intervals),
    prompt: "聞こえた響きを鍵盤で答える",
    copy: "明るさ、暗さ、緊張感、浮遊感を聞き分けて、構成音を鍵盤で再現します。",
    type: "ear",
  };
}

function harmonyTargetFromChallenge(quiz, challenge) {
  const chords = diatonicChords(challenge.key).filter((chord) => chord.degree !== "vii°");
  const expected = challenge.degrees.map((degree) => chords.find((chord) => chord.degree === degree));
  const barLabel = challenge.bars.length === 1 ? "コード" : "コード進行";
  return {
    id: quiz.id,
    root: challenge.key,
    key: challenge.key,
    name: challenge.name,
    bars: challenge.bars,
    degrees: challenge.degrees,
    chords,
    choices: chords,
    expected,
    notes: challenge.bars.flat(),
    prompt: `${challenge.name} のキーと${barLabel}を耳で当てる`,
    copy: `お手本ではメロディーだけが鳴ります。キーを選び、${challenge.bars.length === 1 ? "コードを1つ" : "各小節へコード"}を置いて確認してください。`,
    type: "harmonize",
  };
}

// 手修正ポイント: 鍵盤ボタンの生成。見た目は CSS、押した時の処理は selectNote
function renderKeyboard() {
  WHITE_SEQUENCE.forEach((note, index) => {
    const button = document.createElement("button");
    button.className = "key white";
    button.dataset.note = note;
    button.dataset.octave = String(4 + Math.floor(index / 7));
    button.innerHTML = `<span>${note}</span>`;
    button.addEventListener("click", () => selectNote(note, button.dataset.octave));
    els.keyboard.appendChild(button);
  });

  BLACK_KEYS.forEach(({ note, slot }) => {
    const button = document.createElement("button");
    button.className = "key black";
    button.dataset.note = note;
    button.dataset.octave = String(4 + Math.floor((slot - 1) / 7));
    button.style.left = `${(slot / 15) * 100}%`;
    button.innerHTML = `<span>${note}</span>`;
    button.addEventListener("click", () => selectNote(note, button.dataset.octave));
    els.keyboard.appendChild(button);
  });
}

function closeTrainingMenu() {
  els.trainingPopover.classList.add("hidden");
  els.trainingTrigger.setAttribute("aria-expanded", "false");
}

function updateNavigationState(mode) {
  const trainingModes = PLAY_MODES;
  els.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  els.trainingTrigger.classList.toggle("active", trainingModes.includes(mode));
  els.trainingPopover.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });
}

// 手修正ポイント: モード切替の中心。自由練習だけ専用クラスを付けて固定レイアウトにする
async function setMode(mode) {
  state.mode = mode;
  state.selected = [];
  state.followQuizOrder = false;
  closeTrainingMenu();
  document.body.classList.toggle("practice-active", mode === "practice");
  els.gamePanel.classList.toggle("practice-mode", mode === "practice");
  if (mode === "lesson") {
    state.lessonStep = 0;
  }
  updateNavigationState(mode);
  els.modeTitle.textContent = MODES[mode].title;
  els.modeCopy.textContent = MODES[mode].copy;
  els.promptLabel.textContent = MODES[mode].label;
  els.gamePanel.classList.toggle("hidden", mode === "mypage" || mode === "textbook");
  els.mypagePanel.classList.toggle("hidden", mode !== "mypage");
  els.textbookPanel.classList.toggle("hidden", mode !== "textbook");
  if (mode === "mypage") {
    await renderMyPageTop();
    return;
  }
  if (mode === "textbook") {
    renderTextbook();
    return;
  }
  if (mode === "practice") {
    showPracticeMode();
    return;
  }
  await nextChallenge();
}

// 手修正ポイント: 自由練習の初期表示。スコア/履歴用 target は持たない
function showPracticeMode() {
  state.target = null;
  state.selected = [];
  state.hintCount = 0;
  state.solved = false;
  els.prompt.textContent = "鍵盤を自由に押して響きを調べる";
  els.promptLabel.textContent = MODES.practice.label;
  els.modeCopy.textContent = MODES.practice.copy;
  renderAnswer();
  renderPracticeAnalysis();
  renderSolvedStatus();
  updateHintVisibility();
  updateControls();
  updateKeyState();
}

// 手修正ポイント: 問題モードの次問取得。自由練習では呼ばない
async function nextChallenge() {
  state.selected = [];
  state.activeBar = 0;
  if (isHarmonyMode()) state.harmonyKey = null;
  state.hintCount = 0;
  state.solved = false;

  const quiz =
    state.followQuizOrder && state.target?.id
      ? await pickNextQuizAfter(state.target.id)
      : await pickQuizForMode(state.mode);
  await showQuiz(quiz);
}

async function showQuiz(quiz) {
  state.target = targetFromQuiz(quiz);
  state.target.progress = await getProgressForQuiz(state.target.id);
  els.prompt.textContent = state.target.prompt;
  els.promptLabel.textContent =
    state.mode === "lesson" ? `${MODES.lesson.label} ${state.target.step}/100` : MODES[state.mode].label;
  els.modeCopy.textContent = state.target.copy || MODES[state.mode].copy;

  if (state.mode === "ear" || isHarmonyMode()) {
    setTimeout(playTarget, 160);
  }

  renderAnswer();
  renderConceptBoard();
  renderHint();
  renderSolvedStatus();
  updateHintVisibility();
  updateControls();
  updateKeyState();
}

async function openQuizFromHistory(quizId) {
  const quiz = await requestToPromise(state.db.transaction("quizzes", "readonly").objectStore("quizzes").get(quizId));
  if (!quiz) return;

  state.mode = quiz.mode;
  state.selected = [];
  state.hintCount = 0;
  state.solved = false;
  state.followQuizOrder = true;
  updateNavigationState(quiz.mode);
  els.modeTitle.textContent = MODES[quiz.mode].title;
  els.modeCopy.textContent = MODES[quiz.mode].copy;
  els.promptLabel.textContent = MODES[quiz.mode].label;
  els.gamePanel.classList.remove("hidden");
  els.mypagePanel.classList.add("hidden");
  els.textbookPanel.classList.add("hidden");
  await showQuiz(quiz);
}

async function openProgressionPattern(patternIndex) {
  if (!state.target?.root || Number.isNaN(patternIndex)) return;
  const quizId = `progression-${state.target.root}-${patternIndex}`;
  const quiz = await requestToPromise(state.db.transaction("quizzes", "readonly").objectStore("quizzes").get(quizId));
  if (!quiz) return;
  state.selected = [];
  state.hintCount = 0;
  state.solved = false;
  await showQuiz(quiz);
}

// 手修正ポイント: 鍵盤クリック時の分岐。自由練習は同じピッチ単位でトグルし、問題モードは採点用に保持
function selectNote(note, octave) {
  if (usesConceptBoard()) return;

  ensureAudio();
  const pitch = `${note}${octave}`;
  playNote(note, Number(octave), 0, 0.35);

  if (state.mode === "practice") {
    state.selected = state.selected.some((item) => item === pitch)
      ? state.selected.filter((item) => item !== pitch)
      : sortPitches([...state.selected, pitch]);
  } else if ((state.mode === "lesson" && state.target?.answerMode === "scale") || state.mode === "scale") {
    state.selected = state.selected.includes(pitch)
      ? state.selected.filter((item) => item !== pitch)
      : [...state.selected, pitch];
  } else if (state.selected.some((item) => pitchNote(item) === note)) {
    state.selected = state.selected.filter((item) => pitchNote(item) !== note);
  } else {
    state.selected.push(pitch);
  }

  if (state.mode === "interval" || state.mode === "transpose") {
    state.selected = [pitch];
  }

  renderAnswer();
  renderPracticeAnalysis();
  renderHint();
  updateKeyState();
}

// 手修正ポイント: 選択中の音/採点結果の表示。自由練習では固定高の横並びリストになる
function renderAnswer(message = "", status = "") {
  els.answerStrip.innerHTML = "";
  if (els.playAnswer) {
    els.playAnswer.disabled = !canPlaySelectedAnswer();
  }
  if (message) {
    const feedback = document.createElement("div");
    feedback.className = `feedback-banner ${status || "neutral"}`;
    feedback.textContent = message;
    els.answerStrip.appendChild(feedback);
  }

  if (!message && usesConceptBoard()) {
    if (isHarmonyMode() && state.selected.filter(Boolean).length === 0) {
      const hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = "小節を選び、強拍音を含むコード候補から1つずつ配置する";
      els.answerStrip.appendChild(hint);
      return;
    }

    if (state.mode === "diatonic" && state.selected.length === 0) {
      const hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = "カードを押して I から順番に並べる";
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
    hint.textContent = state.mode === "practice" ? "鍵盤を押すとコードやスケール候補を表示します" : "鍵盤を押して答えを作る";
    els.answerStrip.appendChild(hint);
  }

  values.forEach((value) => {
    const span = document.createElement("span");
    span.className = "answer-note";
    span.textContent = isHarmonyMode()
      ? harmonyChordById(value)?.symbol || value
      : usesConceptBoard() ? diatonicChoiceById(value)?.symbol || chordById(value)?.symbol || value : displayPitch(value);
    els.answerStrip.appendChild(span);
  });
}

// 手修正ポイント: 自由練習の解析パネル描画。サマリ、コード候補、スケール候補をここで組み立てる
function renderPracticeAnalysis() {
  if (state.mode !== "practice") return;

  els.conceptBoard.classList.remove("hidden");
  els.keyboard.classList.remove("hidden");

  const noteNames = selectedNoteNames();
  const chordMatches = analyzeChordMatches(noteNames);
  const scaleMatches = analyzeScaleMatches(noteNames);

  els.conceptBoard.innerHTML = `
    <div class="practice-board">
      <div class="practice-summary">
        <span>選択中</span>
        <strong>${noteNames.length ? noteNames.join(" / ") : "--"}</strong>
        <p>${practiceIntervalText(noteNames)}</p>
      </div>
      <div class="practice-results">
        ${renderPracticeResultColumn("コード候補", chordMatches, "3音以上を選ぶとコード候補を表示します")}
        ${renderPracticeResultColumn("スケール候補", scaleMatches, "5音以上を選ぶとスケール候補を表示します")}
      </div>
    </div>
  `;
}

// 手修正ポイント: 自由練習の候補列。カード内の表示文言や件数表示を変えるならここ
function renderPracticeResultColumn(title, matches, emptyText) {
  const rows = matches.length
    ? matches
        .map(
          (match) => `
            <div class="practice-match ${match.exact ? "exact" : ""}">
              <span>${match.exact ? "一致" : `${match.matched}/${match.total}音`}</span>
              <strong>${match.name}</strong>
              <small>${match.copy}</small>
            </div>
          `,
        )
        .join("")
    : `<p class="practice-empty">${emptyText}</p>`;
  return `
    <section>
      <h3>${title}</h3>
      <div class="practice-match-list">${rows}</div>
    </section>
  `;
}

// 手修正ポイント: 鍵盤ではなくカードボードを使うモードの描画入口。自由練習は renderPracticeAnalysis を使う
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

  if (state.mode === "progression") {
    renderProgressionBoard();
    return;
  }

  if (isHarmonyMode()) {
    renderHarmonizeBoard();
    return;
  }

  renderFunctionBoard();
}

function renderHarmonizeBoard() {
  const candidateKeys = ["C", "G", "D", "A"];
  const chords = harmonyCurrentChords();
  const barCount = state.target.bars.length;
  const selectedChords = Array.from({ length: barCount }, (_, index) => chords.find((chord) => chord.id === state.selected[index]));
  const reveal = state.solved;

  els.conceptBoard.innerHTML = `
    <div class="harmonize-board">
      <div class="key-detect">
        <div>
          <p class="mini-label">Step 1</p>
          <strong>このメロディーのキーは？</strong>
          <small>主音への着地感と、使われている変化音を聴きます。</small>
        </div>
        <div class="key-choice-row">
          ${candidateKeys.map((key) => `<button type="button" class="${state.harmonyKey === key ? "active" : ""}" data-action="choose-harmony-key" data-key="${key}">${key}メジャー</button>`).join("")}
        </div>
      </div>
      <div class="melody-timeline ${barCount === 1 ? "one-bar" : ""}" aria-label="${barCount}小節のメロディー">
        ${state.target.bars.map((bar, index) => {
          const chord = selectedChords[index];
          return `
            <button type="button" class="melody-bar ${state.activeBar === index ? "active" : ""}" data-action="focus-harmony-bar" data-bar="${index}">
              <span>${index + 1}小節目</span>
              <strong>${reveal ? bar.map(pitchNote).join(" － ") : "♪　♪　♪　♪"}</strong>
              <small>${reveal ? "音名を開示" : "メロディーを聴いて推定"}</small>
              <b>${chord ? `${chord.symbol} · ${roleName(chord.role)}` : "コードを選ぶ"}</b>
            </button>
          `;
        }).join("")}
      </div>
      <div class="harmony-picker">
        <div>
          <p class="mini-label">Step 2 · ${state.activeBar + 1}小節目</p>
          <strong>${state.harmonyKey ? `${state.harmonyKey}メジャーのコード` : "先にキーを選択"}</strong>
          <small>コードを置いたら「自分の音を聞く」でメロディーと一緒に確認します。</small>
        </div>
        <div class="card-bank">
          ${chords.map((chord) => `
            <button class="chord-card ${state.selected[state.activeBar] === chord.id ? "selected-card" : ""}" data-action="pick-harmony" data-id="${chord.id}">
              <span>${chord.degree} · ${chord.role}</span>
              <strong>${chord.symbol}</strong>
              <small>${roleName(chord.role)}</small>
            </button>
          `).join("") || '<span class="harmony-disabled">キーを選ぶとコード候補が表示されます</span>'}
        </div>
      </div>
      <div class="harmony-flow">
        <span>推定した流れ</span>
        <strong>${state.target.bars.map((_, index) => selectedChords[index]?.role || "? ").join(" → ")}</strong>
        <p>${reveal ? `正解は ${state.target.key}メジャー：${state.target.expected.map((chord) => chord.symbol).join(" → ")}` : "メロディーだけを繰り返し聴き、伴奏を重ねて確かめましょう。"}</p>
      </div>
    </div>
  `;
  bindConceptButtons();
}

function harmonyCurrentChords() {
  if (!state.harmonyKey) return [];
  return diatonicChords(state.harmonyKey).filter((chord) => chord.degree !== "vii°");
}

function harmonyChordById(id) {
  return harmonyCurrentChords().find((chord) => chord.id === id);
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

function renderProgressionBoard() {
  const selectedChords = state.selected.map((id) => diatonicChoiceById(id));
  const remaining = state.target.choices.filter((chord) => !state.selected.includes(chord.id));
  const pattern = state.target.pattern;

  els.conceptBoard.innerHTML = `
    <div class="progression-layout">
      <div class="progression-main">
        <div class="progression-study">
          <div class="progression-info">
            <span>${pattern.category || "進行"}</span>
            <strong>${pattern.name}</strong>
            <p>${pattern.why || pattern.copy}</p>
          </div>
          <div class="playback-toggle" role="group" aria-label="再生モード">
            <button class="${state.progressionPlayback === "degree" ? "active" : ""}" data-action="set-playback" data-playback="degree">度数位置</button>
            <button class="${state.progressionPlayback === "voicing" ? "active" : ""}" data-action="set-playback" data-playback="voicing">実用ボイシング</button>
          </div>
        </div>
        <div class="progression-work">
          <div class="progression-row">
            ${state.target.progression
              .map(
                (chord, index) => `
                  <div class="degree-slot ${selectedChords[index]?.id === chord.id ? "filled correct-slot" : selectedChords[index] ? "filled" : ""}">
                    <span>${chord.degree}</span>
                    <em>${roleName(chord.role)}</em>
                    <strong>${selectedChords[index]?.symbol || "?"}</strong>
                  </div>
                `,
              )
              .join('<div class="progression-arrow">→</div>')}
          </div>
        </div>
        <div class="progression-card-bank">
          <p class="mini-label">コードカード（クリックして選択）</p>
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
        </div>
        ${renderVoiceLine(pattern)}
      </div>
      ${renderProgressionLibrary(state.target.root)}
    </div>
  `;

  bindConceptButtons();
}

function renderVoiceLine(pattern) {
  if (!pattern.voiceLine) return "";
  return `
    <div class="voice-line">
      <span>声部の動き</span>
      <strong>${pattern.voiceLine.join(" → ")}</strong>
      <p>クリシェではコード名だけでなく、1つの声部が少しずつ動くことを追います。</p>
    </div>
  `;
}

function renderProgressionLibrary(root) {
  return `
    <div class="progression-library">
      <p class="mini-label">進行ライブラリ</p>
      <div>
        ${PROGRESSION_PATTERNS.map((pattern, index) => {
          const symbols = progressionChords(root, pattern)
            .filter((chord) => !chord.isDummy)
            .map((chord) => chord.symbol)
            .join(" - ");
          return `
            <button type="button" class="progression-library-item" data-action="open-progression-pattern" data-pattern-index="${index}">
              <span>${pattern.category || "進行"}</span>
              <strong>${pattern.name}</strong>
              <small>${symbols}</small>
            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function bindConceptButtons() {
  els.conceptBoard.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const { action, id, role } = button.dataset;

      if (action === "set-playback") {
        state.progressionPlayback = button.dataset.playback;
        renderConceptBoard();
        return;
      }

      if (action === "open-progression-pattern") {
        openProgressionPattern(Number(button.dataset.patternIndex));
        return;
      }

      if (state.solved) return;

      if (action === "choose-harmony-key") {
        state.harmonyKey = button.dataset.key;
        state.selected = [];
        state.activeBar = 0;
        renderAnswer();
        renderConceptBoard();
        updateControls();
        return;
      }

      if (action === "focus-harmony-bar") {
        state.activeBar = Number(button.dataset.bar);
        renderConceptBoard();
        return;
      }

      if (action === "pick-harmony") {
        state.selected[state.activeBar] = id;
        const nextEmpty = state.target.bars.findIndex((_, index) => !state.selected[index]);
        state.activeBar = nextEmpty >= 0 ? nextEmpty : Math.min(state.activeBar + 1, state.target.bars.length - 1);
        renderAnswer();
        renderConceptBoard();
        updateControls();
        return;
      }

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

  if (state.mode === "interval") {
    return [
      { title: "基準音を確認", copy: `出発点は <strong>${state.target.root}</strong> です。この鍵盤自体は回答に含めません。` },
      { title: "半音で数える", copy: `<strong>${state.target.interval.name}</strong> は ${state.target.interval.short}。白鍵と黒鍵を1つずつ数えます。` },
      { title: "よく使う距離", copy: "短3度は3半音、長3度は4半音、完全5度は7半音です。" },
      { title: "上向きに探す", copy: `今回は ${state.target.root} から右方向へ進み、到着する鍵盤を1つ選びます。` },
    ];
  }

  if (state.mode === "transpose") {
    return [
      { title: "主音を1とする", copy: `<strong>${state.target.targetKey}</strong> を第1音としてメジャースケールを組み立てます。` },
      { title: "メジャーの度数", copy: "第1〜7音はルートから <strong>0 / 2 / 4 / 5 / 7 / 9 / 11半音</strong> です。" },
      { title: `第${state.target.degree.degree}音の距離`, copy: `第${state.target.degree.degree}音は主音から <strong>${state.target.degree.semitones}半音</strong> 上です。` },
      { title: "移調の考え方", copy: "元の音名ではなく度数を保ちます。同じ役割を新しいキーの中で探してください。" },
    ];
  }

  if (isHarmonyMode()) {
    return [
      { title: "主音を探す", copy: "フレーズが最も落ち着いて終われそうな音を歌い、その音を主音とするキーを試します。" },
      { title: "変化音を聴く", copy: "F#、C#、G#などの有無は、C・G・D・Aメジャーを区別する手がかりになります。" },
      { title: "コードを重ねて検証", copy: "各小節の長い音や強拍音が、置いたコードの構成音として自然に聞こえるか確認します。" },
      { title: "機能の流れ", copy: "Tで安定し、SDで展開し、Dで次へ進みたくなる流れを探してください。" },
    ];
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

// 手修正ポイント: ボタン表示/非表示の集約。自由練習では判定・次へ・ヒント・お手本を隠す
function updateControls() {
  const isPractice = state.mode === "practice";
  els.check.classList.toggle("hidden", state.solved || isPractice);
  els.next.classList.toggle("hidden", isPractice);
  els.toggleHint.classList.toggle("hidden", isPractice);
  els.hintCost.classList.toggle("hidden", isPractice);
  els.playTarget.classList.toggle("hidden", isPractice);
  els.solvedStatus.classList.toggle("hidden", isPractice);
  els.playAnswer.disabled = !canPlaySelectedAnswer();
  updateHintVisibility();
}

function updateKeyState() {
  document.querySelectorAll(".key").forEach((key) => {
    key.classList.toggle("selected", state.selected.includes(`${key.dataset.note}${key.dataset.octave}`));
  });
}

// 手修正ポイント: 採点処理。自由練習はここを通らないのでスコアに反映されない
function checkAnswer() {
  if (state.mode === "interval" || state.mode === "transpose") {
    const ok = state.mode === "transpose"
      ? samePitchSet(state.selected.map(pitchNote), state.target.notes.map(pitchNote))
      : arraysEqual(state.selected, state.target.notes);
    record(ok);
    state.solved = ok;
    const correctPitch = state.mode === "transpose" ? pitchNote(state.target.notes[0]) : displayPitch(state.target.notes[0]);
    const success = state.mode === "interval"
      ? `正解：${state.target.root} から ${state.target.interval.name} 上は ${correctPitch}`
      : `正解：${state.target.targetKey}メジャーの第${state.target.degree.degree}音は ${correctPitch}`;
    renderAnswer(ok ? success : "不正解。基準音から半音で数え直してみよう。", ok ? "correct" : "incorrect");
    updateControls();
    return;
  }

  if (isHarmonyMode()) {
    const barCount = state.target.bars.length;
    const chords = Array.from({ length: barCount }, (_, index) => harmonyChordById(state.selected[index]));
    const complete = chords.every(Boolean);
    const keyOk = state.harmonyKey === state.target.key;
    const matchingBars = complete ? chords.filter((chord, index) => chord.degree === state.target.degrees[index]).length : 0;
    const ok = complete && keyOk && matchingBars === barCount;
    record(ok);
    state.solved = ok;
    const feedback = !complete
      ? `キーを選び、${barCount === 1 ? "コードを1つ" : `${barCount}小節すべてにコード`}配置してください。`
      : `${keyOk ? "キーは正解。" : "キーが違います。"} コードは${barCount}小節中${matchingBars}小節一致。`;
    renderAnswer(ok ? `${state.target.key}メジャー、${state.target.expected.map((chord) => chord.symbol).join(" → ")}。正解です。` : feedback, ok ? "correct" : "incorrect");
    renderConceptBoard();
    updateControls();
    return;
  }

  if (state.mode === "lesson") {
    const ok =
      state.target.answerMode === "chord"
        ? samePitchSet(state.selected.map(pitchNote), state.target.notes)
        : arraysEqual(state.selected, state.target.notes);
    record(ok);
    state.solved = ok;
    renderAnswer(ok ? `${state.target.root} ${state.target.name} 完成` : "不正解。もう一度試してください。", ok ? "correct" : "incorrect");
    updateControls();
    return;
  }

  if (state.mode === "chord") {
    const selectedNotes = state.selected.map(pitchNote);
    const ok = samePitchSet(selectedNotes, state.target.notes);
    record(ok);
    state.solved = ok;
    renderAnswer(ok ? "正解" : "不正解。もう一度試してください。", ok ? "correct" : "incorrect");
    updateControls();
    return;
  }

  if (state.mode === "ear") {
    const selectedNotes = state.selected.map(pitchNote);
    const ok = samePitchSet(selectedNotes, state.target.notes);
    record(ok);
    state.solved = ok;
    renderAnswer(ok ? `正解: ${state.target.root} ${state.target.name}` : "不正解。もう一度試してください。", ok ? "correct" : "incorrect");
    updateControls();
    return;
  }

  if (state.mode === "diatonic") {
    const ok = arraysEqual(state.selected, state.target.chords.map((chord) => chord.id));
    record(ok);
    state.solved = ok;
    renderAnswer(ok ? `${state.target.root}メジャーの7コード完成` : "不正解。もう一度試してください。", ok ? "correct" : "incorrect");
    renderConceptBoard();
    updateControls();
    return;
  }

  if (state.mode === "function") {
    const ok = state.target.chords.every((chord) => state.target.assignments[chord.id] === chord.role);
    record(ok);
    state.solved = ok;
    renderAnswer(ok ? "全コードを正しく仕分けました" : "不正解。もう一度試してください。", ok ? "correct" : "incorrect");
    renderConceptBoard();
    updateControls();
    return;
  }

  if (state.mode === "progression") {
    const expected = state.target.progression.map((chord) => chord.id);
    const ok = arraysEqual(state.selected, expected);
    record(ok);
    state.solved = ok;
    renderAnswer(ok ? `${state.target.pattern.name} 完成` : "不正解。もう一度試してください。", ok ? "correct" : "incorrect");
    renderConceptBoard();
    updateControls();
    return;
  }

  if (state.mode === "scale") {
    const ok = arraysEqual(state.selected, state.target.notes);
    record(ok);
    state.solved = ok;
    renderAnswer(ok ? "正解" : "不正解。もう一度試してください。", ok ? "correct" : "incorrect");
    updateControls();
  }
}

// 手修正ポイント: スコア/連続正解/DB保存の入口。採点対象モードだけが呼ぶ
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
  persistAnswer(ok).catch((error) => console.error("Failed to save progress", error));
  renderStats();
}

async function persistAnswer(ok) {
  if (!state.account || !state.target) return;

  const accountId = state.account.id;
  const targetId = state.target.id;
  const mode = state.mode;
  const selected = [...state.selected];
  const answer = [...(state.target.notes || [])];
  const now = new Date().toISOString();
  const account = {
    ...state.account,
    score: state.score,
    streak: state.streak,
    correct: state.correct,
    attempts: state.attempts,
    updatedAt: now,
  };
  const progressId = progressKey(accountId, targetId);
  const previous = await requestToPromise(state.db.transaction("progress", "readonly").objectStore("progress").get(progressId));
  const progress = {
    id: progressId,
    accountId,
    quizId: targetId,
    mode,
    attempts: (previous?.attempts || 0) + 1,
    correct: (previous?.correct || 0) + (ok ? 1 : 0),
    solved: Boolean(previous?.solved || ok),
    lastCorrectAt: ok ? now : previous?.lastCorrectAt || null,
    lastAttemptAt: now,
  };

  await new Promise((resolve, reject) => {
    const transaction = state.db.transaction(["accounts", "progress", "attemptsLog"], "readwrite");
    transaction.objectStore("accounts").put(account);
    transaction.objectStore("progress").put(progress);
    transaction.objectStore("attemptsLog").add({
      accountId,
      quizId: targetId,
      mode,
      ok,
      selected,
      answer,
      createdAt: now,
    });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  state.accounts = state.accounts.map((item) => (item.id === account.id ? account : item));
  if (state.account?.id === accountId) {
    state.account = account;
  }
  if (state.target?.id === targetId) {
    state.target.progress = progress;
  }
  if (ok && !previous?.solved && state.account?.id === accountId) {
    await refreshSolvedCount();
  }
  if (state.account?.id === accountId) {
    await refreshLearningSummary();
  }
  if (state.target?.id === targetId) {
    renderSolvedStatus();
  }
  renderStats();
}

function hintScoreMultiplier() {
  return Math.max(0, 1 - state.hintCount * 0.25);
}

function progressKey(accountId, quizId) {
  return `${accountId}:${quizId}`;
}

async function getProgressForQuiz(quizId) {
  if (!state.account) return null;
  return requestToPromise(state.db.transaction("progress", "readonly").objectStore("progress").get(progressKey(state.account.id, quizId)));
}

async function refreshSolvedCount() {
  if (!state.account) {
    state.solvedCount = 0;
    return;
  }

  const records = await requestToPromise(
    state.db.transaction("progress", "readonly").objectStore("progress").index("accountId").getAll(state.account.id),
  );
  state.solvedCount = records.filter((record) => record.solved).length;
}

async function refreshLearningSummary() {
  if (!state.account) {
    renderLearningSummary(createEmptyLearningSummary());
    return;
  }

  const progressRecords = await requestToPromise(
    state.db.transaction("progress", "readonly").objectStore("progress").index("accountId").getAll(state.account.id),
  );
  const attemptRecords = await requestToPromise(
    state.db.transaction("attemptsLog", "readonly").objectStore("attemptsLog").index("accountId").getAll(state.account.id),
  );
  const todayAttempts = attemptRecords.filter((record) => isToday(record.createdAt));
  const todayCorrect = todayAttempts.filter((record) => record.ok).length;
  const todayAccuracy = todayAttempts.length ? Math.round((todayCorrect / todayAttempts.length) * 100) : null;
  const solvedRecords = progressRecords.filter((record) => record.solved);
  const solvedProgressions = solvedRecords.filter((record) => record.mode === "progression").length;
  const totalXp =
    (state.account.correct || 0) * 30 +
    (state.account.attempts || 0) * 5 +
    solvedRecords.length * 20 +
    solvedProgressions * 15;

  renderLearningSummary({
    level: calculateLevel(totalXp),
    goals: {
      attempts: todayAttempts.length,
      accuracy: todayAccuracy,
      progressions: countTodayNewProgressions(attemptRecords, progressRecords),
    },
  });
}

function createEmptyLearningSummary() {
  return {
    level: calculateLevel(0),
    goals: {
      attempts: 0,
      accuracy: null,
      progressions: 0,
    },
  };
}

function calculateLevel(totalXp) {
  let level = 1;
  let current = Math.max(0, totalXp);
  let next = xpForLevel(level);

  while (current >= next) {
    current -= next;
    level += 1;
    next = xpForLevel(level);
  }

  return {
    level,
    current,
    next,
    ratio: next ? current / next : 0,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
  };
}

function xpForLevel(level) {
  return 120 + (level - 1) * 60;
}

function countTodayNewProgressions(attemptRecords, progressRecords) {
  const firstCorrectByQuiz = new Map();
  attemptRecords
    .filter((record) => record.mode === "progression" && record.ok && record.createdAt)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((record) => {
      if (!firstCorrectByQuiz.has(record.quizId)) {
        firstCorrectByQuiz.set(record.quizId, record.createdAt);
      }
    });

  let count = [...firstCorrectByQuiz.values()].filter((createdAt) => isToday(createdAt)).length;
  const loggedQuizIds = new Set(firstCorrectByQuiz.keys());
  progressRecords.forEach((record) => {
    if (record.mode === "progression" && record.solved && !loggedQuizIds.has(record.quizId) && isToday(record.lastCorrectAt)) {
      count += 1;
    }
  });
  return count;
}

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function renderLearningSummary(summary) {
  const levelProgress = Math.round(summary.level.ratio * 100);
  els.levelNumber.textContent = `Lv. ${summary.level.level}`;
  els.levelTitle.textContent = summary.level.title;
  els.xpText.textContent = `${summary.level.current} / ${summary.level.next} XP`;
  els.levelRing.style.setProperty("--level-progress", `${levelProgress}%`);
  els.xpFill.style.setProperty("--xp-progress", `${levelProgress}%`);

  renderGoal(
    els.goalAttemptsDot,
    els.goalAttemptsValue,
    summary.goals.attempts >= DAILY_GOALS.attempts,
    `${Math.min(summary.goals.attempts, DAILY_GOALS.attempts)} / ${DAILY_GOALS.attempts}`,
  );
  renderGoal(
    els.goalAccuracyDot,
    els.goalAccuracyValue,
    summary.goals.accuracy !== null && summary.goals.accuracy >= DAILY_GOALS.accuracy,
    summary.goals.accuracy === null ? "--" : `${summary.goals.accuracy}%`,
  );
  renderGoal(
    els.goalProgressionsDot,
    els.goalProgressionsValue,
    summary.goals.progressions >= DAILY_GOALS.progressions,
    `${Math.min(summary.goals.progressions, DAILY_GOALS.progressions)} / ${DAILY_GOALS.progressions}`,
  );
}

function renderGoal(dot, valueEl, done, value) {
  dot.classList.toggle("done", done);
  dot.textContent = done ? "✓" : "";
  valueEl.textContent = value;
}

function renderSolvedStatus() {
  if (state.mode === "practice") {
    els.solvedStatus.textContent = "";
    els.solvedStatus.classList.remove("solved", "missed");
    return;
  }

  const progress = state.target?.progress;
  els.solvedStatus.classList.toggle("solved", Boolean(progress?.solved));
  els.solvedStatus.classList.toggle("missed", Boolean(progress && !progress.solved));

  if (progress?.solved) {
    els.solvedStatus.textContent = `正解済み / この問題 ${progress.correct}/${progress.attempts}`;
    return;
  }

  if (progress) {
    els.solvedStatus.textContent = `未正解 / この問題 ${progress.correct}/${progress.attempts}`;
    return;
  }

  els.solvedStatus.textContent = "未挑戦";
}

function renderTextbook(activeId = TEXTBOOK_SECTIONS[0].id) {
  const active = TEXTBOOK_SECTIONS.find((section) => section.id === activeId) || TEXTBOOK_SECTIONS[0];
  els.textbookPanel.innerHTML = `
    <div class="textbook-layout">
      <nav class="textbook-nav" aria-label="教科書の章">
        ${TEXTBOOK_SECTIONS.map(
          (section) => `
            <button class="${section.id === active.id ? "active" : ""}" type="button" data-textbook-section="${section.id}">
              <span>${section.kicker}</span>
              <strong>${section.title}</strong>
            </button>
          `,
        ).join("")}
      </nav>
      <article class="textbook-article">
        <p class="label">${active.kicker}</p>
        <h2>${active.title}</h2>
        <p class="textbook-lead">${active.lead}</p>
        <div class="textbook-points">
          ${active.points.map((point) => `<div><span></span><p>${point}</p></div>`).join("")}
        </div>
        <div class="textbook-example">
          <span>例</span>
          <strong>${active.example}</strong>
        </div>
        <div class="textbook-practice">
          <span>対応する実習</span>
          <strong>${active.practice}</strong>
          ${active.practiceMode ? `<button type="button" data-start-practice="${active.practiceMode}">この単元を練習する</button>` : ""}
        </div>
      </article>
    </div>
  `;
}

async function renderMyPageTop() {
  const { quizzes, progress } = await loadLearningRecords();
  const summaries = PLAY_MODES.map((mode) => summarizeMode(mode, quizzes, progress));
  const attemptRecords = state.account
    ? await requestToPromise(state.db.transaction("attemptsLog", "readonly").objectStore("attemptsLog").index("accountId").getAll(state.account.id))
    : [];
  const todayAttempts = attemptRecords.filter((record) => isToday(record.createdAt));
  const todayCorrect = todayAttempts.filter((record) => record.ok).length;
  const todayAccuracy = todayAttempts.length ? `${Math.round((todayCorrect / todayAttempts.length) * 100)}%` : "--";
  const lastAttempt = [...attemptRecords].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  const total = summaries.reduce(
    (sum, item) => ({
      quizzes: sum.quizzes + item.total,
      solved: sum.solved + item.solved,
      attempts: sum.attempts + item.attempts,
      correct: sum.correct + item.correct,
    }),
    { quizzes: 0, solved: 0, attempts: 0, correct: 0 },
  );

  els.mypagePanel.innerHTML = `
    <div class="mypage-head">
      <div>
        <p class="label">ホーム</p>
        <h2>今日の学習状況</h2>
        <p><span>${escapeHtml(state.account?.name || DEFAULT_ACCOUNT_NAME)}</span><strong>全${total.quizzes}問中 ${total.solved}問を正解済み</strong></p>
      </div>
    </div>
    <div class="home-overview">
      <div>
        <span>今日の挑戦</span>
        <strong>${todayAttempts.length}</strong>
      </div>
      <div>
        <span>今日の正解率</span>
        <strong>${todayAccuracy}</strong>
      </div>
      <div>
        <span>累計正解</span>
        <strong>${total.correct}</strong>
      </div>
      <div>
        <span>最近の成績</span>
        <strong>${lastAttempt ? (lastAttempt.ok ? "正解" : "復習中") : "--"}</strong>
      </div>
    </div>
    <div class="mypage-grid">
      ${summaries
        .map(
          (item) => `
            <button class="menu-score-card" type="button" data-history-mode="${item.mode}">
              <strong>${escapeHtml(MODES[item.mode].title)}</strong>
              <span>${escapeHtml(MODES[item.mode].label)}</span>
              <div class="score-metrics">
                <div><span>正解済み</span><b>${item.solved}/${item.total}</b></div>
                <div><span>挑戦</span><b>${item.attempts}</b></div>
                <div><span>精度</span><b>${item.accuracy}</b></div>
              </div>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

async function renderMyPageDetail(mode) {
  const { quizzes, progress } = await loadLearningRecords();
  const rows = quizzes
    .filter((quiz) => quiz.mode === mode)
    .sort(compareQuizzes)
    .map((quiz) => {
      const record = progress.get(quiz.id);
      const attempts = record?.attempts || 0;
      const correct = record?.correct || 0;
      return {
        quiz,
        record,
        title: quizTitle(quiz),
        attempts,
        correct,
        accuracy: attempts ? `${Math.round((correct / attempts) * 100)}%` : "--",
      };
    });

  const summary = summarizeMode(mode, quizzes, progress);
  els.mypagePanel.innerHTML = `
    <div class="mypage-head">
      <div>
        <p class="label">Menu Progress</p>
        <h2>${escapeHtml(MODES[mode].title)}</h2>
        <p>正解済み ${summary.solved}/${summary.total}問。挑戦 ${summary.attempts}回、正解 ${summary.correct}回、精度 ${summary.accuracy}。</p>
      </div>
    </div>
    <div class="detail-toolbar">
      <button type="button" data-history-back>ホームへ戻る</button>
    </div>
    ${
      rows.length
        ? `<div class="history-table">
            <div class="history-row header">
              <span>問題</span><span>状態</span><span>挑戦</span><span>正解</span><span>最終挑戦</span><span>移動</span>
            </div>
            ${rows
              .map(
                (row) => `
                  <div class="history-row">
                    <strong>${escapeHtml(row.title)}</strong>
                    <span><span class="status-pill ${row.record?.solved ? "solved" : ""}">${row.record?.solved ? "正解済み" : "未正解"}</span></span>
                    <span>${row.attempts}回</span>
                    <span>${row.correct}回 / ${row.accuracy}</span>
                    <span>${formatHistoryDate(row.record?.lastAttemptAt)}</span>
                    <span><button class="history-jump" type="button" data-quiz-id="${escapeHtml(row.quiz.id)}">この問題へ</button></span>
                  </div>
                `,
              )
              .join("")}
          </div>`
        : `<div class="empty-history">このメニューの問題がまだ登録されていません。</div>`
    }
  `;
}

async function loadLearningRecords() {
  const [quizzes, progressList] = await Promise.all([
    requestToPromise(state.db.transaction("quizzes", "readonly").objectStore("quizzes").getAll()),
    state.account
      ? requestToPromise(state.db.transaction("progress", "readonly").objectStore("progress").index("accountId").getAll(state.account.id))
      : Promise.resolve([]),
  ]);
  return {
    quizzes,
    progress: new Map(progressList.map((record) => [record.quizId, record])),
  };
}

function summarizeMode(mode, quizzes, progress) {
  const modeQuizzes = quizzes.filter((quiz) => quiz.mode === mode);
  const records = modeQuizzes.map((quiz) => progress.get(quiz.id)).filter(Boolean);
  const attempts = records.reduce((sum, record) => sum + (record.attempts || 0), 0);
  const correct = records.reduce((sum, record) => sum + (record.correct || 0), 0);

  return {
    mode,
    total: modeQuizzes.length,
    solved: records.filter((record) => record.solved).length,
    attempts,
    correct,
    accuracy: attempts ? `${Math.round((correct / attempts) * 100)}%` : "--",
  };
}

function quizTitle(quiz) {
  const target = targetFromQuiz(quiz);
  return target.prompt || `${MODES[quiz.mode].title} ${quiz.id}`;
}

function formatHistoryDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderStats() {
  els.score.textContent = state.score;
  els.streak.textContent = state.streak;
  els.correct.textContent = state.correct;
  els.attempts.textContent = state.attempts;
  els.accuracy.textContent = state.attempts ? `${Math.round((state.correct / state.attempts) * 100)}%` : "--";
  els.solvedCount.textContent = state.solvedCount;
}

// 手修正ポイント: お手本再生。進行/スケール/コードで鳴らし方を分岐
function playTarget() {
  ensureAudio();
  if (!state.target) return;

  if (state.mode === "progression") {
    flashKeys(playChordSequence(state.target.progression, 0.55, state.progressionPlayback));
    return;
  }

  if (isHarmonyMode()) {
    playMelody(state.target.bars);
    flashKeys(state.target.notes);
    return;
  }

  if (state.mode === "interval") {
    const sequence = [state.target.rootPitch, state.target.notes[0]];
    sequence.forEach((pitch, index) => playNote(pitchNote(pitch), pitchOctave(pitch), index * 0.45, 0.4));
    flashKeys(sequence);
    return;
  }

  if (state.mode === "transpose") {
    const rootPitch = `${state.target.targetKey}4`;
    const sequence = [rootPitch, state.target.notes[0]];
    sequence.forEach((pitch, index) => playNote(pitchNote(pitch), pitchOctave(pitch), index * 0.45, 0.4));
    flashKeys(sequence);
    return;
  }

  const notes = state.target.notes;
  if (state.mode === "scale" || state.mode === "diatonic" || (state.mode === "lesson" && state.target.answerMode === "scale")) {
    notes.forEach((pitch, index) => playNote(pitchNote(pitch), pitchOctave(pitch), index * 0.22, 0.2));
  } else {
    chordPitchesFromTarget(state.target).forEach((pitch) => playNote(pitchNote(pitch), pitchOctave(pitch), 0, 0.75));
  }
  flashKeys(state.mode === "scale" || state.mode === "diatonic" || (state.mode === "lesson" && state.target.answerMode === "scale") ? notes : chordPitchesFromTarget(state.target));
}

function setKeyLight(enabled) {
  state.keyLight = enabled;
  els.keyLightButtons.forEach((button) => {
    button.classList.toggle("active", (button.dataset.keyLight === "on") === enabled);
  });
}

// 手修正ポイント: 自分の音を聞くボタンの有効条件。自由練習は選択音があれば再生可
function canPlaySelectedAnswer() {
  if (state.mode === "practice") return state.selected.length > 0;
  if (!state.target) return false;
  if (state.mode === "function") {
    return Object.keys(state.target.assignments || {}).length > 0 || state.selected.length > 0;
  }
  return state.selected.length > 0;
}

// 手修正ポイント: 選択音の再生。自由練習は最後の通常分岐で同時発音される
function playSelectedAnswer() {
  ensureAudio();
  if (!canPlaySelectedAnswer()) return;

  if ((state.mode === "lesson" && state.target.answerMode === "scale") || state.mode === "scale") {
    state.selected.forEach((pitch, index) => playNote(pitchNote(pitch), pitchOctave(pitch), index * 0.22, 0.2));
    flashKeys(state.selected);
    return;
  }

  if (state.mode === "diatonic") {
    const chords = state.selected.map((id) => diatonicChoiceById(id)).filter(Boolean);
    flashKeys(playChordSequence(chords, 0.55, "degree"));
    return;
  }

  if (state.mode === "progression") {
    const chords = state.selected.map((id) => diatonicChoiceById(id)).filter(Boolean);
    flashKeys(playChordSequence(chords, 0.55, state.progressionPlayback));
    return;
  }

  if (isHarmonyMode()) {
    playHarmonization();
    return;
  }

  if (state.mode === "function") {
    const assignedChords = state.target.chords.filter((chord) => state.target.assignments[chord.id]);
    const focusedChord = state.selected[0] ? [chordById(state.selected[0])].filter(Boolean) : [];
    const chords = assignedChords.length ? assignedChords : focusedChord;
    flashKeys(playChordSequence(chords, 0.45, "degree"));
    return;
  }

  state.selected.forEach((pitch) => playNote(pitchNote(pitch), pitchOctave(pitch), 0, 0.75));
  flashKeys(state.selected);
}

function playSuccess(target) {
  if (!target) return;
  ensureAudio();

  if (target.type === "progression") {
    playChordSequence(target.progression, 0.22, state.progressionPlayback);
    return;
  }

  if (target.type === "harmonize") {
    playHarmonization();
    return;
  }

  if ((target.type === "lesson" && target.answerMode === "scale") || target.type === "scale" || target.type === "diatonic") {
    target.notes.forEach((pitch, index) => {
      playNote(pitchNote(pitch), pitchOctave(pitch), index * 0.08, 0.18);
    });
    return;
  }

  chordPitchesFromTarget(target).forEach((pitch) => playNote(pitchNote(pitch), pitchOctave(pitch), 0, 0.55));
}

function chordPitchesFromTarget(target) {
  if (!target?.root || !target?.notes) return [];
  return chordPitchesFromNotes(target.root, target.notes, 4);
}

function playMelody(bars, barDuration = 0.9) {
  bars.forEach((bar, barIndex) => {
    bar.forEach((pitch, noteIndex) => {
      playNote(pitchNote(pitch), pitchOctave(pitch), barIndex * barDuration + noteIndex * (barDuration / bar.length), 0.32);
    });
  });
}

function playHarmonization() {
  const barDuration = 0.9;
  playMelody(state.target.bars, barDuration);
  const played = [...state.target.notes];
  Array.from({ length: state.target.bars.length }, (_, index) => harmonyChordById(state.selected[index])).forEach((chord, index) => {
    if (!chord) return;
    chordTonePitches(chord, 3).forEach((pitch) => {
      playNote(pitchNote(pitch), pitchOctave(pitch), index * barDuration, 0.78);
      played.push(pitch);
    });
  });
  flashKeys(played);
}

function chordPitchesFromNotes(root, notes, rootOctave = 4) {
  const rootIndex = NOTES.indexOf(root);
  return notes.map((note) => {
    const noteIndex = NOTES.indexOf(note);
    const interval = (noteIndex - rootIndex + NOTES.length) % NOTES.length;
    return `${note}${rootOctave + Math.floor((rootIndex + interval) / NOTES.length)}`;
  });
}

function playChordSequence(chords, stepDelay, mode = "degree") {
  if (mode === "voicing") {
    return playVoicedChordSequence(chords, stepDelay);
  }

  const played = [];
  chords.forEach((chord, index) => {
    chordTonePitches(chord, chordRootOctaveInKey(chord)).forEach((pitch) => {
      playNote(pitchNote(pitch), pitchOctave(pitch), index * stepDelay, 0.42);
      played.push(pitch);
    });
  });
  return played;
}

function playVoicedChordSequence(chords, stepDelay) {
  let previous = null;
  const played = [];
  chords.forEach((chord, index) => {
    const pitches = voiceChordNearPrevious(chord, previous);
    pitches.forEach((pitch) => {
      playNote(pitchNote(pitch), pitchOctave(pitch), index * stepDelay, 0.42);
      played.push(pitch);
    });
    previous = pitches;
  });
  return played;
}

function voiceChordNearPrevious(chord, previous) {
  const candidates = [3, 4, 5].map((octave) => chordTonePitches(chord, octave));
  if (!previous) return candidates[1];

  const previousMidis = previous.map((pitch) => midiFor(pitchNote(pitch), pitchOctave(pitch)));
  return candidates
    .map((pitches) => ({
      pitches,
      distance: pitches.reduce((sum, pitch, index) => {
        const midi = midiFor(pitchNote(pitch), pitchOctave(pitch));
        return sum + Math.abs(midi - (previousMidis[index] || previousMidis[previousMidis.length - 1]));
      }, 0),
    }))
    .sort((a, b) => a.distance - b.distance)[0].pitches;
}

function chordRootOctaveInKey(chord) {
  const keyRoot = chord.id?.split("-")[0] || chord.note;
  const absolute = NOTES.indexOf(keyRoot) + chord.offset;
  return 4 + Math.floor(absolute / NOTES.length);
}

function chordTonePitches(chord, rootOctave) {
  if (!chord) return [];
  const intervals = intervalsForQuality(chord.quality);
  return scalePitches(chord.note, rootOctave, intervals);
}

// 手修正ポイント: Web Audio 初期化。ブラウザ制限があるためユーザー操作後に作る
function ensureAudio() {
  if (!state.audio) {
    state.audio = new AudioContext();
  }
}

// 手修正ポイント: 単音再生の音色。oscillator.type や gain を触ると音色/音量が変わる
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
  if (!state.keyLight) return;
  const pitches = notes.map((note) => (/\d$/.test(note) ? note : `${note}4`));
  document.querySelectorAll(".key").forEach((key) => {
    if (pitches.includes(`${key.dataset.note}${key.dataset.octave}`)) {
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

// 手修正ポイント: 自由練習の解析用。複数オクターブの同名音を1音名へまとめる
function selectedNoteNames() {
  return [...new Set(state.selected.map(pitchNote))].sort((a, b) => NOTES.indexOf(a) - NOTES.indexOf(b));
}

// 手修正ポイント: 自由練習の表示順。鍵盤上の低い音から並べる
function sortPitches(pitches) {
  return [...pitches].sort((a, b) => midiFor(pitchNote(a), pitchOctave(a)) - midiFor(pitchNote(b), pitchOctave(b)));
}

// 手修正ポイント: 自由練習のコード候補判定。候補数やゆるさは filter / slice を調整
function analyzeChordMatches(noteNames) {
  if (noteNames.length < 3) return [];
  const selected = new Set(noteNames);

  return NOTES.flatMap((root) =>
    Object.entries(CHORDS).map(([kind, chord]) => {
      const tones = chordNotes(root, chord.intervals);
      const matched = tones.filter((note) => selected.has(note)).length;
      const extra = noteNames.filter((note) => !tones.includes(note)).length;
      return {
        name: `${root} ${chord.name}`,
        copy: chord.copy,
        matched,
        total: tones.length,
        extra,
        exact: matched === tones.length && extra === 0,
        score: matched * 2 - extra - Math.abs(tones.length - noteNames.length),
      };
    }),
  )
    .filter((match) => match.exact || (match.matched >= Math.min(3, match.total) && match.extra <= 1))
    .sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 6);
}

// 手修正ポイント: 自由練習のスケール候補判定。対象スケールは PRACTICE_SCALES
function analyzeScaleMatches(noteNames) {
  if (noteNames.length < 5) return [];
  const selected = new Set(noteNames);

  return NOTES.flatMap((root) =>
    Object.values(PRACTICE_SCALES).map((scale) => {
      const tones = uniqueNotes(scaleNotes(root, scale.intervals));
      const matched = noteNames.filter((note) => tones.includes(note)).length;
      const missing = tones.length - matched;
      const extra = noteNames.filter((note) => !tones.includes(note)).length;
      return {
        name: `${root} ${scale.name}`,
        copy: scale.copy,
        matched,
        total: tones.length,
        missing,
        extra,
        exact: noteNames.length === tones.length && missing === 0 && extra === 0,
        score: matched * 2 - missing - extra * 2,
      };
    }),
  )
    .filter((match) => match.exact || (match.matched >= Math.min(5, noteNames.length) && match.extra <= 1))
    .sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 6);
}

function uniqueNotes(notes) {
  return [...new Set(notes)];
}

// 手修正ポイント: 自由練習のサマリ文。半音表示の文言を変えるならここ
function practiceIntervalText(noteNames) {
  if (noteNames.length === 0) return "音を選ぶと、音名セットから候補を解析します。";
  if (noteNames.length === 1) return `${noteNames[0]} を基準に追加の音を押してください。`;
  const root = noteNames[0];
  const intervals = noteNames.map((note) => (NOTES.indexOf(note) - NOTES.indexOf(root) + NOTES.length) % NOTES.length);
  return `${root} からの半音: ${intervals.map((interval) => `+${interval}`).join(" / ")}`;
}

// 手修正ポイント: 鍵盤ではなくカードUIを使う採点モード。自由練習は含めない
function usesConceptBoard() {
  return ["diatonic", "function", "progression", "harmonize", "harmonyOne"].includes(state.mode);
}

function isHarmonyMode(mode = state.mode) {
  return mode === "harmonize" || mode === "harmonyOne";
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

function progressionChords(root, pattern) {
  const specs = pattern.chords || pattern.degrees.map((degree, index) => ({ degree, role: pattern.roles[index] }));
  return specs.map((spec, index) => createProgressionChord(root, spec, index));
}

function createProgressionChord(root, spec, index) {
  const base = degreeBase(spec.degree);
  const offset = degreeOffset(base);
  const quality = spec.quality || diatonicQualityForDegree(base);
  const note = transpose(root, offset);

  return {
    degree: spec.degree,
    quality,
    offset,
    role: spec.role || roleForDegree(base),
    id: `${root}-prog-${index}-${spec.degree}-${quality}`,
    note,
    symbol: `${note}${qualitySuffix(quality)}`,
    lineTone: spec.lineTone,
  };
}

function progressionChoices(root, chords) {
  const chordSymbols = new Set(chords.map((chord) => chord.symbol));
  const dummyQualities = ["major", "minor", "major7", "dominant7", "minor7"];
  const dummyCandidates = NOTES.map((note) => dummyQualities.map((quality) => ({ note, quality })))
    .flat()
    .map(({ note, quality }) => ({
      id: `${root}-prog-dummy-${note}${quality}`,
      note,
      quality,
      symbol: `${note}${qualitySuffix(quality)}`,
      isDummy: true,
    }))
    .filter((chord) => !chordSymbols.has(chord.symbol));
  const dummies = shuffleRandom(dummyCandidates).slice(0, 4);

  return shuffleRandom([...chords, ...dummies]);
}

function chordToneNames(chord) {
  if (!chord) return [];
  const intervals = intervalsForQuality(chord.quality);
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

function degreeBase(degree) {
  return degree.replace(/maj7|m7|7|dim|°/g, "");
}

function degreeOffset(degree) {
  const offsets = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };
  return offsets[degree.toUpperCase()] ?? 0;
}

function diatonicQualityForDegree(degree) {
  if (degree.includes("°")) return "dim";
  if (degree === degree.toLowerCase()) return "minor";
  return "major";
}

function roleForDegree(degree) {
  const item = DIATONIC_DEGREES.find((entry) => degreeBase(entry.degree).toUpperCase() === degree.toUpperCase());
  return item?.role || "T";
}

function qualitySuffix(quality) {
  if (quality === "minor" || quality === "m") return "m";
  if (quality === "dim") return "dim";
  if (quality === "major7") return "maj7";
  if (quality === "dominant7") return "7";
  if (quality === "minor7") return "m7";
  if (quality === "minorMajor7") return "mMaj7";
  if (quality === "minor6") return "m6";
  return "";
}

function intervalsForQuality(quality) {
  if (quality === "minor" || quality === "m") return CHORDS.minor.intervals;
  if (quality === "dim") return CHORDS.diminished.intervals;
  if (quality === "major7") return CHORDS.major7.intervals;
  if (quality === "dominant7") return CHORDS.dominant7.intervals;
  if (quality === "minor7") return CHORDS.minor7.intervals;
  if (quality === "minorMajor7") return [0, 3, 7, 11];
  if (quality === "minor6") return [0, 3, 7, 9];
  return CHORDS.major.intervals;
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

function transposePitch(pitch, interval) {
  const absolute = NOTES.indexOf(pitchNote(pitch)) + pitchOctave(pitch) * 12 + interval;
  return `${NOTES[((absolute % 12) + 12) % 12]}${Math.floor(absolute / 12)}`;
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
  const midi = midiFor(note, octave);
  return 440 * 2 ** ((midi - 69) / 12);
}

function midiFor(note, octave) {
  return 12 * (octave + 1) + NOTES.indexOf(note);
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

init().catch((error) => {
  console.error(error);
  els.prompt.textContent = "データベースの初期化に失敗しました";
  els.modeCopy.textContent = "ブラウザのIndexedDBが使える状態か確認してください。";
});
