// --- APP STATE & TAB SWITCHING ---
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initAgeCalc();
  initSciCalc();
});

function initTabs() {
  const tabAge = document.getElementById('tab-age');
  const tabSci = document.getElementById('tab-sci');
  const viewAge = document.getElementById('age-calc-view');
  const viewSci = document.getElementById('sci-calc-view');

  tabAge.addEventListener('click', () => {
    tabAge.classList.add('active');
    tabAge.setAttribute('aria-selected', 'true');
    tabSci.classList.remove('active');
    tabSci.setAttribute('aria-selected', 'false');
    viewAge.classList.add('active');
    viewSci.classList.remove('active');
  });

  tabSci.addEventListener('click', () => {
    tabSci.classList.add('active');
    tabSci.setAttribute('aria-selected', 'true');
    tabAge.classList.remove('active');
    tabAge.setAttribute('aria-selected', 'false');
    viewSci.classList.add('active');
    viewAge.classList.remove('active');
  });
}

// --- AGE CALCULATOR MODULE ---
function initAgeCalc() {
  const dayInput = document.getElementById('birth-day');
  const monthInput = document.getElementById('birth-month');
  const yearInput = document.getElementById('birth-year');

  const calcBtn = document.getElementById('calc-age-btn');
  const resetBtn = document.getElementById('reset-age-btn');
  const ageForm = document.getElementById('age-form');

  const errorBox = document.getElementById('age-error');
  const resultsContainer = document.getElementById('age-results');

  // Auto-advance input focus for UX
  const setupAutoAdvance = (d, m, y) => {
    d.addEventListener('input', () => {
      d.value = d.value.replace(/\D/g, '');
      if (d.value.length === 2) m.focus();
    });
    m.addEventListener('input', () => {
      m.value = m.value.replace(/\D/g, '');
      if (m.value.length === 2) y.focus();
    });
    y.addEventListener('input', () => {
      y.value = y.value.replace(/\D/g, '');
    });
  };

  setupAutoAdvance(dayInput, monthInput, yearInput);

  // Quick preset years
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      yearInput.value = btn.getAttribute('data-year');
      if (!dayInput.value) dayInput.value = '15';
      if (!monthInput.value) monthInput.value = '06';
      calculateAge();
    });
  });

  ageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateAge();
  });

  resetBtn.addEventListener('click', () => {
    dayInput.value = '';
    monthInput.value = '';
    yearInput.value = '';
    errorBox.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    dayInput.focus();
  });

  function calculateAge() {
    errorBox.classList.add('hidden');
    resultsContainer.classList.add('hidden');

    const d = parseInt(dayInput.value.trim(), 10);
    const m = parseInt(monthInput.value.trim(), 10);
    const y = parseInt(yearInput.value.trim(), 10);

    if (!d || !m || !y || isNaN(d) || isNaN(m) || isNaN(y)) {
      showAgeError('Please enter a valid birth day, month, and year.');
      return;
    }

    if (m < 1 || m > 12) {
      showAgeError('Month must be between 1 and 12.');
      return;
    }

    if (d < 1 || d > 31) {
      showAgeError('Day must be between 1 and 31.');
      return;
    }

    if (y < 1850 || y > 2100) {
      showAgeError('Year must be between 1850 and 2100.');
      return;
    }

    const birthDate = new Date(y, m - 1, d);
    if (
      birthDate.getFullYear() !== y ||
      birthDate.getMonth() !== m - 1 ||
      birthDate.getDate() !== d
    ) {
      showAgeError('Invalid date specified (e.g. Feb 30 does not exist).');
      return;
    }

    // Target date is strictly current system date
    const targetDate = new Date();

    if (birthDate > targetDate) {
      showAgeError('Birth date cannot be in the future.');
      return;
    }

    // Exact difference calculation (Years, Months, Days)
    let ageYears = targetDate.getFullYear() - birthDate.getFullYear();
    let ageMonths = targetDate.getMonth() - birthDate.getMonth();
    let ageDays = targetDate.getDate() - birthDate.getDate();

    if (ageDays < 0) {
      ageMonths--;
      const prevMonthLastDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate();
      ageDays += prevMonthLastDay;
    }

    if (ageMonths < 0) {
      ageYears--;
      ageMonths += 12;
    }

    // Total stats
    const diffTime = Math.abs(targetDate - birthDate);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = ageYears * 12 + ageMonths;
    const totalHours = (totalDays * 24).toLocaleString();

    // Day of week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeekStr = daysOfWeek[birthDate.getDay()];

    // Zodiac sign
    const zodiacStr = getZodiacSign(d, m);

    // Next birthday countdown
    const nextBdayStr = getNextBirthdayCountdown(birthDate, targetDate);

    // Render output
    document.getElementById('res-years').textContent = ageYears;
    document.getElementById('res-months').textContent = ageMonths;
    document.getElementById('res-days').textContent = ageDays;

    document.getElementById('res-dayofweek').textContent = dayOfWeekStr;
    document.getElementById('res-zodiac').textContent = zodiacStr;
    document.getElementById('res-nextbday').textContent = nextBdayStr;
    document.getElementById('res-total-months').textContent = totalMonths.toLocaleString();
    document.getElementById('res-total-weeks').textContent = totalWeeks.toLocaleString();
    document.getElementById('res-total-days').textContent = totalDays.toLocaleString();
    document.getElementById('res-total-hours').textContent = '~' + totalHours;

    resultsContainer.classList.remove('hidden');
  }

  function showAgeError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }
}

