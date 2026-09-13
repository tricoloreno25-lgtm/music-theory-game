// Run with a local HTTP server on 8765 and a dedicated Chrome CDP port on 9337.
// All test data lives in a disposable browser context, separate from user data.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const output = process.argv[2] || '/private/tmp/chord-quest-browser-review';
await mkdir(output, { recursive: true });
const version = await (await fetch('http://127.0.0.1:9337/json/version')).json();
async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let next = 0;
  const pending = new Map(), errors = [];
  socket.addEventListener('message', event => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.exceptionThrown') errors.push(data.params.exceptionDetails);
    if (!pending.has(data.id)) return;
    const { resolve, reject } = pending.get(data.id);
    pending.delete(data.id);
    data.error ? reject(new Error(JSON.stringify(data.error))) : resolve(data.result);
  });
  return {
    errors, close: () => socket.close(),
    call: (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++next; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
    }),
  };
}
const browser = await connect(version.webSocketDebuggerUrl);
const { browserContextId } = await browser.call('Target.createBrowserContext');
let page;
try {
  const { targetId } = await browser.call('Target.createTarget', { url: 'http://127.0.0.1:8765', browserContextId });
  const pages = await (await fetch('http://127.0.0.1:9337/json/list')).json();
  page = await connect(pages.find(item => item.id === targetId).webSocketDebuggerUrl);
  const call = page.call;
  await call('Runtime.enable');
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const waitFor = async expression => {
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      if (await evaluate(`typeof state !== 'undefined' && typeof experience !== 'undefined' && (${expression})`)) return;
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    throw new Error(`Timed out: ${expression}`);
  };
  const click = async selector => {
    const point = await evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el || el.disabled) throw new Error('Missing or disabled: ' + ${JSON.stringify(selector)});
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) throw new Error('Hidden: ' + ${JSON.stringify(selector)});
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()`);
    await call('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
    await call('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
  };
  const change = (selector, value) => evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (el.disabled) throw new Error('Disabled control');
    if (el.type === 'checkbox') el.checked = ${JSON.stringify(value)};
    else el.value = ${JSON.stringify(String(value))};
    el.dispatchEvent(new Event('change', { bubbles: true }));
  })()`);
  const snapshot = async (name, width = 1440) => {
    await call('Emulation.setDeviceMetricsOverride', { width, height: width === 390 ? 844 : 1000, deviceScaleFactor: 1, mobile: width === 390 });
    await evaluate('scrollTo({top:0,behavior:"instant"})');
    await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    const pageWidth = await evaluate('document.documentElement.scrollWidth');
    if (pageWidth !== width) console.log(await evaluate(`Array.from(document.querySelectorAll('body *')).filter(el => { const r=el.getBoundingClientRect(); return r.width && r.right > innerWidth + 1; }).map(el=>({tag:el.tagName,cls:el.className,width:el.getBoundingClientRect().width, text:el.innerText.slice(0,60)})).slice(-15)`));
    const { cssContentSize } = await call('Page.getLayoutMetrics');
    const { data } = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: cssContentSize.height, scale: 1 } });
    await writeFile(`${output}/${name}.png`, Buffer.from(data, 'base64'));
    assert.equal(pageWidth, width, `${name}: page overflow`);
  };
  const answerCorrect = async () => {
    const pitches = await evaluate('state.target.notes');
    for (const pitch of pitches) await click(`#keyboard [data-note="${pitch.slice(0, -1)}"][data-octave="${pitch.slice(-1)}"]`);
    await click('#check-answer');
    await waitFor('state.solved && !state.saving');
  };

  await waitFor('typeof experience !== "undefined" && state.account && document.querySelector(".daily-hero")');
  if (process.argv[3] === 'melody') {
    await evaluate('openQuizFromHistory("harmony-one-0")');
    assert.equal(await evaluate('document.querySelector("#show-melody-notes").checked'), false);
    assert.match(await evaluate('document.querySelector(".melody-pitches").textContent'), /♪/);
    await click('[data-action="choose-harmony-key"][data-key="C"]');
    await click('[data-action="pick-harmony"][data-id="C-0"]');
    const answer = await evaluate('({selected:state.selected, key:state.harmonyKey, score:state.score, hints:state.hintCount})');
    await click('#show-melody-notes');
    assert.equal(await evaluate('document.querySelector(".melody-pitches").textContent'), 'B4 → C5 → E5 → G5');
    assert.ok(await evaluate('!document.querySelector(".harmony-flow").textContent.includes("正解は") && !state.solved'));
    await click('#show-melody-notes');
    assert.match(await evaluate('document.querySelector(".melody-pitches").textContent'), /♪/);
    assert.deepEqual(await evaluate('({selected:state.selected, key:state.harmonyKey, score:state.score, hints:state.hintCount})'), answer);
    await click('#show-melody-notes');
    await snapshot('melody-guide-one-mobile', 390);
    await evaluate('setMode("harmonize")');
    assert.equal(await evaluate('document.querySelector("#show-melody-notes").checked'), true);
    assert.deepEqual(await evaluate('Array.from(document.querySelectorAll(".melody-pitches")).map(el=>el.textContent)'), await evaluate('state.target.bars.map(bar=>bar.map(pitch=>pitch.replace("#","♯")).join(" → "))'));
    await snapshot('melody-guide-four-mobile', 390);
    await snapshot('melody-guide-four-desktop');
    await call('Page.reload', { ignoreCache: true });
    await waitFor('state.account && document.querySelector(".daily-hero")');
    await evaluate('openQuizFromHistory("harmony-one-0")');
    assert.equal(await evaluate('document.querySelector("#show-melody-notes").checked'), true);
    const accountA = await evaluate('state.account.id');
    await evaluate(`(async () => {
      const account = createAccountRecord('音名表示の確認用');
      await storeRequest('accounts', 'readwrite', store => store.put(account));
      state.accounts.push(account); renderAccountSelect(); await switchAccount(account.id);
    })()`);
    assert.equal(await evaluate('document.querySelector("#show-melody-notes").checked'), false);
    await evaluate(`switchAccount(${JSON.stringify(accountA)})`);
    assert.equal(await evaluate('document.querySelector("#show-melody-notes").checked'), true);
    assert.deepEqual(page.errors, []);
    console.log('PASS melody guide: all notes, no solution disclosure, answer preservation, both harmony modes, account settings and reload');
  } else if (process.argv[3] === 'visual') {
    for (const mode of ['function', 'progression']) {
      await evaluate(`setMode(${JSON.stringify(mode)})`);
      await evaluate(`if (state.mode === 'function') state.target.assignments = Object.fromEntries(state.target.chords.map(chord => [chord.id, chord.role])); else state.selected = state.target.progression.map(chord => chord.id); renderConceptBoard(); renderAnswer();`);
      for (const width of [1440, 390]) {
        await snapshot(`${mode}-${width === 390 ? 'mobile' : 'desktop'}`, width);
        assert.ok(await evaluate(`Array.from(document.querySelectorAll('.function-layout, .function-drop, .progression-main, .progression-study, .progression-work, .progression-card-bank .card-bank')).every(el => el.scrollHeight <= el.clientHeight + 1)`), `${mode} at ${width}: clipped contents`);
        if (mode === 'function') assert.equal(await evaluate('document.querySelectorAll(".assigned-card").length'), 7);
      }
    }
    for (const id of await evaluate('buildQuizBank().filter(quiz => quiz.mode === "progression").map(quiz => quiz.id)')) {
      await evaluate(`openQuizFromHistory(${JSON.stringify(id)})`);
      await evaluate('state.selected = state.target.progression.map(chord=>chord.id); renderAnswer(); renderConceptBoard();');
      assert.equal(await evaluate('document.documentElement.scrollWidth'), 390, `${id}: page overflow`);
      assert.ok(await evaluate(`Array.from(document.querySelectorAll('.degree-slot, .progression-library-item')).every(el => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1)`), `${id}: clipped card`);
    }
    await snapshot('progression-mobile', 390);
    await evaluate('setMode("practice")');
    for (const note of ['C', 'E', 'G']) await click(`#keyboard [data-note="${note}"][data-octave="4"]`);
    assert.ok(await evaluate('document.querySelector(".practice-match.exact")?.textContent.includes("C")'));
    await snapshot('studio-freeplay-mobile', 390);
    assert.deepEqual(page.errors, []);
    console.log('PASS function and progression: all answer cards visible at 1440 and 390 px');
  } else {
  if (!process.argv[3]) {
  await snapshot('home-desktop');
  await snapshot('home-mobile', 390);
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await click('[data-cq="daily"]');
  await waitFor('experience.session && state.target && state.mode === "interval"');
  const firstId = await evaluate('state.target.id');
  await answerCorrect();
  await click('[data-mode="mypage"]');
  await waitFor('state.mode === "mypage" && document.querySelector("[data-cq=resume]")');
  await click('[data-cq="resume"]');
  await waitFor('state.mode === "interval" && state.solved');
  assert.equal(await evaluate('state.target.id'), firstId);
  for (let i = 1; i < 5; i++) {
    await click('#next-challenge');
    await waitFor(`experience.session.index === ${i} && !state.solved`);
    await answerCorrect();
  }
  await click('#next-challenge');
  await waitFor('experience.sessionComplete');
  assert.equal(await evaluate('experience.data.lastSession.correct'), 5);
  console.log('PASS daily lesson: answer, home, resume, complete');

  await evaluate('openQuizFromHistory("chord-C-major")');
  assert.equal(await evaluate('experience.sessionComplete'), false);
  for (const note of ['C', 'D#', 'G']) await click(`#keyboard [data-note="${note}"][data-octave="4"]`);
  const score = await evaluate('state.score');
  await click('#toggle-hint');
  await click('#check-answer');
  await waitFor('!state.saving && document.querySelector("#explanation-panel").textContent.includes("足りない音")');
  assert.equal(await evaluate('state.score'), score);
  assert.match(await evaluate('document.querySelector("#explanation-panel").textContent'), /E.*D♯/);
  await click('[data-cq="compare"]');
  assert.ok(await evaluate('sound.voices.size > 0'));
  await click('[data-cq="stop"]');
  await click('#keyboard [data-note="D#"][data-octave="4"]');
  await click('#keyboard [data-note="E"][data-octave="4"]');
  await click('#check-answer');
  await waitFor('state.solved && !state.saving');
  assert.equal(await evaluate('state.score - ' + score), 115);
  console.log('PASS chord correction, comparison playback, and no practice penalty');

  await evaluate('openQuizFromHistory("ear-C-minor")');
  await click('[data-cq="ear-choice"][data-value="major"]');
  const attempts = await evaluate('state.attempts');
  await click('#check-answer');
  await waitFor(`!state.saving && state.attempts === ${attempts + 1}`);
  await click('[data-cq="ear-choice"][data-value="minor"]');
  await click('#check-answer');
  await waitFor('state.solved && !state.saving');
  await click('#next-challenge');
  await waitFor('!state.solved');
  assert.ok(await evaluate('earKinds().includes(state.target.kind)'));
  await evaluate('openQuizFromHistory("ear-C-augmented")');
  assert.equal(await evaluate('experience.settings.earLevel'), 3);
  await change('#ear-level', 1);
  await waitFor('experience.settings.earLevel === 1 && earKinds().includes(state.target.kind)');
  assert.equal(await evaluate('state.followQuizOrder'), false);
  await change('#ear-level', 2);
  await waitFor('document.querySelectorAll("[data-cq=ear-choice]").length === 5');
  console.log('PASS ear choices, history, sequential navigation, difficulty changes');

  await evaluate('openQuizFromHistory("chord-D-major")');
  const skipId = await evaluate('state.target.id');
  const skipAttempts = await evaluate('state.attempts');
  await click('#next-challenge');
  await waitFor(`!state.saving && state.target.id !== ${JSON.stringify(skipId)}`);
  assert.ok(await evaluate(`getProgressForQuiz(${JSON.stringify(skipId)}).then(isReviewDue)`));
  assert.equal(await evaluate('state.attempts'), skipAttempts);
  await evaluate('startSession("review")');
  assert.equal(await evaluate('experience.session.ids.length'), 3);
  assert.ok(await evaluate(`experience.session.ids.includes(${JSON.stringify(skipId)})`));
  console.log('PASS deferred question persists without an attempt; review has 3 questions');
  }

  await evaluate('setMode("textbook")');
  await click('#textbook-panel [data-cq="demo"]');
  assert.ok(await evaluate('sound.voices.size > 0'));
  await click('[data-cq="mini-answer"][data-value="E♭"]');
  assert.match(await evaluate('document.querySelector("#mini-feedback").textContent'), /正解/);
  await click('[data-start-practice]');
  await waitFor('state.mode === "interval"');
  console.log('PASS textbook: demo, mini question, related practice');

  await evaluate('setMode("practice")');
  assert.equal(await evaluate('state.target'), null);
  assert.match(await evaluate('document.querySelector("#prompt").textContent'), /鍵盤を自由に/);
  await click('[data-cq="studio-slot"][data-slot="1"]');
  await click('[data-cq="studio-chord"][data-value="1"]');
  await click('[data-cq="studio-move"][data-from="1"][data-to="0"]');
  assert.deepEqual(await evaluate('experience.data.draft.slots'), [1, 0, 5, 3]);
  await change('#studio-key', 'G');
  await change('#sound-tempo', 160);
  await change('#studio-name', 'ブラウザ確認');
  await evaluate('window.onsets = []; window.originalNote = sound.note; sound.note = function(...args) { if(args[5] != null) onsets.push(args[5]); return originalNote.apply(this,args); }');
  await click('[data-cq="studio-play"]');
  await waitFor('onsets.length >= 20');
  const onsets = await evaluate('[...new Set(onsets)].sort((a,b)=>a-b).slice(0,5)');
  for (let i = 1; i < 5; i++) assert.ok(Math.abs(onsets[i] - onsets[i - 1] - 1.5) < .00001, 'loop must maintain beat spacing');
  await click('[data-cq="stop"]');
  assert.equal(await evaluate('sound.voices.size + sound.timers.size + Number(experience.loopTimer !== null)'), 0);
  await evaluate('sound.note = originalNote');
  await click('[data-cq="studio-save"]');
  await snapshot('studio-desktop');
  await snapshot('studio-mobile', 390);
  const saved = await evaluate('experience.data.favorites[0]');
  await call('Page.reload', { ignoreCache: true });
  await waitFor('state.account && document.querySelector(".daily-hero")');
  await click('[data-mode="practice"]');
  await waitFor('state.mode === "practice" && document.querySelector("[data-cq=studio-load]")');
  await change('#studio-key', 'D');
  await click('[data-cq="studio-load"]');
  assert.deepEqual(await evaluate('experience.data.draft.slots'), saved.slots);
  assert.equal(await evaluate('experience.data.draft.key'), 'G');
  assert.equal(await evaluate('experience.settings.tempo'), 160);
  console.log('PASS studio editing, precise loop boundary, stop, save and reload');

  const accountA = await evaluate('state.account.id');
  const accountAScore = await evaluate('state.score');
  await call('Page.enable');
  const promptHandled = new Promise(resolve => {
    // Trigger the native prompt and handle it through CDP in the next turn.
    setTimeout(async () => { await call('Page.handleJavaScriptDialog', { accept: true, promptText: '確認用ユーザーB' }); resolve(); }, 100);
  });
  await click('#create-account');
  await promptHandled;
  await waitFor(`state.account.id !== ${JSON.stringify(accountA)}`);
  assert.equal(await evaluate('state.score'), 0);
  assert.equal(await evaluate('experience.data.favorites.length'), 0);
  assert.equal(await evaluate('experience.settings.tempo'), 100);
  assert.equal(await evaluate('experience.data.session || null'), null);
  await change('#account-select', accountA);
  await waitFor(`state.account.id === ${JSON.stringify(accountA)} && !!document.querySelector('[data-cq="studio-load"]')`);
  assert.equal(await evaluate('state.score'), accountAScore);
  assert.equal(await evaluate('experience.settings.tempo'), 160);
  console.log('PASS account-specific progress, settings and compositions');

  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  for (const mode of ['harmonyOne', 'harmonize', 'function', 'progression', 'diatonic']) {
    await evaluate(`setMode(${JSON.stringify(mode)})`);
    if (mode === 'harmonyOne' || mode === 'harmonize') {
      const key = await evaluate('state.target.key');
      await click(`[data-action="choose-harmony-key"][data-key="${key}"]`);
      const ids = await evaluate('state.target.expected.map(chord=>chord.id)');
      for (const id of ids) await click(`[data-action="pick-harmony"][data-id="${id}"]`);
    } else if (mode === 'function') {
      for (const chord of await evaluate('state.target.chords')) {
        await click(`[data-action="focus-function"][data-id="${chord.id}"]`);
        await click(`[data-action="assign-function"][data-role="${chord.role}"]`);
      }
    } else {
      const ids = await evaluate('(state.target.progression || state.target.chords).map(chord=>chord.id)');
      for (const id of ids) await click(`[data-action="pick-${mode}"][data-id="${id}"]`);
    }
    await click('#check-answer');
    await waitFor('state.solved && !state.saving');
    if (mode === 'harmonize') {
      await click('[data-action="focus-harmony-bar"][data-bar="2"]');
      await change('#play-region', 'bar');
      assert.equal(await evaluate('state.activeBar'), 2);
      await evaluate('window.harmonyNotes = []; window.originalNote = sound.note; sound.note = function(...args) { harmonyNotes.push(args); return originalNote.apply(this,args); }');
      await click('#play-answer');
      assert.equal(await evaluate('harmonyNotes.length'), 7);
      await click('[data-cq="stop"]');
      await evaluate('sound.note = originalNote');
    }
    await snapshot(`${mode}-mobile`, 390);
    await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  }
  console.log('PASS harmony, function, progression and diatonic operations, selected-bar playback');

  await evaluate('openQuizFromHistory("chord-C-major")');
  await snapshot('chord-desktop');
  await snapshot('chord-mobile', 390);
  await click('#training-trigger');
  assert.ok(await evaluate('document.querySelector("#training-popover").getBoundingClientRect().right <= innerWidth'));
  await click('#training-trigger');
  await click('.sound-settings summary');
  assert.ok(await evaluate('document.querySelector(".sound-settings-body").getBoundingClientRect().right <= innerWidth'));
  await click('.sound-settings summary');
  await evaluate('openQuizFromHistory("scale-G-major")');
  const scale = await evaluate('state.target.notes');
  for (const pitch of scale) {
    const octave = Number(pitch.slice(-1));
    await click(`[data-cq="octave"][data-octave="${octave}"]`);
    await click(`#keyboard [data-note="${pitch.slice(0,-1)}"][data-octave="${octave}"]`);
  }
  assert.deepEqual(await evaluate('state.selected'), scale);
  await click('#check-answer');
  await waitFor('state.solved && !state.saving');
  console.log('PASS mobile layout, popovers and scale across octave ranges');

  await evaluate('openQuizFromHistory("chord-F-major")');
  await evaluate('state.selected = ["F4", "A4", "C5"]; renderAnswer(); window.originalPersist = persistAnswer; window.releaseSave = null; persistAnswer = () => new Promise((resolve,reject) => { releaseSave = () => reject(new Error("Injected save failure")); })');
  const before = await evaluate('({ score:state.score, attempts:state.attempts })');
  await click('#check-answer');
  await waitFor('state.saving');
  assert.ok(await evaluate('document.querySelector("#account-select").disabled && document.querySelector("#create-account").disabled'));
  await evaluate('releaseSave()');
  await waitFor('!state.saving');
  assert.deepEqual(await evaluate('({ score:state.score, attempts:state.attempts })'), before);
  assert.equal(await evaluate('state.solved'), false);
  assert.deepEqual(await evaluate('state.selected'), ['F4', 'A4', 'C5']);
  await evaluate('persistAnswer = originalPersist');
  await click('#check-answer');
  await waitFor('state.solved && !state.saving');
  assert.equal(await evaluate('state.attempts'), before.attempts + 1);
  console.log('PASS save failure preserves answer and score, blocks account switching, retries once');

  await evaluate(`(async () => {
    const originalPick = pickQuizForMode;
    let release;
    pickQuizForMode = () => new Promise(resolve => { release = resolve; });
    const pending = setMode('interval');
    await setMode('practice');
    release(buildQuizBank().find(quiz => quiz.id === 'interval-C-4'));
    await pending;
    pickQuizForMode = originalPick;
  })()`);
  assert.equal(await evaluate('state.target'), null);
  assert.match(await evaluate('document.querySelector("#prompt").textContent'), /鍵盤を自由に/);
  await evaluate(`(async () => {
    const originalProgress = getProgressForQuiz;
    let release;
    getProgressForQuiz = () => new Promise(resolve => { release = resolve; });
    const pending = openQuizFromHistory('chord-C-major');
    while (!release) await new Promise(resolve => setTimeout(resolve, 5));
    await setMode('practice');
    release(null);
    await pending;
    getProgressForQuiz = originalProgress;
  })()`);
  assert.equal(await evaluate('state.target'), null);
  assert.match(await evaluate('document.querySelector("#prompt").textContent'), /鍵盤を自由に/);
  console.log('PASS delayed quiz/history loads cannot overwrite a later navigation');
  assert.deepEqual(page.errors, [], 'uncaught browser errors');
  console.log(`All browser checks passed. Screenshots: ${output}`);
  }
} finally {
  page?.close();
  await browser.call('Target.disposeBrowserContext', { browserContextId });
  browser.close();
}
