const key = 'expenses.data';

const budgetForm = document.getElementById('budgetForm');
const budgetInput = document.getElementById('budget');
const expenseForm = document.getElementById('form');
const nameInput = document.getElementById('name');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');

const budgetTotal = document.getElementById('b');
const spentTotal = document.getElementById('spent');
const balanceTotal = document.getElementById('balance');
const chart = document.getElementById('chart');
const list = document.getElementById('list');

let data = JSON.parse(
  localStorage.getItem(key) || '{"budget":2000,"items":[]}'
);

const money = number => '$' + Number(number).toFixed(2);

function save() {
  localStorage.setItem(key, JSON.stringify(data));
}

function render() {
  budgetInput.value = data.budget;

  const total = data.items.reduce((sum, item) => sum + item.amount, 0);

  budgetTotal.textContent = money(data.budget);
  spentTotal.textContent = money(total);
  balanceTotal.textContent = money(data.budget - total);

  const categories = {};

  data.items.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + item.amount;
  });

  chart.innerHTML =
    Object.entries(categories)
      .map(item =>
        '<p>' +
        item[0] +
        ' · ' +
        money(item[1]) +
        '<span class="bar"><i style="width:' +
        Math.min(100, (item[1] / Math.max(1, data.budget)) * 100) +
        '%"></i></span></p>'
      )
      .join('') || '<p class="empty">No expenses yet</p>';

  list.innerHTML = data.items
    .map(
      item =>
        '<div class="item"><span>' +
        item.name +
        ' <small class="muted">' +
        item.category +
        '</small></span><span>' +
        money(item.amount) +
        ' <button class="danger del" data-id="' +
        item.id +
        '">×</button></span></div>'
    )
    .join('');

  document.querySelectorAll('.del').forEach(button => {
    button.onclick = () => {
      data.items = data.items.filter(item => item.id != button.dataset.id);
      save();
      render();
    };
  });
}

budgetForm.onsubmit = event => {
  event.preventDefault();
  data.budget = Math.max(0, Number(budgetInput.value) || 0);
  save();
  render();
};

expenseForm.onsubmit = event => {
  event.preventDefault();

  data.items.unshift({
    id: Date.now(),
    name: nameInput.value,
    amount: Number(amountInput.value),
    category: categoryInput.value
  });

  save();
  expenseForm.reset();
  render();
};

render();
