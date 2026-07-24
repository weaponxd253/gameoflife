// ─── Game State ────────────────────────────────────────────────────────────
let salary = 0, savings = 0, debt = 0;
let investments = 0;
let studentDebt = 0, housingDebt = 0, businessDebt = 0, consumerDebt = 0;
let annualExpenses = 0;
let health = 100, happiness = 100;
let dependents = 0, age = 18;
let career = "Unemployed", maritalStatus = "Single";
let lifePath = "Undecided";
let lifeEventHistory = [];
let currentQuestionIndex = 0;
let selectedChoice = null;
let decisionsMade = 0;
let maxDebtCarried = 0;
let maxStudentDebtCarried = 0;

// Life event cooldown tracking
let questionsSinceLastEvent = 0;
let recentEventIndices = [];   // prevents same event repeating within last 3

// ─── Life Events ───────────────────────────────────────────────────────────
const lifeEvents = [
  {
    id: "lottery_win",
    category: "financial",
    weight: 1,
    text: "Won the lottery! (+$50,000, +20 Happiness)",
    effects: { savings: 50000, happiness: 20 }
  },
  {
    id: "inheritance",
    category: "financial",
    weight: 2,
    text: "Inherited money from a relative! (+$100,000)",
    effects: { savings: 100000 }
  },
  {
    id: "identity_theft",
    category: "financial",
    weight: 6,
    text: "Identity theft! (-$8,000, -15 Happiness)",
    effects: { savings: -8000, happiness: -15 }
  },
  {
    id: "student_loan_refinance",
    category: "financial",
    weight: 7,
    conditions: { minStudentDebt: 30000 },
    text: "Student loan refinancing helped (-$15,000 student debt, +5 Happiness)",
    effects: { studentDebt: -15000, happiness: 5 }
  },
  {
    id: "consumer_debt_consolidation",
    category: "financial",
    weight: 6,
    conditions: { minConsumerDebt: 10000 },
    text: "Debt consolidation lowered your consumer debt (-$8,000 debt, +4 Happiness)",
    effects: { consumerDebt: -8000, happiness: 4 }
  },
  {
    id: "lifestyle_creep",
    category: "financial",
    weight: 5,
    conditions: { minSalary: 70000, minAnnualExpenses: 25000 },
    text: "Lifestyle creep raised your baseline costs (+$8,000 annual expenses, -5 Happiness)",
    effects: { annualExpenses: 8000, happiness: -5 }
  },
  {
    id: "started_exercising",
    category: "health",
    weight: 7,
    conditions: { maxHealth: 90 },
    text: "Started exercising! (+10 Health)",
    effects: { health: 10 }
  },
  {
    id: "medical_bill",
    category: "health",
    weight: 8,
    conditions: { maxHealth: 75, minAge: 28 },
    text: "Unexpected medical bill (-$20,000, -20 Health)",
    effects: { savings: -20000, health: -20 }
  },
  {
    id: "bad_habits",
    category: "health",
    weight: 5,
    conditions: { maxHappiness: 85 },
    text: "Developed bad habits (-15 Health, -5 Happiness)",
    effects: { health: -15, happiness: -5 }
  },
  {
    id: "bonus_at_work",
    category: "career",
    weight: 7,
    conditions: { minSalary: 35000 },
    text: "Got a bonus at work! (+$15,000, +5 Happiness)",
    effects: { savings: 15000, happiness: 5 }
  },
  {
    id: "promotion",
    category: "career",
    weight: 6,
    conditions: { minSalary: 50000 },
    text: "Promotion came through! (+$20,000 Salary, +10 Happiness)",
    effects: { salary: 20000, happiness: 10 }
  },
  {
    id: "layoff_scare",
    category: "career",
    weight: 6,
    conditions: { minSalary: 30000 },
    text: "Layoff scare — stressful quarter (-10 Happiness, -5 Health)",
    effects: { happiness: -10, health: -5 }
  },
  {
    id: "made_friend",
    category: "family",
    weight: 6,
    text: "Made a great friend! (+10 Happiness)",
    effects: { happiness: 10 }
  },
  {
    id: "childcare_surprise",
    category: "family",
    weight: 7,
    conditions: { minDependents: 1 },
    text: "Childcare costs jumped (+$6,000 annual expenses, -8 Happiness)",
    effects: { annualExpenses: 6000, happiness: -8 }
  },
  {
    id: "family_support",
    category: "family",
    weight: 5,
    conditions: { minDependents: 1 },
    text: "Family support made life easier (+12 Happiness, +5 Health)",
    effects: { happiness: 12, health: 5 }
  },
  {
    id: "car_repair",
    category: "housing",
    weight: 6,
    text: "Car accident repair costs (-$5,000, -10 Happiness)",
    effects: { savings: -5000, happiness: -10 }
  },
  {
    id: "home_repair",
    category: "housing",
    weight: 7,
    conditions: { minHousingDebt: 50000 },
    text: "Major home repair (-$18,000, -8 Happiness)",
    effects: { savings: -18000, happiness: -8 }
  },
  {
    id: "neighborhood_growth",
    category: "housing",
    weight: 4,
    conditions: { minHousingDebt: 50000 },
    text: "Neighborhood values rose (+$25,000 investments, +5 Happiness)",
    effects: { investments: 25000, happiness: 5 }
  },
  {
    id: "business_windfall",
    category: "business",
    weight: 6,
    conditions: { lifePath: "Business" },
    text: "Business windfall! (+$45,000 savings, +10 Happiness)",
    effects: { savings: 45000, happiness: 10 }
  },
  {
    id: "business_setback",
    category: "business",
    weight: 7,
    conditions: { minBusinessDebt: 1 },
    text: "Business setback added pressure (+$20,000 business debt, -10 Happiness)",
    effects: { businessDebt: 20000, happiness: -10 }
  },
  {
    id: "lean_operations",
    category: "business",
    weight: 4,
    conditions: { lifePath: "Business", minAnnualExpenses: 15000 },
    text: "Lean operations paid off (-$8,000 annual expenses, +8 Happiness)",
    effects: { annualExpenses: -8000, happiness: 8 }
  },
  {
    id: "market_boom",
    category: "investment",
    weight: 8,
    conditions: { minInvestments: 1 },
    text: "Stock market boom! (+$30,000 investments, +10 Happiness)",
    effects: { investments: 30000, happiness: 10 }
  },
  {
    id: "market_crash",
    category: "investment",
    weight: 7,
    conditions: { minInvestments: 25000 },
    text: "Market crash hit your portfolio (-$25,000 investments, -15 Happiness)",
    effects: { investments: -25000, happiness: -15 }
  },
  {
    id: "dividend_income",
    category: "investment",
    weight: 5,
    conditions: { minInvestments: 50000 },
    text: "Dividend income arrived (+$12,000 savings)",
    effects: { savings: 12000 }
  }
];

// ─── Questions ─────────────────────────────────────────────────────────────
// ageYears: how many years of life this step represents
// requires: { stat: minValue } — choice is locked/disabled if not met
const pathGrowthRoutes = {
  College: "college_growth",
  "Early Career": "early_career_growth",
  Trade: "trade_growth",
  Business: "business_growth"
};

