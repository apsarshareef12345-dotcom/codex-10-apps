const STORAGE_KEY = 'focus-galaxy-state-v1';

const $ = (id) => document.getElementById(id);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved) {
      return {
        work: Number(saved.work) || 25,
        break: Number(saved.break) || 5,
        done: Number(saved.done) || 0,
        logs: Array.isArray(saved.logs) ? saved.logs : []
      };
    }
  } catch (error) {
    console.warn('Could not load timer data.', error);
  }

  return {
    work: 25,
    break: 5,
    done: 0,
    logs: []
  };
}

let state = loadState();
let mode = 'focus';
let remaining = state.work * 60;
let running = false;
let timerId = null;

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function displayTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;

  return `${minutes}:${String(secondsLeft).padStart(2, '0')}`;
}

function render() {
  $('clock').textContent = displayTime(remaining);

  $('mode').textContent =
    mode === 'focus'
      ? 'Focus time'
      : 'Break time — you earned it!';

  $('start').textContent =
    running
      ? 'Pause'
      : mode === 'focus'
        ? 'Start focus'
        : 'Start break';

  $('sessions').textContent = state.done;
  $('work').value = state.work;
  $('break').value = state.break;

  $('log').innerHTML = state.logs.length
    ? state.logs
        .slice(0, 10)
        .map((entry) => `<p>${entry}</p>`)
        .join('')
    : '<p>Your completed focus missions will appear here.</p>';
}

function playAlert() {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.35
    );

    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
  } catch (error) {
    // Timer still works if the browser blocks sound.
  }
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  running = false;
}

function completeRound() {
  stopTimer();
  playAlert();

  if (mode === 'focus') {
    state.done += 1;

    state.logs.unshift(
      `${new Date().toLocaleString()} — focus session complete`
    );

    state.logs = state.logs.slice(0, 20);

    mode = 'break';
    remaining = state.break * 60;
  } else {
    mode = 'focus';
    remaining = state.work * 60;
  }

  save();
  render();
}

function tick() {
  if (remaining <= 1) {
    completeRound();
  } else {
    remaining -= 1;
    render();
  }
}

$('start').addEventListener('click', () => {
  if (running) {
    stopTimer();
  } else {
    running = true;
    timerId = setInterval(tick, 1000);
  }

  render();
});

$('reset').addEventListener('click', () => {
  stopTimer();
  mode = 'focus';
  remaining = state.work * 60;
  render();
});

function updateSettings() {
  state.work = Math.min(90, Math.max(1, Number($('work').value) || 25));
  state.break = Math.min(60, Math.max(1, Number($('break').value) || 5));

  save();

  if (!running) {
    mode = 'focus';
    remaining = state.work * 60;
  }

  render();
}

$('work').addEventListener('change', updateSettings);
$('break').addEventListener('change', updateSettings);

$('clearLog').addEventListener('click', () => {
  state.logs = [];
  save();
  render();
});

render();
