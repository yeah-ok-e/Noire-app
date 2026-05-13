/*
  NOIRE Command Hub PWA script
  Loads persisted metrics from prior NOIRE dashboards if available and
  provides navigation and editing for an integrated command centre.
*/

// keys from earlier dashboards to import state from if available
const IMPORT_KEYS = [
  'noire-dashboard-expensive',
  'noire-dashboard-minimal',
  'noire-dashboard-black',
  'noire-dashboard-custom',
  'noire-dashboard-v2',
  'noire-dashboard-v3'
];

const APP_KEY = 'noire-app-state';

// Default start and target dates for legacy calculations
const START_DATE = new Date(2026, 4, 9); // May 9, 2026
const TARGET_DATE = new Date(2026, 6, 23); // July 23, 2026

// Determine if a string is ISO date-like
function isValidISODate(str) {
  return /\d{4}-\d{2}-\d{2}/.test(str);
}

// Attempt to load state from previously used dashboards
function importState() {
  // If we've already saved state to the new app key, prefer that
  const existing = localStorage.getItem(APP_KEY);
  if (existing) {
    try {
      return JSON.parse(existing);
    } catch (e) {}
  }
  for (const key of IMPORT_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // ensure some fields exist
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (e) {}
    }
  }
  return null;
}

// Create a new default state object
function defaultState() {
  return {
    date: new Date().toISOString().slice(0, 10),
    cashOnHand: 0,
    cashCollected: 0,
    touches: 0,
    replies: 0,
    unitsSold: 0,
    saleRevenue: 0,
    markedToday: '',
    nonNegs: { body: false, money: false, noire: false, cash: false, sleep: false },
    inventory: {},
    bills: [],
    threads: [],
    totals: { workouts: 0, totalSales: 0, totalRevenue: 0, rentMonthsPaid: 0 },
    history: []
  };
}

// Merge imported state into our simplified state representation
function normalizeState(imported) {
  const base = defaultState();
  if (!imported) return base;
  // Copy relevant fields
  ['cashOnHand','cashCollected','touches','replies','unitsSold','saleRevenue','markedToday'].forEach(k => {
    if (typeof imported[k] !== 'undefined') base[k] = imported[k];
  });
  if (imported.nonNegs) base.nonNegs = { ...base.nonNegs, ...imported.nonNegs };
  if (imported.totals) base.totals = { ...base.totals, ...imported.totals };
  if (imported.history && Array.isArray(imported.history)) base.history = imported.history;
  // use imported date if valid
  if (imported.date && isValidISODate(imported.date)) base.date = imported.date;
  return base;
}

// Load our initial state
let state = normalizeState(importState());

// Save state to localStorage
function saveAppState() {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
}

// Utility: compute week stats (past 7 days including today)
function computeWeekStats() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  let touches = state.touches || 0;
  let sales = state.unitsSold || 0;
  let workouts = state.nonNegs.body ? 1 : 0;
  let revenue = state.saleRevenue || 0;
  for (const h of state.history) {
    const d = new Date(h.date);
    if (d >= weekAgo) {
      touches += h.touches || 0;
      sales += h.unitsSold || 0;
      workouts += h.nonNegs && h.nonNegs.body ? 1 : 0;
      revenue += h.saleRevenue || 0;
    }
  }
  return { touches, sales, workouts, revenue };
}

// Utility: days between two dates
function daysBetween(d1, d2) {
  return Math.floor((d2 - d1) / 86400000);
}

// Render functions
function renderHome() {
  // Date
  const dateEl = document.getElementById('cardDate');
  const today = new Date();
  dateEl.textContent = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
  // Metrics
  document.getElementById('stateCash').textContent = Number(state.cashOnHand || 0).toLocaleString();
  const gap = Math.max(0, 1048 - (state.cashOnHand || 0));
  document.getElementById('stateGap').textContent = gap.toLocaleString();
  document.getElementById('stateSales').textContent = state.unitsSold || 0;
  document.getElementById('stateOutbound').textContent = state.touches || 0;
  // Non-negotiables
  const checksEl = document.getElementById('stateChecks');
  const labels = { body: 'Body', money: 'Money', noire: 'Noire', cash: 'Cash', sleep: 'Sleep' };
  checksEl.innerHTML = '';
  for (const key of Object.keys(state.nonNegs)) {
    const span = document.createElement('span');
    span.textContent = state.nonNegs[key] ? '✓' : '·';
    span.title = labels[key];
    checksEl.appendChild(span);
  }
  // Marked today
  const markedEl = document.getElementById('stateMarked');
  markedEl.textContent = state.markedToday && state.markedToday.trim() ? state.markedToday : '·';
}

