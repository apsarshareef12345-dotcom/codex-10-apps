const key = 'habit.data';

let data = JSON.parse(
  localStorage.getItem(key) ||
    '{"habits":["Drink water","Read"],"checks":{}}'
);

const habitForm = document.getElementById('form');
const habitInput = document.getElementById('habit');
const table = document.getElementById('table');

const days = Array.from({ length: 21 }, (_, index) => {
  const day = new Date();
  day.setDate(day.getDate() - 20 + index);
  return day;
});

function save() {
  localStorage.setItem(key, JSON.stringify(data));
}

function render() {
  table.innerHTML =
    '<tr><th>Habit</th>' +
    days
      .map(
        day =>
          '<th>' +
          day.toLocaleDateString(undefined, {
            weekday: 'short',
            day: 'numeric'
          }) +
          '</th>'
      )
      .join('') +
    '<th>Streak</th><th></th></tr>' +
    data.habits
      .map((habitName, index) => {
        let streak = 0;

        for (
          let dayIndex = days.length - 1;
          dayIndex >= 0 &&
          data.checks[habitName + '|' + days[dayIndex].toDateString()];
          dayIndex--
        ) {
          streak++;
        }

        return (
          '<tr><td>' +
          habitName +
          '</td>' +
          days
            .map(
              day =>
                '<td><input class="check" data-k="' +
                habitName +
                '|' +
                day.toDateString() +
                '" type="checkbox" ' +
                (data.checks[
                  habitName + '|' + day.toDateString()
                ]
                  ? 'checked'
                  : '') +
                '></td>'
            )
            .join('') +
          '<td>' +
          streak +
          ' days</td><td><button class="danger del" data-i="' +
          index +
          '">×</button></td></tr>'
        );
      })
      .join('');

  document.querySelectorAll('.check').forEach(box => {
    box.onchange = () => {
      data.checks[box.dataset.k] = box.checked;
      save();
      render();
    };
  });

  document.querySelectorAll('.del').forEach(button => {
    button.onclick = () => {
      data.habits.splice(button.dataset.i, 1);
      save();
      render();
    };
  });
}

habitForm.onsubmit = event => {
  event.preventDefault();

  if (
    habitInput.value.trim() &&
    !data.habits.includes(habitInput.value.trim())
  ) {
    data.habits.push(habitInput.value.trim());
  }

  save();
  habitForm.reset();
  render();
};

render();
