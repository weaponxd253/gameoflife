const { assert, createGameContext, test } = require("./test-utils");

test("achievement ids are unique", () => {
  const { run } = createGameContext();
  const duplicateIds = run(`(() => {
    const ids = achievements.map(achievement => achievement.id);
    return ids.filter((id, index) => ids.indexOf(id) !== index);
  })()`);

  assert.deepStrictEqual(duplicateIds, []);
});

test("deterministic final state unlocks expected achievements", () => {
  const { run } = createGameContext();
  const ids = run(`(() => {
    savings = 250000;
    investments = 125000;
    salary = 120000;
    health = 95;
    happiness = 95;
    lifePath = "Business";
    career = "Tech Startup Founder";
    maxDebtCarried = 175000;
    lifeEventHistory = [lifeEvents.find(event => event.id === "market_boom")];

    return getUnlockedAchievements().map(achievement => achievement.id);
  })()`);

  [
    "debt_free",
    "investor",
    "joyful_life",
    "healthy_life",
    "risk_taker",
    "entrepreneur",
    "market_player",
    "comeback_story"
  ].forEach(id => assert.ok(ids.includes(id), id));
});

test("student loan survivor requires prior student debt", () => {
  const { run } = createGameContext();
  const unlocked = run(`(() => {
    maxStudentDebtCarried = 50000;
    studentDebt = 0;

    return getUnlockedAchievements()
      .map(achievement => achievement.id)
      .includes("student_loan_survivor");
  })()`);

  assert.strictEqual(unlocked, true);
});

test("achievement collection merges ids without duplicates", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    const first = saveUnlockedAchievements([
      { id: "investor" },
      { id: "debt_free" }
    ]);
    const second = saveUnlockedAchievements([
      { id: "investor" },
      { id: "entrepreneur" }
    ]);

    return {
      first: first.sort(),
      second: second.sort()
    };
  })()`);

  assert.deepStrictEqual(result.first, ["debt_free", "investor"]);
  assert.deepStrictEqual(result.second, ["debt_free", "entrepreneur", "investor"]);
});

test("corrupt achievement collection data returns an empty collection", () => {
  const { run } = createGameContext();
  const collection = run(`(() => {
    localStorage.setItem(ACHIEVEMENT_COLLECTION_KEY, "not-json");
    return getAchievementCollection();
  })()`);

  assert.deepStrictEqual(collection, []);
});
