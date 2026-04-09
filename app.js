/* ========================================
   THE SYSTEM v4 — Tracker App
   Core logic: data, rendering, calculation
   ======================================== */

let CONFIG = null;
let currentKW = null;   // e.g. "2026-kw15"
let allData = {};       // { "2026-kw15": { businessHours: [...], water: [...], ... }, ... }
let changelog = [];
let jokerDays = {};     // { "2026-kw15": [false,...,false] }

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  loadAllData();
  currentKW = getCurrentKW();
  renderKWNav();
  renderSections();
  loadWeekData();
  updateSummary();
  setupEventListeners();
  loadTheme();
  updateJokerBar();
});

async function loadConfig() {
  try {
    const resp = await fetch('config.json');
    CONFIG = await resp.json();
  } catch (e) {
    console.error('Config load failed, using embedded fallback');
    // If config.json fails (e.g. local file://), we'll still work
    CONFIG = { sections: [], dayLabels: ['Mo','Di','Mi','Do','Fr','Sa','So'], joker: { perYear: 60 } };
  }
}

// ==================== KW UTILS ====================
function getISOWeek(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function getCurrentKW() {
  const now = new Date();
  const week = getISOWeek(now);
  const year = now.getFullYear();
  // Adjust year for edge cases (week 1 in December)
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1);
  if (now < startOfWeek1 && week > 50) {
    return `${year - 1}-kw${String(week).padStart(2, '0')}`;
  }
  return `${year}-kw${String(week).padStart(2, '0')}`;
}

function parseKW(kwStr) {
  const m = kwStr.match(/(\d{4})-kw(\d{2})/);
  return m ? { year: parseInt(m[1]), week: parseInt(m[2]) } : null;
}

