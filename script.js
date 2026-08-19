(() => {
  "use strict";

  const audio = document.getElementById("audio");
  const recordBtn = document.getElementById("recordBtn");
  const tonearm = document.getElementById("tonearm");
  const playBtn = document.getElementById("playBtn");
  const iconPlay = document.getElementById("iconPlay");
  const iconPause = document.getElementById("iconPause");
  const seek = document.getElementById("seek");
  const volume = document.getElementById("volume");
  const curTimeEl = document.getElementById("curTime");
  const durTimeEl = document.getElementById("durTime");
  const statCount = document.getElementById("statCount");
  const statTime = document.getElementById("statTime");

  const STORAGE_KEYS = {
    count: "baladeADeux_playCount",
    seconds: "baladeADeux_totalSeconds"
  };

  const state = {
    playCount: parseInt(localStorage.getItem(STORAGE_KEYS.count) || "0", 10),
    totalSeconds: parseFloat(localStorage.getItem(STORAGE_KEYS.seconds) || "0"),
    lastTime: 0,
    countedThisRun: false
  };

  function formatClock(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function formatHours(totalSec) {
    const totalMinutes = totalSec / 60;
    const h = Math.floor(totalMinutes / 60);
    const m = Math.round(totalMinutes % 60);
    if (h === 0) return `0h ${m.toString().padStart(2, "0")}`;
    return `${h}h ${m.toString().padStart(2, "0")}`;
  }

  function renderStats() {
    statCount.textContent = state.playCount.toString();
    statTime.textContent = formatHours(state.totalSeconds);
  }

  function persistStats() {
    localStorage.setItem(STORAGE_KEYS.count, String(state.playCount));
    localStorage.setItem(STORAGE_KEYS.seconds, String(state.totalSeconds));
  }

  function setPlayingUI(isPlaying) {
    recordBtn.classList.toggle("playing", isPlaying);
    recordBtn.setAttribute("aria-pressed", String(isPlaying));
    tonearm.classList.toggle("engaged", isPlaying);
    iconPlay.hidden = isPlaying;
    iconPause.hidden = !isPlaying;
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  recordBtn.addEventListener("click", togglePlay);
  playBtn.addEventListener("click", togglePlay);

  audio.addEventListener("play", () => {
    setPlayingUI(true);
    if (!state.countedThisRun && audio.currentTime < 1.2) {
      state.playCount += 1;
      state.countedThisRun = true;
      persistStats();
      renderStats();
    }
    state.lastTime = audio.currentTime;
  });

  audio.addEventListener("pause", () => {
    setPlayingUI(false);
    persistStats();
  });

  audio.addEventListener("ended", () => {
    setPlayingUI(false);
    state.countedThisRun = false;
    persistStats();
  });

  audio.addEventListener("timeupdate", () => {
    const now = audio.currentTime;
    const delta = now - state.lastTime;
    // ignore backward jumps (seeks) and large forward jumps (also seeks)
    if (delta > 0 && delta < 2) {
      state.totalSeconds += delta;
      renderStats();
      // throttle writes a little by only persisting on whole-ish seconds
      if (Math.floor(now) % 2 === 0) persistStats();
    }
    state.lastTime = now;

    if (now < 1.2) state.countedThisRun = state.countedThisRun; // no-op, keep flag until real restart
    if (audio.duration) {
      seek.value = (now / audio.duration) * 100;
      seek.style.setProperty("--fill", seek.value + "%");
    }
    curTimeEl.textContent = formatClock(now);
  });

  audio.addEventListener("loadedmetadata", () => {
    durTimeEl.textContent = formatClock(audio.duration);
  });

  audio.addEventListener("seeked", () => {
    // allow a fresh count if the listener rewound to the very start and replays
    if (audio.currentTime < 0.5) state.countedThisRun = false;
    state.lastTime = audio.currentTime;
  });

  seek.addEventListener("input", () => {
    if (audio.duration) {
      audio.currentTime = (parseFloat(seek.value) / 100) * audio.duration;
    }
  });

  volume.addEventListener("input", () => {
    audio.volume = parseFloat(volume.value);
  });

  // Persist periodically so background/locked playback isn't lost if the tab dies
  setInterval(persistStats, 5000);
  document.addEventListener("visibilitychange", persistStats);
  window.addEventListener("pagehide", persistStats);
  window.addEventListener("beforeunload", persistStats);

  // Lock-screen / notification controls so playback can be driven and tracked
  // while the phone is locked and the browser tab stays open in the background.
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Balade à deux",
      artist: "Mastu",
      album: "Balade à deux",
      artwork: [
        { src: "assets/vinyl.jpg", sizes: "900x900", type: "image/jpeg" }
      ]
    });
    navigator.mediaSession.setActionHandler("play", () => audio.play().catch(() => {}));
    navigator.mediaSession.setActionHandler("pause", () => audio.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 10);
    });
  }

  // Register the service worker so the page (and the song) can be
  // added to the home screen and opened without a fresh network fetch.
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  // Gently falling petals — purely decorative, generated with a little
  // randomness so the drift never looks mechanical.
  (function petals() {
    const field = document.getElementById("petalField");
    if (!field) return;
    const colors = ["c-lavender", "c-teal", "c-gold", "c-cream"];
    const count = window.matchMedia("(max-width: 480px)").matches ? 6 : 9;
    for (let i = 0; i < count; i++) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 20 26");
      svg.classList.add("petal", colors[i % colors.length]);
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#ic-petal");
      svg.appendChild(use);

      const left = Math.random() * 100;
      const size = 10 + Math.random() * 12;
      const duration = 14 + Math.random() * 12;
      const delay = -Math.random() * duration;
      const driftX = (Math.random() * 140 - 70).toFixed(0) + "px";

      svg.style.left = left + "vw";
      svg.style.width = size + "px";
      svg.style.height = (size * 1.3) + "px";
      svg.style.animationDuration = duration + "s";
      svg.style.animationDelay = delay + "s";
      svg.style.setProperty("--drift-x", driftX);

      field.appendChild(svg);
    }
  })();

  renderStats();
})();
