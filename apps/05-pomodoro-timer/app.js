const storageKey = 'pomo.state';

const modeLabel = document.getElementById('mode');
const clock = document.getElementById('clock');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const workInput = document.getElementById('work');
const breakInput = document.getElementById('break');
const sessionsValue = document.getElementById('sessions');
const logElement = document.getElementById('log');

let state = JSON.parse(
  localStorage.getItem(storageKey) ||
    '{"work":25,"break":5,"done":0,"logs":[]}'
);

let currentMode = 'focus';
let remaining = state.work * 60;
let running = false;
let timerId = null;

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function render() {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  clock.textContent = minutes + ':' + String(seconds).padStart(2, '0');
  modeLabel.textContent = currentMode === 'focus' ? 'Focus time' : 'Break time';
  sessionsValue.textContent = state.done;
  startButton.textContent = running ? 'Pause' : 'Start';

  logElement.innerHTML =
    state.logs
      .slice(0, 8)
      .map(item => '<p class="muted">' + item + '</p>')
      .join('') ||
    '<p class="muted">No completed focus sessions yet.</p>';
}

function playAlert() {
  if (navigator.vibrate) {
    navigator.vibrate([120, 70, 120]);
  }
}

function finishRound() {
  playAlert();

  if (currentMode === 'focus') {
    state.done++;
    state.logs.unshift(
      new Date().toLocaleString() + ' — focus session complete'
    );

    currentMode = 'break';
    remaining = state.break * 60;
  } else {
    currentMode = 'focus';
    remaining = state.work * 60;
  }

  save();
  render();
}

function tick() {
  if (remaining <= 1) {
    clearInterval(timerId);
    timerId = null;
    running = false;
    finishRound();
    return;
  }

  remaining--;
  render();
}

startButton.onclick = () => {
  running = !running;

  if (running) {
    timerId = setInterval(tick, 1000);
  } else {
    clearInterval(timerId);
    timerId = null;
  }

  render();
};

resetButton.onclick = () => {
  clearInterval(timerId);
  timerId = null;
  running = false;
  currentMode = 'focus';
  remaining = state.work * 60;
  render();
};

function saveSettings() {
  state.work = Math.max(1, Number(workInput.value) || 25);
  state.break = Math.max(1, Number(breakInput.value) || 5);

  save();

  if (!running) {
    resetButton.click();
  }
}

workInput.value = state.work;
breakInput.value = state.break;

workInput.onchange = saveSettings;
breakInput.onchange = saveSettings;

render();