function kwToDateRange(kwStr) {
  const { year, week } = parseKW(kwStr);
  const jan4 = new Date(year, 0, 4);
  const start = new Date(jan4);
  start.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1 + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function formatDate(d) {
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function shiftKW(kwStr, delta) {
  const { start } = kwToDateRange(kwStr);
  start.setDate(start.getDate() + delta * 7);
  const w = getISOWeek(start);
  const y = start.getFullYear();
  // Fix year for week 1
  const jan4 = new Date(y, 0, 4);
  const startW1 = new Date(jan4);
  startW1.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1);
  const actualYear = start < startW1 ? y - 1 : y;
  return `${actualYear}-kw${String(w).padStart(2, '0')}`;
}

// ==================== DATA PERSISTENCE ====================
function loadAllData() {
  try {
    const raw = localStorage.getItem('thesystem_data');
    if (raw) allData = JSON.parse(raw);
    const cl = localStorage.getItem('thesystem_changelog');
    if (cl) changelog = JSON.parse(cl);
    const jk = localStorage.getItem('thesystem_joker');
    if (jk) jokerDays = JSON.parse(jk);
  } catch (e) {
    console.error('Data load error:', e);
  }
}

function saveAllData() {
  try {
    localStorage.setItem('thesystem_data', JSON.stringify(allData));
    localStorage.setItem('thesystem_changelog', JSON.stringify(changelog));
    localStorage.setItem('thesystem_joker', JSON.stringify(jokerDays));
  } catch (e) {
    console.error('Data save error:', e);
  }
}

function getWeekData(kw) {
  if (!allData[kw]) allData[kw] = {};
  return allData[kw];
}

function setFieldValue(kw, fieldId, value) {
  if (!allData[kw]) allData[kw] = {};
  allData[kw][fieldId] = value;
  saveAllData();
  updateSummary();
}

// ==================== RENDER KW NAV ====================
function renderKWNav() {
  const { year, week } = parseKW(currentKW);
  const { start, end } = kwToDateRange(currentKW);
  document.getElementById('kwLabel').textContent = `KW ${week}`;
  document.getElementById('kwDates').textContent = `${formatDate(start)} – ${formatDate(end)}.${end.getFullYear()}`;
}

// ==================== RENDER SECTIONS ====================
function renderSections() {
  const main = document.getElementById('appMain');
  main.innerHTML = '';

  if (!CONFIG || !CONFIG.sections) return;

  CONFIG.sections.forEach(section => {
    const sec = document.createElement('div');
    sec.className = 'section';
    sec.dataset.sectionId = section.id;

    // Header
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
      <div class="section-title">
        <span class="section-icon">${section.icon}</span>
        ${section.label}
      </div>
      <span class="section-chevron">▾</span>
    `;
    header.addEventListener('click', () => {
      sec.classList.toggle('collapsed');
      saveSectionState();
    });
    sec.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'section-body';

    section.fields.forEach(field => {
      const fieldEl = document.createElement('div');
      fieldEl.className = 'field';
      fieldEl.dataset.fieldId = field.id;
      fieldEl.innerHTML = renderField(field);
      body.appendChild(fieldEl);
    });

    sec.appendChild(body);
    main.appendChild(sec);

    // Restore collapsed state
    const collapsed = getSectionStates();
    if (collapsed[section.id]) sec.classList.add('collapsed');
  });

  attachFieldListeners();
}

function renderField(field) {
  const dayLabels = CONFIG.dayLabels || ['Mo','Di','Mi','Do','Fr','Sa','So'];
  const targetStr = field.target ? `Ziel: ${field.target}${field.targetUnit ? ' ' + field.targetUnit : ''}` : '';

  let html = `<div class="field-label">
    <span class="field-name">${field.label}</span>
    <span class="field-target" data-field-target="${field.id}">${targetStr}</span>
  </div>`;

  switch (field.type) {
    case 'daily_toggle':
      html += `<div class="day-grid">${dayLabels.map((d, i) => `
        <div class="day-col">
          <span class="day-label">${d}</span>
          <button class="toggle-btn" data-field="${field.id}" data-day="${i}">—</button>
        </div>`).join('')}</div>`;
      break;

    case 'daily_hours':
      html += `<div class="day-grid">${dayLabels.map((d, i) => `
        <div class="day-col">
          <span class="day-label">${d}</span>
          <input type="number" class="hours-input" data-field="${field.id}" data-day="${i}" min="0" max="24" step="0.5" placeholder="0">
        </div>`).join('')}</div>`;
      break;

    case 'daily_grade':
      html += `<div class="day-grid">${dayLabels.map((d, i) => `
        <div class="day-col">
          <span class="day-label">${d}</span>
          <input type="number" class="grade-input" data-field="${field.id}" data-day="${i}" min="1" max="6" step="1" placeholder="–">
        </div>`).join('')}</div>`;
      break;

    case 'daily_text':
      html += `<div class="day-grid">${dayLabels.map((d, i) => `
        <div class="day-col">
          <span class="day-label">${d}</span>
          <input type="text" class="day-text-input" data-field="${field.id}" data-day="${i}" placeholder="…">
        </div>`).join('')}</div>`;
      break;

    case 'weekly_count':
      html += `<div class="weekly-row">
        <div class="count-stepper">
          <button class="count-btn" data-field="${field.id}" data-action="dec">−</button>
          <span class="count-value" data-field="${field.id}" data-role="display">0</span>
          <button class="count-btn" data-field="${field.id}" data-action="inc">+</button>
        </div>
        ${field.target ? `<span class="field-target" data-field-target="${field.id}">/ ${field.target}</span>` : ''}
      </div>`;
      break;

    case 'weekly_toggle':
      html += `<div class="weekly-row">
        <div class="weekly-toggle">
          <button class="weekly-toggle-btn" data-field="${field.id}" data-val="true">Ja</button>
          <button class="weekly-toggle-btn" data-field="${field.id}" data-val="false">Nein</button>
        </div>
      </div>`;
      break;

    case 'weekly_choice':
      const choices = field.choices || ['nein', 'klein', 'groß'];
      html += `<div class="weekly-row">
        <div class="weekly-choice">${choices.map(c => `
          <button class="choice-btn" data-field="${field.id}" data-val="${c}">${c}</button>`).join('')}
        </div>
      </div>`;
      break;

    case 'text':
      html += `<input type="text" class="text-input" data-field="${field.id}" placeholder="…">`;
      break;
  }

  return html;
}

// ==================== LOAD WEEK DATA INTO UI ====================
function loadWeekData() {
  const data = getWeekData(currentKW);

  CONFIG.sections.forEach(section => {
    section.fields.forEach(field => {
      const val = data[field.id];

      switch (field.type) {
        case 'daily_toggle': {
          const btns = document.querySelectorAll(`.toggle-btn[data-field="${field.id}"]`);
          btns.forEach((btn, i) => {
            const v = val ? val[i] : null;
            btn.classList.remove('on', 'off');
            if (v === true) { btn.classList.add('on'); btn.textContent = '✓'; }
            else if (v === false) { btn.classList.add('off'); btn.textContent = '✗'; }
            else { btn.textContent = '—'; }
          });
          break;
        }
        case 'daily_hours': {
          const inputs = document.querySelectorAll(`.hours-input[data-field="${field.id}"]`);
          inputs.forEach((inp, i) => {
            const v = val ? val[i] : null;
            inp.value = (v !== null && v !== undefined && v !== 0) ? v : '';
            inp.classList.toggle('has-value', !!v);
          });
          break;
        }
        case 'daily_grade': {
          const inputs = document.querySelectorAll(`.grade-input[data-field="${field.id}"]`);
          inputs.forEach((inp, i) => {
            const v = val ? val[i] : null;
            inp.value = (v !== null && v !== undefined && v !== 0) ? v : '';
          });
          break;
        }
        case 'daily_text': {
          const inputs = document.querySelectorAll(`.day-text-input[data-field="${field.id}"]`);
          inputs.forEach((inp, i) => {
            inp.value = val ? (val[i] || '') : '';
          });
          break;
        }
        case 'weekly_count': {
          const display = document.querySelector(`.count-value[data-field="${field.id}"]`);
          if (display) display.textContent = val || 0;
          break;
        }
        case 'weekly_toggle': {
          const btns = document.querySelectorAll(`.weekly-toggle-btn[data-field="${field.id}"]`);
          btns.forEach(btn => {
            btn.classList.remove('yes', 'no');
            if (val === true && btn.dataset.val === 'true') btn.classList.add('yes');
            if (val === false && btn.dataset.val === 'false') btn.classList.add('no');
          });
          break;
        }
        case 'weekly_choice': {
          const btns = document.querySelectorAll(`.choice-btn[data-field="${field.id}"]`);
          btns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.val === val);
          });
          break;
        }
        case 'text': {
          const inp = document.querySelector(`.text-input[data-field="${field.id}"]`);
          if (inp) inp.value = val || '';
          break;
        }
      }
    });
  });

  updateTargetIndicators();
}

// ==================== ATTACH EVENT LISTENERS ====================
function attachFieldListeners() {
  // Daily toggles (3-state: null → true → false → null)
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      const day = parseInt(btn.dataset.day);
      const data = getWeekData(currentKW);
      if (!data[field]) data[field] = [null,null,null,null,null,null,null];

      const cur = data[field][day];
      let next;
      if (cur === null || cur === undefined) next = true;
      else if (cur === true) next = false;
      else next = null;

      data[field][day] = next;
      btn.classList.remove('on', 'off');
      if (next === true) { btn.classList.add('on'); btn.textContent = '✓'; }
      else if (next === false) { btn.classList.add('off'); btn.textContent = '✗'; }
      else { btn.textContent = '—'; }

      saveAllData();
      updateSummary();
      updateTargetIndicators();
    });
  });

  // Daily hours
  document.querySelectorAll('.hours-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const field = inp.dataset.field;
      const day = parseInt(inp.dataset.day);
      const data = getWeekData(currentKW);
      if (!data[field]) data[field] = [0,0,0,0,0,0,0];
      data[field][day] = parseFloat(inp.value) || 0;
      inp.classList.toggle('has-value', !!data[field][day]);
      saveAllData();
      updateSummary();
      updateTargetIndicators();
    });
  });

  // Daily grades
  document.querySelectorAll('.grade-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const field = inp.dataset.field;
      const day = parseInt(inp.dataset.day);
      const data = getWeekData(currentKW);
      if (!data[field]) data[field] = [0,0,0,0,0,0,0];
      let v = parseInt(inp.value);
      if (v < 1 || v > 6 || isNaN(v)) v = 0;
      data[field][day] = v;
      inp.value = v || '';
      saveAllData();
    });
  });

  // Daily text
  document.querySelectorAll('.day-text-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const field = inp.dataset.field;
      const day = parseInt(inp.dataset.day);
      const data = getWeekData(currentKW);
      if (!data[field]) data[field] = ['','','','','','',''];
      data[field][day] = inp.value;
      saveAllData();
    });
  });

  // Weekly count steppers
  document.querySelectorAll('.count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      const action = btn.dataset.action;
      const data = getWeekData(currentKW);
      let val = data[field] || 0;
      if (action === 'inc') val++;
      else if (action === 'dec' && val > 0) val--;
      data[field] = val;
      document.querySelector(`.count-value[data-field="${field}"]`).textContent = val;
      saveAllData();
      updateSummary();
      updateTargetIndicators();
    });
  });

  // Weekly toggles
  document.querySelectorAll('.weekly-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      const val = btn.dataset.val === 'true';
      const data = getWeekData(currentKW);

      // Toggle off if clicking same value
      if (data[field] === val) {
        data[field] = null;
        btn.classList.remove('yes', 'no');
      } else {
        data[field] = val;
        // Clear siblings
        document.querySelectorAll(`.weekly-toggle-btn[data-field="${field}"]`).forEach(b => b.classList.remove('yes', 'no'));
        btn.classList.add(val ? 'yes' : 'no');
      }
      saveAllData();
      updateSummary();
    });
  });

  // Weekly choice
  document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const field = btn.dataset.field;
      const val = btn.dataset.val;
      const data = getWeekData(currentKW);

      if (data[field] === val) {
        data[field] = null;
        btn.classList.remove('active');
      } else {
        data[field] = val;
        document.querySelectorAll(`.choice-btn[data-field="${field}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      saveAllData();
      updateSummary();
    });
  });

  // Text inputs
  document.querySelectorAll('.text-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const field = inp.dataset.field;
      setFieldValue(currentKW, field, inp.value);
    });
  });
}