const questions = [
  {
    id: "start",
    text: "🎓 You're 18. Where do you go from here?",
    ageYears: 0,
    choices: [
      { text: "📚 Go to College",          next: "college_career",      path: "College",      studentDebt: 30000,  happiness: -10, health: -5,  ageAdd: 4 },
      { text: "💼 Start a Career",          next: "early_career_start",  path: "Early Career", salary: 30000, happiness: 5,               ageAdd: 1 },
      { text: "🔧 Attend Trade School",     next: "trade_career",        path: "Trade",        salary: 40000, studentDebt: 10000,  happiness: 3, ageAdd: 2 },
      { text: "🚀 Start a Business",        next: "business_focus",      path: "Business",     salary: 25000, businessDebt: 5000,   happiness: -5, health: -10, ageAdd: 1 }
    ]
  },
  {
    id: "college_career",
    text: "🎓 You finished college! Pick your career path:",
    ageYears: 0,
    choices: [
      { text: "🩺 Doctor (High salary, high debt)",         next: "work_life_balance", salary: 120000, studentDebt: 200000, action: () => career = "Doctor" },
      { text: "🛠 Engineer (Good salary, moderate debt)",   next: "work_life_balance", salary: 90000,  studentDebt: 50000,  action: () => career = "Engineer" },
      { text: "⚖️ Lawyer (High salary, very high debt)",   next: "work_life_balance", salary: 110000, studentDebt: 180000, action: () => career = "Lawyer" },
      { text: "🎓 Professor (Stable income, low debt)",     next: "work_life_balance", salary: 70000,  studentDebt: 40000,  action: () => career = "Professor" }
    ]
  },
  {
    id: "early_career_start",
    text: "🚀 You skipped college! Choose a career path:",
    ageYears: 0,
    choices: [
      { text: "🏬 Retail Manager",       next: "work_life_balance", salary: 45000, happiness: 5,  action: () => career = "Retail Manager" },
      { text: "👷 Construction Worker",  next: "work_life_balance", salary: 50000, happiness: 3,  health: -5, action: () => career = "Construction Worker" },
      { text: "🚚 Delivery Driver",      next: "work_life_balance", salary: 35000, happiness: 8,  action: () => career = "Delivery Driver" },
      { text: "🏭 Factory Worker",       next: "work_life_balance", salary: 40000, happiness: 0,  health: -3, action: () => career = "Factory Worker" }
    ]
  },
  {
    id: "trade_career",
    text: "🔧 You completed trade school! Choose a career path:",
    ageYears: 0,
    choices: [
      { text: "⚡ Electrician",        next: "work_life_balance", salary: 60000, happiness: 10, action: () => career = "Electrician" },
      { text: "🚰 Plumber",            next: "work_life_balance", salary: 65000, happiness: 8,  health: -5, action: () => career = "Plumber" },
      { text: "❄️ HVAC Technician",    next: "work_life_balance", salary: 55000, happiness: 5,  action: () => career = "HVAC Technician" },
      { text: "🛠 Auto Mechanic",      next: "work_life_balance", salary: 50000, happiness: 7,  health: -3, action: () => career = "Auto Mechanic" }
    ]
  },
  {
    id: "business_focus",
    text: "🚀 You started a business! Choose your focus:",
    ageYears: 0,
    choices: [
      { text: "💻 Freelance Web Developer",  next: "work_life_balance", salary: 70000, businessDebt: 5000,  happiness: 15, action: () => career = "Freelance Web Developer" },
      { text: "🌿 Landscaping Business",     next: "work_life_balance", salary: 60000, businessDebt: 10000, happiness: 10, health: -5, action: () => career = "Landscaper" },
      { text: "🍔 Food Truck Owner",         next: "work_life_balance", salary: 75000, businessDebt: 30000, happiness: 12, action: () => career = "Food Truck Owner" },
      { text: "🛒 E-commerce Store",         next: "work_life_balance", salary: 65000, businessDebt: 20000, happiness: 10, action: () => career = "E-commerce Entrepreneur" }
    ]
  },
  {
    id: "work_life_balance",
    text: "⚖️ You're settled into your job. How do you approach work-life balance?",
    ageYears: 4,
    choices: [
      { text: "💼 Work extra hours for a raise",                 next: "relationship", nextByPath: pathGrowthRoutes, salary: 10000,  happiness: -15, health: -10 },
      { text: "⚖️ Balance work & personal life",                 next: "relationship", nextByPath: pathGrowthRoutes, happiness: 10,  health: 5 },
      { text: "🏖️ Take a relaxed job (less stress, lower pay)",  next: "relationship", nextByPath: pathGrowthRoutes, salary: -5000, happiness: 20, health: 10 }
    ]
  },
  {
    id: "college_growth",
    pathOnly: "College",
    text: "🎓 Your degree is opening doors. What do you focus on next?",
    ageYears: 2,
    choices: [
      { text: "🤝 Build your professional network", next: "relationship", salary: 15000, happiness: 5 },
      { text: "🏛️ Chase a prestigious role",       next: "relationship", salary: 30000, happiness: -10, health: -5 },
      { text: "💸 Pay down student loans",          next: "relationship", studentDebt: -25000, happiness: 5 }
    ]
  },
  {
    id: "early_career_growth",
    pathOnly: "Early Career",
    text: "💼 You built experience early. How do you grow from here?",
    ageYears: 2,
    choices: [
      { text: "📣 Ask for a promotion",        next: "relationship", salary: 15000, happiness: -5 },
      { text: "📚 Earn a certificate at night", next: "relationship", salary: 25000, studentDebt: 8000, happiness: -8, health: -5 },
      { text: "🏢 Switch companies",           next: "relationship", salary: 20000, happiness: 5 }
    ]
  },
  {
    id: "trade_growth",
    pathOnly: "Trade",
    text: "🔧 Your trade skills are paying off. What is next?",
    ageYears: 2,
    choices: [
      { text: "📜 Get advanced certification",       next: "relationship", salary: 15000, studentDebt: 5000 },
      { text: "🧰 Take independent contracts",       next: "relationship", salary: 25000, savings: -10000, fallbackDebtType: "businessDebt", happiness: 10, health: -5 },
      { text: "🛡️ Keep a steady union job",          next: "relationship", salary: 10000, happiness: 8, health: 5 }
    ]
  },
  {
    id: "business_growth",
    pathOnly: "Business",
    text: "🚀 Your business has traction. How do you scale it?",
    ageYears: 2,
    choices: [
      { text: "📈 Reinvest aggressively",   next: "relationship", salary: 45000, savings: -30000, fallbackDebtType: "businessDebt", businessDebt: 15000, annualExpenses: 12000, happiness: -5 },
      { text: "🧾 Stay lean and profitable", next: "relationship", salary: 15000, savings: 15000, annualExpenses: 6000, happiness: 8 },
      { text: "👥 Hire help",               next: "relationship", salary: 30000, savings: -20000, fallbackDebtType: "businessDebt", annualExpenses: 18000, happiness: 12 }
    ]
  },
  {
    id: "relationship",
    text: "💞 You meet someone special! What do you do?",
    ageYears: 5,
    choices: [
      {
        text: "💍 Small, intimate wedding",
        next: "kids", savings: -10000, annualExpenses: 2000, happiness: 20,
        action: () => maritalStatus = "Married"
      },
      {
        text: "💒 Grand luxury wedding",
        next: "kids", savings: -50000, annualExpenses: 8000, happiness: 30, salary: 30000,
        requires: { savings: 20000 },
        action: () => maritalStatus = "Married"
      },
      { text: "🚶 Stay single for now", next: "housing", happiness: -5 }
    ]
  },
  {
    id: "kids",
    text: "👶 Thinking about having kids?",
    ageYears: 3,
    choices: [
      { text: "👨‍👩‍👦 Have one child",        next: "housing", happiness: 20, savings: -50000, annualExpenses: 14000, action: () => dependents += 1 },
      { text: "👨‍👩‍👧‍👦 Have multiple kids", next: "housing", happiness: 30, savings: -100000, annualExpenses: 32000, action: () => dependents += 2 },
      { text: "💼 No kids — focus on career", next: "housing", happiness: -5, salary: 10000 }
    ]
  },
  {
    id: "housing",
    text: "🏡 You need a place to live. What do you do?",
    ageYears: 2,
    choices: [
      { text: "🏠 Buy a modest house (-$100,000 debt)",      next: "transportation", housingDebt: 100000, annualExpenses: 12000, happiness: 15 },
      { text: "🏢 Rent an apartment (no debt, flexible)",    next: "transportation", annualExpenses: 18000, happiness: 5 },
      {
        text: "🏰 Invest in a luxury home (-$500,000 debt)",
        next: "transportation", housingDebt: 500000, annualExpenses: 40000, happiness: 30,
        requires: { salary: 100000 }
      }
    ]
  },
  {
    id: "transportation",
    text: "🚗 You need transportation. What do you buy?",
    ageYears: 1,
    choices: [
      { text: "🚙 Cheap used car (-$10,000)",           next: "career_crossroads", consumerDebt: 10000, annualExpenses: 2500 },
      { text: "🚗 Reliable mid-range car (-$30,000)",   next: "career_crossroads", consumerDebt: 30000, annualExpenses: 5500, happiness: 5 },
      {
        text: "🏎️ Luxury sports car (-$100,000)",
        next: "career_crossroads", consumerDebt: 100000, annualExpenses: 12000, happiness: 20,
        requires: { savings: 30000 }
      }
    ]
  },
  {
    id: "career_crossroads",
    text: "🔄 Your career is at a crossroads. What do you do?",
    ageYears: 8,
    choices: [
      { text: "💼 Stay at current job",                                  next: "retirement" },
      { text: "🚀 Start a business (-$50,000 investment)",               next: "business_model", path: "Business", savings: -50000, fallbackDebtType: "businessDebt", salary: 100000, annualExpenses: 15000, happiness: 15, requires: { savings: 50000 } },
      { text: "🔄 Switch jobs for a better salary",                      next: "career_switch", salary: 20000, happiness: -5 },
      { text: "🎓 Go back to college (-$30,000 tuition)",                next: "degree_career", path: "College", savings: -30000, happiness: -5, studentDebt: 30000, requires: { savings: 30000 } }
    ]
  },
  {
    id: "degree_career",
    text: "🎓 You completed your degree! Choose a high-paying career:",
    ageYears: 4,
    choices: [
      { text: "💻 Software Developer",           next: "retirement", salary: 95000,  studentDebt: 50000, happiness: 10, action: () => career = "Software Developer" },
      { text: "📊 Financial Analyst",            next: "retirement", salary: 85000,  studentDebt: 40000, happiness: 8,  action: () => career = "Financial Analyst" },
      { text: "📢 Marketing Manager",            next: "retirement", salary: 90000,  studentDebt: 30000, happiness: 12, action: () => career = "Marketing Manager" },
      { text: "💊 Pharmaceutical Sales Rep",     next: "retirement", salary: 100000, studentDebt: 25000, happiness: 15, action: () => career = "Pharmaceutical Sales Rep" }
    ]
  },
  {
    id: "career_switch",
    text: "🔄 You switched careers! Choose your new path:",
    ageYears: 2,
    choices: [
      { text: "📊 Project Manager",             next: "retirement", salary: 85000, happiness: 10, action: () => career = "Project Manager" },
      { text: "🏡 Real Estate Agent",           next: "retirement", salary: 75000, happiness: 12, action: () => career = "Real Estate Agent" },
      { text: "🔒 Cybersecurity Specialist",    next: "retirement", salary: 90000, happiness: 8,  action: () => career = "Cybersecurity Specialist" },
      { text: "🛠 Freelancer / Consultant",     next: "retirement", salary: 80000, happiness: 15, action: () => career = "Freelancer/Consultant" }
    ]
  },
  {
    id: "business_model",
    text: "💡 You launched a business! What's your model?",
    ageYears: 2,
    choices: [
      { text: "🚀 Tech Startup",          next: "retirement", salary: 120000, savings: -50000, fallbackDebtType: "businessDebt", annualExpenses: 30000, happiness: 20, action: () => career = "Tech Startup Founder" },
      { text: "🍽️ Restaurant Owner",     next: "retirement", salary: 90000,  savings: -40000, fallbackDebtType: "businessDebt", annualExpenses: 36000, happiness: 10, action: () => career = "Restaurant Owner" },
      { text: "🛍️ E-commerce Store",     next: "retirement", salary: 85000,  savings: -20000, fallbackDebtType: "businessDebt", annualExpenses: 18000, happiness: 15, action: () => career = "E-commerce Entrepreneur" },
      { text: "🏪 Franchise Owner",       next: "retirement", salary: 100000, savings: -75000, fallbackDebtType: "businessDebt", annualExpenses: 42000, happiness: 12, requires: { savings: 75000 }, action: () => career = "Franchise Owner" }
    ]
  },
  {
    id: "retirement",
    text: "🏖️ Retirement is approaching. How do you plan for it?",
    ageYears: 20,
    choices: [
      { text: "⏳ Retire early (-$300,000 savings)", next: null, savings: -300000, happiness: 20, requires: { savings: 300000 } },
      { text: "💼 Work longer for stability",         next: null, salary: 50000 },
      { text: "📈 Invest in stocks for passive income", next: null, investments: 100000 }
    ]
  }
];

