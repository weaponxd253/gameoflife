// ─── Game State ────────────────────────────────────────────────────────────
let salary = 0, savings = 0, debt = 0;
let health = 100, happiness = 100;
let dependents = 0, age = 18;
let career = "Unemployed", maritalStatus = "Single";
let lifeEventHistory = [];
let currentQuestionIndex = 0;
let selectedChoice = null;

// Life event cooldown tracking
let questionsSinceLastEvent = 0;
let recentEventIndices = [];   // prevents same event repeating within last 3

// ─── Life Events ───────────────────────────────────────────────────────────
const lifeEvents = [
  { text: "Won the lottery! (+$50,000, +20 Happiness)", savings: 50000, happiness: 20 },
  { text: "Stock market boom! (+$30,000, +10 Happiness)", savings: 30000, happiness: 10 },
  { text: "Inherited money from a relative! (+$100,000)", savings: 100000 },
  { text: "Started exercising! (+10 Health)", health: 10 },
  { text: "Got a bonus at work! (+$15,000)", savings: 15000, happiness: 5 },
  { text: "Made a great friend! (+10 Happiness)", happiness: 10 },
  { text: "Unexpected medical bill (-$20,000, -20 Health)", savings: -20000, health: -20 },
  { text: "Car accident repair costs (-$5,000, -10 Happiness)", savings: -5000, happiness: -10 },
  { text: "Lost money in a bad investment (-$25,000, -15 Happiness)", savings: -25000, happiness: -15 },
  { text: "Developed bad habits (-15 Health, -5 Happiness)", health: -15, happiness: -5 },
  { text: "Layoff scare — stressful quarter (-10 Happiness, -5 Health)", happiness: -10, health: -5 },
  { text: "Identity theft! (-$8,000, -15 Happiness)", savings: -8000, happiness: -15 }
];

