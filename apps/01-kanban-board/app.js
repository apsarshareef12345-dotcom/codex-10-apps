const storageKey = 'mission-control-tasks';

const board = document.getElementById('board');
const form = document.getElementById('taskForm');
const titleInput = document.getElementById('taskTitle');
const priorityInput = document.getElementById('priority');
const completeCount = document.getElementById('completedCount');

const columns = [
  { id: 'todo', title: 'To Do', icon: '◌' },
  { id: 'progress', title: 'In Progress', icon: '↗' },
  { id: 'done', title: 'Done', icon: '★' }
];

let tasks = JSON.parse(localStorage.getItem(storageKey) || '[]');
let draggedId = null;

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => {
    const characters = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return characters[character];
  });
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function render() {
  completeCount.textContent = tasks.filter(
    task => task.status === 'done'
  ).length;

  board.innerHTML = columns
    .map(column => {
      const items = tasks.filter(task => task.status === column.id);

      const taskCards = items
        .map(
          task =>
            '<article class="task" draggable="true" data-id="' +
            task.id +
            '">' +
            '<span class="tag ' +
            task.priority.toLowerCase() +
            '">' +
            task.priority +
            '</span>' +
            '<p class="task-title">' +
            escapeHtml(task.title) +
            '</p>' +
            '<div class="task-actions">' +
            '<button class="move" data-id="' +
            task.id +
            '">Move →</button>' +
            '<button class="delete" aria-label="Delete task" data-id="' +
            task.id +
            '">×</button>' +
            '</div>' +
            '</article>'
        )
        .join('');

      return (
        '<section class="column" data-status="' +
        column.id +
        '">' +
        '<div class="column-head">' +
        '<h3>' +
        column.icon +
        ' ' +
        column.title +
        '</h3>' +
        '<span>' +
        items.length +
        '</span>' +
        '</div>' +
        '<div class="task-list">' +
        (taskCards || '<p class="empty">No missions here yet.</p>') +
        '</div>' +
        '</section>'
      );
    })
    .join('');

  document.querySelectorAll('.task').forEach(task => {
    task.addEventListener('dragstart', () => {
      draggedId = task.dataset.id;
      task.classList.add('dragging');
    });

    task.addEventListener('dragend', () => {
      task.classList.remove('dragging');
    });
  });

  document.querySelectorAll('.column').forEach(column => {
    column.addEventListener('dragover', event => {
      event.preventDefault();
      column.classList.add('over');
    });

    column.addEventListener('dragleave', () => {
      column.classList.remove('over');
    });

    column.addEventListener('drop', () => {
      column.classList.remove('over');
      moveTask(draggedId, column.dataset.status);
    });
  });

  document.querySelectorAll('.move').forEach(button => {
    button.onclick = () => {
      const task = tasks.find(
        item => String(item.id) === button.dataset.id
      );

      const currentColumn = columns.findIndex(
        column => column.id === task.status
      );

      const nextColumn = columns[(currentColumn + 1) % columns.length];

      moveTask(task.id, nextColumn.id);
    };
  });

  document.querySelectorAll('.delete').forEach(button => {
    button.onclick = () => {
      tasks = tasks.filter(
        task => String(task.id) !== button.dataset.id
      );

      save();
      render();
    };
  });
}

function moveTask(id, status) {
  const task = tasks.find(item => String(item.id) === String(id));

  if (!task) return;

  task.status = status;
  save();
  render();
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const title = titleInput.value.trim();

  if (!title) return;

  tasks.unshift({
    id: Date.now(),
    title: title,
    priority: priorityInput.value,
    status: 'todo'
  });

  save();

  form.reset();
  priorityInput.value = 'Medium';

  render();
  titleInput.focus();
});

render();