function getQuestionIndexById(id) {
  return questions.findIndex(question => question.id === id);
}

function getCurrentQuestion() {
  return questions[currentQuestionIndex];
}

function resolveQuestionIndex(target) {
  if (target === null || target === undefined) return null;
  if (typeof target === "number") {
    return target >= 0 && target < questions.length ? target : null;
  }
  if (typeof target === "string") {
    const index = getQuestionIndexById(target);
    if (index !== -1) return index;
  }

  console.error("Unknown question target:", target);
  return null;
}

function getNextTarget(choice) {
  return choice.nextByPath?.[lifePath] || choice.next;
}

// ─── UI Helpers ─────────────────────────────────────────────────────────────
function getLegacyDebt() {
  return Math.max(0, debt);
}

function getConsumerDebtTotal() {
  return getLegacyDebt() + Math.max(0, consumerDebt);
}

function getTotalDebt() {
  return getLegacyDebt()
    + Math.max(0, studentDebt)
    + Math.max(0, housingDebt)
    + Math.max(0, businessDebt)
    + Math.max(0, consumerDebt);
}

function getTotalAssets() {
  return Math.max(0, savings) + Math.max(0, investments);
}

function getNetWorth() {
  return getTotalAssets() - getTotalDebt();
}

function getDebtBreakdown() {
  return [
    { id: "studentDebt", label: "Student Debt", amount: studentDebt },
    { id: "housingDebt", label: "Housing Debt", amount: housingDebt },
    { id: "businessDebt", label: "Business Debt", amount: businessDebt },
    { id: "consumerDebt", label: "Consumer Debt", amount: getConsumerDebtTotal() }
  ];
}

function formatMoney(amount) {
  const sign = amount < 0 ? "-" : "";
  return `${sign}$${Math.abs(amount).toLocaleString()}`;
}

