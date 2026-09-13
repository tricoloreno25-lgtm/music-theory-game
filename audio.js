// Shared audio clock: sound and visual cues use the same scheduled onset.
class QuestAudio {
  constructor() {
    this.context = null;
    this.voices = new Set();
    this.timers = new Set();
    this.endTime = 0;
    this.volume = 0.6;
    this.tone = 'piano';
  }

  ensure() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.master = this.context.createGain();
      const compressor = this.context.createDynamicsCompressor();
      compressor.threshold.value = -15;
      compressor.ratio.value = 6;
      this.master.connect(compressor).connect(this.context.destination);
      this.setVolume(this.volume);
    }
    if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    return this.context;
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, Number(value)));
    if (this.master) this.master.gain.setTargetAtTime(this.volume * 0.45, this.context.currentTime, 0.02);
  }

  later(callback, seconds) {
    const timer = setTimeout(() => { this.timers.delete(timer); callback(); }, Math.max(0, seconds * 1000));
    this.timers.add(timer);
    return timer;
  }

  mark(selector, delay, duration = 0.3) {
    this.later(() => {
      document.querySelectorAll(selector).forEach(element => {
        element.classList.add('playing');
        const until = performance.now() + duration * 1000;
        element.dataset.playingUntil = String(until);
        this.later(() => {
          if (Number(element.dataset.playingUntil) <= performance.now() + 10) element.classList.remove('playing');
        }, duration);
      });
    }, delay);
  }

  note(note, octave, delay = 0, duration = 0.45, light = true, scheduledStart = null) {
    const ctx = this.ensure();
    const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    if (!names.includes(note) || !Number.isFinite(octave)) return;
    const frequency = 440 * 2 ** ((12 * (octave + 1) + names.indexOf(note) - 69) / 12);
    const start = scheduledStart ?? (ctx.currentTime + delay + 0.015);
    const tail = this.tone === 'triangle' ? 0.08 : 0.3;
    const length = Math.max(0.1, duration) + tail;
    const partials = this.tone === 'piano' ? [[1, .75], [2, .22], [3, .1], [4, .04]]
      : this.tone === 'electric' ? [[1, .8], [2, .12], [7, .035]] : [[1, .65]];
    partials.forEach(([multiple, amplitude]) => {
      const oscillator = ctx.createOscillator();
      const envelope = ctx.createGain();
      oscillator.type = this.tone === 'triangle' ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency * multiple;
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(amplitude, start + 0.009);
      envelope.gain.exponentialRampToValueAtTime(amplitude * 0.3, start + Math.min(0.18, length / 2));
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + length);
      oscillator.connect(envelope).connect(this.master);
      this.voices.add(oscillator);
      oscillator.onended = () => { this.voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
      oscillator.start(start);
      oscillator.stop(start + length + 0.02);
    });
    this.endTime = Math.max(this.endTime, start + length);
    if (light) this.mark(`[data-note="${note}"][data-octave="${octave}"], [data-demo-pitch="${note}${octave}"]`, start - ctx.currentTime, duration);
  }

  stop() {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    this.voices.forEach(voice => { try { voice.stop(); } catch {} });
    this.voices.clear();
    this.endTime = this.context?.currentTime || 0;
    document.querySelectorAll('.playing').forEach(element => element.classList.remove('playing'));
  }
}

const sound = new QuestAudio();