// ─── Questions ─────────────────────────────────────────────────────────────
// ageYears: how many years of life this step represents
// requires: { stat: minValue } — choice is locked/disabled if not met
const questions = [
  {
    text: "🎓 You're 18. Where do you go from here?",
    ageYears: 0,
    choices: [
      { text: "📚 Go to College",          next: 1, debt: 30000,  happiness: -10, health: -5,  ageAdd: 4 },
      { text: "💼 Start a Career",          next: 2, salary: 30000, happiness: 5,               ageAdd: 1 },
      { text: "🔧 Attend Trade School",     next: 3, salary: 40000, debt: 10000,  happiness: 3, ageAdd: 2 },
      { text: "🚀 Start a Business",        next: 4, salary: 25000, debt: 5000,   happiness: -5, health: -10, ageAdd: 1 }
    ]
  },
  {
    text: "🎓 You finished college! Pick your career path:",
    ageYears: 0,
    choices: [
      { text: "🩺 Doctor (High salary, high debt)",         next: 5, salary: 120000, debt: 200000, action: () => career = "Doctor" },
      { text: "🛠 Engineer (Good salary, moderate debt)",   next: 5, salary: 90000,  debt: 50000,  action: () => career = "Engineer" },
      { text: "⚖️ Lawyer (High salary, very high debt)",   next: 5, salary: 110000, debt: 180000, action: () => career = "Lawyer" },
      { text: "🎓 Professor (Stable income, low debt)",     next: 5, salary: 70000,  debt: 40000,  action: () => career = "Professor" }
    ]
  },
  {
    text: "🚀 You skipped college! Choose a career path:",
    ageYears: 0,
    choices: [
      { text: "🏬 Retail Manager",       next: 5, salary: 45000, happiness: 5,  action: () => career = "Retail Manager" },
      { text: "👷 Construction Worker",  next: 5, salary: 50000, happiness: 3,  health: -5, action: () => career = "Construction Worker" },
      { text: "🚚 Delivery Driver",      next: 5, salary: 35000, happiness: 8,  action: () => career = "Delivery Driver" },
      { text: "🏭 Factory Worker",       next: 5, salary: 40000, happiness: 0,  health: -3, action: () => career = "Factory Worker" }
    ]
  },
  {
    text: "🔧 You completed trade school! Choose a career path:",
    ageYears: 0,
    choices: [
      { text: "⚡ Electrician",        next: 5, salary: 60000, happiness: 10, action: () => career = "Electrician" },
      { text: "🚰 Plumber",            next: 5, salary: 65000, happiness: 8,  health: -5, action: () => career = "Plumber" },
      { text: "❄️ HVAC Technician",    next: 5, salary: 55000, happiness: 5,  action: () => career = "HVAC Technician" },
      { text: "🛠 Auto Mechanic",      next: 5, salary: 50000, happiness: 7,  health: -3, action: () => career = "Auto Mechanic" }
    ]
  },
  {
    text: "🚀 You started a business! Choose your focus:",
    ageYears: 0,
    choices: [
      { text: "💻 Freelance Web Developer",  next: 5, salary: 70000, debt: 5000,  happiness: 15, action: () => career = "Freelance Web Developer" },
      { text: "🌿 Landscaping Business",     next: 5, salary: 60000, debt: 10000, happiness: 10, health: -5, action: () => career = "Landscaper" },
      { text: "🍔 Food Truck Owner",         next: 5, salary: 75000, debt: 30000, happiness: 12, action: () => career = "Food Truck Owner" },
      { text: "🛒 E-commerce Store",         next: 5, salary: 65000, debt: 20000, happiness: 10, action: () => career = "E-commerce Entrepreneur" }
    ]
  },
  {
    text: "⚖️ You're settled into your job. How do you approach work-life balance?",
    ageYears: 4,
    choices: [
      { text: "💼 Work extra hours for a raise",            next: 6, salary: 10000,  happiness: -15, health: -10 },
      { text: "⚖️ Balance work & personal life",           next: 6, happiness: 10,  health: 5 },
      { text: "🏖️ Take a relaxed job (less stress, lower pay)", next: 6, salary: -5000, happiness: 20, health: 10 }
    ]
  },
  {
    text: "💞 You meet someone special! What do you do?",
    ageYears: 5,
    choices: [
      {
        text: "💍 Small, intimate wedding",
        next: 7, savings: -10000, happiness: 20,
        action: () => maritalStatus = "Married"
      },
      {
        text: "💒 Grand luxury wedding",
        next: 7, savings: -50000, happiness: 30, salary: 30000,
        requires: { savings: 20000 },
        action: () => maritalStatus = "Married"
      },
      { text: "🚶 Stay single for now", next: 8, happiness: -5 }
    ]
  },
  {
    text: "👶 Thinking about having kids?",
    ageYears: 3,
    choices: [
      { text: "👨‍👩‍👦 Have one child",      next: 8, happiness: 20, savings: -50000, action: () => dependents += 1 },
      { text: "👨‍👩‍👧‍👦 Have multiple kids", next: 8, happiness: 30, savings: -100000, action: () => dependents += 2 },
      { text: "💼 No kids — focus on career", next: 8, happiness: -5, salary: 10000 }
    ]
  },
  {
    text: "🏡 You need a place to live. What do you do?",
    ageYears: 2,
    choices: [
      { text: "🏠 Buy a modest house (-$100,000 debt)",      next: 9, debt: 100000, happiness: 15 },
      { text: "🏢 Rent an apartment (no debt, flexible)",    next: 9, happiness: 5 },
      {
        text: "🏰 Invest in a luxury home (-$500,000 debt)",
        next: 9, debt: 500000, happiness: 30,
        requires: { salary: 100000 }
      }
    ]
  },
  {
    text: "🚗 You need transportation. What do you buy?",
    ageYears: 1,
    choices: [
      { text: "🚙 Cheap used car (-$10,000)",           next: 10, debt: 10000 },
      { text: "🚗 Reliable mid-range car (-$30,000)",   next: 10, debt: 30000, happiness: 5 },
      {
        text: "🏎️ Luxury sports car (-$100,000)",
        next: 10, debt: 100000, happiness: 20,
        requires: { savings: 30000 }
      }
    ]
  },
  {
    text: "🔄 Your career is at a crossroads. What do you do?",
    ageYears: 8,
    choices: [
      { text: "💼 Stay at current job",                                  next: 14 },
      { text: "🚀 Start a business (-$50,000 investment)",              next: 13, savings: -50000, salary: 100000, happiness: 15, requires: { savings: 50000 } },
      { text: "🔄 Switch jobs for a better salary",                     next: 12, salary: 20000, happiness: -5 },
      { text: "🎓 Go back to college (-$30,000 tuition)",              next: 11, savings: -30000, happiness: -5, debt: 30000, requires: { savings: 30000 } }
    ]
  },
  {
    text: "🎓 You completed your degree! Choose a high-paying career:",
    ageYears: 4,
    choices: [
      { text: "💻 Software Developer",           next: 14, salary: 95000,  debt: 50000, happiness: 10, action: () => career = "Software Developer" },
      { text: "📊 Financial Analyst",            next: 14, salary: 85000,  debt: 40000, happiness: 8,  action: () => career = "Financial Analyst" },
      { text: "📢 Marketing Manager",            next: 14, salary: 90000,  debt: 30000, happiness: 12, action: () => career = "Marketing Manager" },
      { text: "💊 Pharmaceutical Sales Rep",     next: 14, salary: 100000, debt: 25000, happiness: 15, action: () => career = "Pharmaceutical Sales Rep" }
    ]
  },
  {
    text: "🔄 You switched careers! Choose your new path:",
    ageYears: 2,
    choices: [
      { text: "📊 Project Manager",             next: 14, salary: 85000, happiness: 10, action: () => career = "Project Manager" },
      { text: "🏡 Real Estate Agent",           next: 14, salary: 75000, happiness: 12, action: () => career = "Real Estate Agent" },
      { text: "🔒 Cybersecurity Specialist",    next: 14, salary: 90000, happiness: 8,  action: () => career = "Cybersecurity Specialist" },
      { text: "🛠 Freelancer / Consultant",     next: 14, salary: 80000, happiness: 15, action: () => career = "Freelancer/Consultant" }
    ]
  },
  {
    text: "💡 You launched a business! What's your model?",
    ageYears: 2,
    choices: [
      { text: "🚀 Tech Startup",          next: 14, salary: 120000, savings: -50000, happiness: 20, action: () => career = "Tech Startup Founder" },
      { text: "🍽️ Restaurant Owner",     next: 14, salary: 90000,  savings: -40000, happiness: 10, action: () => career = "Restaurant Owner" },
      { text: "🛍️ E-commerce Store",     next: 14, salary: 85000,  savings: -20000, happiness: 15, action: () => career = "E-commerce Entrepreneur" },
      { text: "🏪 Franchise Owner",       next: 14, salary: 100000, savings: -75000, happiness: 12, requires: { savings: 75000 }, action: () => career = "Franchise Owner" }
    ]
  },
  {
    text: "🏖️ Retirement is approaching. How do you plan for it?",
    ageYears: 20,
    choices: [
      { text: "⏳ Retire early (-$300,000 savings)", next: null, savings: -300000, happiness: 20, requires: { savings: 300000 } },
      { text: "💼 Work longer for stability",         next: null, salary: 50000 },
      { text: "📈 Invest in stocks for passive income", next: null, savings: 100000 }
    ]
  }
];