function normalizeFinanceState() {
  savings = Math.max(0, savings);
  investments = Math.max(0, investments);
  debt = Math.max(0, debt);
  studentDebt = Math.max(0, studentDebt);
  housingDebt = Math.max(0, housingDebt);
  businessDebt = Math.max(0, businessDebt);
  consumerDebt = Math.max(0, consumerDebt);
  annualExpenses = Math.max(0, annualExpenses);
}

function updateFinancialMilestones() {
  maxDebtCarried = Math.max(maxDebtCarried, getTotalDebt());
  maxStudentDebtCarried = Math.max(maxStudentDebtCarried, studentDebt);
}

function adjustDebtBucket(bucket, amount) {
  if (!amount) return;
  if (bucket === "studentDebt") studentDebt += amount;
  else if (bucket === "housingDebt") housingDebt += amount;
  else if (bucket === "businessDebt") businessDebt += amount;
  else if (bucket === "consumerDebt") consumerDebt += amount;
  else debt += amount;
  normalizeFinanceState();
}

function getDebtBucketAmount(bucket) {
  if (bucket === "studentDebt") return studentDebt;
  if (bucket === "housingDebt") return housingDebt;
  if (bucket === "businessDebt") return businessDebt;
  if (bucket === "consumerDebt") return consumerDebt;
  return debt;
}

function updateFinances(amount, fallbackDebtType = "consumerDebt") {
  if (!amount) return;
  if (amount < 0) {
    const cost = Math.abs(amount);
    const paidFromSavings = Math.min(savings, cost);
    savings -= paidFromSavings;
    const shortfall = cost - paidFromSavings;
    if (shortfall > 0) adjustDebtBucket(fallbackDebtType, shortfall);
  } else {
    savings += amount;
  }
  normalizeFinanceState();
}

function applyFinancialEffects(source) {
  salary += source.salary || 0;
  investments += source.investments || 0;
  annualExpenses += source.annualExpenses || 0;

  adjustDebtBucket("legacyDebt", source.debt || 0);
  adjustDebtBucket("studentDebt", source.studentDebt || 0);
  adjustDebtBucket("housingDebt", source.housingDebt || 0);
  adjustDebtBucket("businessDebt", source.businessDebt || 0);
  adjustDebtBucket("consumerDebt", source.consumerDebt || 0);
  updateFinances(source.savings || 0, source.fallbackDebtType || "consumerDebt");

  normalizeFinanceState();
  updateFinancialMilestones();
}

function getDebtEffect(source) {
  return (source.debt || 0)
    + (source.studentDebt || 0)
    + (source.housingDebt || 0)
    + (source.businessDebt || 0)
    + (source.consumerDebt || 0);
}

function getEventEffects(event) {
  return event?.effects || event || {};
}

function getEventKey(event, index) {
  return event?.id || index;
}

function getEventCategoryLabel(event) {
  const labels = {
    financial: "Financial",
    health: "Health",
    career: "Career",
    family: "Family",
    housing: "Home & Transport",
    business: "Business",
    investment: "Investment"
  };
  return labels[event?.category] || "Life";
}

function conditionMeetsPath(requiredPath) {
  if (!requiredPath) return true;
  return Array.isArray(requiredPath)
    ? requiredPath.includes(lifePath)
    : lifePath === requiredPath;
}

function eventApplies(event) {
  const c = event.conditions || {};
  const totalDebt = getTotalDebt();
  const currentConsumerDebt = getConsumerDebtTotal();

  return conditionMeetsPath(c.lifePath)
    && (c.minAge === undefined || age >= c.minAge)
    && (c.maxAge === undefined || age <= c.maxAge)
    && (c.minHealth === undefined || health >= c.minHealth)
    && (c.maxHealth === undefined || health <= c.maxHealth)
    && (c.minHappiness === undefined || happiness >= c.minHappiness)
    && (c.maxHappiness === undefined || happiness <= c.maxHappiness)
    && (c.minSalary === undefined || salary >= c.minSalary)
    && (c.maxSalary === undefined || salary <= c.maxSalary)
    && (c.minSavings === undefined || savings >= c.minSavings)
    && (c.maxSavings === undefined || savings <= c.maxSavings)
    && (c.minInvestments === undefined || investments >= c.minInvestments)
    && (c.maxInvestments === undefined || investments <= c.maxInvestments)
    && (c.minTotalDebt === undefined || totalDebt >= c.minTotalDebt)
    && (c.maxTotalDebt === undefined || totalDebt <= c.maxTotalDebt)
    && (c.minStudentDebt === undefined || studentDebt >= c.minStudentDebt)
    && (c.minHousingDebt === undefined || housingDebt >= c.minHousingDebt)
    && (c.minBusinessDebt === undefined || businessDebt >= c.minBusinessDebt)
    && (c.minConsumerDebt === undefined || currentConsumerDebt >= c.minConsumerDebt)
    && (c.minAnnualExpenses === undefined || annualExpenses >= c.minAnnualExpenses)
    && (c.maxAnnualExpenses === undefined || annualExpenses <= c.maxAnnualExpenses)
    && (c.minDependents === undefined || dependents >= c.minDependents)
    && (c.maxDependents === undefined || dependents <= c.maxDependents)
    && (c.maritalStatus === undefined || maritalStatus === c.maritalStatus)
    && (c.careerIncludes === undefined || career.toLowerCase().includes(String(c.careerIncludes).toLowerCase()));
}

function getEventWeight(event) {
  let weight = event.weight || 1;
  const totalDebt = getTotalDebt();
  const expenseRatio = salary > 0 ? annualExpenses / salary : (annualExpenses > 0 ? 2 : 0);

  if (event.category === "health") {
    if (health < 50) weight *= 2.2;
    else if (health < 75) weight *= 1.45;
  }

  if (event.category === "financial") {
    if (totalDebt > 150000) weight *= 1.45;
    if (expenseRatio > 0.6) weight *= 1.35;
  }

  if (event.category === "career") {
    if (salary >= 80000) weight *= 1.35;
    if (happiness < 65) weight *= 1.15;
  }

  if (event.category === "family" && dependents > 0) {
    weight *= 1 + Math.min(0.75, dependents * 0.25);
  }

  if (event.category === "housing" && (housingDebt > 0 || consumerDebt > 0)) {
    weight *= 1.35;
  }

  if (event.category === "business" && (lifePath === "Business" || businessDebt > 0)) {
    weight *= 1.8;
  }

  if (event.category === "investment" && investments > 0) {
    weight *= 1.3 + Math.min(0.9, investments / 200000);
  }

  return Math.max(0.1, weight);
}

function getLifeEventChance() {
  const totalDebt = getTotalDebt();
  const expenseRatio = salary > 0 ? annualExpenses / salary : (annualExpenses > 0 ? 2 : 0);
  let chance = 0.12;

  if (questionsSinceLastEvent >= 3) chance += 0.18;
  if (totalDebt > 50000) chance += 0.06;
  if (totalDebt > 200000) chance += 0.06;
  if (health < 60) chance += 0.08;
  if (investments > 0) chance += 0.04;
  if (lifePath === "Business" || businessDebt > 0) chance += 0.05;
  if (dependents > 0) chance += 0.04;
  if (expenseRatio > 0.6) chance += 0.05;

  return Math.max(0.05, Math.min(0.55, chance));
}

function pickWeightedEvent(candidates) {
  const totalWeight = candidates.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const item of candidates) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }

  return candidates[candidates.length - 1] || null;
}

