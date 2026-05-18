'use strict';

// ═══════════════════════════════════════════════════════════
// NOIRE OS — Multi-Agent AI Operating System
// Agents: LIFE · FINANCE · BRAND · HEALTH · ARCHIVE
// ═══════════════════════════════════════════════════════════

// ─── Config ────────────────────────────────────────────────
const OS_KEY = 'noire-os-v2';
const LEGACY_KEYS = [
  'noire-app-state',
  'noire-dashboard-expensive',
  'noire-dashboard-minimal',
  'noire-dashboard-black',
  'noire-dashboard-custom',
  'noire-dashboard-v2',
  'noire-dashboard-v3'
];

const AGENT_ICONS  = { life:'◎', finance:'◈', brand:'◆', health:'◉', archive:'◇' };
const AGENT_COLORS = { life:'#ffffff', finance:'#00d4aa', brand:'#ff6b35', health:'#00ff88', archive:'#9b6bff' };

// ─── Utilities ──────────────────────────────────────────────
const today  = () => new Date().toISOString().slice(0, 10);
const nowISO = () => new Date().toISOString();
const uid    = () => Math.random().toString(36).slice(2, 9);

function daysBetween(a, b) {
  return Math.floor((new Date(b) - new Date(a)) / 86400000);
}

function fmtDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

