const $ = (id) => document.getElementById(id);

const passages = {
  easy: [
    'I like red apples.',
    'My cat can jump.',
    'The sun is very bright.',
    'We play in the park.',
    'A frog can hop fast.'
  ],
  medium: [
    'My happy dog runs in the garden.',
    'I can draw a bright rainbow today.',
    'We read books after school every day.',
    'The little bird sings a sweet song.'
  ],
  hard: [
    'Practice makes my typing faster and better.',
    'I can use both hands on the keyboard.',
    'Small steps help me become a typing hero.',
    'Learning new skills can be fun and exciting.'
  ]
};

let targetText = '';
let timerId = null;
let started = false;
let finished = false;
let seconds = 0;
let currentErrors = 0;

function chooseSentence() {
  const level = $('level').value;
  const list = passages[level];

  const randomIndex = Math.floor(Math.random() * list.length);
  targetText = list[randomIndex];

  clearInterval(timerId);

  started = false;
  finished = false;
  seconds = 0;
  currentErrors = 0;

  $('typingBox').value = '';
  $('typingBox').disabled = true;
  $('typingBox').maxLength = targetText.length;

  $('time').textContent = '0';
  $('errors').textContent = '0';
  $('accuracy').textContent = '100';
  $('stars').textContent = '0';

  $('start').textContent = 'Start game';
  $('message').textContent = 'Press Start, then type the sentence carefully.';

  renderSentence('');
}

function renderSentence(typedText) {
  $('sentence').innerHTML = targetText
    .split('')
    .map((character, index) => {
      let className = '';

      if (index < typedText.length) {
        className =
          typedText[index] === character
            ? 'correct'
            : 'wrong';
      } else if (index === typedText.length && started && !finished) {
        className = 'current';
      }

      const safeCharacter =
        character === ' ' ? '&nbsp;' : escapeHtml(character);

      return `<span class="${className}">${safeCharacter}</span>`;
    })
    .join('');
}

function escapeHtml(character) {
  return String(character)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function startGame() {
  if (!targetText) chooseSentence();

  if (finished) {
    chooseSentence();
  }

  if (started) return;

  started = true;
  $('typingBox').disabled = false;
  $('typingBox').focus();
  $('start').textContent = 'Typing…';
  $('message').textContent = 'Keep going! Accuracy is your superpower.';

  timerId = setInterval(() => {
    seconds += 1;
    $('time').textContent = seconds;
  }, 1000);

  renderSentence($('typingBox').value);
}

function updateGame() {
  if (!started || finished) return;

  const typedText = $('typingBox').value;

  let correctLetters = 0;
  currentErrors = 0;

  for (let index = 0; index < typedText.length; index += 1) {
    if (typedText[index] === targetText[index]) {
      correctLetters += 1;
    } else {
      currentErrors += 1;
    }
  }

  const accuracy = typedText.length
    ? Math.round((correctLetters / typedText.length) * 100)
    : 100;

  $('errors').textContent = currentErrors;
  $('accuracy').textContent = accuracy;

  renderSentence(typedText);

  if (typedText.length === targetText.length) {
    finishGame(accuracy);
  }
}

function finishGame(accuracy) {
  finished = true;
  started = false;

  clearInterval(timerId);

  $('typingBox').disabled = true;
  $('start').textContent = 'Play again';

  let stars = 1;

  if (accuracy >= 80) stars = 2;
  if (accuracy >= 95) stars = 3;

  $('stars').textContent = '⭐'.repeat(stars);

  if (accuracy === 100) {
    $('message').textContent =
      `Perfect! You earned ${stars} stars. Amazing typing!`;
  } else if (accuracy >= 80) {
    $('message').textContent =
      `Great job! You earned ${stars} stars. Try again for 100%!`;
  } else {
    $('message').textContent =
      `Nice try! You earned ${stars} star. Go slowly and try again.`;
  }

  saveBestScore(accuracy);
}

function saveBestScore(accuracy) {
  const oldBest = Number(localStorage.getItem('typing-quest-best')) || 0;

  if (accuracy > oldBest) {
    localStorage.setItem('typing-quest-best', accuracy);
  }
}

$('start').addEventListener('click', () => {
  if (finished) {
    chooseSentence();
  }

  startGame();
});

$('newSentence').addEventListener('click', chooseSentence);

$('level').addEventListener('change', chooseSentence);

$('typingBox').addEventListener('input', updateGame);

chooseSentence();