function isNegativeEvent(event) {
  const effects = getEventEffects(event);
  return (effects.savings || 0) < 0
    || (effects.investments || 0) < 0
    || getDebtEffect(effects) > 0
    || (effects.annualExpenses || 0) > 0
    || (effects.health || 0) < 0
    || (effects.happiness || 0) < 0;
}

function payDownDebtFromSavings() {
  const debtBuckets = ["consumerDebt", "legacyDebt", "studentDebt", "businessDebt", "housingDebt"];
  debtBuckets.forEach(bucket => {
    if (savings <= 0) return;
    const currentAmount = getDebtBucketAmount(bucket);
    const payment = Math.min(savings, currentAmount);
    if (payment <= 0) return;
    savings -= payment;
    adjustDebtBucket(bucket, -payment);
  });
  normalizeFinanceState();
}

function updateStatus() {
  document.getElementById("salary").textContent    = salary.toLocaleString();
  document.getElementById("savings").textContent   = savings.toLocaleString();
  document.getElementById("debt").textContent      = getTotalDebt().toLocaleString();
  const investmentsEl = document.getElementById("investments");
  if (investmentsEl) investmentsEl.textContent = investments.toLocaleString();
  document.getElementById("health").textContent    = health;
  document.getElementById("happiness").textContent = happiness;
  document.getElementById("career").textContent    = career;
  document.getElementById("marital-status").textContent = maritalStatus;
  document.getElementById("dependents").textContent = dependents;
  document.getElementById("age").textContent       = age;
  const lifePathEl = document.getElementById("life-path");
  if (lifePathEl) lifePathEl.textContent = lifePath;

  // Update progress bars
  const hBar  = document.getElementById("health-bar");
  const haBar = document.getElementById("happiness-bar");
  if (hBar)  hBar.style.width  = Math.max(0, Math.min(100, health))    + "%";
  if (haBar) haBar.style.width = Math.max(0, Math.min(100, happiness)) + "%";
}