function renderNoire() {
  const statsEl = document.getElementById('noireStats');
  statsEl.innerHTML = '';
  const items = [
    { label: 'Units Sold', value: state.unitsSold || 0 },
    { label: 'Revenue', value: '$' + (state.saleRevenue || 0).toLocaleString() },
    { label: 'Outbound', value: state.touches || 0 },
    { label: 'Replies', value: state.replies || 0 },
    { label: 'Workouts', value: (state.nonNegs.body ? 1 : 0) + state.totals.workouts }
  ];
  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'stat';
    const l = document.createElement('div'); l.className = 'stat-label'; l.textContent = item.label;
    const v = document.createElement('div'); v.className = 'stat-value'; v.textContent = item.value;
    row.appendChild(l);
    row.appendChild(v);
    statsEl.appendChild(row);
  });
}

function renderLegacy() {
  const today = new Date();
  const daysElapsed = Math.max(0, daysBetween(START_DATE, today));
  document.getElementById('legacyDays').textContent = daysElapsed;
  // workouts count includes totals + today
  const workouts = state.totals.workouts + (state.nonNegs.body ? 1 : 0);
  document.getElementById('legacyWorkouts').textContent = workouts;
  document.getElementById('legacyRent').textContent = state.totals.rentMonthsPaid || 0;
  const totalSales = state.totals.totalSales + (state.unitsSold || 0);
  document.getElementById('legacySales').textContent = totalSales;
  const totalRevenue = state.totals.totalRevenue + (state.saleRevenue || 0);
  document.getElementById('legacyRevenue').textContent = '$' + (totalRevenue || 0).toLocaleString();
}

// Define goals with completion conditions
const goals = [
  {
    id: 'touches',
    title: '50 Outbound Touches This Week',
    progress: () => {
      const ws = computeWeekStats();
      return { current: ws.touches, target: 50 };
    }
  },
  {
    id: 'sales',
    title: '3 Units Sold This Week',
    progress: () => {
      const ws = computeWeekStats();
      return { current: ws.sales, target: 3 };
    }
  },
  {
    id: 'workouts',
    title: '5 Workouts This Week',
    progress: () => {
      const ws = computeWeekStats();
      return { current: ws.workouts, target: 5 };
    }
  },
  {
    id: 'revenue',
    title: '$500 Revenue This Week',
    progress: () => {
      const ws = computeWeekStats();
      return { current: ws.revenue, target: 500 };
    }
  },
  {
    id: 'cash',
    title: 'Reach Cash On Hand >= $1,048',
    progress: () => {
      return { current: state.cashOnHand || 0, target: 1048 };
    }
  }
];

function renderGoals() {
  const list = document.getElementById('goalList');
  list.innerHTML = '';
  goals.forEach(goal => {
    const prog = goal.progress();
    const li = document.createElement('li');
    const title = document.createElement('span');
    title.textContent = goal.title;
    const progressLabel = document.createElement('span');
    progressLabel.className = 'goal-progress';
    progressLabel.textContent = `${Math.min(prog.current, prog.target)}/${prog.target}`;
    if (prog.current >= prog.target) li.classList.add('completed');
    li.appendChild(title);
    li.appendChild(progressLabel);
    list.appendChild(li);
  });
}

// Navigation handler
function setupNavigation() {
  const navItems = document.querySelectorAll('nav.nav-bar li');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const page = item.getAttribute('data-page');
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(page).classList.add('active');
      // On navigation, re-render relevant section
      if (page === 'home') renderHome();
      if (page === 'noire') renderNoire();
      if (page === 'legacy') renderLegacy();
      if (page === 'goals') renderGoals();
    });
  });
}

// Handle home card editing
function setupEditForm() {
  const card = document.getElementById('homeCard');
  const form = document.getElementById('editForm');
  card.addEventListener('click', () => {
    form.style.display = form.style.display === 'flex' ? 'none' : 'flex';
    if (form.style.display === 'flex') {
      // Prefill inputs
      document.getElementById('editCash').value = state.cashOnHand || '';
      document.getElementById('editSales').value = state.unitsSold || '';
      document.getElementById('editOutbound').value = state.touches || '';
      document.getElementById('editMarked').value = state.markedToday || '';
    }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    // update state
    state.cashOnHand = Number(document.getElementById('editCash').value) || 0;
    state.unitsSold = Number(document.getElementById('editSales').value) || 0;
    state.touches = Number(document.getElementById('editOutbound').value) || 0;
    state.markedToday = document.getElementById('editMarked').value.trim();
    // Save and re-render home, goals and noire
    saveAppState();
    renderHome();
    renderNoire();
    renderLegacy();
    renderGoals();
    // hide form
    form.style.display = 'none';
  });
}

// On load
document.addEventListener('DOMContentLoaded', () => {
  // Setup navigation and edit form
  setupNavigation();
  setupEditForm();
  // Render initial views
  renderHome();
  renderNoire();
  renderLegacy();
  renderGoals();
});