// ==================== CALCULATION ENGINE ====================
function calculateWeek(kw) {
  const data = getWeekData(kw);
  let totalFab = 0, totalBonus = 0, totalMalus = 0;

  if (!CONFIG || !CONFIG.sections) return { fab: 0, bonus: 0, malus: 0, net: 0 };

  CONFIG.sections.forEach(section => {
    section.fields.forEach(field => {
      const val = data[field.id];
      if (val === undefined || val === null) return;
      if (!field.fab && !field.euro) return;

      const fab = field.fab;
      const euro = field.euro;

      switch (field.type) {
        case 'daily_toggle': {
          if (!Array.isArray(val)) break;
          const trueCount = val.filter(v => v === true).length;
          const falseCount = val.filter(v => v === false).length;

          // FAB
          if (fab) {
            if (fab.mode === 'always' && trueCount === 7) totalFab += fab.value;
            else if (fab.mode === 'on_target' && field.target && trueCount >= field.target) totalFab += fab.value;
          }

          // Euro
          if (euro) {
            if (euro.bonusPerDay) totalBonus += trueCount * euro.bonusPerDay;
            if (euro.malusPerDay) totalMalus += falseCount * euro.malusPerDay;
            if (euro.bonusOnTarget && field.target && trueCount >= field.target) totalBonus += euro.bonusOnTarget;
            if (euro.malusOnMiss && field.target && trueCount < field.target && (trueCount + falseCount) > 0) totalMalus += euro.malusOnMiss;
          }
          break;
        }

        case 'daily_hours': {
          if (!Array.isArray(val)) break;
          const total = val.reduce((s, v) => s + (v || 0), 0);
          const daysWithHours = val.filter(v => v > 0).length;
          const daysWithZero = val.filter(v => v === 0 && v !== null).length;

          // FAB
          if (fab) {
            if (fab.mode === 'per_hour') {
              totalFab += Math.floor(total) * (fab.perUnit || 1);
              if (fab.onTarget && field.target && total >= field.target) totalFab += fab.onTarget;
            }
          }

          // Euro
          if (euro) {
            if (euro.bonusPerDay) totalBonus += daysWithHours * euro.bonusPerDay;
            if (euro.bonusPerHour) totalBonus += total * euro.bonusPerHour;
            if (euro.bonusOnTarget && field.target && total >= field.target) totalBonus += euro.bonusOnTarget;
            if (euro.malusPerDay) totalMalus += daysWithZero * euro.malusPerDay;
            if (euro.malusOnMiss && field.target && total < field.target) totalMalus += euro.malusOnMiss;
          }
          break;
        }

        case 'weekly_count': {
          const count = typeof val === 'number' ? val : 0;
          const targetHit = field.target && count >= field.target;

          if (fab && fab.mode === 'on_target' && targetHit) totalFab += fab.value;
          if (euro) {
            if (targetHit) totalBonus += (euro.bonus || 0);
            else if (field.target && count < field.target) totalMalus += (euro.malus || 0);
          }
          break;
        }

        case 'weekly_toggle': {
          if (val === null || val === undefined) break;

          if (fab && fab.mode === 'on_yes' && val === true) totalFab += fab.value;
          if (euro) {
            if (val === true) totalBonus += (euro.bonus || 0);
            else if (val === false) totalMalus += (euro.malus || 0);
          }
          break;
        }

        case 'weekly_choice': {
          if (!val || val === 'nein') {
            if (euro) totalMalus += (euro.malus || 0);
          } else {
            if (fab) totalFab += (fab.value || 0);
            if (euro) totalBonus += (euro.bonus || 0);
          }
          break;
        }
      }
    });
  });

  return {
    fab: totalFab,
    bonus: Math.round(totalBonus * 100) / 100,
    malus: Math.round(totalMalus * 100) / 100,
    net: Math.round((totalBonus - totalMalus) * 100) / 100
  };
}

