const STORAGE_KEY = 'habit-quest-21-days';

const $ = (id) => document.getElementById(id);

function newHabit(name) {
  return {
    id: `habit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    days: Array(21).fill(false)
  };
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved && Array.isArray(saved.habits)) {
      return {
        habits: saved.habits.map((habit) => ({
          id: habit.id || `habit-${Date.now()}-${Math.random()}`,
          name: String(habit.name || 'My habit'),
          days: Array.from({ length: 21 }, (_, index) => Boolean(habit.days?.[index]))
        }))
      };
    }
  } catch (error) {
    console.warn('Could not load habit data.', error);
  }

  return {
    habits: [
      newHabit('Drink water'),
      newHabit('Walking'),
      newHabit('Workout')
    ]
  };
}

let data = loadData();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderDayLabels() {
  let labels = '<tr><th>Habits</th>';

  for (let day = 1; day <= 21; day += 1) {
    labels += `
      <th>
        <span class="day-number">${day}</span>
        <span class="day-word">DAY</span>
      </th>
    `;
  }

  labels += '</tr>';
  $('dayLabels').innerHTML = labels;
}

function renderProgress() {
  const completedDays = new Set();

  data.habits.forEach((habit) => {
    habit.days.forEach((isDone, index) => {
      if (isDone) completedDays.add(index);
    });
  });

  const completed = completedDays.size;

  $('progressText').textContent =
    `${completed} of 21 days completed`;

  $('progressBar').style.width = `${(completed / 21) * 100}%`;
}

function renderHabits() {
  if (!data.habits.length) {
    $('habitRows').innerHTML = `
      <tr>
        <td colspan="22" class="empty">
          Add your first habit above to begin your 21-day journey.
        </td>
      </tr>
    `;
    return;
  }

  $('habitRows').innerHTML = data.habits
    .map((habit) => {
      const dayBoxes = habit.days
        .map(
          (isDone, index) => `
            <td>
              <button
                class="tick ${isDone ? 'done' : ''}"
                data-habit="${habit.id}"
                data-day="${index}"
                aria-label="Day ${index + 1}"
              >
                ✓
              </button>
            </td>
          `
        )
        .join('');

      return `
        <tr>
          <td>
            ${escapeHtml(habit.name)}
            <button
              class="delete-habit"
              data-delete="${habit.id}"
              title="Delete habit"
            >
              ×
            </button>
          </td>
          ${dayBoxes}
        </tr>
      `;
    })
    .join('');
}

function escapeHtml(text) {
  return String(text).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);
}

function render() {
  renderDayLabels();
  renderHabits();
  renderProgress();
}

$('habitForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const name = $('habitInput').value.trim();

  if (!name) return;

  data.habits.push(newHabit(name));
  $('habitInput').value = '';

  save();
  render();
});

$('habitRows').addEventListener('click', (event) => {
  const tickButton = event.target.closest('[data-habit][data-day]');
  const deleteButton = event.target.closest('[data-delete]');

  if (tickButton) {
    const habit = data.habits.find(
      (item) => item.id === tickButton.dataset.habit
    );

    if (habit) {
      const day = Number(tickButton.dataset.day);

      habit.days[day] = !habit.days[day];

      save();
      render();
    }
  }

  if (deleteButton) {
    const habit = data.habits.find(
      (item) => item.id === deleteButton.dataset.delete
    );

    if (!habit) return;

    const shouldDelete = confirm(`Delete "${habit.name}"?`);

    if (shouldDelete) {
      data.habits = data.habits.filter(
        (item) => item.id !== deleteButton.dataset.delete
      );

      save();
      render();
    }
  }
});

render();