function getZodiacSign(day, month) {
  const zodiacs = [
    { name: 'Capricorn ♑', end: 19 },
    { name: 'Aquarius ♒', end: 18 },
    { name: 'Pisces ♓', end: 20 },
    { name: 'Aries ♈', end: 19 },
    { name: 'Taurus ♉', end: 20 },
    { name: 'Gemini ♊', end: 20 },
    { name: 'Cancer ♋', end: 22 },
    { name: 'Leo ♌', end: 22 },
    { name: 'Virgo ♍', end: 22 },
    { name: 'Libra ♎', end: 22 },
    { name: 'Scorpio ♏', end: 21 },
    { name: 'Sagittarius ♐', end: 21 },
    { name: 'Capricorn ♑', end: 31 }
  ];
  return day <= zodiacs[month - 1].end ? zodiacs[month - 1].name : zodiacs[month].name;
}

function getNextBirthdayCountdown(birthDate, refDate) {
  let nextBday = new Date(refDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBday < refDate) {
    nextBday.setFullYear(refDate.getFullYear() + 1);
  }

  const diffTime = nextBday - refDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '🎉 Today is the Birthday!';

  let m = 0;
  let d = diffDays;
  let tempDate = new Date(refDate);

  while (tempDate < nextBday) {
    const prevTime = new Date(tempDate);
    tempDate.setMonth(tempDate.getMonth() + 1);
    if (tempDate <= nextBday) {
      m++;
    } else {
      const remainingTime = nextBday - prevTime;
      d = Math.round(remainingTime / (1000 * 60 * 60 * 24));
      break;
    }
  }

  if (m > 0) {
    return `${m} month${m > 1 ? 's' : ''}, ${d} day${d !== 1 ? 's' : ''} (${diffDays} days total)`;
  }
  return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
}


