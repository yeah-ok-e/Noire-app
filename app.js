'use strict';

// ═══════════════════════════════════════════════════════════
// LEGACY OS — Multi-Agent AI Operating System
// ═══════════════════════════════════════════════════════════
// Agents: CFO · Operator · Noire Strategist · Archivist
//         Reality Guard · Health · Intelligence · Legacy
// ═══════════════════════════════════════════════════════════

// ─── Config ────────────────────────────────────────────────
const OS_KEY = 'legacy-os-v3';
const LEGACY_KEYS = [
  'noire-os-v2','noire-app-state',
  'noire-dashboard-expensive','noire-dashboard-minimal',
  'noire-dashboard-black','noire-dashboard-custom',
  'noire-dashboard-v2','noire-dashboard-v3'
];

const AGENT_ROSTER = [
  { id:'cfo',           icon:'◈', name:'CFO',              color:'#00d4aa' },
  { id:'operator',      icon:'◎', name:'OPERATOR',         color:'#ffffff' },
  { id:'noire',         icon:'◆', name:'NOIRE STRATEGIST', color:'#ff6b35' },
  { id:'realityGuard',  icon:'⚡', name:'REALITY GUARD',   color:'#f59e0b' },
  { id:'health',        icon:'◉', name:'HEALTH',           color:'#00ff88' },
  { id:'intelligence',  icon:'◐', name:'INTELLIGENCE',     color:'#60a5fa' },
  { id:'archivist',     icon:'◇', name:'ARCHIVIST',        color:'#9b6bff' },
  { id:'legacy',        icon:'∞', name:'LEGACY',           color:'#e879f9' },
];

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
  const f = Math.round(Math.min(1, Math.max(0, pct)) * len);
  return '█'.repeat(f) + '░'.repeat(len - f);
}

// ─── Default State ─────────────────────────────────────────
function defaultState() {
  const d = today();
  return {
    v: 3,
    system: {
      phase: 'SURVIVAL', // SURVIVAL | PROOF | SCALE
      autoPhase: true,
    },
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
      dailyBurn: 0,
      transactions: [],
      bills: [],
      incomeStreams: [],
      assets: []
    },
    brand: {
      touches: 0,
      replies: 0,
      unitsSold: 0,
      saleRevenue: 0,
      weeklyGoals: { touches: 50, sales: 3, revenue: 500 },
      history: [],
      pipeline: [],
      inventory: [],
      campaigns: [],
      buyers: [],
      collaborators: []
    },
    health: {
      streak: 0,
      lastWorkoutDate: null,
      sleepLast: 0,
      proteinToday: 0,
      proteinGoal: 150,
      recoveryScore: 5,
      weight: 0,
      bodyFat: 0,
      physique: { targetWeight: 0, targetBodyFat: 0, deadline: '' },
      log: [],
      weeklyGoal: 5,
      totals: { workouts: 0, rentPaid: 0 }
    },
    archive: {
      startDate: d,
      entries: [],
      lessons: [],
      messages: [],
      milestones: [],
      doctrine: []
    },
    signals: [],
    cmdHistory: []
  };
}

// ─── State Migration ────────────────────────────────────────
function migrateState(s) {
  if (!s || typeof s !== 'object') return defaultState();
  const d = defaultState();

  // v2 → v3: add all new domains
  if (s.v === 2) {
    s.v = 3;
    s.system = { phase: 'SURVIVAL', autoPhase: true };
    if (!s.finance.dailyBurn)    s.finance.dailyBurn = 0;
    if (!s.finance.incomeStreams) s.finance.incomeStreams = [];
    if (!s.finance.assets)       s.finance.assets = [];
    if (!s.brand.inventory)      s.brand.inventory = [];
    if (!s.brand.campaigns)      s.brand.campaigns = [];
    if (!s.brand.buyers)         s.brand.buyers = [];
    if (!s.brand.collaborators)  s.brand.collaborators = [];
    if (!s.health.proteinToday)  s.health.proteinToday = 0;
    if (!s.health.proteinGoal)   s.health.proteinGoal = 150;
    if (!s.health.recoveryScore) s.health.recoveryScore = 5;
    if (!s.health.weight)        s.health.weight = 0;
    if (!s.health.bodyFat)       s.health.bodyFat = 0;
    if (!s.health.physique)      s.health.physique = d.health.physique;
    if (!s.archive.lessons)      s.archive.lessons = [];
    if (!s.archive.messages)     s.archive.messages = [];
    if (!s.archive.milestones)   s.archive.milestones = [];
    if (!s.archive.doctrine)     s.archive.doctrine = [];
  }
  return s;
}

// ─── State Load / Save ──────────────────────────────────────
let S;

function loadState() {
  // Try current key
  try {
    const raw = localStorage.getItem(OS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.v >= 3) return p;
      if (p && p.v === 2) return migrateState(p);
    }
  } catch (_) {}

  // Try legacy keys
  for (const k of LEGACY_KEYS) {
    try {
      const p = JSON.parse(localStorage.getItem(k) || '');
      if (p && typeof p === 'object') return migrateState(p);
    } catch (_) {}
  }
  return defaultState();
}

function save() {
  localStorage.setItem(OS_KEY, JSON.stringify(S));
}

// ─── Agent Runtime ──────────────────────────────────────────
function postSignal(agentId, type, payload) {
  S.signals.unshift({ id: uid(), agentId, type, payload, ts: nowISO() });
  if (S.signals.length > 60) S.signals.length = 60;
}

function selfClean() {
  S.life.history           = S.life.history.slice(0, 365);
  S.brand.history          = S.brand.history.slice(0, 365);
  S.health.log             = S.health.log.slice(0, 500);
  S.archive.entries        = S.archive.entries.slice(0, 2000);
  S.finance.transactions   = S.finance.transactions.slice(0, 500);
  S.signals                = S.signals.slice(0, 60);
  S.cmdHistory             = S.cmdHistory.slice(0, 60);
}

function checkDayChange() {
  const d = today();
  if (S.life.date === d) return;

  // Archive life snapshot
  S.life.history.unshift({
    date: S.life.date,
    dayScore: S.life.dayScore,
    markedToday: S.life.markedToday,
    nonNegs: { ...S.life.nonNegs }
  });

  // Archive brand snapshot
  S.brand.history.unshift({
    date: S.life.date,
    touches: S.brand.touches,
    unitsSold: S.brand.unitsSold,
    saleRevenue: S.brand.saleRevenue
  });

  // Health: streak update
  if (S.life.nonNegs.body) {
    S.health.totals.workouts++;
    S.health.streak++;
    S.health.lastWorkoutDate = S.life.date;
  } else if (S.health.lastWorkoutDate) {
    if (daysBetween(S.health.lastWorkoutDate, S.life.date) > 1) S.health.streak = 0;
  }

  // Reset daily counters
  S.life.date         = d;
  S.life.markedToday  = '';
  S.life.nonNegs      = { body: false, money: false, noire: false, cash: false, sleep: false };
  S.life.dayScore     = 0;
  S.brand.touches     = 0;
  S.brand.replies     = 0;
  S.brand.unitsSold   = 0;
  S.brand.saleRevenue = 0;
  S.health.proteinToday = 0;

  postSignal('system', 'day-changed', { date: d });
  save();
}

function agentTick() {
  checkDayChange();
  selfClean();
  recomputeScore();
  if (S.system.autoPhase) S.system.phase = computePhase();
  renderStatusBar();
  renderClock();
}

