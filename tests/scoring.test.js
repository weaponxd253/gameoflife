const { assert, createGameContext, test } = require("./test-utils");

test("score categories and overall score stay in range", () => {
  const { run } = createGameContext();
  const scores = run(`(() => {
    salary = 110000;
    savings = 50000;
    investments = 25000;
    studentDebt = 30000;
    health = 88;
    happiness = 92;
    career = "Engineer";
    lifePath = "College";

    return getScoreBreakdown();
  })()`);

  scores.categories.forEach(category => {
    assert.ok(category.score >= 0 && category.score <= 100, category.id);
  });
  assert.ok(scores.overall.score >= 0 && scores.overall.score <= 100);
});

test("large debt can lower financial score while career remains strong", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    salary = 160000;
    studentDebt = 450000;
    career = "Doctor";
    lifePath = "College";

    return {
      financial: getFinancialScore(),
      career: getCareerScore()
    };
  })()`);

  assert.ok(result.career > 80);
  assert.ok(result.financial < result.career);
});

test("health and happiness scores mirror current state", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    health = 72;
    happiness = 64;
    const scores = getScoreBreakdown();

    return Object.fromEntries(
      scores.categories.map(category => [category.id, category.score])
    );
  })()`);

  assert.strictEqual(result.health, 72);
  assert.strictEqual(result.happiness, 64);
});

test("life balance falls under heavy expense pressure", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    salary = 100000;
    savings = 100000;
    health = 90;
    happiness = 90;
    annualExpenses = 10000;
    const lowExpense = getBalanceScore();

    annualExpenses = 90000;
    const highExpense = getBalanceScore();

    return { lowExpense, highExpense };
  })()`);

  assert.ok(result.lowExpense > result.highExpense);
});
