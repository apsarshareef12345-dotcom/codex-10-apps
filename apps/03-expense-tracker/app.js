const STORAGE_KEY = 'spendwise-expense-data-v1';
const colors = ['#449ff1', '#f05d62', '#36c88f', '#f2ba4e', '#a66be5', '#a1adbd'];

const $ = (id) => document.getElementById(id);
const money = (value) =>
  `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved && Array.isArray(saved.items)) {
      return {
        budget: Number(saved.budget) || 0,
        items: saved.items
          .map((item) => ({
            id: item.id || crypto.randomUUID(),
            name: String(item.name || item.description || 'Expense'),
            amount: Number(item.amount) || 0,
            category: String(item.category || 'Other'),
            date: item.date || new Date().toISOString()
          }))
          .filter((item) => item.amount > 0)
      };
    }
  } catch (error) {
    console.warn('Saved data could not be loaded.', error);
  }

  return { budget: 0, items: [] };
}

let data = load();

const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const spent = () => data.items.reduce((sum, item) => sum + item.amount, 0);

const escapeHtml = (text) =>
  String(text).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[character]);

function totalsByCategory() {
  return data.items.reduce((all, item) => {
    all[item.category] = (all[item.category] || 0) + item.amount;
    return all;
  }, {});
}

function renderStats() {
  const total = spent();
  const balance = data.budget - total;

  $('budgetTotal').textContent = money(data.budget);
  $('spentTotal').textContent = money(total);
  $('balanceTotal').textContent = money(balance);

  $('barFill').style.width =
    `${data.budget ? Math.min(100, (total / data.budget) * 100) : 0}%`;

  $('barFill').style.background =
    balance < 0 ? 'var(--red)' : 'var(--teal)';

  $('balanceIcon').textContent = balance < 0 ? '↓' : '↗';
  $('balanceIcon').style.background =
    balance < 0 ? '#4a2834' : '#203f42';
  $('balanceIcon').style.color =
    balance < 0 ? 'var(--red)' : 'var(--teal)';

  if (!data.budget) {
    $('budgetMessage').textContent = 'Set a budget to track progress';
  } else if (balance < 0) {
    $('budgetMessage').textContent = `Over budget by ${money(-balance)}`;
  } else {
    $('budgetMessage').textContent = `${money(balance)} remaining`;
  }
}

function renderBreakdown() {
  const entries = Object.entries(totalsByCategory())
    .sort((a, b) => b[1] - a[1]);

  const total = spent();
  $('chartTotal').textContent = money(total);

  if (!entries.length) {
    $('donut').style.background = 'conic-gradient(#344155 0 100%)';
    $('legend').innerHTML =
      '<small>Add an expense to see your categories.</small>';
    return;
  }

  let start = 0;

  $('donut').style.background = `conic-gradient(${entries
    .map(([, amount], index) => {
      const end = start + (amount / total) * 100;
      const slice = `${colors[index % colors.length]} ${start}% ${end}%`;
      start = end;
      return slice;
    })
    .join(', ')})`;

  $('legend').innerHTML = entries
    .map(
      ([category, amount], index) => `
        <div>
          <i style="background:${colors[index % colors.length]}"></i>
          <span>${escapeHtml(category)}</span>
          <small>${money(amount)}</small>
        </div>
      `
    )
    .join('');
}

function renderList() {
  const items = [...data.items].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (!items.length) {
    $('list').innerHTML =
      '<p class="empty">No expenses yet. Add your first one above.</p>';
    return;
  }

  $('list').innerHTML = items
    .map(
      (item) => `
        <div class="item">
          <span>
            ${escapeHtml(item.name)}
            <small>${new Date(item.date).toLocaleDateString()}</small>
          </span>
          <span>${escapeHtml(item.category)}</span>
          <span>${money(item.amount)}</span>
          <button class="delete" data-id="${item.id}">×</button>
        </div>
      `
    )
    .join('');
}

function renderMonths() {
  const now = new Date();

  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - 11 + index,
      1
    );

    const total = data.items
      .filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === date.getFullYear() &&
          itemDate.getMonth() === date.getMonth()
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);

    return { date, total };
  });

  const largest = Math.max(...months.map((month) => month.total), 1);

  $('monthChart').innerHTML = months
    .map(
      ({ date, total }, index) => `
        <div class="month${index === 11 ? ' current' : ''}">
          <b>${money(total)}</b>
          <i style="height:${total ? Math.max(8, (total / largest) * 100) : 4}%"></i>
          <span>${date.toLocaleDateString(undefined, { month: 'short' })}</span>
        </div>
      `
    )
    .join('');
}

function render() {
  renderStats();
  renderBreakdown();
  renderList();
  renderMonths();
}

$('expenseForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const name = $('name').value.trim();
  const amount = Number($('amount').value);

  if (!name || !Number.isFinite(amount) || amount <= 0) return;

  data.items.push({
    id: crypto.randomUUID(),
    name,
    amount,
    category: $('category').value,
    date: new Date().toISOString()
  });

  save();
  event.currentTarget.reset();
  render();
});

$('list').addEventListener('click', (event) => {
  const button = event.target.closest('.delete');
  if (!button) return;

  data.items = data.items.filter((item) => item.id !== button.dataset.id);
  save();
  render();
});

$('editBudget').addEventListener('click', () => {
  $('budgetInput').value = data.budget || '';
  $('budgetDialog').showModal();
});

$('saveBudget').addEventListener('click', (event) => {
  event.preventDefault();

  const budget = Number($('budgetInput').value);

  if (!Number.isFinite(budget) || budget < 0) return;

  data.budget = budget;
  save();
  $('budgetDialog').close();
  render();
});

function clearExpenses() {
  if (!data.items.length) return;

  const answer = confirm(
    'Clear all saved expenses? Your budget will stay.'
  );

  if (!answer) return;

  data.items = [];
  save();
  render();
}

$('clearAll').addEventListener('click', clearExpenses);
$('clearTop').addEventListener('click', clearExpenses);

render();