// ─── Computed Metrics ───────────────────────────────────────
function weekBrand() {
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  let touches = S.brand.touches, sales = S.brand.unitsSold, revenue = S.brand.saleRevenue;
  for (const h of S.brand.history) {
    if (h.date >= cutoff) {
      touches  += h.touches     || 0;
      sales    += h.unitsSold   || 0;
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
  return Math.max(1, daysBetween(S.archive.startDate || today(), today()) + 1);
}

function computeRunway() {
  if (!S.finance.dailyBurn || S.finance.dailyBurn <= 0) return Infinity;
  return Math.max(0, Math.floor(S.finance.cashOnHand / S.finance.dailyBurn));
}

function computeRisk() {
  const r = computeRunway();
  const c = S.finance.cashOnHand;
  if (r !== Infinity && r < 7)    return 'CRITICAL';
  if (r !== Infinity && r < 14)   return 'HIGH';
  if (c < 200)                    return 'HIGH';
  if (r !== Infinity && r < 30)   return 'MEDIUM';
  if (c < S.finance.cashGoal * 0.3) return 'MEDIUM';
  return 'LOW';
}

function computePhase() {
  if (!S.system.autoPhase) return S.system.phase;
  const r = computeRunway();
  const c = S.finance.cashOnHand;
  const week = weekBrand();
  if ((r !== Infinity && r < 21) || c < 200) return 'SURVIVAL';
  if (c >= S.finance.cashGoal && week.sales >= S.brand.weeklyGoals.sales) return 'SCALE';
  return 'PROOF';
}

function computeMomentum() {
  const recent = S.life.history.slice(0, 5);
  const current = S.life.dayScore;
  if (!recent.length) return { score: current, trend: 'STABLE' };
  const avg = recent.reduce((s, d) => s + (d.dayScore || 0), 0) / recent.length;
  const score = Math.round(current * 0.4 + avg * 0.6);
  const trend = current > avg * 1.15 ? 'UP' : current < avg * 0.75 ? 'DOWN' : 'STABLE';
  return { score, trend };
}

function computeScore() {
  const nn       = S.life.nonNegs;
  const nnDone   = Object.values(nn).filter(Boolean).length;
  const nnScore  = (nnDone / 5) * 50;
  const hScore   = Math.min(1, weekWorkouts() / S.health.weeklyGoal) * 15;
  const tScore   = Math.min(1, S.brand.touches / S.brand.weeklyGoals.touches) * 20;
  const hasNote  = !!S.archive.entries.find(e => e.date === today());
  return Math.round(nnScore + hScore + tScore + (hasNote ? 15 : 0));
}

function recomputeScore() {
  S.life.dayScore = computeScore();
}

// ─── Agent Compute Functions ────────────────────────────────
function runCFO() {
  const c = S.finance.cashOnHand, goal = S.finance.cashGoal;
  const r = computeRunway(), risk = computeRisk();
  const signals = [];

  if (risk === 'CRITICAL') signals.push('FREEZE all non-essential spend. One mission: cash in.');
  else if (risk === 'HIGH') signals.push('Compress spend. No new commitments without closes first.');
  else if (risk === 'MEDIUM') signals.push('Measured spend only. Maintain $200+ buffer above bills.');

  const active  = S.finance.incomeStreams.filter(s => s.status === 'active');
  const pending = S.finance.incomeStreams.filter(s => s.status === 'pending');

  if (!active.length && !signals.length) signals.push('No active income streams. Log them for trajectory tracking.');
  if (c >= goal && pending.length) signals.push(`Goal reached. Activate: ${pending[0].name}`);
  if (c >= goal && !pending.length && signals.length === 0) signals.push('Cash goal reached. Raise the ceiling or reinvest.');

  const totalBills = S.finance.bills.reduce((s, b) => s + (b.amount || 0), 0);
  if (totalBills > c * 0.8 && c > 0) signals.push(`Bills (${fmtMoney(totalBills)}) = ${Math.round((totalBills/c)*100)}% of cash. Compress or close.`);

  return { risk, signals };
}

function runRealityGuard() {
  const warnings = [];
  const c = S.finance.cashOnHand, goal = S.finance.cashGoal;
  const r = computeRunway(), phase = computePhase();
  const week = weekBrand(), ww = weekWorkouts();
  const day = new Date().getDay();

  if (r !== Infinity && r < 7)
    warnings.push({ level:'critical', text:`${r}d runway. Spending freeze. Zero new commitments.` });
  else if (r !== Infinity && r < 14)
    warnings.push({ level:'high', text:`${r}d runway. Compress expenses immediately.` });

  if (c < goal * 0.15 && phase !== 'SURVIVAL')
    warnings.push({ level:'high', text:'Phase mismatch. Cash is at survival level. Operate accordingly.' });

  if (week.touches > 20 && week.sales === 0)
    warnings.push({ level:'high', text:`${week.touches} touches, zero closes. Pitch or qualification is off.` });

  if (week.sales === 0 && day >= 5)
    warnings.push({ level:'medium', text:'No sales this week. Weekend is not a rest day right now.' });

  if (ww === 0 && day >= 4)
    warnings.push({ level:'medium', text:'No workouts by Thursday. Body is infrastructure. 20 mins minimum.' });

  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const weekEntries = S.archive.entries.filter(e => e.date >= cutoff);
  if (!weekEntries.length)
    warnings.push({ level:'low', text:'Zero archive entries this week. The system cannot document silence.' });

  const mom = computeMomentum();
  if (mom.trend === 'DOWN' && c < goal * 0.3)
    warnings.push({ level:'high', text:'Declining momentum + low cash. Narrow to one highest-yield action.' });

  return warnings;
}

function runIntelligence() {
  const opps = [];
  const week = weekBrand(), goals = S.brand.weeklyGoals;
  const c = S.finance.cashOnHand, goal = S.finance.cashGoal;

  if (week.touches > 20 && week.sales === 0)
    opps.push('High touch-to-close gap. Test a sharper, more direct pitch.');

  const pitched = S.brand.pipeline.filter(p => p.stage === 'PITCHED');
  if (pitched.length >= 2) {
    const val = pitched.reduce((s, p) => s + (p.value || 0), 0);
    opps.push(`${pitched.length} deals pitched (${fmtMoney(val)} potential). Nudge each this week.`);
  }

  const followUps = S.brand.pipeline.filter(p => p.stage === 'FOLLOW-UP');
  if (followUps.length) opps.push(`${followUps.length} lead${followUps.length > 1 ? 's' : ''} in follow-up. Touch them today.`);

  if (c >= goal * 0.85 && c < goal)
    opps.push('One close away from cash goal. Prioritize the nearest deal.');

  const pending = S.finance.incomeStreams.filter(s => s.status === 'pending');
  if (pending.length)
    opps.push(`${pending.length} income stream${pending.length > 1 ? 's' : ''} pending activation. Review trigger conditions.`);

  if (week.touches < goals.touches * 0.4 && new Date().getDay() <= 3)
    opps.push('Early week, low volume. Stack outbound today.');

  const buyers = S.brand.buyers.filter(b => {
    if (!b.lastContact) return false;
    return daysBetween(b.lastContact, today()) > 30;
  });
  if (buyers.length) opps.push(`${buyers.length} buyer${buyers.length > 1 ? 's' : ''} not contacted in 30+ days. Reconnect.`);

  return opps.length ? opps : ['Monitoring. No active opportunity flags.'];
}

function generateNextActions() {
  const actions = [];
  const c = S.finance.cashOnHand, goal = S.finance.cashGoal;
  const week = weekBrand(), goals = S.brand.weeklyGoals;
  const r = computeRunway(), ww = weekWorkouts();
  const day = new Date().getDay();

  if (r !== Infinity && r < 14)
    actions.push({ priority:'critical', text:`Cash runway: ${r}d. Generate income now.`, tag:'CFO' });
  if (c < 100)
    actions.push({ priority:'critical', text:'Emergency: sub-$100. Every close matters.', tag:'CFO' });

  const salesLeft = goals.sales - week.sales;
  if (salesLeft > 0)
    actions.push({ priority:'high', text:`Close ${salesLeft} more unit${salesLeft > 1 ? 's' : ''} this week`, tag:'NOIRE' });

  const followUps = S.brand.pipeline.filter(p => p.stage === 'FOLLOW-UP');
  if (followUps.length)
    actions.push({ priority:'high', text:`Follow up: ${followUps.slice(0,2).map(p=>p.name).join(', ')}${followUps.length>2?` +${followUps.length-2}`:''}`, tag:'NOIRE' });

  const touchesLeft = goals.touches - week.touches;
  if (touchesLeft > 0 && week.touches < goals.touches * 0.6)
    actions.push({ priority:'high', text:`${touchesLeft} touches to weekly goal`, tag:'NOIRE' });

  if (!S.life.nonNegs.body) {
    if (ww === 0 && day >= 3)
      actions.push({ priority:'high', text:'No workouts this week. Move today.', tag:'BODY' });
    else
      actions.push({ priority:'medium', text:'Log a workout today', tag:'BODY' });
  }

  if (S.health.proteinToday < S.health.proteinGoal * 0.5)
    actions.push({ priority:'medium', text:`Protein: ${S.health.proteinToday}g / ${S.health.proteinGoal}g goal`, tag:'BODY' });

  if (!S.archive.entries.find(e => e.date === today()))
    actions.push({ priority:'low', text:'Archive today before you sleep', tag:'LEGACY' });

  return actions.slice(0, 7);
}

// ─── Render Utilities ───────────────────────────────────────
function renderStatusBar() {
  const bar = document.getElementById('agentStatusBar');
  if (!bar) return;
  bar.innerHTML = AGENT_ROSTER.slice(0, 5).map(a =>
    `<span class="agent-dot" style="color:${a.color}" title="${a.name}">${a.icon}</span>`
  ).join('');
}

function renderClock() {
  const el = document.getElementById('osTime');
  if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:false });
}

