const STORAGE_KEY = 'ledger-expenses-v1';
const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];
const categoryColors = { Food: '#ee765e', Transport: '#4f806d', Shopping: '#e5b936', Bills: '#7b91bc', Health: '#9a78a5', Entertainment: '#d88a52', Other: '#98a39d' };
const demoExpenses = [
  { id: crypto.randomUUID(), description: 'Weekly groceries', amount: 84.32, category: 'Food', date: '2026-08-30' },
  { id: crypto.randomUUID(), description: 'Monthly transit pass', amount: 72.00, category: 'Transport', date: '2026-08-28' },
  { id: crypto.randomUUID(), description: 'New running shoes', amount: 128.50, category: 'Shopping', date: '2026-08-25' },
  { id: crypto.randomUUID(), description: 'Internet bill', amount: 59.99, category: 'Bills', date: '2026-08-22' },
  { id: crypto.randomUUID(), description: 'Dinner with friends', amount: 46.80, category: 'Food', date: '2026-08-19' }
];
let expenses = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || demoExpenses.map((expense) => ({ ...expense }));
let editingId = null;
let chart;
const $ = (selector) => document.querySelector(selector);
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const readableDate = (date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T12:00:00`));

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); }
function refresh() { renderSummary(); renderCategories(); renderExpenses(); renderChart(); if (window.lucide) lucide.createIcons(); }
function renderSummary() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  $('#total-spending').textContent = money(total);
  $('#expense-count').textContent = expenses.length;
  $('#average-expense').textContent = money(expenses.length ? total / expenses.length : 0);
  $('#total-foot').textContent = expenses.length ? `Across ${expenses.length} recorded ${expenses.length === 1 ? 'expense' : 'expenses'}` : 'Across all expenses';
}
function renderCategories() {
  const totals = expenses.reduce((result, expense) => { result[expense.category] += expense.amount; return result; }, Object.fromEntries(categories.map((category) => [category, 0])));
  const ranked = Object.entries(totals).filter(([, total]) => total > 0).sort((a, b) => b[1] - a[1]);
  const max = ranked[0]?.[1] || 1;
  $('#category-list').innerHTML = ranked.length ? ranked.map(([category, total]) => `<div class="category-row"><span class="category-name">${category}</span><div class="category-bar"><span style="width:${total / max * 100}%; background:${categoryColors[category]}"></span></div><span class="category-amount">${money(total)}</span></div>`).join('') : '<p class="card-foot">Your category rhythm will appear here.</p>';
}
function renderExpenses() {
  const category = $('#category-filter').value;
  const search = $('#search-input').value.trim().toLowerCase();
  const sort = $('#sort-select').value;
  const visible = expenses.filter((expense) => (category === 'all' || expense.category === category) && expense.description.toLowerCase().includes(search)).sort((a, b) => {
    if (sort === 'amount-desc') return b.amount - a.amount;
    if (sort === 'amount-asc') return a.amount - b.amount;
    return sort === 'date-asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });
  $('#visible-count').textContent = `${visible.length} shown`;
  $('#expense-list').innerHTML = visible.map((expense, index) => `<div class="expense-row" style="animation-delay:${index * 40}ms"><div class="expense-description"><span class="expense-symbol">${expense.description.trim().charAt(0).toUpperCase()}</span><span>${escapeHtml(expense.description)}</span></div><span class="expense-amount">${money(expense.amount)}</span><span class="expense-category">${expense.category}</span><span class="expense-date">${readableDate(expense.date)}</span><span class="row-actions"><button title="Edit expense" aria-label="Edit ${escapeHtml(expense.description)}" data-action="edit" data-id="${expense.id}"><i data-lucide="pencil"></i></button><button title="Delete expense" aria-label="Delete ${escapeHtml(expense.description)}" data-action="delete" data-id="${expense.id}"><i data-lucide="trash-2"></i></button></span></div>`).join('');
  $('#empty-state').hidden = visible.length > 0;
}
function renderChart() {
  const totals = categories.map((category) => expenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0));
  const hasData = totals.some(Boolean);
  $('#category-chart').style.display = hasData ? 'block' : 'none'; $('#chart-empty').classList.toggle('visible', !hasData);
  if (chart) chart.destroy();
  if (!hasData || !window.Chart) return;
  chart = new Chart($('#category-chart'), { type: 'doughnut', data: { labels: categories, datasets: [{ data: totals, backgroundColor: categories.map((category) => categoryColors[category]), borderWidth: 3, borderColor: '#fff' }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { position: 'right', labels: { color: '#77807b', boxWidth: 10, boxHeight: 10, padding: 13, font: { family: 'DM Sans', size: 10 } } }, tooltip: { callbacks: { label: (context) => ` ${money(context.raw)}` } } } } });
}
function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function openModal(id = null) { editingId = id; const expense = expenses.find((item) => item.id === id); $('#modal-eyebrow').textContent = id ? 'EDIT TRANSACTION' : 'NEW TRANSACTION'; $('#modal-title').textContent = id ? 'Edit an expense' : 'Add an expense'; $('#submit-label').textContent = id ? 'Update expense' : 'Save expense'; $('#description-input').value = expense?.description || ''; $('#amount-input').value = expense?.amount || ''; $('#category-input').value = expense?.category || 'Food'; $('#date-input').value = expense?.date || new Date().toISOString().slice(0, 10); $('#modal-backdrop').hidden = false; $('#description-input').focus(); }
function closeModal() { $('#modal-backdrop').hidden = true; editingId = null; }

$('#add-expense-button').addEventListener('click', () => openModal()); $('#empty-add-button').addEventListener('click', () => openModal()); $('#close-modal').addEventListener('click', closeModal); $('#modal-backdrop').addEventListener('click', (event) => { if (event.target.id === 'modal-backdrop') closeModal(); });
$('#expense-form').addEventListener('submit', (event) => { event.preventDefault(); const form = new FormData(event.target); const data = { description: form.get('description').trim(), amount: Number(form.get('amount')), category: form.get('category'), date: form.get('date') }; if (editingId) expenses = expenses.map((expense) => expense.id === editingId ? { ...expense, ...data } : expense); else expenses.push({ ...data, id: crypto.randomUUID() }); save(); refresh(); closeModal(); });
$('#expense-list').addEventListener('click', (event) => { const button = event.target.closest('button'); if (!button) return; const id = button.dataset.id; if (button.dataset.action === 'edit') openModal(id); if (button.dataset.action === 'delete' && confirm('Delete this expense?')) { expenses = expenses.filter((expense) => expense.id !== id); save(); refresh(); } });
$('#category-filter').addEventListener('change', renderExpenses); $('#sort-select').addEventListener('change', renderExpenses); $('#search-input').addEventListener('input', renderExpenses);
$('#reset-data-button').addEventListener('click', () => { if (confirm('Reset all expenses to the starter data?')) { expenses = demoExpenses.map((expense) => ({ ...expense, id: crypto.randomUUID() })); save(); refresh(); } });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
$('#current-month').textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()).toUpperCase(); $('#today-label').textContent = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date());
categories.forEach((category) => $('#category-filter').insertAdjacentHTML('beforeend', `<option value="${category}">${category}</option>`));
refresh();