function updateSummary() {
  const result = calculateWeek(currentKW);
  document.getElementById('sumFab').textContent = result.fab;
  document.getElementById('sumBonus').textContent = `${result.bonus} €`;
  document.getElementById('sumMalus').textContent = `${result.malus} €`;

  const netEl = document.getElementById('sumNet');
  netEl.textContent = `${result.net >= 0 ? '+' : ''}${result.net} €`;
  netEl.closest('.summary-card').className = `summary-card summary-net`;
}

function updateTargetIndicators() {
  const data = getWeekData(currentKW);

  CONFIG.sections.forEach(section => {
    section.fields.forEach(field => {
      if (!field.target) return;
      const val = data[field.id];
      const indicators = document.querySelectorAll(`[data-field-target="${field.id}"]`);

      let hit = false;
      if (field.type === 'daily_toggle' && Array.isArray(val)) {
        hit = val.filter(v => v === true).length >= field.target;
      } else if (field.type === 'daily_hours' && Array.isArray(val)) {
        hit = val.reduce((s, v) => s + (v || 0), 0) >= field.target;
      } else if (field.type === 'weekly_count') {
        hit = (val || 0) >= field.target;
      }

      indicators.forEach(el => {
        el.classList.remove('hit', 'miss');
        const hasData = val && (Array.isArray(val) ? val.some(v => v !== null && v !== undefined && v !== 0) : val !== null);
        if (hasData) el.classList.add(hit ? 'hit' : 'miss');
      });
    });
  });
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  document.getElementById('kwPrev').addEventListener('click', () => navigateKW(-1));
  document.getElementById('kwNext').addEventListener('click', () => navigateKW(1));
  document.getElementById('kwToday').addEventListener('click', () => {
    currentKW = getCurrentKW();
    renderKWNav();
    loadWeekData();
    updateSummary();
  });

  document.getElementById('btnSync').addEventListener('click', openSyncModal);
  document.getElementById('btnSettings').addEventListener('click', openSettingsModal);

  // Sync tabs
  document.querySelectorAll('.sync-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sync-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.sync-panel').forEach(p => p.classList.add('hidden'));
      document.getElementById(`sync${tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1)}`).classList.remove('hidden');
    });
  });

  // Joker
  document.getElementById('btnJoker').addEventListener('click', toggleJoker);

  // Close modals on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') navigateKW(-1);
    if (e.key === 'ArrowRight') navigateKW(1);
  });
}

