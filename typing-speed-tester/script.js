// Typing Speed Tester — FINAL with name & countdown end behavior
(() => {
  /* ---------- Texts & Words ---------- */
  const texts = [
    "Practice makes progress. Keep typing and improve your speed and accuracy.",
    "The quick brown fox jumps over the lazy dog. A classic pangram for typing exercises.",
    "In the heart of the city, bright lights danced across the river. Typing helps build focus."
  ];

  const wordsPool = [
    "apple","banana","orange","grape","kiwi","mango","lemon","lime","cherry","berry","peach","plum",
    "keyboard","typing","speed","focus","practice","progress","coding","javascript","python","design",
    "random","words","challenge","sprint","game","arcade"
  ];

  function randomWords(count = 35) {
    const out = [];
    for (let i=0;i<count;i++) out.push(wordsPool[Math.floor(Math.random()*wordsPool.length)]);
    return out.join(" ");
  }

  /* ---------- DOM ---------- */
  const playerNameInput = document.getElementById("player-name");
  const display = document.getElementById("display-text");
  const inputBox = document.getElementById("input-box");
  const timeLeftEl = document.getElementById("time-left");
  const wpmEl = document.getElementById("wpm");
  const accuracyEl = document.getElementById("accuracy");
  const errorsEl = document.getElementById("errors");
  const restartBtn = document.getElementById("restart-btn");
  const textSelect = document.getElementById("text-select");
  const timeSelect = document.getElementById("time-select");
  const results = document.getElementById("results");
  const finalPlayer = document.getElementById("final-player");
  const finalWpm = document.getElementById("final-wpm");
  const finalAccuracy = document.getElementById("final-accuracy");
  const correctCharsEl = document.getElementById("correct-chars");
  const bestWpmEl = document.getElementById("best-wpm");

  const themeToggle = document.getElementById("theme-toggle");
  const leaderboardOpen = document.getElementById("leaderboard-open");
  const leaderboardModal = document.getElementById("leaderboard-modal");
  const leaderboardClose = document.getElementById("leaderboard-close");
  const leaderboardList = document.getElementById("leaderboard-list");
  const clearLeaderboardBtn = document.getElementById("clear-leaderboard");

  const countdownOverlay = document.getElementById("countdown-overlay");
  const countdownNumber = document.getElementById("countdown-number");
  const countdownBtn = document.getElementById("countdown-btn");

  const timerFront = document.getElementById("timer-front");
  const container = document.getElementById("container");

  /* ---------- Audio (ensure files exist) ---------- */
  const correctSound = new Audio("sounds/correct.mp3");
  const wrongSound = new Audio("sounds/wrong.mp3");
  const countdownBeep = new Audio("sounds/count_beep.mp3");
  const finalFanfare = new Audio("sounds/final_fanfare.mp3"); // optional

  correctSound.volume = 0.22;
  wrongSound.volume = 0.28;
  countdownBeep.volume = 0.35;
  finalFanfare.volume = 0.25;

  /* ---------- Timer ring ---------- */
  const R = 48;
  const CIRC = 2 * Math.PI * R;
  if (timerFront) {
    timerFront.style.strokeDasharray = `${CIRC}`;
    timerFront.style.strokeDashoffset = `${0}`;
  }

  /* ---------- State ---------- */
  let currentText = "";
  let timer = null;
  let totalDuration = parseInt(timeSelect.value, 10);
  let timeLeft = totalDuration;
  let started = false;
  let totalTyped = 0;
  let correctChars = 0;
  let errors = 0;
  let streak = 0;
  let lastCorrectTimestamp = 0;

  /* ---------- Utilities ---------- */
  function loadText(idx) {
    if (parseInt(idx) === 3) currentText = randomWords(40);
    else currentText = texts[idx] || texts[0];
    display.innerHTML = "";
    // add spans
    for (let ch of currentText) {
      const span = document.createElement("span");
      span.textContent = ch;
      display.appendChild(span);
    }
    // ensure scroll reset
    display.scrollTop = 0;
  }

  function resetState() {
    clearInterval(timer);
    totalDuration = parseInt(timeSelect.value, 10);
    timeLeft = totalDuration;
    timeLeftEl.textContent = timeLeft;
    inputBox.value = "";
    started = false;
    totalTyped = 0;
    correctChars = 0;
    errors = 0;
    streak = 0;
    lastCorrectTimestamp = 0;
    finalWpm.textContent = "0";
    finalAccuracy.textContent = "0";
    results.hidden = true;
    updateBest();
    // reset spans classes
    const spans = display.querySelectorAll("span");
    spans.forEach(s => { s.className = ""; s.style.transition = "120ms"; });
    timerFront.style.strokeDashoffset = 0;
  }

  function updateStats() {
    const minutes = (totalDuration - timeLeft) / 60 || 1/60;
    const words = correctChars / 5;
    const wpm = Math.round(words / minutes) || 0;
    wpmEl.textContent = wpm;
    const accuracy = totalTyped === 0 ? 100 : Math.max(0, Math.round((correctChars / totalTyped) * 100));
    accuracyEl.textContent = accuracy;
    errorsEl.textContent = errors;
    correctCharsEl.textContent = correctChars;
  }

  function updateTimerVisual() {
    const fraction = (totalDuration - timeLeft) / totalDuration;
    timerFront.style.strokeDashoffset = Math.max(0, CIRC * (1 - fraction));
    if (fraction >= 0.9) timerFront.style.stroke = "var(--wrong)"; else timerFront.style.stroke = "var(--accent)";
  }

  function startTimerLoop() {
    const endAt = Date.now() + timeLeft * 1000;
    timer = setInterval(() => {
      const now = Date.now();
      const secLeft = Math.max(0, Math.ceil((endAt - now) / 1000));
      timeLeft = secLeft;
      timeLeftEl.textContent = timeLeft;
      updateStats();
      updateTimerVisual();
      if (timeLeft <= 0) finishTest();
    }, 250);
  }

  function finishTest() {
    clearInterval(timer);
    updateStats();
    results.hidden = false;

    // final result display
    finalPlayer.textContent = playerNameInput.value.trim() || "Anonymous";
    finalWpm.textContent = wpmEl.textContent;
    finalAccuracy.textContent = accuracyEl.textContent;
    correctCharsEl.textContent = correctChars;

    // Save to leaderboard (name|wpm|date)
    const name = (playerNameInput.value || "Anonymous").trim() || "Anonymous";
    const currentWpm = parseInt(wpmEl.textContent, 10) || 0;
    let board = JSON.parse(localStorage.getItem("typing_leaderboard") || "[]");
    if (currentWpm > 0) {
      board.push({ name, wpm: currentWpm, time: new Date().toISOString() });
      board.sort((a, b) => b.wpm - a.wpm);
      board = board.slice(0, 5);
      localStorage.setItem("typing_leaderboard", JSON.stringify(board));
      try { finalFanfare.currentTime = 0; finalFanfare.play().catch(()=>{}); } catch(e){}
    }
    updateBest();
  }

  /* ---------- Input handling ---------- */
  function createParticle(x, y, color) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.background = color;
    display.appendChild(p);
    const dx = (Math.random()-0.5)*120;
    const dy = - (40 + Math.random()*80);
    p.animate([
      { transform:`translate3d(0,0,0)`, opacity:1 },
      { transform:`translate3d(${dx}px, ${dy}px,0) scale(0.4)`, opacity:0 }
    ], { duration:700 + Math.random()*300, easing:"cubic-bezier(.16,.84,.24,1)" });
    setTimeout(()=> p.remove(), 1100);
  }

  function handleInput() {
    // require name before starting: if not provided, block start
    const nameTrim = (playerNameInput.value || "").trim();
    if (!nameTrim) {
      // refuse to start automatically — show small highlight and focus
      playerNameInput.style.border = "1px solid #ff7b7b";
      playerNameInput.focus();
      return;
    } else {
      playerNameInput.style.border = "";
    }

    const typed = inputBox.value;
    totalTyped = typed.length;
    correctChars = 0;
    errors = 0;
    const spans = display.querySelectorAll("span");

    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      const expected = span.textContent;
      const typedChar = typed[i];
      span.className = "";
      span.style.transition = "120ms";
      if (typedChar == null) continue;
      if (typedChar === expected) {
        span.classList.add("mark-correct");
        correctChars++;
        // glow + particle + sound
        container.classList.add("typing-glow");
        setTimeout(()=> container.classList.remove("typing-glow"), 120);
        try { correctSound.currentTime = 0; correctSound.play().catch(()=>{}); } catch(e){}
        const rect = span.getBoundingClientRect();
        const parentRect = display.getBoundingClientRect();
        createParticle(rect.left - parentRect.left + rect.width/2, rect.top - parentRect.top + rect.height/2, getComputedStyle(document.documentElement).getPropertyValue('--correct') || '#7ef7a0');
        const now = Date.now();
        if (now - lastCorrectTimestamp < 1500) streak++; else streak = 1;
        lastCorrectTimestamp = now;
      } else {
        span.classList.add("mark-wrong");
        errors++;
        try { wrongSound.currentTime = 0; wrongSound.play().catch(()=>{}); } catch(e){}
        streak = 0;
      }
    }

    if (typed.length > currentText.length) {
      errors += (typed.length - currentText.length);
    }

    updateStats();
  }

  /* ---------- Countdown (5..1 -> Go -> END) ---------- */
  let countdownRunning = false;
  async function startCountdownSequence() {
    // require a player name before countdown
    const nameTrim = (playerNameInput.value || "").trim();
    if (!nameTrim) {
      playerNameInput.style.border = "1px solid #ff7b7b";
      playerNameInput.focus();
      return;
    } else {
      playerNameInput.style.border = "";
    }

    // ensure modal closed
    leaderboardModal.classList.add("hidden");

    countdownOverlay.classList.remove("hidden");
    countdownRunning = true;

    const seq = ["5","4","3","2","1","Go!"];
    for (let i=0;i<seq.length;i++){
      countdownNumber.textContent = seq[i];
      countdownNumber.classList.remove("countdown-go");
      countdownNumber.style.opacity = "1";
      countdownNumber.style.transform = "scale(1)";

      // play beep on numbers and GO
      try { countdownBeep.currentTime = 0; countdownBeep.play().catch(()=>{}); } catch(e){}

      if (seq[i] === "Go!") {
        countdownNumber.classList.add("countdown-go");
      }

      // show each for 1000ms
      await new Promise(r => setTimeout(r, 1000));
      // fade
      countdownNumber.style.opacity = "0";
      countdownNumber.style.transform = "scale(0.6)";
      await new Promise(r => setTimeout(r, 150));
    }

    countdownOverlay.classList.add("hidden");
    countdownRunning = false;

    // AFTER countdown: immediately end the game and store the (possibly zero) score
    // We call finishTest() to show results and record leaderboard entry with player's name
    // Prepare display and stats quickly (load text then immediately finish)
    loadText(parseInt(textSelect.value));
    resetState();
    updateStats(); // show initial stats (all zero)
    // Immediately show final results (player name + score)
    finishTest();
  }

  /* ---------- Leaderboard rendering ---------- */
  function renderLeaderboard() {
    const board = JSON.parse(localStorage.getItem("typing_leaderboard") || "[]");
    leaderboardList.innerHTML = "";
    if (!board || board.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.style.padding = "8px 0";
      td.style.color = "var(--muted)";
      td.textContent = "No scores yet — play to record!";
      tr.appendChild(td);
      leaderboardList.appendChild(tr);
      return;
    }
    board.forEach((row, idx) => {
      const tr = document.createElement("tr");
      tr.style.borderTop = "1px solid rgba(255,255,255,0.03)";
      const rank = document.createElement("td"); rank.style.padding = "8px 0"; rank.textContent = idx+1;
      const nameTd = document.createElement("td"); nameTd.style.padding="8px 0"; nameTd.textContent=row.name || "Anonymous";
      const wpmTd = document.createElement("td"); wpmTd.style.padding="8px 0"; wpmTd.textContent=row.wpm;
      const dateTd = document.createElement("td"); dateTd.style.padding="8px 0"; dateTd.textContent = new Date(row.time).toLocaleString();
      tr.appendChild(rank); tr.appendChild(nameTd); tr.appendChild(wpmTd); tr.appendChild(dateTd);
      leaderboardList.appendChild(tr);
    });
  }

  function updateBest() {
    const board = JSON.parse(localStorage.getItem("typing_leaderboard") || "[]");
    bestWpmEl.textContent = board.length ? board[0].wpm + " WPM" : "—";
  }

  /* ---------- Theme ---------- */
  function applyTheme() {
    const theme = localStorage.getItem("typing_theme") || "dark";
    if (theme === "light") {
      document.documentElement.classList.add("light");
      themeToggle.textContent = "🌞";
    } else {
      document.documentElement.classList.remove("light");
      themeToggle.textContent = "🌙";
    }
  }

  /* ---------- Event wiring ---------- */
  textSelect.addEventListener("change", ()=> { loadText(parseInt(textSelect.value)); resetState(); });
  timeSelect.addEventListener("change", ()=> { resetState(); });
  inputBox.addEventListener("input", ()=> {
    // block auto-start if no name
    const nameTrim = (playerNameInput.value || "").trim();
    if (!nameTrim) {
      playerNameInput.style.border = "1px solid #ff7b7b";
      playerNameInput.focus();
      return;
    } else {
      playerNameInput.style.border = "";
    }

    if (!started && !countdownRunning) {
      started = true;
      startTimerLoop();
    }
    handleInput();
  });

  restartBtn.addEventListener("click", ()=> { resetState(); inputBox.focus(); });
  countdownBtn.addEventListener("click", ()=> { if (!countdownRunning) startCountdownSequence(); });

  themeToggle.addEventListener("click", ()=> {
    const isLight = document.documentElement.classList.toggle("light");
    localStorage.setItem("typing_theme", isLight ? "light" : "dark");
    applyTheme();
  });

  leaderboardOpen.addEventListener("click", ()=> { renderLeaderboard(); leaderboardModal.classList.remove("hidden"); });
  leaderboardClose.addEventListener("click", ()=> { leaderboardModal.classList.add("hidden"); });
  clearLeaderboardBtn.addEventListener("click", ()=> { localStorage.removeItem("typing_leaderboard"); renderLeaderboard(); updateBest(); });

  /* ---------- Init ---------- */
  loadText(0);
  resetState();
  applyTheme();
  updateBest();

  /* ---------- Auto-scroll caret support ---------- */
  inputBox.addEventListener("keyup", ()=> {
    const caretIndex = inputBox.value.length;
    const spans = display.querySelectorAll("span");
    if (caretIndex >= spans.length) display.scrollTop = display.scrollHeight;
    else if (spans[caretIndex]) {
      const s = spans[caretIndex];
      const offsetTop = s.offsetTop;
      if (offsetTop > display.clientHeight - 80) display.scrollTop = offsetTop - 60;
    }
  });

})();
