const { assert, createGameContext, test } = require("./test-utils");

test("total debt and net worth include every finance bucket", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    savings = 100000;
    investments = 50000;
    debt = 1000;
    studentDebt = 20000;
    housingDebt = 80000;
    businessDebt = 7000;
    consumerDebt = 3000;

    return {
      totalDebt: getTotalDebt(),
      netWorth: getNetWorth()
    };
  })()`);

  assert.deepStrictEqual(result, {
    totalDebt: 111000,
    netWorth: 39000
  });
});

test("negative savings effects create fallback debt after savings are exhausted", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    savings = 5000;
    updateFinances(-12000, "businessDebt");

    return {
      savings,
      businessDebt,
      totalDebt: getTotalDebt()
    };
  })()`);

  assert.deepStrictEqual(result, {
    savings: 0,
    businessDebt: 7000,
    totalDebt: 7000
  });
});

test("debt payoff spends savings across debt buckets in payoff order", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    savings = 10000;
    consumerDebt = 3000;
    studentDebt = 10000;
    payDownDebtFromSavings();

    return {
      savings,
      consumerDebt,
      studentDebt,
      totalDebt: getTotalDebt()
    };
  })()`);

  assert.deepStrictEqual(result, {
    savings: 0,
    consumerDebt: 0,
    studentDebt: 3000,
    totalDebt: 3000
  });
});

test("save and load preserve expanded finance state", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    salary = 90000;
    savings = 12345;
    investments = 54321;
    studentDebt = 111;
    housingDebt = 222;
    businessDebt = 333;
    consumerDebt = 444;
    annualExpenses = 555;
    saveGame();

    salary = 0;
    savings = 0;
    investments = 0;
    studentDebt = 0;
    housingDebt = 0;
    businessDebt = 0;
    consumerDebt = 0;
    annualExpenses = 0;
    loadGame();

    return {
      salary,
      savings,
      investments,
      studentDebt,
      housingDebt,
      businessDebt,
      consumerDebt,
      annualExpenses
    };
  })()`);

  assert.deepStrictEqual(result, {
    salary: 90000,
    savings: 12345,
    investments: 54321,
    studentDebt: 111,
    housingDebt: 222,
    businessDebt: 333,
    consumerDebt: 444,
    annualExpenses: 555
  });
});