function fmtMoney(n) {
  const v = Number(n) || 0;
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function progBar(pct, len = 20) {
  const filled = Math.round(Math.min(1, pct) * len);
  return '█'.repeat(filled) + '░'.repeat(len - filled);
}

// ─── Default State ─────────────────────────────────────────
function defaultState() {
  const d = today();
  return {
    v: 2,
    life: {
      date: d,
      markedToday: '',
      focusMode: false,
      nonNegs: { body: false, money: false, noire: false, cash: false, sleep: false },
      dayScore: 0,
      history: []
    },
    finance: {
      cashOnHand: 0,
      cashGoal: 1048,
      transactions: [],
      bills: []
    },
    brand: {
      touches: 0,
      replies: 0,
      unitsSold: 0,
      saleRevenue: 0,
      pipeline: [],
      weeklyGoals: { touches: 50, sales: 3, revenue: 500 },
      history: []
    },
    health: {
      streak: 0,
      lastWorkoutDate: null,
      sleepLast: 0,
      log: [],
      weeklyGoal: 5,
      totals: { workouts: 0, rentPaid: 0 }
    },
    archive: {
      startDate: d,
      entries: [],
      milestones: []
    },
    signals: [],
    cmdHistory: []
  };
}

// ─── State Persistence ─────────────────────────────────────
let S;

function loadState() {
  const raw = localStorage.getItem(OS_KEY);
  if (raw) {
    try {
      const p = JSON.parse(raw);
      if (p && p.v === 2) return p;
    } catch (_) {}
  }

  // Migrate from legacy dashboards
  let legacy = null;
  for (const k of LEGACY_KEYS) {
    try {
      const p = JSON.parse(localStorage.getItem(k) || '');
      if (p && typeof p === 'object') { legacy = p; break; }
    } catch (_) {}
  }

  const s = defaultState();
  if (legacy) {
    s.finance.cashOnHand   = legacy.cashOnHand   || 0;
    s.brand.touches        = legacy.touches       || 0;
    s.brand.replies        = legacy.replies       || 0;
    s.brand.unitsSold      = legacy.unitsSold     || 0;
    s.brand.saleRevenue    = legacy.saleRevenue   || 0;
    s.life.markedToday     = legacy.markedToday   || '';
    if (legacy.nonNegs) s.life.nonNegs = { ...s.life.nonNegs, ...legacy.nonNegs };
    if (legacy.totals) {
      s.health.totals.workouts = legacy.totals.workouts        || 0;
      s.health.totals.rentPaid = legacy.totals.rentMonthsPaid  || 0;
    }
  }
  return s;
}

function save() {
  localStorage.setItem(OS_KEY, JSON.stringify(S));
}

// ─── Agent Runtime ──────────────────────────────────────────

function postSignal(agentId, type, payload) {
  S.signals.unshift({ id: uid(), agentId, type, payload, ts: nowISO() });
  if (S.signals.length > 60) S.signals.length = 60;
}

function checkDayChange() {
  const d = today();
  if (S.life.date === d) return;

  // Archive life day
  S.life.history.unshift({
    date: S.life.date,
    dayScore: S.life.dayScore,
    markedToday: S.life.markedToday,
    nonNegs: { ...S.life.nonNegs }
  });
  if (S.life.history.length > 365) S.life.history.length = 365;

  // Archive brand day
  S.brand.history.unshift({
    date: S.life.date,
    touches: S.brand.touches,
    unitsSold: S.brand.unitsSold,
    saleRevenue: S.brand.saleRevenue
  });
  if (S.brand.history.length > 365) S.brand.history.length = 365;

  // Health: update streak
  if (S.life.nonNegs.body) {
    S.health.totals.workouts++;
    S.health.streak++;
    S.health.lastWorkoutDate = S.life.date;
  } else if (S.health.lastWorkoutDate) {
    const gap = daysBetween(S.health.lastWorkoutDate, S.life.date);
    if (gap > 1) S.health.streak = 0;
  }

  // Reset daily counters
  S.life.date        = d;
  S.life.markedToday = '';
  S.life.nonNegs     = { body: false, money: false, noire: false, cash: false, sleep: false };
  S.life.dayScore    = 0;
  S.brand.touches    = 0;
  S.brand.replies    = 0;
  S.brand.unitsSold  = 0;
  S.brand.saleRevenue = 0;

  postSignal('life', 'day-changed', { date: d });
  save();
}

function selfClean() {
  S.life.history    = S.life.history.slice(0, 365);
  S.brand.history   = S.brand.history.slice(0, 365);
  S.health.log      = S.health.log.slice(0, 500);
  S.archive.entries = S.archive.entries.slice(0, 2000);
  S.finance.transactions = S.finance.transactions.slice(0, 500);
  S.signals         = S.signals.slice(0, 60);
  S.cmdHistory      = S.cmdHistory.slice(0, 60);
}

function agentTick() {
  checkDayChange();
  selfClean();
  recomputeScore();
  renderStatusBar();
  renderClock();
}

// ─── Computations ───────────────────────────────────────────

function weekBrand() {
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  let touches = S.brand.touches, sales = S.brand.unitsSold, revenue = S.brand.saleRevenue;
  for (const h of S.brand.history) {
    if (h.date >= cutoff) {
      touches  += h.touches   || 0;
      sales    += h.unitsSold || 0;
      revenue  += h.saleRevenue || 0;
    }
  }
  return { touches, sales, revenue };
}

function weekWorkouts() {
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const fromLog = S.health.log.filter(e => e.type === 'workout' && e.date >= cutoff).length;
  return fromLog + (S.life.nonNegs.body ? 1 : 0);
}

function daysRunning() {
  const start = S.archive.startDate || today();
  return Math.max(1, daysBetween(start, today()) + 1);
}

function computeScore() {
  const nn = S.life.nonNegs;
  const nnDone = Object.values(nn).filter(Boolean).length;
  const nnScore = (nnDone / 5) * 50;
  const healthScore = Math.min(1, weekWorkouts() / S.health.weeklyGoal) * 15;
  const touchScore  = Math.min(1, S.brand.touches / S.brand.weeklyGoals.touches) * 20;
  const hasNote     = !!S.archive.entries.find(e => e.date === today());
  return Math.round(nnScore + healthScore + touchScore + (hasNote ? 15 : 0));
}

function recomputeScore() {
  S.life.dayScore = computeScore();
}

function briefingPriority() {
  const week  = weekBrand();
  const ww    = weekWorkouts();
  const goals = S.brand.weeklyGoals;

  if (S.finance.cashOnHand < S.finance.cashGoal * 0.5)
    return 'MONEY MOVE: Cash gap is wide. Prioritize closes today.';
  if (week.touches < goals.touches * 0.3)
    return 'OUTBOUND: Volume low. Get 10+ touches in today.';
  if (ww === 0)
    return 'BODY: Zero workouts this week. Move your body today.';
  if (!S.archive.entries.find(e => e.date === today()))
    return 'ARCHIVE: Nothing logged today. Capture the moment.';
  return 'LOCKED IN. Stay on mission.';
}

// ─── Renders ────────────────────────────────────────────────

function renderStatusBar() {
  const bar = document.getElementById('agentStatusBar');
  if (!bar) return;
  bar.innerHTML = Object.entries(AGENT_ICONS).map(([id, icon]) =>
    `<span class="agent-dot" style="color:${AGENT_COLORS[id]}" title="${id.toUpperCase()}">${icon}</span>`
  ).join('');
}

function renderClock() {
  const el = document.getElementById('osTime');
  if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12: false });
}