// ─── Module: HOME ───────────────────────────────────────────
function renderHome() {
  const phase   = S.system.autoPhase ? computePhase() : S.system.phase;
  const mom     = computeMomentum();
  const risk    = computeRisk();
  const r       = computeRunway();
  const actions = generateNextActions();
  const warnings= runRealityGuard();
  const nn      = S.life.nonNegs;
  const d       = new Date();
  const dayStr  = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  const days    = daysRunning();
  const gap     = Math.max(0, S.finance.cashGoal - S.finance.cashOnHand);
  const rwStr   = r === Infinity ? '∞' : `${r}d`;
  const phClass = { SURVIVAL:'survival', PROOF:'proof', SCALE:'scale' }[phase] || 'proof';
  const trendIcon = { UP:'↑', STABLE:'→', DOWN:'↓' }[mom.trend];

  document.getElementById('mod-home').innerHTML = `
    <div class="ops-header">
      <div class="ops-left">
        <span class="phase-badge phase-${phClass}">${phase}</span>
        <span class="ops-day">DAY ${days}</span>
      </div>
      <span class="ops-date">${dayStr}, ${dateStr}</span>
    </div>

    <div class="snapshot-panel">
      <div class="snap-grid">
        <div class="snap-item">
          <span class="snap-label">CASH</span>
          <span class="snap-val">${fmtMoney(S.finance.cashOnHand)}</span>
        </div>
        <div class="snap-item">
          <span class="snap-label">RUNWAY</span>
          <span class="snap-val ${r !== Infinity && r < 14 ? 'snap-danger' : ''}">${rwStr}</span>
        </div>
        <div class="snap-item">
          <span class="snap-label">GAP</span>
          <span class="snap-val">${fmtMoney(gap)}</span>
        </div>
        <div class="snap-item">
          <span class="snap-label">RISK</span>
          <span class="snap-val risk-badge risk-${risk.toLowerCase()}">${risk}</span>
        </div>
      </div>
    </div>

    <div class="momentum-panel">
      <div class="panel-label">Momentum</div>
      <div class="momentum-row">
        <span class="momentum-score">${mom.score}</span>
        <div class="momentum-meta">
          <span class="momentum-trend trend-${mom.trend.toLowerCase()}">${trendIcon} ${mom.trend}</span>
          <span class="momentum-phase">${phase} · Day Score ${S.life.dayScore}</span>
        </div>
      </div>
      <div class="momentum-bar">${progBar(mom.score / 100)}</div>
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

    ${actions.length ? `
    <div class="actions-panel">
      <div class="panel-label">Next Actions</div>
      ${actions.map(a => `
        <div class="action-item priority-${a.priority}">
          <span class="action-dot"></span>
          <span class="action-text">${a.text}</span>
          <span class="action-tag">${a.tag}</span>
        </div>
      `).join('')}
    </div>` : ''}

    ${warnings.length ? `
    <div class="guard-panel">
      <div class="panel-label guard-label">⚡ Reality Guard</div>
      ${warnings.map(w => `
        <div class="guard-item">
          <span class="guard-dot">${{critical:'🔴',high:'🟠',medium:'🟡',low:'⚪'}[w.level]}</span>
          <span class="guard-text">${w.text}</span>
        </div>
      `).join('')}
    </div>` : ''}

    ${S.life.markedToday ? `
    <div class="marked-panel">
      <span class="panel-label" style="margin:0">MARKED</span>
      <span class="marked-text">${S.life.markedToday}</span>
    </div>` : ''}
  `;
}

// ─── Module: FINANCE ────────────────────────────────────────
function renderFinance() {
  const gap  = Math.max(0, S.finance.cashGoal - S.finance.cashOnHand);
  const pct  = S.finance.cashOnHand / S.finance.cashGoal;
  const r    = computeRunway(), risk = computeRisk();
  const cfo  = runCFO();
  const rwStr = r === Infinity ? '∞' : `${r}d`;
  const txs  = S.finance.transactions.slice(0, 8);

  document.getElementById('mod-finance').innerHTML = `
    <div class="cash-hero-panel">
      <div class="cash-hero-top">
        <div class="panel-label" style="margin:0">Cash On Hand</div>
        <span class="risk-badge risk-${risk.toLowerCase()}">${risk}</span>
      </div>
      <div class="cash-hero-num" onclick="openCashEdit()">${fmtMoney(S.finance.cashOnHand)}</div>
      <div class="cash-meta">
        <span class="cash-meta-item">GAP: ${fmtMoney(gap)}</span>
        <span class="cash-meta-item ${r !== Infinity && r < 14 ? 'danger' : ''}">RUNWAY: ${rwStr}${S.finance.dailyBurn ? ' @ '+fmtMoney(S.finance.dailyBurn)+'/d' : ''}</span>
      </div>
      <div class="cash-bar">${progBar(pct)} ${Math.round(pct*100)}%</div>
      ${cfo.signals[0] ? `<div class="cfo-signal">${cfo.signals[0]}</div>` : ''}
    </div>

    <div class="quick-cash-panel">
      <div class="panel-label">Quick Add</div>
      <div class="quick-btns">
        <button class="quick-btn" onclick="quickCash(100)">+$100</button>
        <button class="quick-btn" onclick="quickCash(500)">+$500</button>
        <button class="quick-btn" onclick="quickCash(1000)">+$1K</button>
        <button class="quick-btn expense" onclick="openExpenseModal()">EXPENSE</button>
        <button class="quick-btn neutral" onclick="openBurnModal()">BURN</button>
      </div>
    </div>

    <div class="streams-panel">
      <div class="panel-label">Income Streams ${S.finance.incomeStreams.length ? `(${S.finance.incomeStreams.length})` : ''}</div>
      ${S.finance.incomeStreams.map(st => `
        <div class="stream-row">
          <span class="stream-name">${st.name}</span>
          <span class="stream-amt">${st.monthly ? fmtMoney(st.monthly)+'/mo' : ''}</span>
          <span class="stream-status s-${st.status}">${st.status.toUpperCase()}</span>
          <button class="icon-cycle" onclick="cycleStream('${st.id}')" title="cycle status">↻</button>
          <button class="icon-del"   onclick="deleteStream('${st.id}')">✕</button>
        </div>
      `).join('')}
      <button class="action-btn finance-btn" style="margin-top:${S.finance.incomeStreams.length?'8px':'0'};width:100%" onclick="openStreamModal()">+ INCOME STREAM</button>
    </div>

    ${S.finance.bills.length ? `
    <div class="bills-panel">
      <div class="panel-label">Bills</div>
      ${S.finance.bills.slice(0,6).map(b => `
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
          <span class="tx-amt ${t.type}">${t.type==='income'?'+':'-'}${fmtMoney(t.amount)}</span>
        </div>
      `).join('')}
    </div>` : ''}
  `;
}

// ─── Module: NOIRE HQ ───────────────────────────────────────
let noireTab = 'sales';

function renderNoire() {
  const tabs = ['SALES','STOCK','OUTREACH'];
  document.getElementById('mod-noire').innerHTML = `
    <div class="sub-nav">
      ${tabs.map(t => `
        <button class="sub-btn ${noireTab === t.toLowerCase() ? 'active' : ''}"
                onclick="switchNoireTab('${t.toLowerCase()}')">${t}</button>
      `).join('')}
    </div>
    <div id="noire-body"></div>
  `;
  renderNoireBody();
}