// ─── UI Helpers ─────────────────────────────────────────────────────────────
function updateStatus() {
  document.getElementById("salary").textContent    = salary.toLocaleString();
  document.getElementById("savings").textContent   = savings.toLocaleString();
  document.getElementById("debt").textContent      = debt.toLocaleString();
  document.getElementById("health").textContent    = health;
  document.getElementById("happiness").textContent = happiness;
  document.getElementById("career").textContent    = career;
  document.getElementById("marital-status").textContent = maritalStatus;
  document.getElementById("dependents").textContent = dependents;
  document.getElementById("age").textContent       = age;

  // Update progress bars
  const hBar  = document.getElementById("health-bar");
  const haBar = document.getElementById("happiness-bar");
  if (hBar)  hBar.style.width  = Math.max(0, Math.min(100, health))    + "%";
  if (haBar) haBar.style.width = Math.max(0, Math.min(100, happiness)) + "%";
}

function updateFinances(amount) {
  if (savings + amount < 0) {
    debt += Math.abs(savings + amount);
    savings = 0;
  } else {
    savings += amount;
  }
  document.getElementById("savings").textContent = savings.toLocaleString();
  document.getElementById("debt").textContent    = debt.toLocaleString();
}

function adjustFinalFinances() {
  if (debt > 0) {
    if (savings >= debt) { savings -= debt; debt = 0; }
    else                 { debt -= savings; savings = 0; }
  }
  document.getElementById("savings").textContent = savings.toLocaleString();
  document.getElementById("debt").textContent    = debt.toLocaleString();
}