// LIFE ───────────────────────────────────────────────────────
function renderLife() {
  const score  = S.life.dayScore;
  const week   = weekBrand();
  const ww     = weekWorkouts();
  const days   = daysRunning();
  const nn     = S.life.nonNegs;
  const d      = new Date();
  const dayStr = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateStr= d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

  document.getElementById('mod-life').innerHTML = `
    <div class="briefing-card">
      <div class="brief-header">
        <span class="brief-day">DAY ${days}</span>
        <span class="brief-date">${dayStr}, ${dateStr}</span>
      </div>
      <div class="brief-divider"></div>
      <div class="brief-grid">
        <div class="brief-row">
          <span class="brief-agent" style="color:var(--finance)">FINANCE</span>
          <span class="brief-val">${fmtMoney(S.finance.cashOnHand)} / ${fmtMoney(S.finance.cashGoal)}</span>
        </div>
        <div class="brief-row">
          <span class="brief-agent" style="color:var(--brand)">BRAND</span>
          <span class="brief-val">${week.touches} touches · ${week.sales} sold</span>
        </div>
        <div class="brief-row">
          <span class="brief-agent" style="color:var(--health)">HEALTH</span>
          <span class="brief-val">${ww} workout${ww !== 1 ? 's' : ''} this week</span>
        </div>
        <div class="brief-row">
          <span class="brief-agent" style="color:var(--archive)">ARCHIVE</span>
          <span class="brief-val">${days} day${days !== 1 ? 's' : ''} running</span>
        </div>
      </div>
      <div class="brief-divider"></div>
      <div class="brief-priority">${briefingPriority()}</div>
      ${S.life.markedToday ? `<div class="brief-marked">↳ ${S.life.markedToday}</div>` : ''}
    </div>

    <div class="non-negs-panel">
      <div class="panel-label">Non-Negotiables</div>
      <div class="nn-grid">
        ${Object.keys(nn).map(k => `
          <button class="nn-btn${nn[k] ? ' checked' : ''}" onclick="toggleNonNeg('${k}')">
            <span class="nn-check">${nn[k] ? '✓' : '○'}</span>
            <span class="nn-name">${k.toUpperCase()}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <div class="day-score-panel">
      <div class="panel-label">Day Score</div>
      <div class="score-hero">${score}</div>
      <div class="score-bar">${progBar(score / 100)} ${score}%</div>
      ${S.life.focusMode ? '<div class="focus-badge">FOCUS MODE</div>' : ''}
    </div>
  `;
}

// FINANCE ────────────────────────────────────────────────────
function renderFinance() {
  const gap = Math.max(0, S.finance.cashGoal - S.finance.cashOnHand);
  const pct = S.finance.cashOnHand / S.finance.cashGoal;
  const txs = S.finance.transactions.slice(0, 8);
  const bills = S.finance.bills.slice(0, 6);

  document.getElementById('mod-finance').innerHTML = `
    <div class="cash-hero-panel">
      <div class="panel-label">Cash On Hand</div>
      <div class="cash-hero-num" onclick="openCashEdit()">${fmtMoney(S.finance.cashOnHand)}</div>
      <div class="cash-gap">GAP TO GOAL: ${fmtMoney(gap)}</div>
      <div class="cash-bar">${progBar(pct)} ${Math.round(pct * 100)}%</div>
    </div>

    <div class="quick-cash-panel">
      <div class="panel-label">Quick Add</div>
      <div class="quick-btns">
        <button class="quick-btn" onclick="quickCash(100)">+$100</button>
        <button class="quick-btn" onclick="quickCash(500)">+$500</button>
        <button class="quick-btn" onclick="quickCash(1000)">+$1K</button>
        <button class="quick-btn expense" onclick="openExpenseModal()">EXPENSE</button>
      </div>
    </div>

    ${bills.length ? `
    <div class="bills-panel">
      <div class="panel-label">Bills (${S.finance.bills.length})</div>
      ${bills.map(b => `
        <div class="bill-row">
          <span class="bill-name">${b.name}</span>
          <span class="bill-due">due ${b.dueDay}</span>
          <span class="bill-amt">${fmtMoney(b.amount)}</span>
          <button class="icon-del" onclick="deleteBill('${b.id}')">✕</button>
        </div>
      `).join('')}
    </div>` : ''}

    ${txs.length ? `
    <div class="tx-panel">
      <div class="panel-label">Recent</div>
      ${txs.map(t => `
        <div class="tx-row">
          <span class="tx-date">${fmtDate(t.date)}</span>
          <span class="tx-label">${t.label}</span>
          <span class="tx-amt ${t.type}">${t.type === 'income' ? '+' : '-'}${fmtMoney(t.amount)}</span>
        </div>
      `).join('')}
    </div>` : ''}
  `;
}

// BRAND ──────────────────────────────────────────────────────
function renderBrand() {
  const week  = weekBrand();
  const goals = S.brand.weeklyGoals;
  const tPct  = week.touches / goals.touches;
  const sPct  = week.sales   / goals.sales;
  const rPct  = week.revenue / goals.revenue;
  const pipe  = S.brand.pipeline.slice(0, 6);

  document.getElementById('mod-brand').innerHTML = `
    <div class="brand-metrics-grid">
      <div class="bm-card" onclick="quickTouch()">
        <div class="bm-num">${week.touches}</div>
        <div class="bm-label">TOUCHES</div>
        <div class="bm-sub">+${S.brand.touches} today</div>
      </div>
      <div class="bm-card">
        <div class="bm-num">${week.sales}</div>
        <div class="bm-label">SOLD</div>
        <div class="bm-sub">${fmtMoney(week.revenue)}</div>
      </div>
      <div class="bm-card">
        <div class="bm-num">${S.brand.replies}</div>
        <div class="bm-label">REPLIES</div>
        <div class="bm-sub">today</div>
      </div>
    </div>

    <div class="goals-panel">
      <div class="panel-label">Weekly Goals</div>
      <div class="goal-row">
        <span class="goal-name">TOUCHES</span>
        <span class="goal-bar">${progBar(tPct)}</span>
        <span class="goal-num">${week.touches}/${goals.touches}</span>
      </div>
      <div class="goal-row">
        <span class="goal-name">SALES</span>
        <span class="goal-bar">${progBar(sPct)}</span>
        <span class="goal-num">${week.sales}/${goals.sales}</span>
      </div>
      <div class="goal-row">
        <span class="goal-name">REVENUE</span>
        <span class="goal-bar">${progBar(rPct)}</span>
        <span class="goal-num">${fmtMoney(week.revenue)}/${fmtMoney(goals.revenue)}</span>
      </div>
    </div>

    <div class="brand-actions">
      <button class="action-btn brand-btn" onclick="quickTouch()">+ TOUCH</button>
      <button class="action-btn brand-btn" onclick="openSaleModal()">LOG SALE</button>
      <button class="action-btn brand-btn" onclick="openPipelineModal()">+ PIPELINE</button>
    </div>

    ${pipe.length ? `
    <div class="pipeline-panel">
      <div class="panel-label">Pipeline (${S.brand.pipeline.length})</div>
      ${pipe.map(p => `
        <div class="pipe-row">
          <span class="pipe-name">${p.name}</span>
          <span class="pipe-stage">${p.stage}</span>
          <span class="pipe-val">${p.value ? fmtMoney(p.value) : ''}</span>
          <button class="icon-del" onclick="deletePipeline('${p.id}')">✕</button>
        </div>
      `).join('')}
    </div>` : ''}
  `;
}

// HEALTH ─────────────────────────────────────────────────────
function renderHealth() {
  const ww       = weekWorkouts();
  const goal     = S.health.weeklyGoal;
  const total    = S.health.totals.workouts + (S.life.nonNegs.body ? 1 : 0);
  const dots     = Array.from({ length: goal }, (_, i) => i < ww ? '●' : '○').join(' ');
  const recent   = S.health.log.slice(0, 8);

  document.getElementById('mod-health').innerHTML = `
    <div class="health-hero">
      <div class="health-row">
        <div class="health-stat">
          <div class="health-num">${S.health.streak}</div>
          <div class="health-label">STREAK</div>
        </div>
        <div class="health-stat">
          <div class="health-num">${ww}</div>
          <div class="health-label">THIS WEEK</div>
        </div>
        <div class="health-stat">
          <div class="health-num">${total}</div>
          <div class="health-label">ALL TIME</div>
        </div>
      </div>
      <div class="week-dots">${dots}</div>
    </div>

    <div class="health-actions">
      <button class="action-btn health-btn" onclick="openWorkoutModal()">+ WORKOUT</button>
      <button class="action-btn health-btn" onclick="openSleepModal()">+ SLEEP</button>
    </div>

    ${S.health.sleepLast ? `
    <div class="sleep-panel">
      <span class="panel-label">Last Sleep</span>
      <span class="sleep-val">${S.health.sleepLast}h</span>
    </div>` : ''}

    ${recent.length ? `
    <div class="health-log-panel">
      <div class="panel-label">Log</div>
      ${recent.map(e => `
        <div class="log-row">
          <span class="log-date">${fmtDate(e.date)}</span>
          <span class="log-type">${e.type.toUpperCase()}</span>
          <span class="log-val">${e.value}</span>
          <button class="icon-del" onclick="deleteHealthEntry('${e.id}')">✕</button>
        </div>
      `).join('')}
    </div>` : ''}
  `;
}

// ARCHIVE ────────────────────────────────────────────────────
function renderArchive() {
  const days      = daysRunning();
  const totalW    = S.health.totals.workouts;
  const totalRev  = S.finance.transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + (t.amount || 0), 0);
  const todayEntry = S.archive.entries.find(e => e.date === today());
  const recent     = S.archive.entries.slice(0, 20);

  document.getElementById('mod-archive').innerHTML = `
    <div class="archive-stats">
      <div class="arc-stat">
        <span class="arc-num">${days}</span>
        <span class="arc-label">DAYS</span>
      </div>
      <div class="arc-stat">
        <span class="arc-num">${totalW}</span>
        <span class="arc-label">WORKOUTS</span>
      </div>
      <div class="arc-stat">
        <span class="arc-num">${fmtMoney(totalRev)}</span>
        <span class="arc-label">REVENUE</span>
      </div>
    </div>

    <div class="archive-compose-panel">
      <div class="panel-label">Today — ${fmtDate(today())}</div>
      <textarea id="archiveTa" class="archive-textarea"
                placeholder="What happened today…">${todayEntry ? todayEntry.text : ''}</textarea>
      <button class="action-btn archive-btn" onclick="saveArchiveEntry()">SAVE ENTRY</button>
    </div>

    <div class="timeline-panel">
      <div class="panel-label">Timeline</div>
      ${recent.length
        ? recent.map(e => `
            <div class="timeline-entry">
              <div class="tl-date">${fmtDate(e.date)}</div>
              <div class="tl-text">${e.text.slice(0, 140)}${e.text.length > 140 ? '…' : ''}</div>
            </div>`).join('')
        : '<div class="tl-empty">No entries yet. Start writing.</div>'
      }
    </div>
  `;
}

// ─── Module Router ──────────────────────────────────────────
function renderModule(id) {
  if (id === 'life')    renderLife();
  if (id === 'finance') renderFinance();
  if (id === 'brand')   renderBrand();
  if (id === 'health')  renderHealth();
  if (id === 'archive') renderArchive();
}

function renderActive() {
  const el = document.querySelector('.module.active');
  if (el) renderModule(el.dataset.agent);
}

// ─── Action Handlers (called from inline onclick) ───────────

window.toggleNonNeg = function(key) {
  S.life.nonNegs[key] = !S.life.nonNegs[key];
  recomputeScore();
  save();
  renderLife();
};

// Finance
window.quickCash = function(n) {
  S.finance.cashOnHand += n;
  S.finance.transactions.unshift({ id: uid(), date: today(), type: 'income', amount: n, label: 'quick add' });
  postSignal('finance', 'cash-added', { n });
  save(); renderFinance(); renderLife();
};

window.openCashEdit = function() {
  showModal('EDIT CASH', `
    <div class="modal-form">
      <label class="mf-label">Cash On Hand ($)</label>
      <input id="mCash" class="mf-input" type="number" min="0" step="0.01" value="${S.finance.cashOnHand}">
      <label class="mf-label">Note (optional)</label>
      <input id="mCashNote" class="mf-input" type="text" placeholder="source…">
      <button class="action-btn finance-btn" onclick="saveCashEdit()">SAVE</button>
    </div>`);
};

window.saveCashEdit = function() {
  const val   = parseFloat(document.getElementById('mCash').value) || 0;
  const note  = document.getElementById('mCashNote').value.trim() || 'manual';
  const diff  = val - S.finance.cashOnHand;
  S.finance.cashOnHand = val;
  if (diff !== 0) {
    S.finance.transactions.unshift({ id: uid(), date: today(),
      type: diff > 0 ? 'income' : 'expense', amount: Math.abs(diff), label: note });
  }
  postSignal('finance', 'cash-set', { val });
  save(); closeModal(); renderFinance(); renderLife();
};

window.openExpenseModal = function() {
  showModal('LOG EXPENSE', `
    <div class="modal-form">
      <label class="mf-label">Amount ($)</label>
      <input id="mExpAmt" class="mf-input" type="number" min="0" step="0.01" placeholder="0.00">
      <label class="mf-label">What for</label>
      <input id="mExpLabel" class="mf-input" type="text" placeholder="rent, food, gear…">
      <button class="action-btn neg-btn" onclick="saveExpense()">LOG EXPENSE</button>
    </div>`);
};

window.saveExpense = function() {
  const amt   = parseFloat(document.getElementById('mExpAmt').value) || 0;
  const label = document.getElementById('mExpLabel').value.trim() || 'expense';
  if (amt > 0) {
    S.finance.cashOnHand = Math.max(0, S.finance.cashOnHand - amt);
    S.finance.transactions.unshift({ id: uid(), date: today(), type: 'expense', amount: amt, label });
    postSignal('finance', 'expense-logged', { amt });
  }
  save(); closeModal(); renderFinance();
};

window.deleteBill = function(id) {
  S.finance.bills = S.finance.bills.filter(b => b.id !== id);
  save(); renderFinance();
};

// Brand
window.quickTouch = function() {
  S.brand.touches++;
  postSignal('brand', 'touch', {});
  save(); renderBrand(); renderLife();
  feedback('+1 touch → ' + S.brand.touches + ' today');
};

window.openSaleModal = function() {
  showModal('LOG SALE', `
    <div class="modal-form">
      <label class="mf-label">Units Sold</label>
      <input id="mSaleN" class="mf-input" type="number" value="1" min="1">
      <label class="mf-label">Price Per Unit ($)</label>
      <input id="mSaleP" class="mf-input" type="number" min="0" step="0.01" placeholder="0.00">
      <label class="mf-label">Notes</label>
      <input id="mSaleNote" class="mf-input" type="text" placeholder="client, product…">
      <button class="action-btn brand-btn" onclick="saveSale()">LOG SALE</button>
    </div>`);
};

window.saveSale = function() {
  const n     = parseInt(document.getElementById('mSaleN').value)   || 1;
  const price = parseFloat(document.getElementById('mSaleP').value) || 0;
  const note  = document.getElementById('mSaleNote').value.trim();
  S.brand.unitsSold   += n;
  S.brand.saleRevenue += price * n;
  if (price > 0) {
    S.finance.cashOnHand += price * n;
    S.finance.transactions.unshift({
      id: uid(), date: today(), type: 'income',
      amount: price * n, label: note || `sale ×${n}`
    });
  }
  postSignal('brand', 'sale', { n, price });
  save(); closeModal(); renderBrand(); renderFinance(); renderLife();
};

window.openPipelineModal = function() {
  showModal('ADD TO PIPELINE', `
    <div class="modal-form">
      <label class="mf-label">Name / Lead</label>
      <input id="mPName" class="mf-input" type="text" placeholder="contact or company…">
      <label class="mf-label">Stage</label>
      <select id="mPStage" class="mf-input">
        <option>PROSPECT</option>
        <option>CONTACTED</option>
        <option>PITCHED</option>
        <option>FOLLOW-UP</option>
        <option>CLOSED</option>
      </select>
      <label class="mf-label">Value ($)</label>
      <input id="mPVal" class="mf-input" type="number" min="0" step="0.01" placeholder="0.00">
      <button class="action-btn brand-btn" onclick="savePipeline()">ADD</button>
    </div>`);
};

window.savePipeline = function() {
  const name  = document.getElementById('mPName').value.trim();
  const stage = document.getElementById('mPStage').value;
  const value = parseFloat(document.getElementById('mPVal').value) || 0;
  if (!name) return;
  S.brand.pipeline.unshift({ id: uid(), name, stage, value, date: today() });
  postSignal('brand', 'pipeline-added', { name });
  save(); closeModal(); renderBrand();
};

window.deletePipeline = function(id) {
  S.brand.pipeline = S.brand.pipeline.filter(p => p.id !== id);
  save(); renderBrand();
};

// Health
window.openWorkoutModal = function() {
  showModal('LOG WORKOUT', `
    <div class="modal-form">
      <label class="mf-label">Type</label>
      <select id="mWType" class="mf-input">
        <option>Weights</option>
        <option>Cardio</option>
        <option>HIIT</option>
        <option>Run</option>
        <option>Yoga</option>
        <option>Boxing</option>
        <option>Walk</option>
        <option>General</option>
      </select>
      <label class="mf-label">Notes (optional)</label>
      <input id="mWNote" class="mf-input" type="text" placeholder="sets, duration, feel…">
      <button class="action-btn health-btn" onclick="saveWorkout()">LOG</button>
    </div>`);
};

window.saveWorkout = function() {
  const type  = document.getElementById('mWType').value;
  const notes = document.getElementById('mWNote').value.trim();
  const val   = notes ? `${type} — ${notes}` : type;
  S.health.log.unshift({ id: uid(), date: today(), type: 'workout', value: val, notes });
  S.life.nonNegs.body    = true;
  S.health.lastWorkoutDate = today();
  postSignal('health', 'workout', { type });
  recomputeScore();
  save(); closeModal(); renderHealth(); renderLife();
};

window.openSleepModal = function() {
  showModal('LOG SLEEP', `
    <div class="modal-form">
      <label class="mf-label">Hours Slept</label>
      <input id="mSleepH" class="mf-input" type="number" min="0" max="24" step="0.5" value="${S.health.sleepLast || 7}">
      <button class="action-btn health-btn" onclick="saveSleep()">LOG</button>
    </div>`);
};

window.saveSleep = function() {
  const h = parseFloat(document.getElementById('mSleepH').value) || 7;
  S.health.sleepLast = h;
  S.health.log.unshift({ id: uid(), date: today(), type: 'sleep', value: `${h}h`, notes: '' });
  S.life.nonNegs.sleep = true;
  postSignal('health', 'sleep', { h });
  recomputeScore();
  save(); closeModal(); renderHealth(); renderLife();
};

window.deleteHealthEntry = function(id) {
  S.health.log = S.health.log.filter(e => e.id !== id);
  save(); renderHealth();
};

// Archive
window.saveArchiveEntry = function() {
  const ta   = document.getElementById('archiveTa');
  const text = ta ? ta.value.trim() : '';
  if (!text) return;
  const existing = S.archive.entries.find(e => e.date === today());
  if (existing) {
    existing.text      = text;
    existing.updatedAt = nowISO();
  } else {
    S.archive.entries.unshift({ id: uid(), date: today(), text, tags: [], createdAt: nowISO() });
  }
  postSignal('archive', 'entry', { date: today() });
  recomputeScore();
  save();
  feedback('Entry saved.');
  renderArchive();
  renderLife();
};

// ─── Command Parser ─────────────────────────────────────────
const HELP_TEXT = `
NOIRE OS — COMMANDS
────────────────────────────────────
cash [N]            set cash on hand
cash +[N]           add to cash
cash -[N]           subtract from cash
sold [N] [price]    log units sold
touch [N]           add outbound touches (default 1)
reply [N]           add replies
workout [type]      log a workout
sleep [N]           log hours slept
note [text]         add to today's archive entry
mark [text]         mark today with a note
bill [name] [amt] [dueDay]   add a bill
goal touch [N]      set weekly touch goal
goal sales [N]      set weekly sales goal
goal rev [N]        set weekly revenue goal
goal cash [N]       set cash goal
focus               toggle focus mode
clean               self-clean OS data
status              show agent status
help                show this help
────────────────────────────────────
Press / to focus terminal · ↑↓ for history
`.trim();

function parseCmd(raw) {
  raw = raw.trim();
  if (!raw) return;

  S.cmdHistory.unshift(raw);
  if (S.cmdHistory.length > 60) S.cmdHistory.length = 60;

  const parts = raw.toLowerCase().split(/\s+/);
  const cmd   = parts[0];
  const args  = parts.slice(1);

  if (cmd === 'help' || cmd === '?') {
    showModal('COMMANDS', `<pre>${HELP_TEXT}</pre>`); return;
  }

  if (cmd === 'status') {
    const lines = ['AGENT STATUS', '─'.repeat(32)];
    Object.entries(AGENT_ICONS).forEach(([id, icon]) =>
      lines.push(`${icon} ${id.toUpperCase().padEnd(10)} ACTIVE`)
    );
    lines.push('─'.repeat(32));
    lines.push(`SIGNALS: ${S.signals.length}`);
    lines.push(`SAVED:   ${new Date().toLocaleTimeString()}`);
    showModal('OS STATUS', `<pre>${lines.join('\n')}</pre>`); return;
  }

  if (cmd === 'clean') {
    selfClean(); save();
    feedback('OS cleaned.'); return;
  }

  if (cmd === 'focus') {
    S.life.focusMode = !S.life.focusMode;
    save(); renderLife();
    feedback(`Focus mode ${S.life.focusMode ? 'ON' : 'OFF'}.`); return;
  }

  if (cmd === 'cash') {
    const val = args[0];
    if (!val) { feedback('Usage: cash [N] or cash +[N] or cash -[N]'); return; }
    const n = parseFloat(val.replace(/[+\-$,]/g, ''));
    if (isNaN(n)) { feedback('Invalid amount.'); return; }
    if (val.startsWith('+')) {
      S.finance.cashOnHand += n;
      S.finance.transactions.unshift({ id: uid(), date: today(), type: 'income', amount: n, label: 'cmd' });
    } else if (val.startsWith('-')) {
      S.finance.cashOnHand = Math.max(0, S.finance.cashOnHand - n);
      S.finance.transactions.unshift({ id: uid(), date: today(), type: 'expense', amount: n, label: 'cmd' });
    } else {
      S.finance.cashOnHand = n;
    }
    postSignal('finance', 'cash-cmd', {});
    save(); renderModule('finance'); renderModule('life');
    feedback(`Cash → ${fmtMoney(S.finance.cashOnHand)}`); return;
  }

  if (cmd === 'sold') {
    const n     = parseInt(args[0]) || 1;
    const price = parseFloat(args[1]) || 0;
    S.brand.unitsSold   += n;
    S.brand.saleRevenue += price * n;
    if (price > 0) {
      S.finance.cashOnHand += price * n;
      S.finance.transactions.unshift({ id: uid(), date: today(), type: 'income', amount: price * n, label: `sale ×${n}` });
    }
    postSignal('brand', 'sale-cmd', {});
    save(); renderModule('brand'); renderModule('finance'); renderModule('life');
    feedback(`Sold ${n}${price ? ' @ ' + fmtMoney(price) : ''}`); return;
  }

  if (cmd === 'touch' || cmd === 'touches') {
    const n = parseInt(args[0]) || 1;
    S.brand.touches += n;
    postSignal('brand', 'touch-cmd', {});
    save(); renderModule('brand'); renderModule('life');
    feedback(`+${n} touch${n > 1 ? 'es' : ''} → ${S.brand.touches} today`); return;
  }

  if (cmd === 'reply' || cmd === 'replies') {
    const n = parseInt(args[0]) || 1;
    S.brand.replies += n;
    save(); renderModule('brand');
    feedback(`+${n} repl${n > 1 ? 'ies' : 'y'}`); return;
  }

  if (cmd === 'workout' || cmd === 'wod' || cmd === 'gym') {
    const type = args.join(' ') || 'General';
    S.health.log.unshift({ id: uid(), date: today(), type: 'workout', value: type, notes: '' });
    S.life.nonNegs.body      = true;
    S.health.lastWorkoutDate = today();
    postSignal('health', 'workout-cmd', {});
    recomputeScore(); save(); renderModule('health'); renderModule('life');
    feedback(`Workout: ${type}`); return;
  }

  if (cmd === 'sleep' || cmd === 'slept') {
    const h = parseFloat(args[0]) || 7;
    S.health.sleepLast = h;
    S.health.log.unshift({ id: uid(), date: today(), type: 'sleep', value: `${h}h`, notes: '' });
    S.life.nonNegs.sleep = true;
    postSignal('health', 'sleep-cmd', {});
    recomputeScore(); save(); renderModule('health'); renderModule('life');
    feedback(`Sleep: ${h}h`); return;
  }

  if (cmd === 'note' || cmd === 'archive') {
    const text = raw.slice(cmd.length).trim();
    if (!text) { feedback('Usage: note [text]'); return; }
    const ex = S.archive.entries.find(e => e.date === today());
    if (ex) { ex.text += '\n' + text; ex.updatedAt = nowISO(); }
    else S.archive.entries.unshift({ id: uid(), date: today(), text, tags: [], createdAt: nowISO() });
    postSignal('archive', 'entry-cmd', {});
    recomputeScore(); save(); renderModule('archive'); renderModule('life');
    feedback('Entry saved.'); return;
  }

  if (cmd === 'mark' || cmd === 'marked') {
    S.life.markedToday = raw.slice(cmd.length).trim();
    save(); renderModule('life');
    feedback(`Marked: ${S.life.markedToday}`); return;
  }

  if (cmd === 'bill') {
    const name    = args[0] || 'Bill';
    const amount  = parseFloat(args[1]) || 0;
    const dueDay  = parseInt(args[2]) || 1;
    S.finance.bills.unshift({ id: uid(), name, amount, dueDay, paid: false });
    save(); renderModule('finance');
    feedback(`Bill: ${name} ${fmtMoney(amount)} due day ${dueDay}`); return;
  }

  if (cmd === 'goal') {
    const sub = args[0];
    const n   = parseFloat(args[1]) || 0;
    if (!n) { feedback('Usage: goal [touch|sales|rev|cash] [N]'); return; }
    if (sub === 'touch' || sub === 'touches') {
      S.brand.weeklyGoals.touches = n; feedback(`Touch goal → ${n}`);
    } else if (sub === 'sales' || sub === 'sale') {
      S.brand.weeklyGoals.sales = n; feedback(`Sales goal → ${n}`);
    } else if (sub === 'rev' || sub === 'revenue') {
      S.brand.weeklyGoals.revenue = n; feedback(`Revenue goal → ${fmtMoney(n)}`);
    } else if (sub === 'cash') {
      S.finance.cashGoal = n; feedback(`Cash goal → ${fmtMoney(n)}`);
    } else { feedback('Subcommands: touch, sales, rev, cash'); return; }
    save(); renderModule('brand'); renderModule('finance'); return;
  }

  if (cmd === 'check') {
    const key = args[0];
    if (key && key in S.life.nonNegs) {
      S.life.nonNegs[key] = !S.life.nonNegs[key];
      recomputeScore(); save(); renderModule('life');
      feedback(`${key} ${S.life.nonNegs[key] ? '✓' : '○'}`);
    } else {
      feedback('Negs: body, money, noire, cash, sleep');
    }
    return;
  }

  feedback(`Unknown: "${cmd}". Type help for commands.`);
}

// ─── Modal ──────────────────────────────────────────────────
function showModal(title, bodyHTML) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('overlay').removeAttribute('hidden');
  const first = document.querySelector('#modalBody input, #modalBody select, #modalBody textarea');
  if (first) setTimeout(() => first.focus(), 60);
}

function closeModal() {
  document.getElementById('overlay').setAttribute('hidden', '');
}

// ─── Feedback Toast ─────────────────────────────────────────
let fbTimer;
function feedback(msg) {
  let el = document.getElementById('cmdFeedback');
  if (!el) {
    el = document.createElement('div');
    el.id = 'cmdFeedback';
    el.className = 'cmd-feedback';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(fbTimer);
  fbTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ─── Navigation ─────────────────────────────────────────────
function setupNav() {
  document.querySelectorAll('.mod-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mod-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const id = btn.dataset.module;
      document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
      document.getElementById(`mod-${id}`).classList.add('active');
      renderModule(id);
    });
  });
}

// ─── Command Terminal ────────────────────────────────────────
let histIdx = -1;

function setupTerminal() {
  const input = document.getElementById('cmdInput');

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value.trim();
      if (val) { parseCmd(val); input.value = ''; histIdx = -1; }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < S.cmdHistory.length - 1) {
        histIdx++;
        input.value = S.cmdHistory[histIdx] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = S.cmdHistory[histIdx] || ''; }
      else { histIdx = -1; input.value = ''; }
    } else if (e.key === 'Escape') {
      input.value = ''; histIdx = -1; input.blur();
    }
  });

  document.getElementById('cmdHelpBtn').addEventListener('click', () =>
    showModal('COMMANDS', `<pre>${HELP_TEXT}</pre>`)
  );

  // Press / anywhere to focus terminal
  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== input && !document.getElementById('overlay').isConnected) {
      e.preventDefault();
      input.focus();
    }
  });
}

// ─── Modal Setup ─────────────────────────────────────────────
function setupModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('overlay').addEventListener('click', e => {
    if (e.target.id === 'overlay') closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

// ─── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  S = loadState();
  checkDayChange();
  recomputeScore();

  setupNav();
  setupTerminal();
  setupModal();

  renderStatusBar();
  renderClock();
  renderLife();

  // Agent tick: every 60s
  setInterval(agentTick, 60_000);
  // Clock refresh: every 30s
  setInterval(renderClock, 30_000);

  // Save on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { save(); }
    else { checkDayChange(); recomputeScore(); renderActive(); }
  });

  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