function navigateKW(delta) {
  currentKW = shiftKW(currentKW, delta);
  renderKWNav();
  loadWeekData();
  updateSummary();
  updateJokerBar();
}

// ==================== SECTION COLLAPSE STATE ====================
function getSectionStates() {
  try {
    return JSON.parse(localStorage.getItem('thesystem_collapsed') || '{}');
  } catch { return {}; }
}

function saveSectionState() {
  const states = {};
  document.querySelectorAll('.section').forEach(sec => {
    if (sec.classList.contains('collapsed')) states[sec.dataset.sectionId] = true;
  });
  localStorage.setItem('thesystem_collapsed', JSON.stringify(states));
}

// ==================== THEME ====================
function loadTheme() {
  const theme = localStorage.getItem('thesystem_theme') || 'dark';
  setTheme(theme);
}

function setTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  localStorage.setItem('thesystem_theme', theme);
  document.getElementById('themeDark').classList.toggle('active', theme === 'dark');
  document.getElementById('themeLight').classList.toggle('active', theme === 'light');
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#f4f4f0' : '#0a0a0a';
}

// ==================== JOKER ====================
function toggleJoker() {
  if (!jokerDays[currentKW]) jokerDays[currentKW] = [false,false,false,false,false,false,false];
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1; // Convert to Mon=0
  jokerDays[currentKW][dayIndex] = !jokerDays[currentKW][dayIndex];
  saveAllData();
  updateJokerBar();
}

