const { assert, createGameContext, test } = require("./test-utils");

test("question ids are unique and all route targets resolve", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    const ids = questions.map(q => q.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    const idSet = new Set(ids);
    const missingTargets = [];

    questions.forEach(question => {
      question.choices.forEach(choice => {
        const targets = [choice.next, ...Object.values(choice.nextByPath || {})]
          .filter(target => target !== null && target !== undefined);

        targets.forEach(target => {
          if (typeof target === "string" && !idSet.has(target)) {
            missingTargets.push(question.id + " -> " + target);
          }
        });
      });
    });

    return { duplicateIds, missingTargets };
  })()`);

  assert.deepStrictEqual(result.duplicateIds, []);
  assert.deepStrictEqual(result.missingTargets, []);
});

test("starting choices set the intended life path and next question", () => {
  const cases = [
    [0, "College", "college_career"],
    [1, "Early Career", "early_career_start"],
    [2, "Trade", "trade_career"],
    [3, "Business", "business_focus"]
  ];

  cases.forEach(([choiceIndex, expectedPath, expectedQuestionId]) => {
    const { run } = createGameContext();
    const result = run(`(() => {
      selectedChoice = ${choiceIndex};
      handleNextClick();
      return { lifePath, questionId: getCurrentQuestion().id };
    })()`);

    assert.deepStrictEqual(result, {
      lifePath: expectedPath,
      questionId: expectedQuestionId
    });
  });
});

test("work-life balance routes through path-specific growth questions", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    Math.random = () => 0.99;

    selectedChoice = 0;
    handleNextClick();

    selectedChoice = 1;
    handleNextClick();

    selectedChoice = 1;
    handleNextClick();

    return getCurrentQuestion().id;
  })()`);

  assert.strictEqual(result, "college_growth");
});
