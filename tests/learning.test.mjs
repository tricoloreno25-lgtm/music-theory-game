import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({
  document: { querySelector: () => ({}), querySelectorAll: () => [] },
  console, Date, Math, Set, Map, structuredClone,
});
vm.runInContext(readFileSync(new URL('../app.js', import.meta.url), 'utf8'), context);
vm.runInContext(readFileSync(new URL('../experience.js', import.meta.url), 'utf8').split('\ninit().catch')[0], context);
const evaluate = source => vm.runInContext(source, context);
const value = source => JSON.parse(JSON.stringify(evaluate(source)));

test('all existing quiz IDs remain unique, and all 424 quizzes can build a target', () => {
  const ids = value('buildQuizBank().map(quiz => { const target = targetFromQuiz(quiz); if (!target.notes?.length) throw new Error(quiz.id); return quiz.id; })');
  assert.equal(ids.length, 424);
  assert.equal(new Set(ids).size, 424);
});

test('chord feedback identifies a lowered third and spells the minor chord correctly', () => {
  const result = value(`state.mode = 'chord'; state.target = targetFromQuiz(buildQuizBank().find(q => q.id === 'chord-C-major')); state.selected = ['C4', 'D#4', 'G4']; gradeAnswer()`);
  assert.equal(result.ok, false);
  assert.deepEqual(result.missing, ['E']);
  assert.deepEqual(result.extra, ['D#']);
  assert.deepEqual(value(`spelledChordNotes('C', 'minor')`), ['C', 'E♭', 'G']);
  assert.deepEqual(value(`spelledChordNotes('F', 'dominant7')`), ['F', 'A', 'C', 'E♭']);
});

test('chords accept inversions while scales require the correct order and octave', () => {
  assert.equal(evaluate(`state.mode = 'chord'; state.target = targetFromQuiz(buildQuizBank().find(q => q.id === 'chord-C-major')); state.selected = ['G4', 'C5', 'E5']; gradeAnswer().ok`), true);
  const wrong = value(`state.mode = 'scale'; state.target = targetFromQuiz(buildQuizBank().find(q => q.id === 'scale-C-major')); state.selected = ['C4','E4','D4','F4','G4','A4','B4','C5']; gradeAnswer()`);
  assert.equal(wrong.ok, false);
  assert.match(wrong.detail, /2番目/);
  assert.deepEqual(wrong.missing, []);
  assert.equal(evaluate(`state.selected = [...state.target.notes]; gradeAnswer().ok`), true);
});

test('ear training has three actual difficulty levels and choices are graded by quality', () => {
  assert.deepEqual(value(`experience.settings.earLevel = 1; earKinds()`), ['major', 'minor']);
  assert.equal(evaluate(`experience.settings.earLevel = 2; earKinds().length`), 5);
  assert.equal(evaluate(`experience.settings.earLevel = 3; earKinds().length`), 10);
  assert.equal(evaluate(`experience.settings.earLevel = 1; state.mode = 'ear'; state.target = targetFromQuiz(buildQuizBank().find(q => q.id === 'ear-C-minor')); state.earChoice = null; gradeAnswer().incomplete`), true);
  assert.equal(evaluate(`state.earChoice = 'major'; gradeAnswer().ok`), false);
  assert.equal(evaluate(`state.earChoice = 'minor'; gradeAnswer().ok`), true);
  assert.equal(evaluate(`quizAvailableAtEarLevel(buildQuizBank().find(q => q.id === 'ear-C-augmented'))`), false);
  assert.equal(evaluate(`quizAvailableAtEarLevel(buildQuizBank().find(q => q.id === 'ear-C-major'))`), true);
  assert.equal(evaluate(`quizAvailableAtEarLevel(buildQuizBank().find(q => q.id === 'chord-C-augmented'))`), true);
});

test('empty and incomplete concept answers do not count as an incorrect attempt', () => {
  assert.equal(evaluate(`state.mode = 'function'; state.target = targetFromQuiz(buildQuizBank().find(q => q.id === 'function-C')); gradeAnswer().incomplete`), true);
  assert.equal(evaluate(`state.mode = 'progression'; state.target = targetFromQuiz(buildQuizBank().find(q => q.id === 'progression-C-0')); state.selected = []; gradeAnswer().incomplete`), true);
});

test('review scheduling supports both old records and newly scheduled reviews', () => {
  const now = Date.now();
  context.reviewNow = now;
  context.oldReview = { solved: true, lastCorrectAt: new Date(now - 4 * 86400000).toISOString() };
  assert.equal(evaluate('isReviewDue(oldReview, reviewNow)'), true);
  assert.equal(evaluate('isReviewDue({ solved: true, lastResult: false }, reviewNow)'), true);
  assert.equal(evaluate(`isReviewDue({ solved: true, nextReviewAt: new Date(reviewNow + 86400000).toISOString() }, reviewNow)`), false);
  assert.equal(evaluate(`isReviewDue({ solved: true, reviewRequestedAt: new Date(reviewNow).toISOString(), nextReviewAt: new Date(reviewNow + 86400000).toISOString() }, reviewNow)`), true);
});

test('adaptive selection favors due questions and avoids immediate repetition', () => {
  assert.equal(evaluate(`state.target = null; chooseAdaptiveQuiz([{id:'new'}, {id:'due'}], [{quizId:'due', solved:false}], () => 0).id`), 'due');
  assert.equal(evaluate(`state.target = {id:'a'}; chooseAdaptiveQuiz([{id:'a'}, {id:'b'}], [], () => 0).id`), 'b');
});

test('practice hints are free while challenge hints keep the scoring rule', () => {
  assert.equal(evaluate(`state.hintCount = 3; experience.settings.studyStyle = 'practice'; hintScoreMultiplier()`), 1);
  assert.equal(evaluate(`experience.settings.studyStyle = 'challenge'; hintScoreMultiplier()`), .25);
});

test('every textbook chapter provides a demo, a question, and a working exercise route', () => {
  const chapters = value('TEXTBOOK_SECTIONS.map(section => ({ id: section.id, demo: LESSON_DEMOS[section.id], mode: textbookPracticeMode(section) }))');
  for (const chapter of chapters) {
    assert.ok(chapter.demo, chapter.id);
    assert.ok(chapter.demo.options.includes(chapter.demo.answer), chapter.id);
    assert.ok(value('PLAY_MODES').includes(chapter.mode), chapter.id);
  }
});

test('achievements use observed correct answers rather than raw XP', () => {
  const achievements = value(`calculateAchievements([{mode:'chord',quizId:'chord-C-major',ok:true,createdAt:new Date().toISOString()}, {mode:'chord',quizId:'chord-D-major',ok:true,createdAt:new Date().toISOString()}, {mode:'chord',quizId:'chord-G-major',ok:true,createdAt:new Date().toISOString()}], buildQuizBank())`);
  assert.equal(achievements[2].done, true);
  assert.equal(achievements[0].done, false);
  assert.equal(achievements[1].done, false);
});

test('saved compositions validate transposable degrees and tempo bounds', () => {
  assert.equal(evaluate('validComposition(defaultComposition())'), true);
  assert.equal(evaluate('validComposition({...defaultComposition(), slots:[0,1,2,9]})'), false);
  assert.equal(evaluate('validComposition({...defaultComposition(), tempo:0})'), false);
});