// ─── Stat Diff Panel ────────────────────────────────────────────────────────
function showStatDiffs(diffs) {
  const panel = document.getElementById("stat-diff-panel");
  if (!panel) return;

  panel.innerHTML = "";
  panel.classList.remove("hidden");

  const labels = {
    salary:    { icon: "💰", label: "Salary",    money: true },
    savings:   { icon: "💵", label: "Savings",   money: true },
    debt:      { icon: "🏦", label: "Debt",      money: true, invertColor: true },
    health:    { icon: "❤️", label: "Health",    money: false },
    happiness: { icon: "😊", label: "Happiness", money: false },
    age:       { icon: "🎂", label: "Age",       money: false }
  };

  let hasAny = false;
  Object.entries(diffs).forEach(([key, val]) => {
    if (!val || val === 0) return;
    hasAny = true;
    const meta   = labels[key] || { icon: "", label: key, money: false };
    const isPos  = meta.invertColor ? val < 0 : val > 0;
    const badge  = document.createElement("span");
    badge.className = `diff-badge ${isPos ? "pos" : "neg"}`;
    const prefix = val > 0 ? "+" : "";
    const display = meta.money
      ? `${val > 0 ? "+$" : "-$"}${Math.abs(val).toLocaleString()}`
      : `${prefix}${val}`;
    badge.textContent = `${meta.icon} ${meta.label}: ${display}`;
    panel.appendChild(badge);
  });

  if (!hasAny) { panel.classList.add("hidden"); return; }

  gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  setTimeout(() => {
    gsap.to(panel, { opacity: 0, duration: 0.5, onComplete: () => panel.classList.add("hidden") });
  }, 2800);
}

// ─── Tooltip ────────────────────────────────────────────────────────────────
function buildTooltip(choice) {
  const parts = [];
  if (choice.salary)    parts.push({ label: "Salary",    val: choice.salary,    money: true,  inv: false });
  if (choice.savings)   parts.push({ label: "Savings",   val: choice.savings,   money: true,  inv: false });
  if (choice.debt)      parts.push({ label: "Debt",      val: choice.debt,      money: true,  inv: true  });
  if (choice.health)    parts.push({ label: "Health",    val: choice.health,    money: false, inv: false });
  if (choice.happiness) parts.push({ label: "Happiness", val: choice.happiness, money: false, inv: false });
  if (parts.length === 0) return "No immediate stat change";

  return parts.map(p => {
    const isGood  = p.inv ? p.val < 0 : p.val > 0;
    const cls     = isGood ? "tooltip-pos" : "tooltip-neg";
    const display = p.money
      ? `${p.val > 0 ? "+$" : "-$"}${Math.abs(p.val).toLocaleString()}`
      : `${p.val > 0 ? "+" : ""}${p.val}`;
    return `<span class="tooltip-item ${cls}">${p.label}: ${display}</span>`;
  }).join(" · ");
}