function getJokerCount() {
  let count = 0;
  const year = parseKW(currentKW).year;
  Object.keys(jokerDays).forEach(kw => {
    if (kw.startsWith(String(year))) {
      const days = jokerDays[kw];
      if (Array.isArray(days)) count += days.filter(Boolean).length;
    }
  });
  return count;
}

function updateJokerBar() {
  const used = getJokerCount();
  const total = CONFIG?.joker?.perYear || 60;
  document.getElementById('jokerUsed').textContent = used;
  document.getElementById('jokerTotal').textContent = total;

  const btn = document.getElementById('btnJoker');
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1;
  const isJokerToday = jokerDays[currentKW]?.[dayIndex] === true;
  btn.classList.toggle('active', isJokerToday);
  btn.textContent = isJokerToday ? 'Joker aktiv ✓' : 'Joker heute';
}

// ==================== SYNC / IMPORT / EXPORT ====================
function openSyncModal() {
  document.getElementById('syncModal').classList.remove('hidden');
  document.getElementById('syncResult').classList.add('hidden');
  generateSchema();
}

function closeSyncModal() {
  document.getElementById('syncModal').classList.add('hidden');
}

function doSyncImport() {
  const input = document.getElementById('syncInput').value.trim();
  const resultEl = document.getElementById('syncResult');

  try {
    const json = JSON.parse(input);
    const kw = json.kw || currentKW;
    delete json.kw;

    if (!allData[kw]) allData[kw] = {};
    let merged = 0;

    Object.keys(json).forEach(fieldId => {
      const val = json[fieldId];

      if (val === null || val === undefined) return; // Skip null = don't touch

      if (Array.isArray(val)) {
        // Merge arrays position by position
        if (!allData[kw][fieldId]) allData[kw][fieldId] = Array(val.length).fill(null);
        val.forEach((v, i) => {
          if (v !== null && v !== undefined) {
            allData[kw][fieldId][i] = v;
            merged++;
          }
        });
      } else if (typeof val === 'string' && val.startsWith('+')) {
        // Additive: "+1" means add to existing
        const add = parseInt(val);
        allData[kw][fieldId] = (allData[kw][fieldId] || 0) + add;
        merged++;
      } else {
        allData[kw][fieldId] = val;
        merged++;
      }
    });

    saveAllData();
    if (kw === currentKW) {
      loadWeekData();
      updateSummary();
    }

    resultEl.className = 'sync-result success';
    resultEl.textContent = `✓ ${merged} Felder gemerged in ${kw}`;
    resultEl.classList.remove('hidden');
  } catch (e) {
    resultEl.className = 'sync-result error';
    resultEl.textContent = `✗ Fehler: ${e.message}`;
    resultEl.classList.remove('hidden');
  }
}