// --- SCIENTIFIC CALCULATOR MODULE ---
function initSciCalc() {
  const subDisplay = document.getElementById('sci-expression');
  const mainDisplay = document.getElementById('sci-result');
  const degRadBtn = document.getElementById('btn-deg-rad');
  const degRadIndicator = document.getElementById('deg-rad-indicator');
  const invBtn = document.getElementById('btn-inv');
  const memIndicator = document.getElementById('mem-indicator');
  const historyList = document.getElementById('sci-history-list');
  const clearHistBtn = document.getElementById('clear-history-btn');

  let expression = '';
  let currentVal = '0';
  let isAngleDegree = true;
  let isInverse = false;
  let memoryValue = 0;
  let history = [];
  let evaluated = false;

  // Keypad Click Handlers
  document.querySelectorAll('.keypad-grid .key').forEach(key => {
    key.addEventListener('click', () => {
      const action = key.getAttribute('data-action');
      const val = key.getAttribute('data-val');

      if (val !== null) {
        handleDigit(val);
      } else if (action) {
        handleAction(action);
      }
      updateDisplay();
    });
  });

  // Mode Buttons
  degRadBtn.addEventListener('click', () => {
    isAngleDegree = !isAngleDegree;
    degRadBtn.textContent = isAngleDegree ? 'DEG' : 'RAD';
    degRadIndicator.textContent = isAngleDegree ? 'DEG' : 'RAD';
  });

  invBtn.addEventListener('click', () => {
    isInverse = !isInverse;
    invBtn.classList.toggle('active-mode', isInverse);
    updateInverseLabels();
  });

  document.getElementById('btn-mc').addEventListener('click', () => {
    memoryValue = 0;
    memIndicator.style.display = 'none';
  });

  document.getElementById('btn-mr').addEventListener('click', () => {
    currentVal = memoryValue.toString();
    evaluated = false;
    updateDisplay();
  });

  document.getElementById('btn-mplus').addEventListener('click', () => {
    try {
      const num = parseFloat(evalExpression(expression + currentVal));
      if (!isNaN(num)) {
        memoryValue += num;
        memIndicator.style.display = 'inline-block';
      }
    } catch (e) {}
  });

  clearHistBtn.addEventListener('click', () => {
    history = [];
    renderHistory();
  });

  function updateInverseLabels() {
    const sinBtn = document.querySelector('[data-action="sin"]');
    const cosBtn = document.querySelector('[data-action="cos"]');
    const tanBtn = document.querySelector('[data-action="tan"]');

    if (isInverse) {
      if (sinBtn) sinBtn.textContent = 'asin';
      if (cosBtn) cosBtn.textContent = 'acos';
      if (tanBtn) tanBtn.textContent = 'atan';
    } else {
      if (sinBtn) sinBtn.textContent = 'sin';
      if (cosBtn) cosBtn.textContent = 'cos';
      if (tanBtn) tanBtn.textContent = 'tan';
    }
  }

  function handleDigit(val) {
    if (evaluated) {
      currentVal = '';
      expression = '';
      evaluated = false;
    }
    if (currentVal === '0' && val !== '.') {
      currentVal = val;
    } else if (val === '.' && currentVal.includes('.')) {
      return;
    } else {
      currentVal += val;
    }
  }

  function handleAction(action) {
    if (action === 'clear') {
      expression = '';
      currentVal = '0';
      evaluated = false;
      return;
    }

    if (action === 'backspace') {
      if (evaluated) {
        expression = '';
        evaluated = false;
        return;
      }
      if (currentVal.length > 1) {
        currentVal = currentVal.slice(0, -1);
      } else {
        currentVal = '0';
      }
      return;
    }

    if (action === 'plusminus') {
      if (currentVal !== '0') {
        currentVal = currentVal.startsWith('-') ? currentVal.slice(1) : '-' + currentVal;
      }
      return;
    }

    if (['+', '-', '*', '/', '%'].includes(action)) {
      if (evaluated) {
        expression = currentVal + ' ' + action + ' ';
        currentVal = '0';
        evaluated = false;
      } else {
        expression += (currentVal || '0') + ' ' + action + ' ';
        currentVal = '0';
      }
      return;
    }

    if (action === '(' || action === ')') {
      if (action === '(') {
        expression += '(';
      } else {
        expression += currentVal + ')';
        currentVal = '';
      }
      return;
    }

    if (action === 'equals') {
      try {
        const fullExpr = expression + (currentVal || '');
        if (!fullExpr.trim()) return;

        const result = evalExpression(fullExpr);
        addHistory(fullExpr, result);

        currentVal = String(result);
        expression = '';
        evaluated = true;
      } catch (err) {
        currentVal = 'Error';
        expression = '';
        evaluated = true;
      }
      return;
    }

    // Scientific Functions
    let num = parseFloat(currentVal);

    switch (action) {
      case 'sin':
        applyFunc(isInverse ? 'asin' : 'sin');
        break;
      case 'cos':
        applyFunc(isInverse ? 'acos' : 'cos');
        break;
      case 'tan':
        applyFunc(isInverse ? 'atan' : 'tan');
        break;
      case 'log':
        applyFunc('log10');
        break;
      case 'ln':
        applyFunc('log');
        break;
      case 'pow':
        expression += (currentVal || '0') + ' ^ ';
        currentVal = '0';
        break;
      case 'sqr':
        currentVal = String(Math.pow(num, 2));
        break;
      case 'sqrt':
        currentVal = num < 0 ? 'Error' : String(Math.sqrt(num));
        break;
      case 'fact':
        currentVal = String(factorial(Math.floor(num)));
        break;
      case '1x':
        currentVal = num === 0 ? 'Error' : String(1 / num);
        break;
      case 'pi':
        currentVal = String(Math.PI);
        break;
      case 'e':
        currentVal = String(Math.E);
        break;
    }
  }

  function applyFunc(funcName) {
    let num = parseFloat(currentVal);
    if (isNaN(num)) return;

    let res;
    if (funcName === 'sin') res = Math.sin(isAngleDegree ? toRad(num) : num);
    else if (funcName === 'cos') res = Math.cos(isAngleDegree ? toRad(num) : num);
    else if (funcName === 'tan') res = Math.tan(isAngleDegree ? toRad(num) : num);
    else if (funcName === 'asin') res = isAngleDegree ? toDeg(Math.asin(num)) : Math.asin(num);
    else if (funcName === 'acos') res = isAngleDegree ? toDeg(Math.acos(num)) : Math.acos(num);
    else if (funcName === 'atan') res = isAngleDegree ? toDeg(Math.atan(num)) : Math.atan(num);
    else if (funcName === 'log10') res = Math.log10(num);
    else if (funcName === 'log') res = Math.log(num);

    if (isNaN(res) || !isFinite(res)) {
      currentVal = 'Error';
    } else {
      currentVal = String(cleanFloat(res));
    }
  }

  function toRad(deg) { return deg * (Math.PI / 180); }
  function toDeg(rad) { return rad * (180 / Math.PI); }

  function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  function cleanFloat(val) {
    return Math.round(val * 1e10) / 1e10;
  }

  function evalExpression(exprStr) {
    let sanitized = exprStr
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .replace(/−/g, '-')
      .replace(/\^/g, '**');

    // Handle standard percentage syntax (e.g. 50 % 10 or 50%)
    sanitized = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    // Safe mathematical calculation via Function construction
    const fn = new Function(`return (${sanitized})`);
    const val = fn();

    if (isNaN(val) || !isFinite(val)) throw new Error('Invalid output');
    return cleanFloat(val);
  }

  function updateDisplay() {
    subDisplay.textContent = expression;
    mainDisplay.textContent = currentVal || '0';
  }

  function addHistory(expr, res) {
    history.unshift({ expr, res });
    if (history.length > 10) history.pop();
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      historyList.innerHTML = '<li class="history-empty">No history yet</li>';
      return;
    }
    historyList.innerHTML = history
      .map(
        item => `
        <li class="history-item">
          <span>${item.expr} =</span>
          <strong>${item.res}</strong>
        </li>
      `
      )
      .join('');

    historyList.querySelectorAll('.history-item').forEach((li, idx) => {
      li.addEventListener('click', () => {
        currentVal = String(history[idx].res);
        expression = '';
        updateDisplay();
      });
    });
  }
}