let tooltipEl = null;
function showTooltip(button, html) {
  tooltipEl = document.getElementById("choice-tooltip");
  if (!tooltipEl) return;
  tooltipEl.innerHTML = html;
  tooltipEl.classList.remove("hidden");

  const rect   = button.getBoundingClientRect();
  const ttW    = tooltipEl.offsetWidth || 200;
  let left     = rect.left + rect.width / 2;
  let top      = rect.top - tooltipEl.offsetHeight - 10 + window.scrollY;

  // Flip below button if it would go off the top of the screen
  if (rect.top - tooltipEl.offsetHeight - 10 < 0) {
    top = rect.bottom + 10 + window.scrollY;
  }

  // Keep horizontally in viewport
  left = Math.max(ttW / 2 + 8, Math.min(window.innerWidth - ttW / 2 - 8, left));
  tooltipEl.style.left = left + "px";
  tooltipEl.style.top  = top  + "px";
  tooltipEl.style.opacity = "1";
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.classList.add("hidden");
}

// ─── Rendering ──────────────────────────────────────────────────────────────
function renderQuestion() {
  const q = questions[currentQuestionIndex];
  if (!q) { console.error("Bad index:", currentQuestionIndex); return; }

  gsap.to("#question", {
    opacity: 0, y: -20, duration: 0.4,
    onComplete: () => {
      document.getElementById("question").textContent = q.text;
      document.getElementById("choices").innerHTML   = "";
      selectedChoice = null;

      const nextBtn = document.getElementById("nextBtn");
      if (nextBtn) nextBtn.disabled = true;

      q.choices.forEach((choice, i) => {
        const btn = document.createElement("button");
        btn.classList.add("choice");

        // Check requirements — lock if not met
        const locked = choice.requires && !meetsRequirements(choice.requires);
        if (locked) {
          btn.classList.add("choice-locked");
          btn.disabled = true;
          const reqText = Object.entries(choice.requires)
            .map(([k, v]) => `${k} ≥ ${v >= 1000 ? "$" + v.toLocaleString() : v}`)
            .join(", ");
          btn.innerHTML = `<span class="lock-icon">🔒</span>${choice.text}`;
          btn.addEventListener("mouseenter", () => showTooltip(btn, `<span class="tooltip-neg">Requires: ${reqText}</span>`));
          btn.addEventListener("mouseleave", hideTooltip);
        } else {
          btn.textContent = choice.text;
          btn.onclick = () => selectChoice(i);

          const ttHTML = buildTooltip(choice);
          btn.addEventListener("mouseenter", () => showTooltip(btn, ttHTML));
          btn.addEventListener("mouseleave", hideTooltip);
        }

        document.getElementById("choices").appendChild(btn);
        gsap.from(btn, { opacity: 0, y: 20, duration: 0.4, delay: i * 0.08 });
      });

      gsap.to("#question", { opacity: 1, y: 0, duration: 0.4 });
    }
  });

  const total = questions.length;
  document.getElementById("progress").textContent = `Step ${currentQuestionIndex + 1} of ${total}`;
}

function meetsRequirements(requires) {
  const stats = { savings, salary, health, happiness, debt, age };
  return Object.entries(requires).every(([k, v]) => (stats[k] ?? 0) >= v);
}

function selectChoice(index) {
  selectedChoice = index;
  document.querySelectorAll(".choice").forEach((btn, i) => {
    btn.classList.toggle("selected", i === index);
  });
  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) nextBtn.disabled = false;
}