function doExportWeek() {
  const data = { kw: currentKW, ...getWeekData(currentKW) };
  const output = document.getElementById('exportOutput');
  output.value = JSON.stringify(data, null, 2);
  output.select();
}

function doExportAll() {
  const exported = {
    version: CONFIG?.version || '4.0',
    exportedAt: new Date().toISOString(),
    data: allData,
    changelog: changelog,
    jokerDays: jokerDays
  };

  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `the-system-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function doImportAll() {
  document.getElementById('importFile').click();
}

function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.data) {
        allData = { ...allData, ...imported.data };
        if (imported.changelog) changelog = [...changelog, ...imported.changelog];
        if (imported.jokerDays) jokerDays = { ...jokerDays, ...imported.jokerDays };
        saveAllData();
        loadWeekData();
        updateSummary();
        updateJokerBar();
        alert('Import erfolgreich!');
      } else {
        alert('Ungültiges Format.');
      }
    } catch (err) {
      alert('Fehler beim Import: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function confirmReset() {
  if (confirm('ALLE Daten löschen? Das kann nicht rückgängig gemacht werden!')) {
    if (confirm('Wirklich sicher? Backup schon gezogen?')) {
      localStorage.removeItem('thesystem_data');
      localStorage.removeItem('thesystem_changelog');
      localStorage.removeItem('thesystem_joker');
      allData = {};
      changelog = [];
      jokerDays = {};
      loadWeekData();
      updateSummary();
      updateJokerBar();
    }
  }
}

// ==================== SCHEMA GENERATOR ====================
function generateSchema() {
  if (!CONFIG) return;

  let schema = `DU BIST EIN HABIT-TRACKER-ASSISTENT.\n\n`;
  schema += `Wenn der User dir über seinen Tag/seine Woche erzählt, extrahiere die Daten und gib am Ende ein JSON im folgenden Format aus.\n\n`;
  schema += `REGELN:\n`;
  schema += `- "kw" ist Pflicht (Format: "2026-kw15")\n`;
  schema += `- Nur Felder inkludieren, über die gesprochen wurde\n`;
  schema += `- null = diesen Wert nicht anfassen\n`;
  schema += `- Bei daily-Arrays: [Mo, Di, Mi, Do, Fr, Sa, So], null = Tag nicht anfassen\n`;
  schema += `- "+1" bei weekly_count = auf bestehenden Wert addieren\n\n`;
  schema += `FELDER:\n`;

  CONFIG.sections.forEach(section => {
    schema += `\n--- ${section.label} ---\n`;
    section.fields.forEach(f => {
      schema += `${f.id} (${f.type}): ${f.label}`;
      if (f.target) schema += ` [Ziel: ${f.target}]`;
      schema += `\n`;
    });
  });

  schema += `\nBEISPIEL-OUTPUT:\n`;
  schema += `\`\`\`json\n{\n  "kw": "2026-kw15",\n  "businessHours": [null, null, 3, null, null, null, null],\n  "water": [null, null, true, null, null, null, null],\n  "rowingCount": "+1"\n}\n\`\`\``;

  document.getElementById('schemaOutput').value = schema;
}

function copySchema() {
  const ta = document.getElementById('schemaOutput');
  ta.select();
  navigator.clipboard.writeText(ta.value).then(() => {
    const btn = document.querySelector('#syncSchema .btn-primary');
    btn.textContent = '✓ Kopiert!';
    setTimeout(() => btn.textContent = 'Kopieren', 1500);
  });
}

// ==================== SETTINGS MODAL ====================
function openSettingsModal() {
  document.getElementById('settingsModal').classList.remove('hidden');
  renderChangelog();
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.add('hidden');
}

function renderChangelog() {
  const list = document.getElementById('changelogList');
  if (changelog.length === 0) {
    list.innerHTML = '<p class="muted">Noch keine Änderungen.</p>';
    return;
  }
  list.innerHTML = changelog.slice(-20).reverse().map(entry =>
    `<div>${entry.date} — ${entry.message}</div>`
  ).join('');
}
