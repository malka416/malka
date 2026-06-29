(function () {
  let ctx = null;
  let masterGain = null;
  let scheduleTimer = null;
  let nextNoteTime = 0;
  let noteIndex = 0;
  let isPlaying = false;

  // Soft pentatonic melody (C5 pentatonic: C D E G A)
  const NOTES = [
    523.25, 587.33, 659.25, 783.99, 880.00,
    783.99, 659.25, 587.33, 523.25, 587.33,
    659.25, 783.99, 880.00, 783.99, 659.25,
    523.25,
  ];
  const DURATIONS = [
    0.6, 0.4, 0.6, 0.8, 1.0,
    0.6, 0.6, 0.4, 0.8, 0.6,
    0.4, 0.6, 1.0, 0.6, 0.6,
    1.2,
  ];
  const TEMPO = 1.05;

  function playNote(freq, startTime, duration) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(0.13, startTime + 0.08);
    env.gain.exponentialRampToValueAtTime(0.04, startTime + duration * 0.8);
    env.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(env);
    env.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  function scheduler() {
    const LOOKAHEAD = 0.12;
    const SCHEDULE_WINDOW = 0.3;

    while (nextNoteTime < ctx.currentTime + SCHEDULE_WINDOW) {
      const i = noteIndex % NOTES.length;
      playNote(NOTES[i], nextNoteTime, DURATIONS[i] * TEMPO * 0.9);
      nextNoteTime += DURATIONS[i] * TEMPO;
      noteIndex++;
    }

    scheduleTimer = setTimeout(scheduler, LOOKAHEAD * 1000);
  }

  function startMusic() {
    if (isPlaying) return;
    if (!ctx) {
      ctx = new AudioContext();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    noteIndex = 0;
    nextNoteTime = ctx.currentTime + 0.15;
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
      masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      setTimeout(() => { if (masterGain) masterGain.gain.value = 0.7; }, 1500);
    }
  }

  // Build the floating toggle button
  const btn = document.createElement("button");
  btn.id = "music-toggle";
  btn.title = "מוזיקת רקע";
  btn.setAttribute("aria-label", "הפעל מוזיקת רקע");
  btn.innerHTML = "&#9835;";
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    isPlaying ? stopMusic() : startMusic();
  });

  // Auto-start: try immediately, fall back to first user interaction
  function tryAutoplay() {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);

    if (ctx.state === "running") {
      // Browser allows autoplay
      noteIndex = 0;
      nextNoteTime = ctx.currentTime + 0.15;
      scheduler();
      isPlaying = true;
      btn.classList.add("playing");
      btn.setAttribute("aria-label", "עצור מוזיקת רקע");
    } else {
      // Blocked — start on first interaction anywhere on the page
      const events = ["click", "touchstart", "keydown"];
      function onFirstInteraction() {
        events.forEach((e) => document.removeEventListener(e, onFirstInteraction));
        startMusic();
      }
      events.forEach((e) => document.addEventListener(e, onFirstInteraction, { once: true }));
    }
  }

  // Wait for DOM ready then attempt autoplay
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryAutoplay);
  } else {
    tryAutoplay();
  }
})();