// ─── Core: Next Click ───────────────────────────────────────────────────────
function handleNextClick() {
  if (selectedChoice === null) return;

  const q      = questions[currentQuestionIndex];
  const choice = q.choices[selectedChoice];

  // Snapshot before changes for diff display
  const before = { salary, savings, debt, health, happiness };

  // Apply stats
  salary    += choice.salary    || 0;
  debt      += choice.debt      || 0;
  health    += choice.health    || 0;
  happiness += choice.happiness || 0;
  updateFinances(choice.savings || 0);

  health    = Math.max(0, Math.min(100, health));
  happiness = Math.max(0, Math.min(100, happiness));

  if (choice.action) choice.action();

  // Age advancement — choice-level overrides question-level
  const yearsAdded = choice.ageAdd !== undefined ? choice.ageAdd : (q.ageYears || 3);
  age += yearsAdded;

  updateStatus();
  saveGame();

  // Compute and show diffs
  const diffs = {
    salary:    salary    - before.salary,
    savings:   savings   - before.savings,
    debt:      debt      - before.debt,
    health:    health    - before.health,
    happiness: happiness - before.happiness,
    age:       yearsAdded
  };
  showStatDiffs(diffs);

  // Life event logic — improved frequency & no-repeat
  questionsSinceLastEvent++;
  const shouldTrigger =
    (questionsSinceLastEvent >= 3 && currentQuestionIndex % 3 === 0 && currentQuestionIndex !== 0) ||
    (questionsSinceLastEvent >= 3 && Math.random() < 0.15) ||
    (questionsSinceLastEvent >= 2 && (debt > 50000 || health < 50) && Math.random() < 0.4);

  if (shouldTrigger) triggerRandomLifeEvent();

  // Navigate
  if (choice.next !== null && choice.next !== undefined && choice.next < questions.length) {
    currentQuestionIndex = choice.next;
    renderQuestion();
  } else {
    endGame();
  }
}