function adjustFinalFinances() {
  payDownDebtFromSavings();
  updateStatus();
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
    investments: { icon: "📈", label: "Investments", money: true },
    debt:      { icon: "🏦", label: "Debt",      money: true, invertColor: true },
    annualExpenses: { icon: "🧾", label: "Annual Expenses", money: true, invertColor: true },
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
  if (choice.investments) parts.push({ label: "Investments", val: choice.investments, money: true, inv: false });
  if (choice.debt)      parts.push({ label: "Debt",      val: choice.debt,      money: true,  inv: true  });
  if (choice.studentDebt) parts.push({ label: "Student Debt", val: choice.studentDebt, money: true, inv: true });
  if (choice.housingDebt) parts.push({ label: "Housing Debt", val: choice.housingDebt, money: true, inv: true });
  if (choice.businessDebt) parts.push({ label: "Business Debt", val: choice.businessDebt, money: true, inv: true });
  if (choice.consumerDebt) parts.push({ label: "Consumer Debt", val: choice.consumerDebt, money: true, inv: true });
  if (choice.annualExpenses) parts.push({ label: "Annual Expenses", val: choice.annualExpenses, money: true, inv: true });
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

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

function getChoicePreview(choice) {
  if (Array.isArray(choice.preview)) return { tags: choice.preview };
  if (choice.preview?.tags) return choice.preview;

  const tags = [];
  const debtChange = getDebtEffect(choice);
  const savingsChange = choice.savings || 0;
  const investmentsChange = choice.investments || 0;
  const expenseChange = choice.annualExpenses || 0;
  const salaryChange = choice.salary || 0;
  const healthChange = choice.health || 0;
  const happinessChange = choice.happiness || 0;

  if (choice.path) tags.push(`${choice.path} Path`);

  if (debtChange >= 150000) tags.push("Very High Debt");
  else if (debtChange >= 30000) tags.push("High Debt");
  else if (debtChange > 0) tags.push("Debt Risk");
  else if (debtChange < 0) tags.push("Debt Reduction");

  if (savingsChange <= -75000) tags.push("Major Cost");
  else if (savingsChange < 0) tags.push("Savings Cost");
  else if (savingsChange >= 75000) tags.push("Major Savings Boost");
  else if (savingsChange > 0) tags.push("Savings Boost");

  if (investmentsChange >= 50000) tags.push("Major Investment Boost");
  else if (investmentsChange > 0) tags.push("Investment Boost");
  else if (investmentsChange < 0) tags.push("Investment Loss");

  if (expenseChange >= 25000) tags.push("High Expenses");
  else if (expenseChange > 0) tags.push("Lifestyle Cost");
  else if (expenseChange < 0) tags.push("Lower Expenses");

  if (salaryChange >= 75000) tags.push("Big Income Boost");
  else if (salaryChange > 0) tags.push("Income Boost");
  else if (salaryChange < 0) tags.push("Lower Pay");

  if (healthChange <= -10) tags.push("Health Risk");
  else if (healthChange < 0) tags.push("Minor Health Risk");
  else if (healthChange > 0) tags.push("Health Boost");

  if (happinessChange >= 15) tags.push("Happiness Boost");
  else if (happinessChange > 0) tags.push("Mood Lift");
  else if (happinessChange <= -10) tags.push("Stress Risk");
  else if (happinessChange < 0) tags.push("Small Happiness Dip");

  if (choice.ageAdd >= 4) tags.push("Slow Start");
  if (choice.requires) tags.push("Requires Cushion");
  if (tags.length === 0) tags.push("Stable Path");

  return { tags: tags.slice(0, 3) };
}

function renderChoiceContent(choice, locked = false) {
  const preview = getChoicePreview(choice);
  const title = `${locked ? '<span class="lock-icon">🔒</span>' : ""}${escapeHtml(choice.text)}`;
  const tags = preview.tags
    .map(tag => `<span class="choice-tag">${escapeHtml(tag)}</span>`)
    .join("");
  const summary = preview.summary
    ? `<span class="choice-preview-summary">${escapeHtml(preview.summary)}</span>`
    : "";

  return `
    <span class="choice-title">${title}</span>
    <span class="choice-preview-tags">${tags}</span>
    ${summary}
  `;
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
  const q = getCurrentQuestion();
  if (!q) { console.error("Bad index:", currentQuestionIndex); return; }

  gsap.to("#question", {
    opacity: 0, y: -20, duration: 0.4,
    onComplete: () => {
      document.getElementById("question").textContent = q.text;
      document.getElementById("choices").innerHTML   = "";
      selectedChoice = null;

      const nextBtn = document.getElementById("nextBtn");
      if (nextBtn) nextBtn.disabled = true;
      const summary = document.getElementById("choice-summary");
      if (summary) {
        summary.textContent = "Choose an option to continue.";
        summary.classList.remove("active");
      }

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
          btn.innerHTML = renderChoiceContent(choice, true);
          btn.addEventListener("mouseenter", () => showTooltip(btn, `<span class="tooltip-neg">Requires: ${reqText}</span>`));
          btn.addEventListener("mouseleave", hideTooltip);
        } else {
          btn.innerHTML = renderChoiceContent(choice);
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

  const progressSuffix = lifePath !== "Undecided" ? ` · ${lifePath} Path` : "";
  document.getElementById("progress").textContent = `Step ${decisionsMade + 1}${progressSuffix}`;
}

function meetsRequirements(requires) {
  const stats = {
    savings, investments, salary, health, happiness, age,
    debt: getTotalDebt(),
    totalDebt: getTotalDebt(),
    annualExpenses
  };
  return Object.entries(requires).every(([k, v]) => (stats[k] ?? 0) >= v);
}

function selectChoice(index) {
  selectedChoice = index;
  document.querySelectorAll(".choice").forEach((btn, i) => {
    btn.classList.toggle("selected", i === index);
  });

  const choice = getCurrentQuestion().choices[index];
  const preview = getChoicePreview(choice);
  const summary = document.getElementById("choice-summary");
  if (summary) {
    summary.textContent = preview.summary || `Selected: ${choice.text} (${preview.tags.join(" · ")})`;
    summary.classList.add("active");
  }

  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) nextBtn.disabled = false;
}

// ─── Core: Next Click ───────────────────────────────────────────────────────
function handleNextClick() {
  if (selectedChoice === null) return;

  const q      = getCurrentQuestion();
  const choice = q.choices[selectedChoice];

  // Snapshot before changes for diff display
  const before = {
    salary,
    savings,
    investments,
    debt: getTotalDebt(),
    annualExpenses,
    health,
    happiness
  };

  // Apply stats
  if (choice.path) lifePath = choice.path;
  applyFinancialEffects(choice);
  health    += choice.health    || 0;
  happiness += choice.happiness || 0;

  health    = Math.max(0, Math.min(100, health));
  happiness = Math.max(0, Math.min(100, happiness));

  if (choice.action) choice.action();

  // Age advancement — choice-level overrides question-level
  const yearsAdded = choice.ageAdd !== undefined ? choice.ageAdd : (q.ageYears || 3);
  age += yearsAdded;
  decisionsMade++;

  updateStatus();

  // Compute and show diffs
  const diffs = {
    salary:    salary    - before.salary,
    savings:   savings   - before.savings,
    investments: investments - before.investments,
    debt:      getTotalDebt() - before.debt,
    annualExpenses: annualExpenses - before.annualExpenses,
    health:    health    - before.health,
    happiness: happiness - before.happiness,
    age:       yearsAdded
  };
  showStatDiffs(diffs);

  // Life event logic — improved frequency & no-repeat
  questionsSinceLastEvent++;
  const shouldTrigger =
    questionsSinceLastEvent >= 2 &&
    (decisionsMade % 3 === 0 || Math.random() < getLifeEventChance());

  if (shouldTrigger) triggerRandomLifeEvent();

  // Navigate
  const nextIndex = resolveQuestionIndex(getNextTarget(choice));
  if (nextIndex !== null) {
    currentQuestionIndex = nextIndex;
    saveGame();
    renderQuestion();
  } else {
    endGame();
  }
}

// ─── Life Events ────────────────────────────────────────────────────────────
function triggerRandomLifeEvent() {
  const candidates = lifeEvents
    .map((event, index) => ({
      event,
      index,
      key: getEventKey(event, index),
      weight: getEventWeight(event)
    }))
    .filter(item => eventApplies(item.event));

  const freshCandidates = candidates.filter(item => !recentEventIndices.includes(item.key));
  const pool = freshCandidates.length > 0 ? freshCandidates : candidates;
  const selected = pickWeightedEvent(pool);
  if (!selected) return;

  const event = selected.event;

  // Update recency window (keep last 3)
  recentEventIndices.push(selected.key);
  if (recentEventIndices.length > 3) recentEventIndices.shift();

  lifeEventHistory.push(event);
  questionsSinceLastEvent = 0;

  const eventBox  = document.getElementById("life-event-box");
  const eventText = document.getElementById("life-event-text");
  if (gsap.isTweening(eventBox)) return;

  eventBox.style.display = "block";
  eventText.innerHTML = `<strong>${event.text}</strong><br><span>${getEventCategoryLabel(event)} event</span>`;

  gsap.timeline()
    .fromTo(eventBox, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" })
    .to(eventBox, { opacity: 1, duration: 2.5 })
    .to(eventBox, { opacity: 0, y: -40, duration: 0.6, ease: "power2.in",
        onComplete: () => { eventBox.style.display = "none"; } });

  applyLifeEventEffects(event);
}

function applyLifeEventEffects(event) {
  const effects = getEventEffects(event);
  applyFinancialEffects(effects);
  health    += effects.health    || 0;
  happiness += effects.happiness || 0;
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
  const netWorth = getNetWorth();
  const totalDebt = getTotalDebt();
  if (netWorth > 1000000)              return "🤑 The Millionaire";
  if (totalDebt === 0 && getTotalAssets() > 100000)  return "💰 The Debt-Free King/Queen 👑";
  if (getTotalAssets() > 500000)       return "💎 The Wealth Builder";
  if (happiness === 100 && health === 100) return "🌟 The Perfect Life Achiever";
  if (happiness >= 80)                 return "😊 The Joyful Guru";
  if (health >= 90)                    return "💪 The Fitness Master";
  if (salary > 150000)                 return "🏢 The Corporate Giant";
  if (career.toLowerCase().includes("entrepreneur") || career.toLowerCase().includes("founder"))
                                       return "🚀 The Business Tycoon";
  if (dependents > 2)                  return "👨‍👩‍👧‍👦 The Family Builder";
  if (totalDebt > 500000)              return "😅 The Risk Taker";
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

function clampScore(score) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getGradeMeta(score) {
  const safeScore = clampScore(score);
  if (safeScore >= 97) return { grade: "A+", color: "#4caf50" };
  if (safeScore >= 90) return { grade: "A",  color: "#8bc34a" };
  if (safeScore >= 80) return { grade: "B",  color: "#cddc39" };
  if (safeScore >= 70) return { grade: "C",  color: "#ffc107" };
  if (safeScore >= 60) return { grade: "D",  color: "#ff9800" };
  return                    { grade: "F",  color: "#f44336" };
}

function scoreToGrade(score) {
  return getGradeMeta(score).grade;
}

function getFinancialScore() {
  const netWorth = getNetWorth();
  const totalDebt = getTotalDebt();
  const totalAssets = getTotalAssets();
  const debtBaseline = Math.max(25000, salary || 0);
  const netWorthScore = clampScore(50 + (netWorth / 5000));
  const assetScore = clampScore(totalAssets / 2500);
  const debtScore = totalDebt === 0
    ? 100
    : clampScore(100 - ((totalDebt / debtBaseline) * 25));
  const expenseRatio = salary > 0 ? annualExpenses / salary : (annualExpenses > 0 ? 2 : 0);
  const expensePenalty = expenseRatio > 0.7 ? 15 : expenseRatio > 0.4 ? 7 : 0;

  return clampScore((netWorthScore * 0.55) + (debtScore * 0.25) + (assetScore * 0.2) - expensePenalty);
}

function getCareerScore() {
  const salaryScore = clampScore(((salary - 25000) / 125000) * 100);
  let score = salaryScore * 0.85;

  if (career && career !== "Unemployed") score += 12;
  if (lifePath !== "Undecided") score += 3;
  if (lifePath === "College" && salary >= 70000) score += 5;
  if (lifePath === "Trade" && salary >= 55000) score += 5;
  if (lifePath === "Early Career" && salary >= 45000) score += 5;
  if (lifePath === "Business" && salary >= 65000) score += 5;

  return clampScore(score);
}

function getBalanceScore() {
  const financialScore = getFinancialScore();
  const lowestCoreScore = Math.min(health, happiness, financialScore);
  const coreAverage = (health + happiness + financialScore) / 3;
  const totalDebt = getTotalDebt();
  const expenseRatio = salary > 0 ? annualExpenses / salary : (annualExpenses > 0 ? 2 : 0);
  const heavyDebtPenalty = totalDebt > Math.max(50000, salary * 2) ? 10 : 0;
  const expensePenalty = expenseRatio > 0.7 ? 12 : expenseRatio > 0.4 ? 6 : 0;
  const commitmentPressure = dependents > 0 && savings < dependents * 25000 ? 8 : 0;

  return clampScore((coreAverage * 0.7) + (lowestCoreScore * 0.3) - heavyDebtPenalty - expensePenalty - commitmentPressure);
}

const scoreCategories = [
  { id: "financial", label: "Financial",    icon: "💰", weight: 0.30, calculate: getFinancialScore },
  { id: "career",    label: "Career",       icon: "🏢", weight: 0.20, calculate: getCareerScore },
  { id: "health",    label: "Health",       icon: "❤️", weight: 0.20, calculate: () => health },
  { id: "happiness", label: "Happiness",    icon: "😊", weight: 0.20, calculate: () => happiness },
  { id: "balance",   label: "Life Balance", icon: "⚖️", weight: 0.10, calculate: getBalanceScore }
];

function getScoreBreakdown() {
  const categories = scoreCategories.map(category => {
    const score = clampScore(category.calculate());
    const gradeMeta = getGradeMeta(score);
    return { ...category, score, ...gradeMeta };
  });
  const totalWeight = categories.reduce((sum, category) => sum + category.weight, 0);
  const overallScore = clampScore(
    categories.reduce((sum, category) => sum + (category.score * category.weight), 0) / totalWeight
  );
  const overallGrade = getGradeMeta(overallScore);

  return {
    categories,
    overall: { score: overallScore, ...overallGrade }
  };
}

const ACHIEVEMENT_COLLECTION_KEY = "lifeGameAchievements";

const achievements = [
  {
    id: "debt_free",
    title: "Debt Free",
    icon: "💰",
    description: "Finished with no debt.",
    condition: () => getTotalDebt() === 0
  },
  {
    id: "millionaire",
    title: "Millionaire",
    icon: "🤑",
    description: "Reached at least $1,000,000 net worth.",
    condition: () => getNetWorth() >= 1000000
  },
  {
    id: "investor",
    title: "Investor",
    icon: "📈",
    description: "Built investments worth at least $100,000.",
    condition: () => investments >= 100000
  },
  {
    id: "career_climber",
    title: "Career Climber",
    icon: "🏢",
    description: "Earned an A-level career score.",
    condition: ({ categoryScores }) => (categoryScores.career?.score || 0) >= 90
  },
  {
    id: "joyful_life",
    title: "Joyful Life",
    icon: "😊",
    description: "Finished with happiness at 90 or higher.",
    condition: () => happiness >= 90
  },
  {
    id: "healthy_life",
    title: "Healthy Life",
    icon: "❤️",
    description: "Finished with health at 90 or higher.",
    condition: () => health >= 90
  },
  {
    id: "balanced_life",
    title: "Balanced Life",
    icon: "⚖️",
    description: "Kept every score category at 75 or higher.",
    condition: ({ scores }) => scores.categories.every(category => category.score >= 75)
  },
  {
    id: "risk_taker",
    title: "Risk Taker",
    icon: "🚀",
    description: "Built a business path or carried major business debt.",
    condition: () => lifePath === "Business" || businessDebt >= 100000
  },
  {
    id: "family_first",
    title: "Family First",
    icon: "👶",
    description: "Raised a larger family while staying happy.",
    condition: () => dependents >= 2 && happiness >= 75
  },
  {
    id: "comeback_story",
    title: "Comeback Story",
    icon: "🌅",
    description: "Finished positive after carrying heavy debt.",
    condition: () => getNetWorth() > 0 && maxDebtCarried >= 150000
  },
  {
    id: "student_loan_survivor",
    title: "Student Loan Survivor",
    icon: "🎓",
    description: "Brought major student debt below $10,000.",
    condition: () => maxStudentDebtCarried >= 30000 && studentDebt < 10000
  },
  {
    id: "homeowner",
    title: "Homeowner",
    icon: "🏡",
    description: "Bought property during your life.",
    condition: () => housingDebt > 0
  },
  {
    id: "entrepreneur",
    title: "Entrepreneur",
    icon: "🛠",
    description: "Built a business or founder career.",
    condition: () => lifePath === "Business"
      || /founder|entrepreneur|owner/i.test(career)
  },
  {
    id: "market_player",
    title: "Market Player",
    icon: "📊",
    description: "Invested meaningfully or experienced an investment event.",
    condition: () => investments >= 100000 || hasEventCategory("investment")
  },
  {
    id: "resilient",
    title: "Resilient",
    icon: "🧭",
    description: "Had several setbacks and still finished at C or better overall.",
    condition: ({ scores }) => countNegativeLifeEvents() >= 3 && scores.overall.score >= 70
  }
];

function getAchievementCollection() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_COLLECTION_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveUnlockedAchievements(unlockedAchievements) {
  const existingIds = getAchievementCollection();
  const mergedIds = Array.from(new Set([
    ...existingIds,
    ...unlockedAchievements.map(achievement => achievement.id)
  ]));

  try {
    localStorage.setItem(ACHIEVEMENT_COLLECTION_KEY, JSON.stringify(mergedIds));
  } catch (e) { /* storage unavailable */ }

  return mergedIds;
}

function getAchievementById(id) {
  return achievements.find(achievement => achievement.id === id);
}

function hasEventCategory(category) {
  return lifeEventHistory.some(event => event?.category === category);
}

function countNegativeLifeEvents() {
  return lifeEventHistory.filter(isNegativeEvent).length;
}

function getUnlockedAchievements(scores = getScoreBreakdown()) {
  const categoryScores = Object.fromEntries(
    scores.categories.map(category => [category.id, category])
  );

  return achievements.filter(achievement => {
    try {
      return achievement.condition({ scores, categoryScores });
    } catch (e) {
      return false;
    }
  });
}

function getPathOutcome() {
  const totalDebt = getTotalDebt();
  if (lifePath === "College") {
    if (studentDebt > 150000 && savings < 50000) return "Debt-Burdened Professional";
    if (salary >= 100000) return "Credentialed Climber";
    return "Balanced Graduate";
  }

  if (lifePath === "Trade") {
    if (salary >= 75000) return "Skilled Specialist";
    if (health < 70) return "Hardworking Specialist";
    return "Steady Earner";
  }

  if (lifePath === "Early Career") {
    if (salary >= 85000) return "Experience-First Climber";
    if (totalDebt === 0) return "Practical Earner";
    return "Self-Made Starter";
  }

  if (lifePath === "Business") {
    if (businessDebt > 200000 || totalDebt > 300000) return "Overextended Entrepreneur";
    if (salary >= 100000) return "Scaling Founder";
    return "Scrappy Builder";
  }

  return "Open Road";
}

function showSummary() {
  const gameContainer = document.querySelector(".game-container");
  const title    = getTitle();
  const netWorth = getNetWorth();
  const totalDebt = getTotalDebt();
  const nwGrade  = getNetWorthGrade(netWorth);
  const pathOutcome = getPathOutcome();
  const scoreBreakdown = getScoreBreakdown();
  const overallGrade = scoreBreakdown.overall;
  const unlockedAchievements = getUnlockedAchievements(scoreBreakdown);
  const achievementCollectionIds = saveUnlockedAchievements(unlockedAchievements);
  const knownAchievementCount = achievementCollectionIds
    .filter(id => Boolean(getAchievementById(id)))
    .length;
  const achievementCards = unlockedAchievements.length > 0
    ? unlockedAchievements.map(achievement => `
      <div class="achievement-card">
        <span class="achievement-icon">${achievement.icon}</span>
        <span>
          <strong>${achievement.title}</strong>
          <small>${achievement.description}</small>
        </span>
      </div>
    `).join("")
    : `<p class="achievement-empty">No badges this run. Try a different path.</p>`;
  const debtRows = getDebtBreakdown().map(item => `
    <p><span>${item.label}</span><strong>${formatMoney(item.amount)}</strong></p>
  `).join("");
  const scoreRows = scoreBreakdown.categories.map(category => `
    <div class="score-row">
      <span class="score-label">${category.icon} ${category.label}</span>
      <span class="score-bar-track">
        <span class="score-bar-fill" style="width:${category.score}%; background:${category.color}"></span>
      </span>
      <span class="score-grade" style="color:${category.color}; border-color:${category.color}">${category.grade}</span>
      <span class="score-value">${category.score}/100</span>
    </div>
  `).join("");

  const lifeEventsList = lifeEventHistory.length > 0
    ? `<ul>${lifeEventHistory.map(ev => {
        if (!ev?.text) return "";
        const bad = isNegativeEvent(ev);
        const category = getEventCategoryLabel(ev);
        return `<li class="${bad ? "negative" : "positive"}">${bad ? "❌" : "✅"} <span class="event-category">${category}</span> ${ev.text}</li>`;
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
        <span style="font-size:14px; opacity:0.7">Financial Result</span>
        <span style="font-size:14px; opacity:0.7">Final Age: ${age}</span>
      </div>

      <div class="score-breakdown">
        <div class="score-breakdown-header">
          <h3>Score Breakdown</h3>
          <div class="overall-score">
            <span>Overall</span>
            <strong style="color:${overallGrade.color}; border-color:${overallGrade.color}">${overallGrade.grade}</strong>
            <span>${overallGrade.score}/100</span>
          </div>
        </div>
        <div class="score-rows">
          ${scoreRows}
        </div>
      </div>

      <div class="financial-details">
        <div>
          <h3>Assets</h3>
          <p><span>Savings</span><strong>${formatMoney(savings)}</strong></p>
          <p><span>Investments</span><strong>${formatMoney(investments)}</strong></p>
        </div>
        <div>
          <h3>Debt</h3>
          ${debtRows}
        </div>
        <div>
          <h3>Lifestyle</h3>
          <p><span>Annual Expenses</span><strong>${formatMoney(annualExpenses)}</strong></p>
          <p><span>Total Debt</span><strong>${formatMoney(totalDebt)}</strong></p>
        </div>
      </div>

      <div class="summary-grid">
        <p class="summary-career">🧭 <strong>Life Path:</strong>&nbsp;${lifePath} — ${pathOutcome}</p>
        <p class="summary-career">🏢 <strong>Career:</strong>&nbsp;${career}</p>
        <p>💰 <strong>Final Salary:</strong>&nbsp;$${salary.toLocaleString()}</p>
        <p>💵 <strong>Total Savings:</strong>&nbsp;$${savings.toLocaleString()}</p>
        <p>📈 <strong>Investments:</strong>&nbsp;$${investments.toLocaleString()}</p>
        <p>🏦 <strong>Total Debt:</strong>&nbsp;$${totalDebt.toLocaleString()}</p>
        <p>🧾 <strong>Annual Expenses:</strong>&nbsp;$${annualExpenses.toLocaleString()}</p>
        <p>😊 <strong>Happiness:</strong>&nbsp;${happiness}/100</p>
        <p>❤️ <strong>Health:</strong>&nbsp;${health}/100</p>
        <p>💍 <strong>Marital Status:</strong>&nbsp;${maritalStatus}</p>
        <p>👶 <strong>Dependents:</strong>&nbsp;${dependents}</p>
      </div>

      <div class="achievements-section">
        <div class="achievements-header">
          <h3>Achievements Unlocked</h3>
          <span>${knownAchievementCount} of ${achievements.length}</span>
        </div>
        <div class="achievement-grid">
          ${achievementCards}
        </div>
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
    const currentQuestion = getCurrentQuestion();
    const state = {
      salary, savings, debt, investments,
      studentDebt, housingDebt, businessDebt, consumerDebt, annualExpenses,
      health, happiness,
      dependents, career, maritalStatus, lifePath, age,
      lifeEventHistory, currentQuestionIndex,
      currentQuestionId: currentQuestion?.id,
      decisionsMade, maxDebtCarried, maxStudentDebtCarried,
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
    investments = s.investments ?? 0;
    studentDebt = s.studentDebt ?? 0;
    housingDebt = s.housingDebt ?? 0;
    businessDebt = s.businessDebt ?? 0;
    consumerDebt = s.consumerDebt ?? 0;
    annualExpenses = s.annualExpenses ?? 0;
    health     = s.health     ?? 100;
    happiness  = s.happiness  ?? 100;
    dependents = s.dependents ?? 0;
    career     = s.career     ?? "Unemployed";
    maritalStatus = s.maritalStatus ?? "Single";
    lifePath   = s.lifePath   ?? "Undecided";
    age        = s.age        ?? 18;
    lifeEventHistory       = s.lifeEventHistory       ?? [];
    const savedQuestionIndex = typeof s.currentQuestionId === "string"
      ? getQuestionIndexById(s.currentQuestionId)
      : -1;
    currentQuestionIndex = savedQuestionIndex !== -1
      ? savedQuestionIndex
      : (s.currentQuestionIndex ?? 0);
    if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
      currentQuestionIndex = 0;
    }
    decisionsMade = s.decisionsMade ?? Math.max(0, currentQuestionIndex);
    maxDebtCarried = Math.max(s.maxDebtCarried ?? 0, getTotalDebt());
    maxStudentDebtCarried = Math.max(s.maxStudentDebtCarried ?? 0, studentDebt);
    questionsSinceLastEvent = s.questionsSinceLastEvent ?? 0;
    recentEventIndices      = s.recentEventIndices      ?? [];
    normalizeFinanceState();
    updateFinancialMilestones();
    return true;
  } catch (e) { return false; }
}

// ─── Reset ──────────────────────────────────────────────────────────────────
function resetGame() {
  localStorage.removeItem("lifeGameSave");
  salary = 0; savings = 0; debt = 0;
  investments = 0;
  studentDebt = 0; housingDebt = 0; businessDebt = 0; consumerDebt = 0;
  annualExpenses = 0;
  health = 100; happiness = 100;
  dependents = 0; age = 18;
  career = "Unemployed"; maritalStatus = "Single";
  lifePath = "Undecided";
  lifeEventHistory = [];
  currentQuestionIndex = 0;
  selectedChoice = null;
  decisionsMade = 0;
  maxDebtCarried = 0;
  maxStudentDebtCarried = 0;
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
    <p id="choice-summary" class="choice-summary">Choose an option to continue.</p>
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
    loadGame();
    updateStatus();
    renderQuestion();
  }
  if (e.target.id === "newGameBtn") {
    document.getElementById("save-banner").classList.add("hidden");
    resetGame();
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
    }
  } catch (e) { /* storage unavailable */ }
});

// ─── Init ───────────────────────────────────────────────────────────────────
updateStatus();
renderQuestion();
