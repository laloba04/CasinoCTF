// Web Audio API sound engine — no external files needed
// AudioContext is created lazily on first call to avoid autoplay policy errors

let ctx = null;

function getCtx() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function osc(freq, type, start, dur, gainStart, gainEnd) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(gainStart, start);
  g.gain.exponentialRampToValueAtTime(Math.max(gainEnd, 0.001), start + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(start);
  o.stop(start + dur);
}

function noise(start, dur, gainVal) {
  const c = getCtx();
  if (!c) return;
  const bufSize = c.sampleRate * dur;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(gainVal, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  src.connect(g);
  g.connect(c.destination);
  src.start(start);
}

export const sounds = {
  cardDeal() {
    try {
      const c = getCtx(); if (!c) return;
      const t = c.currentTime;
      osc(900, 'sine', t, 0.04, 0.15, 0.001);
      osc(600, 'sine', t + 0.02, 0.04, 0.1, 0.001);
      noise(t, 0.06, 0.04);
    } catch {}
  },

  chipBet() {
    try {
      const c = getCtx(); if (!c) return;
      const t = c.currentTime;
      osc(1200, 'sine', t, 0.03, 0.2, 0.001);
      osc(800, 'sine', t + 0.01, 0.03, 0.1, 0.001);
      noise(t, 0.04, 0.06);
    } catch {}
  },

  buttonClick() {
    try {
      const c = getCtx(); if (!c) return;
      osc(600, 'sine', c.currentTime, 0.03, 0.08, 0.001);
    } catch {}
  },

  win() {
    try {
      const c = getCtx(); if (!c) return;
      const t = c.currentTime;
      [523, 659, 784].forEach((freq, i) => osc(freq, 'sine', t + i * 0.12, 0.15, 0.25, 0.001));
    } catch {}
  },

  bigWin() {
    try {
      const c = getCtx(); if (!c) return;
      const t = c.currentTime;
      [523, 659, 784, 1047, 1319].forEach((freq, i) => {
        osc(freq, 'sine', t + i * 0.1, 0.18, 0.3, 0.001);
        osc(freq * 2, 'sine', t + i * 0.1, 0.08, 0.08, 0.001);
      });
    } catch {}
  },

  lose() {
    try {
      const c = getCtx(); if (!c) return;
      const t = c.currentTime;
      osc(392, 'sawtooth', t, 0.15, 0.2, 0.001);
      osc(330, 'sawtooth', t + 0.15, 0.2, 0.2, 0.001);
    } catch {}
  },

  push() {
    try {
      const c = getCtx(); if (!c) return;
      osc(440, 'sine', c.currentTime, 0.2, 0.15, 0.001);
    } catch {}
  },

  diceRoll() {
    try {
      const c = getCtx(); if (!c) return;
      const t = c.currentTime;
      for (let i = 0; i < 6; i++) {
        noise(t + i * 0.05, 0.04, 0.15);
        osc(200 + Math.random() * 300, 'square', t + i * 0.05, 0.04, 0.1, 0.001);
      }
    } catch {}
  },

  rouletteStart() {
    try {
      const c = getCtx(); if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(80, t);
      o.frequency.linearRampToValueAtTime(300, t + 0.8);
      g.gain.setValueAtTime(0.1, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.8);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 1.0);
    } catch {}
  },

  rouletteStop() {
    try {
      const c = getCtx(); if (!c) return;
      const t = c.currentTime;
      for (let i = 0; i < 4; i++) {
        noise(t + i * 0.08, 0.06, 0.12 - i * 0.025);
        osc(400 - i * 50, 'sine', t + i * 0.08, 0.06, 0.1, 0.001);
      }
    } catch {}
  },

  slotsSpin() {
    try {
      const c = getCtx(); if (!c) return;
      let active = true;
      let next = c.currentTime;
      const tick = () => {
        if (!active) return;
        try {
          noise(next, 0.03, 0.06);
          osc(150 + Math.random() * 100, 'square', next, 0.03, 0.05, 0.001);
          next += 0.07;
          setTimeout(tick, 60);
        } catch {}
      };
      tick();
      return () => { active = false; };
    } catch { return () => {}; }
  },

  slotsWin() {
    try {
      const c = getCtx(); if (!c) return;
      const t = c.currentTime;
      const melody = [523, 784, 659, 1047, 880, 1319];
      melody.forEach((freq, i) => osc(freq, 'sine', t + i * 0.09, 0.12, 0.3, 0.001));
    } catch {}
  },
};