function renderNoireBody() {
  const el = document.getElementById('noire-body');
  if (!el) return;

  if (noireTab === 'sales') {
    const week = weekBrand(), goals = S.brand.weeklyGoals;
    const pipe = S.brand.pipeline;
    el.innerHTML = `
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
          <span class="goal-bar">${progBar(week.touches/goals.touches)}</span>
          <span class="goal-num">${week.touches}/${goals.touches}</span>
        </div>
        <div class="goal-row">
          <span class="goal-name">SALES</span>
          <span class="goal-bar">${progBar(week.sales/goals.sales)}</span>
          <span class="goal-num">${week.sales}/${goals.sales}</span>
        </div>
        <div class="goal-row">
          <span class="goal-name">REVENUE</span>
          <span class="goal-bar">${progBar(week.revenue/goals.revenue)}</span>
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
        <div class="panel-label">Pipeline (${pipe.length})</div>
        ${pipe.slice(0,8).map(p => `
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

  else if (noireTab === 'stock') {
    const inv = S.brand.inventory.filter(i => i.status !== 'archived');
    const totalVal = inv.reduce((s, i) => s + (i.qty * i.price), 0);
    el.innerHTML = `
      <div class="inv-actions">
        <button class="action-btn brand-btn" onclick="openInventoryModal()">+ ADD ITEM</button>
      </div>
      ${inv.length ? `
      <div class="inv-panel">
        <div class="panel-label">Inventory (${inv.length} items)</div>
        ${inv.map(item => `
          <div class="inv-row">
            <span class="inv-name">${item.name}</span>
            <span class="inv-qty">${item.qty}u</span>
            <span class="inv-price">${fmtMoney(item.price)}</span>
            <span class="inv-tag inv-${item.status || 'active'}">${(item.status||'active').toUpperCase()}</span>
            <button class="icon-del" onclick="deleteInventory('${item.id}')">✕</button>
          </div>
        `).join('')}
        <div class="inv-summary">Total value: ${fmtMoney(totalVal)} · ${inv.reduce((s,i)=>s+i.qty,0)} units</div>
      </div>` : '<div class="empty-state">No inventory. Add items above.</div>'}
    `;
  }

  else if (noireTab === 'outreach') {
    const campaigns = S.brand.campaigns, buyers = S.brand.buyers;
    el.innerHTML = `
      <div class="outreach-actions">
        <button class="action-btn brand-btn" onclick="openCampaignModal()">+ CAMPAIGN</button>
        <button class="action-btn brand-btn" onclick="openBuyerModal()">+ BUYER</button>
      </div>
      ${campaigns.length ? `
      <div class="campaign-panel">
        <div class="panel-label">Campaigns (${campaigns.length})</div>
        ${campaigns.slice(0,6).map(c => `
          <div class="camp-row">
            <span class="camp-name">${c.name}</span>
            <span class="camp-chan">${c.channel}</span>
            <span class="camp-stat cs-${c.status}">${c.status.toUpperCase()}</span>
            <button class="icon-del" onclick="deleteCampaign('${c.id}')">✕</button>
          </div>
        `).join('')}
      </div>` : ''}
      ${buyers.length ? `
      <div class="buyer-panel">
        <div class="panel-label">Buyers (${buyers.length})</div>
        ${buyers.slice(0,8).map(b => `
          <div class="buyer-row">
            <span class="buyer-name">${b.name}</span>
            <span class="buyer-spend">${fmtMoney(b.totalSpend)}</span>
            <span class="buyer-last">${b.lastContact ? fmtDate(b.lastContact) : '—'}</span>
            <button class="icon-del" onclick="deleteBuyer('${b.id}')">✕</button>
          </div>
        `).join('')}
      </div>` : ''}
      ${!campaigns.length && !buyers.length ? '<div class="empty-state">No outreach data. Add a campaign or buyer.</div>' : ''}
    `;
  }
}

window.switchNoireTab = function(tab) { noireTab = tab; renderNoire(); };

// ─── Module: BODY ───────────────────────────────────────────
function renderBody() {
  const ww     = weekWorkouts();
  const goal   = S.health.weeklyGoal;
  const total  = S.health.totals.workouts + (S.life.nonNegs.body ? 1 : 0);
  const dots   = Array.from({length: goal}, (_,i) => i < ww ? '●' : '○').join(' ');
  const pPct   = Math.min(1, S.health.proteinToday / S.health.proteinGoal);
  const recent = S.health.log.slice(0, 6);

  document.getElementById('mod-body').innerHTML = `
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

    <div class="protein-panel">
      <div class="panel-label">Protein Today</div>
      <div class="protein-row">
        <span class="protein-num">${S.health.proteinToday}g</span>
        <span class="protein-goal">/ ${S.health.proteinGoal}g</span>
        <button class="icon-add" onclick="openProteinModal()">+</button>
      </div>
      <div class="prot-bar-track">
        <div class="prot-bar-fill" style="width:${Math.round(pPct*100)}%"></div>
      </div>
    </div>

    <div class="health-actions">
      <button class="action-btn health-btn" onclick="openWorkoutModal()">+ WORKOUT</button>
      <button class="action-btn health-btn" onclick="openSleepModal()">+ SLEEP</button>
      <button class="action-btn health-btn" onclick="openMVWModal()">MVW</button>
      <button class="action-btn health-btn" onclick="openBodyCompModal()">BODY</button>
    </div>

    ${S.health.sleepLast ? `
    <div class="sleep-panel">
      <span class="panel-label" style="margin:0">Last Sleep</span>
      <span class="sleep-val">${S.health.sleepLast}h</span>
    </div>` : ''}

    ${S.health.weight ? `
    <div class="body-comp-panel">
      <span class="panel-label" style="margin:0">Body</span>
      <div class="bc-row">
        <span class="bc-item">${S.health.weight} lbs</span>
        ${S.health.bodyFat ? `<span class="bc-item">${S.health.bodyFat}% BF</span>` : ''}
        <span class="bc-item">Recovery ${S.health.recoveryScore}/10</span>
      </div>
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

// ─── Module: AGENTS ─────────────────────────────────────────
function renderAgents() {
  const cfo      = runCFO();
  const warnings = runRealityGuard();
  const opps     = runIntelligence();
  const week     = weekBrand();
  const ww       = weekWorkouts();
  const mom      = computeMomentum();
  const phase    = computePhase();
  const days     = daysRunning();

  const cards = [
    {
      ...AGENT_ROSTER.find(a=>a.id==='operator'),
      badge: 'ACTIVE',
      sigs: [`Phase: ${phase}. Momentum: ${mom.score} (${mom.trend}). Day ${days}.`,
             `Focus: ${generateNextActions()[0]?.text || 'On track.'}`]
    },
    {
      ...AGENT_ROSTER.find(a=>a.id==='cfo'),
      badge: cfo.risk === 'CRITICAL' ? 'ALERT' : cfo.risk === 'HIGH' ? 'WARN' : 'ACTIVE',
      sigs: cfo.signals.length ? cfo.signals : ['No alerts. Cash stable.']
    },
    {
      ...AGENT_ROSTER.find(a=>a.id==='noire'),
      badge: 'ACTIVE',
      sigs: [`${week.sales}/${S.brand.weeklyGoals.sales} sales · ${week.touches} touches this week.`,
             S.brand.pipeline.length ? `Pipeline: ${S.brand.pipeline.length} deals.` : 'Pipeline empty.']
    },
    {
      ...AGENT_ROSTER.find(a=>a.id==='realityGuard'),
      badge: warnings.length > 1 ? 'FLAGGED' : warnings.length === 1 ? 'WARN' : 'CLEAR',
      sigs: warnings.length ? warnings.map(w=>w.text) : ['No contradictions detected. Plans are executable.']
    },
    {
      ...AGENT_ROSTER.find(a=>a.id==='health'),
      badge: 'ACTIVE',
      sigs: [`Streak: ${S.health.streak}. ${ww}/${S.health.weeklyGoal} workouts. Sleep: ${S.health.sleepLast||'—'}h.`,
             `Protein: ${S.health.proteinToday}g/${S.health.proteinGoal}g. Recovery: ${S.health.recoveryScore}/10.`]
    },
    {
      ...AGENT_ROSTER.find(a=>a.id==='intelligence'),
      badge: 'ACTIVE',
      sigs: opps
    },
    {
      ...AGENT_ROSTER.find(a=>a.id==='archivist'),
      badge: 'ACTIVE',
      sigs: [`${S.archive.entries.length} entries. ${days} days documented.`,
             `This week: ${S.archive.entries.filter(e=>e.date>=new Date(Date.now()-7*86400000).toISOString().slice(0,10)).length} entries.`]
    },
    {
      ...AGENT_ROSTER.find(a=>a.id==='legacy'),
      badge: 'ACTIVE',
      sigs: [`${S.archive.lessons.length} life lessons. ${S.archive.messages.length} messages to children.`,
             `${S.archive.milestones.length} milestones. ${S.archive.doctrine.length} doctrine entries.`]
    }
  ];

  document.getElementById('mod-agents').innerHTML = `
    <div class="agent-board-top">
      <div class="panel-label">${cards.length} Agents Active · Self-Governing</div>
    </div>
    ${cards.map(ag => `
      <div class="agent-card ${ag.id==='realityGuard'?'guard-card':''}">
        <div class="agent-header">
          <span class="agent-icon" style="color:${ag.color}">${ag.icon}</span>
          <span class="agent-name" style="color:${ag.color}">${ag.name}</span>
          <span class="agent-badge badge-${ag.badge.toLowerCase()}">${ag.badge}</span>
        </div>
        <div class="agent-sigs">
          ${ag.sigs.slice(0,3).map(s=>`<div class="agent-sig">${s}</div>`).join('')}
        </div>
      </div>
    `).join('')}
  `;
}

// ─── Module: LEGACY ─────────────────────────────────────────
let legacyTab = 'daily';

function renderLegacy() {
  const days   = daysRunning();
  const totalRev = S.finance.transactions.filter(t=>t.type==='income').reduce((s,t)=>s+(t.amount||0),0);
  const tabs   = ['DAILY','LESSONS','CHILDREN','MILESTONES'];

  document.getElementById('mod-legacy').innerHTML = `
    <div class="arc-stats">
      <div class="arc-stat"><span class="arc-num">${days}</span><span class="arc-label">DAYS</span></div>
      <div class="arc-stat"><span class="arc-num">${S.archive.lessons.length}</span><span class="arc-label">LESSONS</span></div>
      <div class="arc-stat"><span class="arc-num">${S.archive.milestones.length}</span><span class="arc-label">MILESTONES</span></div>
      <div class="arc-stat"><span class="arc-num">${fmtMoney(totalRev)}</span><span class="arc-label">REVENUE</span></div>
    </div>
    <div class="sub-nav">
      ${tabs.map(t => `
        <button class="sub-btn ${legacyTab===t.toLowerCase()?'active':''}"
                onclick="switchLegacyTab('${t.toLowerCase()}')">${t}</button>
      `).join('')}
    </div>
    <div id="legacy-body"></div>
  `;
  renderLegacyBody();
}

function renderLegacyBody() {
  const el = document.getElementById('legacy-body');
  if (!el) return;

  if (legacyTab === 'daily') {
    const todayEntry = S.archive.entries.find(e => e.date === today());
    const recent = S.archive.entries.slice(0, 15);
    el.innerHTML = `
      <div class="compose-panel">
        <div class="panel-label">Today — ${fmtDate(today())}</div>
        <textarea id="archiveTa" class="archive-textarea"
                  placeholder="What happened today…">${todayEntry ? todayEntry.text : ''}</textarea>
        <button class="action-btn archive-btn" onclick="saveArchiveEntry()">SAVE ENTRY</button>
      </div>
      <div class="timeline-panel">
        <div class="panel-label">Timeline</div>
        ${recent.length
          ? recent.map(e=>`
              <div class="timeline-entry">
                <div class="tl-date">${fmtDate(e.date)}</div>
                <div class="tl-text">${e.text.slice(0,150)}${e.text.length>150?'…':''}</div>
              </div>`).join('')
          : '<div class="tl-empty">No entries yet. Start writing.</div>'
        }
      </div>`;
  }

  else if (legacyTab === 'lessons') {
    el.innerHTML = `
      <div class="compose-mini">
        <div class="panel-label">New Lesson</div>
        <textarea id="lessonTa" class="archive-textarea" style="min-height:65px"
                  placeholder="What did you learn today? Be direct and specific."></textarea>
        <button class="action-btn archive-btn" onclick="saveLesson()">SAVE LESSON</button>
      </div>
      <div class="lessons-panel">
        <div class="panel-label">Life Lessons (${S.archive.lessons.length})</div>
        ${S.archive.lessons.length
          ? S.archive.lessons.slice(0,30).map(l=>`
              <div class="lesson-entry">
                <span class="lesson-date">${fmtDate(l.date)}</span>
                <span class="lesson-text">${l.text}</span>
                <button class="icon-del" onclick="deleteLesson('${l.id}')">✕</button>
              </div>`).join('')
          : '<div class="tl-empty">No lessons yet.</div>'
        }
      </div>`;
  }

  else if (legacyTab === 'children') {
    el.innerHTML = `
      <div class="msg-note">These words are preserved for your children. Write freely — no filter.</div>
      <div class="compose-mini">
        <input id="msgTo"  class="mf-input" type="text" placeholder="To: (name or 'my children')">
        <textarea id="msgTa" class="archive-textarea" style="min-height:75px"
                  placeholder="What do you want them to know…"></textarea>
        <button class="action-btn archive-btn" onclick="saveMessage()">SAVE MESSAGE</button>
      </div>
      <div class="messages-panel">
        <div class="panel-label">Messages (${S.archive.messages.length})</div>
        ${S.archive.messages.length
          ? S.archive.messages.slice(0,10).map(m=>`
              <div class="message-entry">
                <div class="message-meta">
                  <span class="message-to">TO: ${m.to}</span>
                  <span class="message-date">${fmtDate(m.date)}</span>
                </div>
                <div class="message-text">${m.text.slice(0,220)}${m.text.length>220?'…':''}</div>
                <button class="icon-del" onclick="deleteMessage('${m.id}')">✕</button>
              </div>`).join('')
          : '<div class="tl-empty">No messages yet.</div>'
        }
      </div>`;
  }

  else if (legacyTab === 'milestones') {
    el.innerHTML = `
      <div class="compose-mini">
        <input id="msTitle" class="mf-input" type="text" placeholder="Milestone title…">
        <textarea id="msText" class="archive-textarea" style="min-height:65px"
                  placeholder="What happened. Why it matters."></textarea>
        <button class="action-btn archive-btn" onclick="saveMilestone()">MARK MILESTONE</button>
      </div>
      <div class="milestone-panel">
        <div class="panel-label">Milestones (${S.archive.milestones.length})</div>
        ${S.archive.milestones.length
          ? S.archive.milestones.map(m=>`
              <div class="milestone-entry">
                <div class="ms-header">
                  <span class="ms-date">${fmtDate(m.date)}</span>
                  <span class="ms-title">${m.title}</span>
                  <button class="icon-del" onclick="deleteMilestone('${m.id}')">✕</button>
                </div>
                ${m.text ? `<div class="ms-text">${m.text}</div>` : ''}
              </div>`).join('')
          : '<div class="tl-empty">No milestones yet.</div>'
        }
      </div>`;
  }
}

window.switchLegacyTab = function(tab) { legacyTab = tab; renderLegacy(); };

// ─── Module Router ──────────────────────────────────────────
function renderModule(id) {
  if (id === 'home')    renderHome();
  if (id === 'finance') renderFinance();
  if (id === 'noire')   renderNoire();
  if (id === 'body')    renderBody();
  if (id === 'agents')  renderAgents();
  if (id === 'legacy')  renderLegacy();
}

function renderActive() {
  const el = document.querySelector('.module.active');
  if (el) renderModule(el.dataset.agent);
}

// ─── Action Handlers ────────────────────────────────────────

// Non-negs
window.toggleNonNeg = function(key) {
  S.life.nonNegs[key] = !S.life.nonNegs[key];
  if (key === 'body' && S.life.nonNegs.body) S.health.lastWorkoutDate = today();
  recomputeScore();
  save();
  renderHome();
};

// Finance
window.quickCash = function(n) {
  S.finance.cashOnHand += n;
  S.finance.transactions.unshift({ id:uid(), date:today(), type:'income', amount:n, label:'quick add' });
  postSignal('finance', 'cash-add', {});
  save(); renderFinance();
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
  const val  = parseFloat(document.getElementById('mCash').value) || 0;
  const note = document.getElementById('mCashNote').value.trim() || 'manual';
  const diff = val - S.finance.cashOnHand;
  S.finance.cashOnHand = val;
  if (diff !== 0) S.finance.transactions.unshift({ id:uid(), date:today(), type:diff>0?'income':'expense', amount:Math.abs(diff), label:note });
  postSignal('finance', 'cash-set', {});
  save(); closeModal(); renderFinance(); renderHome();
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
    S.finance.transactions.unshift({ id:uid(), date:today(), type:'expense', amount:amt, label });
  }
  save(); closeModal(); renderFinance();
};

window.openBurnModal = function() {
  showModal('SET DAILY BURN RATE', `
    <div class="modal-form">
      <label class="mf-label">Daily Burn Rate ($ / day)</label>
      <input id="mBurn" class="mf-input" type="number" min="0" step="1" value="${S.finance.dailyBurn || ''}">
      <button class="action-btn finance-btn" onclick="saveBurn()">SET BURN RATE</button>
    </div>`);
};
window.saveBurn = function() {
  S.finance.dailyBurn = parseFloat(document.getElementById('mBurn').value) || 0;
  save(); closeModal(); renderFinance(); renderHome();
};

window.openStreamModal = function() {
  showModal('ADD INCOME STREAM', `
    <div class="modal-form">
      <label class="mf-label">Stream Name</label>
      <input id="mStName" class="mf-input" type="text" placeholder="Noire sales, freelance, etc…">
      <label class="mf-label">Type</label>
      <input id="mStType" class="mf-input" type="text" placeholder="product / service / passive…">
      <label class="mf-label">Monthly Revenue ($)</label>
      <input id="mStAmt" class="mf-input" type="number" min="0" step="1" placeholder="0">
      <label class="mf-label">Status</label>
      <select id="mStStatus" class="mf-input">
        <option value="pending">PENDING</option>
        <option value="active">ACTIVE</option>
        <option value="deactivated">DEACTIVATED</option>
      </select>
      <button class="action-btn finance-btn" onclick="saveStream()">ADD STREAM</button>
    </div>`);
};
window.saveStream = function() {
  const name    = document.getElementById('mStName').value.trim();
  const type    = document.getElementById('mStType').value.trim();
  const monthly = parseFloat(document.getElementById('mStAmt').value) || 0;
  const status  = document.getElementById('mStStatus').value;
  if (!name) return;
  S.finance.incomeStreams.push({ id:uid(), name, type, monthly, status });
  save(); closeModal(); renderFinance();
};
window.cycleStream = function(id) {
  const st = S.finance.incomeStreams.find(s => s.id === id);
  if (!st) return;
  const cycle = { pending:'active', active:'deactivated', deactivated:'pending' };
  st.status = cycle[st.status] || 'pending';
  save(); renderFinance();
};
window.deleteStream = function(id) {
  S.finance.incomeStreams = S.finance.incomeStreams.filter(s => s.id !== id);
  save(); renderFinance();
};

window.deleteBill = function(id) {
  S.finance.bills = S.finance.bills.filter(b => b.id !== id);
  save(); renderFinance();
};

// Noire
window.quickTouch = function() {
  S.brand.touches++;
  postSignal('brand', 'touch', {});
  save(); renderNoireBody(); renderHome();
  feedback(`+1 touch → ${S.brand.touches} today`);
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
  const n     = parseInt(document.getElementById('mSaleN').value) || 1;
  const price = parseFloat(document.getElementById('mSaleP').value) || 0;
  const note  = document.getElementById('mSaleNote').value.trim();
  S.brand.unitsSold   += n;
  S.brand.saleRevenue += price * n;
  if (price > 0) {
    S.finance.cashOnHand += price * n;
    S.finance.transactions.unshift({ id:uid(), date:today(), type:'income', amount:price*n, label:note||`sale ×${n}` });
  }
  postSignal('brand', 'sale', { n, price });
  recomputeScore();
  save(); closeModal(); renderNoire(); renderFinance(); renderHome();
};

window.openPipelineModal = function() {
  showModal('ADD PIPELINE', `
    <div class="modal-form">
      <label class="mf-label">Name / Lead</label>
      <input id="mPName" class="mf-input" type="text" placeholder="contact or company…">
      <label class="mf-label">Stage</label>
      <select id="mPStage" class="mf-input">
        <option>PROSPECT</option><option>CONTACTED</option><option>PITCHED</option>
        <option>FOLLOW-UP</option><option>CLOSED</option>
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
  S.brand.pipeline.unshift({ id:uid(), name, stage, value, date:today() });
  postSignal('brand', 'pipeline-add', { name });
  save(); closeModal(); renderNoire();
};
window.deletePipeline = function(id) {
  S.brand.pipeline = S.brand.pipeline.filter(p => p.id !== id);
  save(); renderNoire();
};

window.openInventoryModal = function() {
  showModal('ADD INVENTORY ITEM', `
    <div class="modal-form">
      <label class="mf-label">Item Name</label>
      <input id="mInvName" class="mf-input" type="text" placeholder="product name, SKU…">
      <label class="mf-label">Quantity</label>
      <input id="mInvQty" class="mf-input" type="number" min="0" value="1">
      <label class="mf-label">Price ($)</label>
      <input id="mInvPrice" class="mf-input" type="number" min="0" step="0.01" placeholder="0.00">
      <label class="mf-label">Status</label>
      <select id="mInvStatus" class="mf-input">
        <option value="active">ACTIVE</option>
        <option value="limited">LIMITED</option>
        <option value="sold">SOLD OUT</option>
      </select>
      <button class="action-btn brand-btn" onclick="saveInventory()">ADD ITEM</button>
    </div>`);
};
window.saveInventory = function() {
  const name   = document.getElementById('mInvName').value.trim();
  const qty    = parseInt(document.getElementById('mInvQty').value) || 0;
  const price  = parseFloat(document.getElementById('mInvPrice').value) || 0;
  const status = document.getElementById('mInvStatus').value;
  if (!name) return;
  S.brand.inventory.push({ id:uid(), name, qty, price, status, date:today() });
  save(); closeModal(); renderNoire();
};
window.deleteInventory = function(id) {
  S.brand.inventory = S.brand.inventory.filter(i => i.id !== id);
  save(); renderNoire();
};

window.openCampaignModal = function() {
  showModal('ADD CAMPAIGN', `
    <div class="modal-form">
      <label class="mf-label">Campaign Name</label>
      <input id="mCampName" class="mf-input" type="text" placeholder="launch name…">
      <label class="mf-label">Channel</label>
      <input id="mCampChan" class="mf-input" type="text" placeholder="IG, email, TikTok…">
      <label class="mf-label">Status</label>
      <select id="mCampStat" class="mf-input">
        <option value="planned">PLANNED</option>
        <option value="active">ACTIVE</option>
        <option value="done">DONE</option>
      </select>
      <button class="action-btn brand-btn" onclick="saveCampaign()">ADD</button>
    </div>`);
};
window.saveCampaign = function() {
  const name    = document.getElementById('mCampName').value.trim();
  const channel = document.getElementById('mCampChan').value.trim() || '—';
  const status  = document.getElementById('mCampStat').value;
  if (!name) return;
  S.brand.campaigns.unshift({ id:uid(), name, channel, status, date:today() });
  save(); closeModal(); renderNoire();
};
window.deleteCampaign = function(id) {
  S.brand.campaigns = S.brand.campaigns.filter(c => c.id !== id);
  save(); renderNoire();
};

window.openBuyerModal = function() {
  showModal('ADD BUYER', `
    <div class="modal-form">
      <label class="mf-label">Name</label>
      <input id="mBuyName" class="mf-input" type="text" placeholder="full name or handle…">
      <label class="mf-label">Total Spent ($)</label>
      <input id="mBuySpend" class="mf-input" type="number" min="0" step="0.01" placeholder="0.00">
      <label class="mf-label">Notes</label>
      <input id="mBuyNote" class="mf-input" type="text" placeholder="what they bought, vibe…">
      <button class="action-btn brand-btn" onclick="saveBuyer()">ADD BUYER</button>
    </div>`);
};
window.saveBuyer = function() {
  const name       = document.getElementById('mBuyName').value.trim();
  const totalSpend = parseFloat(document.getElementById('mBuySpend').value) || 0;
  const notes      = document.getElementById('mBuyNote').value.trim();
  if (!name) return;
  S.brand.buyers.unshift({ id:uid(), name, totalSpend, notes, lastContact:today() });
  save(); closeModal(); renderNoire();
};
window.deleteBuyer = function(id) {
  S.brand.buyers = S.brand.buyers.filter(b => b.id !== id);
  save(); renderNoire();
};

// Body / Health
window.openWorkoutModal = function() {
  showModal('LOG WORKOUT', `
    <div class="modal-form">
      <label class="mf-label">Type</label>
      <select id="mWType" class="mf-input">
        <option>Weights</option><option>Cardio</option><option>HIIT</option>
        <option>Run</option><option>Yoga</option><option>Boxing</option>
        <option>Walk</option><option>General</option>
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
  S.health.log.unshift({ id:uid(), date:today(), type:'workout', value:val, notes });
  S.life.nonNegs.body      = true;
  S.health.lastWorkoutDate = today();
  S.health.streak = Math.max(S.health.streak, 1);
  postSignal('health', 'workout', { type });
  recomputeScore();
  save(); closeModal(); renderBody(); renderHome();
};

window.openSleepModal = function() {
  showModal('LOG SLEEP', `
    <div class="modal-form">
      <label class="mf-label">Hours Slept</label>
      <input id="mSleepH" class="mf-input" type="number" min="0" max="24" step="0.5" value="${S.health.sleepLast||7}">
      <button class="action-btn health-btn" onclick="saveSleep()">LOG</button>
    </div>`);
};
window.saveSleep = function() {
  const h = parseFloat(document.getElementById('mSleepH').value) || 7;
  S.health.sleepLast = h;
  S.health.log.unshift({ id:uid(), date:today(), type:'sleep', value:`${h}h`, notes:'' });
  S.life.nonNegs.sleep = true;
  postSignal('health', 'sleep', { h });
  recomputeScore();
  save(); closeModal(); renderBody(); renderHome();
};

window.openProteinModal = function() {
  showModal('LOG PROTEIN', `
    <div class="modal-form">
      <label class="mf-label">Grams to Add</label>
      <input id="mProtG" class="mf-input" type="number" min="0" step="1" placeholder="50">
      <label class="mf-label">Daily Goal (g)</label>
      <input id="mProtGoal" class="mf-input" type="number" min="0" step="1" value="${S.health.proteinGoal}">
      <button class="action-btn health-btn" onclick="saveProtein()">LOG</button>
    </div>`);
};
window.saveProtein = function() {
  const g    = parseFloat(document.getElementById('mProtG').value) || 0;
  const goal = parseFloat(document.getElementById('mProtGoal').value) || 150;
  S.health.proteinToday += g;
  S.health.proteinGoal   = goal;
  save(); closeModal(); renderBody();
  feedback(`Protein: ${S.health.proteinToday}g / ${goal}g`);
};

window.openMVWModal = function() {
  const r = S.health.recoveryScore;
  let label, routine;
  if (r >= 8) {
    label = 'HIGH ENERGY'; routine = '45-60 min full session. Compound movements, high intensity. Push it.';
  } else if (r >= 5) {
    label = 'MODERATE'; routine = '30 min: 5 rounds — 10 pushups, 15 squats, 10 dips, 30s plank. Rest 60s between.';
  } else {
    label = 'RECOVERY'; routine = '20 min: 10 min walk + 3×10 pushups + 3×15 air squats + 5 min stretch.';
  }
  showModal('MINIMUM VIABLE WORKOUT', `
    <div class="mvw-panel">
      <div class="mvw-label">${label} (Recovery ${r}/10)</div>
      <div class="mvw-routine">${routine}</div>
      <label class="mf-label" style="margin-top:14px">Your Energy Level (1-10)</label>
      <input id="mMvwEnergy" class="mf-input" type="number" min="1" max="10" value="${r}" style="margin-top:4px">
      <button class="action-btn health-btn" style="margin-top:8px" onclick="saveMVW()">DONE — LOG WORKOUT</button>
    </div>`);
};
window.saveMVW = function() {
  const energy = parseInt(document.getElementById('mMvwEnergy').value) || 5;
  S.health.recoveryScore   = energy;
  S.health.lastWorkoutDate = today();
  S.life.nonNegs.body      = true;
  S.health.log.unshift({ id:uid(), date:today(), type:'workout', value:`MVW (energy:${energy})`, notes:'' });
  postSignal('health', 'mvw', { energy });
  recomputeScore();
  save(); closeModal(); renderBody(); renderHome();
};

window.openBodyCompModal = function() {
  showModal('BODY METRICS', `
    <div class="modal-form">
      <label class="mf-label">Weight (lbs)</label>
      <input id="mBCWeight" class="mf-input" type="number" min="0" step="0.5" value="${S.health.weight||''}">
      <label class="mf-label">Body Fat %</label>
      <input id="mBCBF" class="mf-input" type="number" min="0" max="60" step="0.1" value="${S.health.bodyFat||''}">
      <label class="mf-label">Recovery Score (1-10)</label>
      <input id="mBCRec" class="mf-input" type="number" min="1" max="10" value="${S.health.recoveryScore||5}">
      <label class="mf-label">Target Weight (lbs)</label>
      <input id="mBCTW" class="mf-input" type="number" min="0" step="0.5" value="${S.health.physique.targetWeight||''}">
      <button class="action-btn health-btn" onclick="saveBodyComp()">SAVE</button>
    </div>`);
};
window.saveBodyComp = function() {
  S.health.weight        = parseFloat(document.getElementById('mBCWeight').value) || S.health.weight;
  S.health.bodyFat       = parseFloat(document.getElementById('mBCBF').value) || S.health.bodyFat;
  S.health.recoveryScore = parseInt(document.getElementById('mBCRec').value) || 5;
  S.health.physique.targetWeight = parseFloat(document.getElementById('mBCTW').value) || 0;
  save(); closeModal(); renderBody();
};

window.deleteHealthEntry = function(id) {
  S.health.log = S.health.log.filter(e => e.id !== id);
  save(); renderBody();
};

// Archive / Legacy
window.saveArchiveEntry = function() {
  const ta   = document.getElementById('archiveTa');
  const text = ta ? ta.value.trim() : '';
  if (!text) return;
  const ex = S.archive.entries.find(e => e.date === today());
  if (ex) { ex.text = text; ex.updatedAt = nowISO(); }
  else S.archive.entries.unshift({ id:uid(), date:today(), text, tags:[], createdAt:nowISO() });
  postSignal('archive', 'entry', { date:today() });
  recomputeScore();
  save();
  feedback('Entry saved.');
  renderLegacy();
  renderHome();
};

window.saveLesson = function() {
  const ta   = document.getElementById('lessonTa');
  const text = ta ? ta.value.trim() : '';
  if (!text) return;
  S.archive.lessons.unshift({ id:uid(), date:today(), text });
  postSignal('legacy', 'lesson', {});
  save();
  feedback('Lesson saved.');
  renderLegacy();
};
window.deleteLesson = function(id) {
  S.archive.lessons = S.archive.lessons.filter(l => l.id !== id);
  save(); renderLegacy();
};

window.saveMessage = function() {
  const to   = (document.getElementById('msgTo')?.value || 'my children').trim() || 'my children';
  const ta   = document.getElementById('msgTa');
  const text = ta ? ta.value.trim() : '';
  if (!text) return;
  S.archive.messages.unshift({ id:uid(), date:today(), to, text });
  postSignal('legacy', 'message', {});
  save();
  feedback('Message saved.');
  renderLegacy();
};
window.deleteMessage = function(id) {
  S.archive.messages = S.archive.messages.filter(m => m.id !== id);
  save(); renderLegacy();
};

window.saveMilestone = function() {
  const title = document.getElementById('msTitle')?.value.trim();
  const ta    = document.getElementById('msText');
  const text  = ta ? ta.value.trim() : '';
  if (!title) return;
  S.archive.milestones.unshift({ id:uid(), date:today(), title, text });
  postSignal('legacy', 'milestone', { title });
  save();
  feedback(`Milestone: ${title}`);
  renderLegacy();
};
window.deleteMilestone = function(id) {
  S.archive.milestones = S.archive.milestones.filter(m => m.id !== id);
  save(); renderLegacy();
};

// ─── Command Parser ─────────────────────────────────────────
const HELP_TEXT = `
LEGACY OS — COMMANDS
────────────────────────────────────────────
cash [N]              set cash on hand
cash +[N] / -[N]      add / subtract cash
sold [N] [price]      log units sold
touch [N]             add outbound touches
reply [N]             add replies
workout [type]        log a workout
sleep [N]             log hours slept
protein [N]           add protein (grams)
weight [N]            log body weight
recovery [N]          set recovery score (1-10)
note [text]           add to today's archive
lesson [text]         save a life lesson
milestone [title]     mark a milestone
mark [text]           mark today
bill [name] [amt] [day]    add a bill
stream [name] [amt]   add income stream
inv [name] [qty] [price]   add inventory
goal touch [N]        set touch goal
goal sales [N]        set sales goal
goal rev [N]          set revenue goal
goal cash [N]         set cash goal
phase [SURVIVAL|PROOF|SCALE]   set phase manually
focus                 toggle focus mode
clean                 self-clean OS
status                agent status
help                  show this
────────────────────────────────────────────
Press / to focus · ↑↓ history · Esc to clear
`.trim();

function parseCmd(raw) {
  raw = raw.trim();
  if (!raw) return;
  S.cmdHistory.unshift(raw);
  if (S.cmdHistory.length > 60) S.cmdHistory.length = 60;

  const parts = raw.toLowerCase().split(/\s+/);
  const cmd   = parts[0];
  const args  = parts.slice(1);

  // Meta
  if (cmd === 'help' || cmd === '?') { showModal('COMMANDS', `<pre>${HELP_TEXT}</pre>`); return; }

  if (cmd === 'status') {
    const cfo = runCFO(), warnings = runRealityGuard();
    const lines = [
      'LEGACY OS — AGENT STATUS',
      '─'.repeat(38),
      ...AGENT_ROSTER.map(a => `${a.icon} ${a.name.padEnd(20)} ACTIVE`),
      '─'.repeat(38),
      `Phase:    ${computePhase()}`,
      `Momentum: ${computeMomentum().score} (${computeMomentum().trend})`,
      `Risk:     ${cfo.risk}`,
      `Runway:   ${computeRunway()===Infinity?'∞':computeRunway()+'d'}`,
      `Warnings: ${warnings.length}`,
      `Signals:  ${S.signals.length}`,
    ];
    showModal('STATUS', `<pre>${lines.join('\n')}</pre>`); return;
  }

  if (cmd === 'clean') { selfClean(); save(); feedback('OS cleaned.'); return; }
  if (cmd === 'focus') {
    S.life.focusMode = !S.life.focusMode;
    save(); renderHome();
    feedback(`Focus ${S.life.focusMode?'ON':'OFF'}.`); return;
  }

  if (cmd === 'phase') {
    const p = (args[0]||'').toUpperCase();
    if (['SURVIVAL','PROOF','SCALE'].includes(p)) {
      S.system.phase = p; S.system.autoPhase = false;
      save(); renderHome();
      feedback(`Phase set: ${p}`);
    } else feedback('Phases: SURVIVAL, PROOF, SCALE');
    return;
  }

  // Cash
  if (cmd === 'cash') {
    const val = args[0]; if (!val) { feedback('cash [N] or cash +N or cash -N'); return; }
    const n = parseFloat(val.replace(/[$,]/g,''));
    if (isNaN(n)) { feedback('Invalid amount.'); return; }
    if (val.startsWith('+')) {
      S.finance.cashOnHand += n;
      S.finance.transactions.unshift({ id:uid(), date:today(), type:'income', amount:n, label:'cmd' });
    } else if (val.startsWith('-')) {
      S.finance.cashOnHand = Math.max(0, S.finance.cashOnHand - n);
      S.finance.transactions.unshift({ id:uid(), date:today(), type:'expense', amount:n, label:'cmd' });
    } else {
      S.finance.cashOnHand = n;
    }
    postSignal('finance', 'cash-cmd', {});
    save(); renderModule('finance'); renderHome();
    feedback(`Cash → ${fmtMoney(S.finance.cashOnHand)}`); return;
  }

  // Sales
  if (cmd === 'sold') {
    const n = parseInt(args[0])||1, price = parseFloat(args[1])||0;
    S.brand.unitsSold   += n;
    S.brand.saleRevenue += price * n;
    if (price > 0) {
      S.finance.cashOnHand += price * n;
      S.finance.transactions.unshift({ id:uid(), date:today(), type:'income', amount:price*n, label:`sale ×${n}` });
    }
    postSignal('brand','sale-cmd',{}); recomputeScore();
    save(); renderModule('noire'); renderModule('finance'); renderHome();
    feedback(`Sold ${n}${price?' @ '+fmtMoney(price):''}`); return;
  }

  if (cmd === 'touch' || cmd === 'touches') {
    const n = parseInt(args[0])||1;
    S.brand.touches += n;
    postSignal('brand','touch-cmd',{});
    save(); renderModule('noire'); renderHome();
    feedback(`+${n} touch${n>1?'es':''} → ${S.brand.touches} today`); return;
  }

  if (cmd === 'reply' || cmd === 'replies') {
    const n = parseInt(args[0])||1;
    S.brand.replies += n;
    save(); renderModule('noire');
    feedback(`+${n} repl${n>1?'ies':'y'}`); return;
  }

  // Body
  if (cmd === 'workout' || cmd === 'wod' || cmd === 'gym') {
    const type = args.join(' ')||'General';
    S.health.log.unshift({ id:uid(), date:today(), type:'workout', value:type, notes:'' });
    S.life.nonNegs.body = true; S.health.lastWorkoutDate = today();
    postSignal('health','workout-cmd',{}); recomputeScore();
    save(); renderModule('body'); renderHome();
    feedback(`Workout: ${type}`); return;
  }

  if (cmd === 'sleep' || cmd === 'slept') {
    const h = parseFloat(args[0])||7;
    S.health.sleepLast = h;
    S.health.log.unshift({ id:uid(), date:today(), type:'sleep', value:`${h}h`, notes:'' });
    S.life.nonNegs.sleep = true;
    postSignal('health','sleep-cmd',{}); recomputeScore();
    save(); renderModule('body'); renderHome();
    feedback(`Sleep: ${h}h`); return;
  }

  if (cmd === 'protein' || cmd === 'prot') {
    const g = parseFloat(args[0])||0;
    S.health.proteinToday += g;
    save(); renderModule('body');
    feedback(`Protein: ${S.health.proteinToday}g / ${S.health.proteinGoal}g`); return;
  }

  if (cmd === 'weight') {
    const w = parseFloat(args[0])||0;
    S.health.weight = w;
    save(); renderModule('body');
    feedback(`Weight: ${w} lbs`); return;
  }

  if (cmd === 'recovery') {
    const r = Math.min(10, Math.max(1, parseInt(args[0])||5));
    S.health.recoveryScore = r;
    save(); renderModule('body');
    feedback(`Recovery: ${r}/10`); return;
  }

  // Archive / Legacy
  if (cmd === 'note' || cmd === 'archive') {
    const text = raw.slice(cmd.length).trim();
    if (!text) { feedback('note [text]'); return; }
    const ex = S.archive.entries.find(e => e.date === today());
    if (ex) { ex.text += '\n' + text; ex.updatedAt = nowISO(); }
    else S.archive.entries.unshift({ id:uid(), date:today(), text, tags:[], createdAt:nowISO() });
    postSignal('archive','entry-cmd',{}); recomputeScore();
    save(); renderModule('legacy'); renderHome();
    feedback('Entry saved.'); return;
  }

  if (cmd === 'lesson') {
    const text = raw.slice(cmd.length).trim();
    if (!text) { feedback('lesson [text]'); return; }
    S.archive.lessons.unshift({ id:uid(), date:today(), text });
    postSignal('legacy','lesson-cmd',{});
    save(); renderModule('legacy');
    feedback('Lesson saved.'); return;
  }

  if (cmd === 'milestone') {
    const title = raw.slice(cmd.length).trim();
    if (!title) { feedback('milestone [title]'); return; }
    S.archive.milestones.unshift({ id:uid(), date:today(), title, text:'' });
    postSignal('legacy','milestone-cmd',{ title });
    save(); renderModule('legacy');
    feedback(`Milestone: ${title}`); return;
  }

  if (cmd === 'mark' || cmd === 'marked') {
    S.life.markedToday = raw.slice(cmd.length).trim();
    save(); renderHome();
    feedback(`Marked: ${S.life.markedToday}`); return;
  }

  // Finance management
  if (cmd === 'bill') {
    const name = args[0]||'Bill', amount = parseFloat(args[1])||0, dueDay = parseInt(args[2])||1;
    S.finance.bills.unshift({ id:uid(), name, amount, dueDay, paid:false });
    save(); renderModule('finance');
    feedback(`Bill: ${name} ${fmtMoney(amount)} day ${dueDay}`); return;
  }

  if (cmd === 'stream') {
    const name = args[0]||'Stream', amt = parseFloat(args[1])||0;
    S.finance.incomeStreams.push({ id:uid(), name, type:'', monthly:amt, status:'pending' });
    save(); renderModule('finance');
    feedback(`Stream added: ${name}`); return;
  }

  if (cmd === 'inv' || cmd === 'inventory') {
    const name = args[0]||'Item', qty = parseInt(args[1])||1, price = parseFloat(args[2])||0;
    S.brand.inventory.push({ id:uid(), name, qty, price, status:'active', date:today() });
    save(); renderModule('noire');
    feedback(`Inventory: ${qty}× ${name} @ ${fmtMoney(price)}`); return;
  }

  // Goals
  if (cmd === 'goal') {
    const sub = args[0], n = parseFloat(args[1])||0;
    if (!n) { feedback('goal [touch|sales|rev|cash] [N]'); return; }
    if (sub === 'touch' || sub === 'touches') { S.brand.weeklyGoals.touches = n; feedback(`Touch goal → ${n}`); }
    else if (sub === 'sales' || sub === 'sale') { S.brand.weeklyGoals.sales = n; feedback(`Sales goal → ${n}`); }
    else if (sub === 'rev'   || sub === 'revenue') { S.brand.weeklyGoals.revenue = n; feedback(`Revenue goal → ${fmtMoney(n)}`); }
    else if (sub === 'cash') { S.finance.cashGoal = n; feedback(`Cash goal → ${fmtMoney(n)}`); }
    else { feedback('Subcommands: touch, sales, rev, cash'); return; }
    save(); renderModule('noire'); renderModule('finance'); return;
  }

  if (cmd === 'check') {
    const key = args[0];
    if (key && key in S.life.nonNegs) {
      S.life.nonNegs[key] = !S.life.nonNegs[key];
      recomputeScore(); save(); renderHome();
      feedback(`${key} ${S.life.nonNegs[key]?'✓':'○'}`);
    } else feedback('Negs: body, money, noire, cash, sleep');
    return;
  }

  feedback(`Unknown: "${cmd}". Type help.`);
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
    el = Object.assign(document.createElement('div'), { id:'cmdFeedback', className:'cmd-feedback' });
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
      const v = input.value.trim();
      if (v) { parseCmd(v); input.value = ''; histIdx = -1; }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < S.cmdHistory.length - 1) { histIdx++; input.value = S.cmdHistory[histIdx]||''; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = S.cmdHistory[histIdx]||''; }
      else { histIdx = -1; input.value = ''; }
    } else if (e.key === 'Escape') {
      input.value = ''; histIdx = -1; input.blur();
    }
  });

  document.getElementById('cmdHelpBtn').addEventListener('click', () =>
    showModal('COMMANDS', `<pre>${HELP_TEXT}</pre>`)
  );

  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== input &&
        document.getElementById('overlay').hasAttribute('hidden')) {
      e.preventDefault(); input.focus();
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
    if (e.key === 'Escape' && !document.getElementById('overlay').hasAttribute('hidden')) closeModal();
  });
}

// ─── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  S = loadState();
  checkDayChange();
  if (S.system.autoPhase) S.system.phase = computePhase();
  recomputeScore();

  setupNav();
  setupTerminal();
  setupModal();

  renderStatusBar();
  renderClock();
  renderHome();

  // Agent tick: 60s
  setInterval(agentTick, 60_000);
  // Clock: 30s
  setInterval(renderClock, 30_000);

  // Sync on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { save(); }
    else { checkDayChange(); recomputeScore(); renderActive(); renderStatusBar(); }
  });

  // SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
