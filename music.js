(function () {
  let ctx = null;
  let masterGain = null;
  let dryGain = null;
  let wetGain = null;
  let scheduleTimer = null;
  let nextBeatTime = 0;
  let beatIndex = 0;
  let isPlaying = false;

  // C major pentatonic frequencies
  const F = {
    C3: 130.81, G3: 196.00, A3: 220.00,
    C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
  };

  // [melody, harmony, bass, duration_in_beats]
  const SCORE = [
    [F.E5, F.C5, F.C3, 2],
    [F.D5, F.A4, null, 1],
    [F.C5, F.G4, null, 1],
    [F.G5, F.E5, F.G3, 2],
    [F.E5, F.C5, null, 1],
    [F.D5, F.A4, null, 1],
    [F.A5, F.E5, F.A3, 2],
    [F.G5, F.D5, null, 1],
    [F.E5, F.C5, null, 1],
    [F.G5, F.E5, F.C3, 2],
    [F.A5, F.E5, null, 1],
    [F.G5, F.D5, null, 1],
    [F.E5, F.C5, F.G3, 4],
  ];

  const BEAT = 0.72; // seconds per beat

  function createReverb() {
    const len = ctx.sampleRate * 2.8;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
      }
    }
    const conv = ctx.createConvolver();
    conv.buffer = buf;
    return conv;
  }

  function playTone(freq, vol, start, dur) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);

    const atk = 0.12;
    const rel = Math.min(0.35, dur * 0.35);
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(vol, start + atk);
    env.gain.setValueAtTime(vol, start + dur - rel);
    env.gain.linearRampToValueAtTime(0, start + dur);

    osc.connect(env);
    env.connect(dryGain);
    env.connect(wetGain);
    osc.start(start);
    osc.stop(start + dur + 0.1);
  }

  function scheduler() {
    while (nextBeatTime < ctx.currentTime + 0.35) {
      const [mel, harm, bass, beats] = SCORE[beatIndex % SCORE.length];
      const dur = beats * BEAT;
      playTone(mel,  0.11, nextBeatTime, dur);
      if (harm) playTone(harm, 0.07, nextBeatTime, dur);
      if (bass) playTone(bass, 0.05, nextBeatTime, dur);
      nextBeatTime += dur;
      beatIndex++;
    }
    scheduleTimer = setTimeout(scheduler, 120);
  }

  function initAudio() {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.9;

    const reverb = createReverb();
    dryGain = ctx.createGain();
    wetGain = ctx.createGain();
    dryGain.gain.value = 0.55;
    wetGain.gain.value = 0.45;

    dryGain.connect(masterGain);
    wetGain.connect(reverb);
    reverb.connect(masterGain);
    masterGain.connect(ctx.destination);
  }

  function startMusic() {
    if (isPlaying) return;
    if (!ctx) initAudio();
    if (ctx.state === "suspended") ctx.resume();
    beatIndex = 0;
    nextBeatTime = ctx.currentTime + 0.2;
    scheduler();
    isPlaying = true;
    btn.classList.add("playing");
    btn.setAttribute("aria-label", "עצור מוזיקת רקע");
  }

  function stopMusic() {
    clearTimeout(scheduleTimer);
    isPlaying = false;
    btn.classList.remove("playing");
    btn.setAttribute("aria-label", "הפעל מוזיקת רקע");
    if (masterGain) {
      masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
      setTimeout(() => { if (masterGain) masterGain.gain.value = 0.9; }, 2000);
    }
  }

  // Floating toggle button
  const btn = document.createElement("button");
  btn.id = "music-toggle";
  btn.title = "מוזיקת רקע";
  btn.setAttribute("aria-label", "הפעל מוזיקת רקע");
  btn.innerHTML = "&#9835;";
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    isPlaying ? stopMusic() : startMusic();
  });

  // Try autoplay on load; start on first interaction if browser blocks it
  function tryAutoplay() {
    initAudio();
    if (ctx.state === "running") {
      beatIndex = 0;
      nextBeatTime = ctx.currentTime + 0.2;
      scheduler();
      isPlaying = true;
      btn.classList.add("playing");
      btn.setAttribute("aria-label", "עצור מוזיקת רקע");
    } else {
      const EVT = ["click", "touchstart", "keydown"];
      function onFirst() {
        EVT.forEach((e) => document.removeEventListener(e, onFirst));
        startMusic();
      }
      EVT.forEach((e) => document.addEventListener(e, onFirst, { once: true }));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryAutoplay);
  } else {
    tryAutoplay();
  }
})();