// ─── Life Events ────────────────────────────────────────────────────────────
function triggerRandomLifeEvent() {
  // Pick an event not recently used
  const available = lifeEvents
    .map((_, i) => i)
    .filter(i => !recentEventIndices.includes(i));

  const pool  = available.length > 0 ? available : lifeEvents.map((_, i) => i);
  const idx   = pool[Math.floor(Math.random() * pool.length)];
  const event = lifeEvents[idx];

  // Update recency window (keep last 3)
  recentEventIndices.push(idx);
  if (recentEventIndices.length > 3) recentEventIndices.shift();

  lifeEventHistory.push(event);
  questionsSinceLastEvent = 0;

  const eventBox  = document.getElementById("life-event-box");
  const eventText = document.getElementById("life-event-text");
  if (gsap.isTweening(eventBox)) return;

  eventBox.style.display = "block";
  eventText.innerHTML = `<strong>${event.text}</strong>`;

  gsap.timeline()
    .fromTo(eventBox, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
    .to(eventBox, { opacity: 1, duration: 2.5 })
    .to(eventBox, { opacity: 0, y: -40, duration: 0.6, ease: "power2.in",
        onComplete: () => { eventBox.style.display = "none"; } });

  applyLifeEventEffects(event);
}

function applyLifeEventEffects(event) {
  updateFinances(event.savings || 0);
  debt      += event.debt      || 0;
  health    += event.health    || 0;
  happiness += event.happiness || 0;
  health    = Math.max(0, Math.min(100, health));
  happiness = Math.max(0, Math.min(100, happiness));
  updateStatus();
}

// ─── End Game ───────────────────────────────────────────────────────────────
function endGame() {
  localStorage.removeItem("lifeGameSave");
  adjustFinalFinances();
  showSummary();
}

function getTitle() {
  const netWorth = savings - debt;
  if (netWorth > 1000000)              return "🤑 The Millionaire";
  if (debt === 0 && savings > 100000)  return "💰 The Debt-Free King/Queen 👑";
  if (savings > 500000)                return "💎 The Wealth Builder";
  if (happiness === 100 && health === 100) return "🌟 The Perfect Life Achiever";
  if (happiness >= 80)                 return "😊 The Joyful Guru";
  if (health >= 90)                    return "💪 The Fitness Master";
  if (salary > 150000)                 return "🏢 The Corporate Giant";
  if (career.toLowerCase().includes("entrepreneur") || career.toLowerCase().includes("founder"))
                                       return "🚀 The Business Tycoon";
  if (dependents > 2)                  return "👨‍👩‍👧‍👦 The Family Builder";
  if (debt > 500000)                   return "😅 The Risk Taker";
  return "🌎 The Survivor";
}

function getNetWorthGrade(nw) {
  if (nw >  500000) return { grade: "A+", color: "#4caf50" };
  if (nw >  200000) return { grade: "A",  color: "#8bc34a" };
  if (nw >   50000) return { grade: "B",  color: "#cddc39" };
  if (nw >       0) return { grade: "C",  color: "#ffc107" };
  if (nw > -50000)  return { grade: "D",  color: "#ff9800" };
  return               { grade: "F",  color: "#f44336" };
}

function showSummary() {
  const gameContainer = document.querySelector(".game-container");
  const title    = getTitle();
  const netWorth = savings - debt;
  const nwGrade  = getNetWorthGrade(netWorth);

  const lifeEventsList = lifeEventHistory.length > 0
    ? `<ul>${lifeEventHistory.map(ev => {
        if (!ev?.text) return "";
        const bad  = (ev.savings || 0) < 0 || (ev.health || 0) < 0 || (ev.happiness || 0) < 0;
        return `<li class="${bad ? "negative" : "positive"}">${bad ? "❌" : "✅"} ${ev.text}</li>`;
      }).join("")}</ul>`
    : "<p style='opacity:0.6'>No major life events happened.</p>";

  const nwColor = nwGrade.color;

  gameContainer.innerHTML = `
    <div class="summary-container">
      <h1>🏆 Life Summary</h1>
      <h2>${title}</h2>

      <div class="net-worth-row">
        <span>Net Worth: <strong style="color:${nwColor}">${netWorth < 0 ? "-$" : "$"}${Math.abs(netWorth).toLocaleString()}</strong></span>
        <span class="nw-grade" style="background:${nwColor}22; color:${nwColor}; border:2px solid ${nwColor}">${nwGrade.grade}</span>
        <span style="font-size:14px; opacity:0.7">Final Age: ${age}</span>
      </div>

      <div class="summary-grid">
        <p class="summary-career">🏢 <strong>Career:</strong>&nbsp;${career}</p>
        <p>💰 <strong>Final Salary:</strong>&nbsp;$${salary.toLocaleString()}</p>
        <p>💵 <strong>Total Savings:</strong>&nbsp;$${savings.toLocaleString()}</p>
        <p>🏦 <strong>Total Debt:</strong>&nbsp;$${debt.toLocaleString()}</p>
        <p>😊 <strong>Happiness:</strong>&nbsp;${happiness}/100</p>
        <p>❤️ <strong>Health:</strong>&nbsp;${health}/100</p>
        <p>💍 <strong>Marital Status:</strong>&nbsp;${maritalStatus}</p>
        <p>👶 <strong>Dependents:</strong>&nbsp;${dependents}</p>
      </div>

      <div class="life-events-list">
        <h3>📜 Life Events You Experienced:</h3>
        ${lifeEventsList}
      </div>

      <button id="playAgainBtn">🔄 Play Again</button>
    </div>
  `;
}

// ─── Save / Load ────────────────────────────────────────────────────────────
function saveGame() {
  try {
    const state = {
      salary, savings, debt, health, happiness,
      dependents, career, maritalStatus, age,
      lifeEventHistory, currentQuestionIndex,
      questionsSinceLastEvent, recentEventIndices
    };
    localStorage.setItem("lifeGameSave", JSON.stringify(state));
  } catch (e) { /* storage unavailable */ }
}

function loadGame() {
  try {
    const raw = localStorage.getItem("lifeGameSave");
    if (!raw) return false;
    const s = JSON.parse(raw);
    salary     = s.salary     ?? 0;
    savings    = s.savings    ?? 0;
    debt       = s.debt       ?? 0;
    health     = s.health     ?? 100;
    happiness  = s.happiness  ?? 100;
    dependents = s.dependents ?? 0;
    career     = s.career     ?? "Unemployed";
    maritalStatus = s.maritalStatus ?? "Single";
    age        = s.age        ?? 18;
    lifeEventHistory       = s.lifeEventHistory       ?? [];
    currentQuestionIndex   = s.currentQuestionIndex   ?? 0;
    questionsSinceLastEvent = s.questionsSinceLastEvent ?? 0;
    recentEventIndices      = s.recentEventIndices      ?? [];
    return true;
  } catch (e) { return false; }
}

// ─── Reset ──────────────────────────────────────────────────────────────────
function resetGame() {
  localStorage.removeItem("lifeGameSave");
  salary = 0; savings = 0; debt = 0;
  health = 100; happiness = 100;
  dependents = 0; age = 18;
  career = "Unemployed"; maritalStatus = "Single";
  lifeEventHistory = [];
  currentQuestionIndex = 0;
  selectedChoice = null;
  questionsSinceLastEvent = 0;
  recentEventIndices = [];

  updateStatus();

  const gc = document.querySelector(".game-container");
  if (!gc) { console.error("Game container not found"); return; }

  gc.innerHTML = `
    <div class="life-container">
      <span class="letter purple">L</span>
      <span class="letter blue">I</span>
      <span class="letter green">F</span>
      <span class="letter yellow">E</span>
    </div>
    <p id="question">Choose your path:</p>
    <div id="choices"></div>
    <button id="nextBtn" disabled>Next →</button>
    <p id="progress"></p>
  `;

  renderQuestion();
}

// ─── Event Delegation ───────────────────────────────────────────────────────
document.addEventListener("click", function (e) {
  if (e.target.id === "nextBtn")      handleNextClick();
  if (e.target.id === "playAgainBtn") resetGame();
  if (e.target.id === "loadBtn") {
    document.getElementById("save-banner").classList.add("hidden");
    updateStatus();
    renderQuestion();
  }
  if (e.target.id === "newGameBtn") {
    localStorage.removeItem("lifeGameSave");
    document.getElementById("save-banner").classList.add("hidden");
    // State already at defaults, just render
    renderQuestion();
  }
});

// ─── Theme Toggle ───────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const themeIcon = document.getElementById("themeIcon");
  const body      = document.body;
  const SUN_COLOR  = "#FFD700";
  const MOON_COLOR = "#B39DDB";

  function applyThemeIcon(isDark) {
    // FIX: remove both animation classes first to prevent stacking
    themeIcon.classList.remove("sun-animation", "moon-animation");
    if (isDark) {
      themeIcon.classList.replace("fa-moon", "fa-sun");
      themeIcon.style.color = SUN_COLOR;
      // Re-trigger animation via requestAnimationFrame (forces reflow)
      requestAnimationFrame(() => themeIcon.classList.add("sun-animation"));
    } else {
      themeIcon.classList.replace("fa-sun", "fa-moon");
      themeIcon.style.color = MOON_COLOR;
      requestAnimationFrame(() => themeIcon.classList.add("moon-animation"));
    }
  }

  // Restore saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    body.classList.add("dark-theme");
    applyThemeIcon(true);
  } else {
    applyThemeIcon(false);
  }

  themeIcon.addEventListener("click", function () {
    const isDark = body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    applyThemeIcon(isDark);
  });

  // Check for a saved game and show banner
  try {
    if (localStorage.getItem("lifeGameSave")) {
      const banner = document.getElementById("save-banner");
      if (banner) banner.classList.remove("hidden");
      // Pre-load the state so it's ready if user clicks Continue
      loadGame();
    }
  } catch (e) { /* storage unavailable */ }
});

// ─── Init ───────────────────────────────────────────────────────────────────
updateStatus();
renderQuestion();