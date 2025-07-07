/* ---------- DOM ELEMENTS ---------- */
const quoteDisplay = document.getElementById('quoteDisplay');
const quoteInput   = document.getElementById('quoteinput');
const timeEl       = document.getElementById('time');
const wpmEl        = document.getElementById('wpm');
const accEl        = document.getElementById('accuracy');
const restartBtn   = document.getElementById('restartBtn');
const timeSelect   = document.getElementById('timeSelect');   // ⏱ dropdown



/* ---------- WORD BANK ---------- */
let myChart = null;
let wpmData = [];
let timePoints = [];

const words = [
  "technology","keyboard","programming","future","student","function","variable","science",
  "developer","interface","network","system","digital","security","algorithm","design",
  "hardware","software","mobile","learning","project","computer","language","machine",
  "typing","speed","accuracy","practice","productivity","application","performance",
  "intelligence","data","frontend","backend","internet","command","code","framework","engineer"
];

/* ---------- STATE ---------- */
let quote          = "";
let timerRunning   = false;
let startTime      = null;
let timerInterval  = null;

/* time‑limit comes from dropdown; default equals current dropdown value */
let timeLimit = parseInt(timeSelect.value) || 30;

/* ---------- INITIALISE ---------- */
loadNewQuote();

/* ---------- EVENT LISTENERS ---------- */
timeSelect.addEventListener('change', () => {
  timeLimit = parseInt(timeSelect.value);
  if (!timerRunning) timeEl.textContent = timeLimit.toString(); // show new value before start
});

/* start timer on first keydown */
quoteInput.addEventListener('keydown', () => {
  if (!timerRunning) {
    timerRunning  = true;
    startTime     = new Date();
    timerInterval = setInterval(updateTimer, 1000);
  }
});

/* handle typing, highlight chars, detect finish */
quoteInput.addEventListener('input', () => {
  const quoteArr = quote.split('');
  const valueArr = quoteInput.value.split('');

  let correctChars = 0;
  let allCorrect   = true;

  quoteArr.forEach((ch, idx) => {
    const span = quoteDisplay.children[idx];
    const typed = valueArr[idx];

    if (typed == null) {
      span.classList.remove('correct', 'incorrect');
      allCorrect = false;
    } else if (typed === ch) {
      span.classList.add('correct');
      span.classList.remove('incorrect');
      correctChars++;
    } else {
      span.classList.add('incorrect');
      span.classList.remove('correct');
      allCorrect = false;
    }
  });

  if (allCorrect && valueArr.length === quoteArr.length) {
    clearInterval(timerInterval);
    quoteInput.disabled = true;
    finishTest(correctChars, valueArr.length);      // finished early
  }
});

/* restart */
restartBtn.addEventListener('click', loadNewQuote);

/* ---------- FUNCTIONS ---------- */

/* new random 40‑word paragraph and reset UI */
function loadNewQuote() {
  quote = generateRandomParagraph(40);
  quoteDisplay.innerHTML = '';
  quote.split('').forEach(ch => {
    const span = document.createElement('span');
    span.innerText = ch;
    quoteDisplay.appendChild(span);
  });

  quoteInput.value    = '';
  quoteInput.disabled = false;
  quoteInput.focus();

  clearInterval(timerInterval);
  timerRunning = false;
  startTime    = null;

  /* use the current dropdown value */
  timeLimit = parseInt(timeSelect.value) || 30;
  timeEl.textContent = timeLimit.toString();
  wpmEl.textContent  = '0';
  accEl.textContent  = '0';

  wpmData = [];
timePoints = [];
const canvas = document.getElementById("wpmChart");
if (myChart) {
  myChart.destroy();
  myChart = null;
}
}

/* build random paragraph */
function generateRandomParagraph(count) {
  let p = '';
  for (let i = 0; i < count; i++) {
    p += words[Math.floor(Math.random() * words.length)] + ' ';
  }
  return p.trim() + '.';
}

/* countdown every second; stop at 0 */
function updateTimer() {
  const elapsed   = Math.floor((new Date() - startTime) / 1000);
  const left      = timeLimit - elapsed;
  timeEl.textContent = left.toString();
const typedWords = quoteInput.value.trim().split(/\s+/).filter(w => w).length;
const wpmNow = Math.round((typedWords / (elapsed || 1)) * 60); // avoid div by 0

wpmData.push(wpmNow);
timePoints.push(elapsed);
  if (left <= 0) {
    clearInterval(timerInterval);
    quoteInput.disabled = true;

    /* count correct chars typed so far */
    const typedText   = quoteInput.value;
    let correctChars  = 0;
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === quote[i]) correctChars++;
    }
    finishTest(correctChars, typedText.length, timeLimit);   // timeout case
  }
}

/* calculate and display final stats */
function finishTest(correctChars, typedLen, fixedTime = null) {
  clearInterval(timerInterval);
  quoteInput.disabled = true;

  const timeTaken  = fixedTime ?? ((new Date() - startTime) / 1000);
  const wordsTyped = typedLen ? quoteInput.value.trim().split(/\s+/).length : 0;
  const wpm        = timeTaken ? Math.round((wordsTyped / timeTaken) * 60) : 0;
  const accuracy   = typedLen ? Math.round((correctChars / typedLen) * 100) : 0;

  timeEl.textContent = Math.round(timeTaken).toString();
  wpmEl.textContent  = wpm.toString();
  accEl.textContent  = accuracy.toString();

  createWPMChart();
}
function createWPMChart() {
  const ctx = document.getElementById("wpmChart").getContext("2d");

  // Clear previous chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: timePoints,
      datasets: [{
        label: "WPM over Time",
        data: wpmData,
        borderColor: "#38bdf8", // neon blue
        backgroundColor: "rgba(56, 189, 248, 0.2)",
        pointBackgroundColor: "#0ea5e9",
        fill: true,
        tension: 0.3,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Time (seconds)"
          }
        },
        y: {
          title: {
            display: true,
            text: "Words Per Minute"
          },
          min: 0
        }
      }
    }
  });
}
