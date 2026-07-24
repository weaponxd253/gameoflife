const { assert, createGameContext, test } = require("./test-utils");

test("life events have unique ids and required metadata", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    const ids = lifeEvents.map(event => event.id);
    return {
      duplicateIds: ids.filter((id, index) => ids.indexOf(id) !== index),
      malformedEvents: lifeEvents
        .filter(event => !event.id || !event.category || !event.effects)
        .map(event => event.id || event.text)
    };
  })()`);

  assert.deepStrictEqual(result.duplicateIds, []);
  assert.deepStrictEqual(result.malformedEvents, []);
});

test("conditioned events unlock only when state allows them", () => {
  const { run } = createGameContext();
  const result = run(`(() => {
    const marketBoom = lifeEvents.find(event => event.id === "market_boom");
    const businessWindfall = lifeEvents.find(event => event.id === "business_windfall");

    const beforeInvestment = eventApplies(marketBoom);
    investments = 50000;
    const afterInvestment = eventApplies(marketBoom);

    const beforeBusiness = eventApplies(businessWindfall);
    lifePath = "Business";
    const afterBusiness = eventApplies(businessWindfall);

    return {
      beforeInvestment,
      afterInvestment,
      beforeBusiness,
      afterBusiness
    };
  })()`);

  assert.deepStrictEqual(result, {
    beforeInvestment: false,
    afterInvestment: true,
    beforeBusiness: false,
    afterBusiness: true
  });
});

test("weighted event picker returns an available candidate", () => {
  const { run } = createGameContext();
  const picked = run(`(() => {
    investments = 100000;
    lifePath = "Business";
    const candidates = lifeEvents
      .filter(eventApplies)
      .map(event => ({ event, weight: getEventWeight(event) }));

    return Boolean(pickWeightedEvent(candidates)?.event);
  })()`);

  assert.strictEqual(picked, true);
});

test("negative event detection understands finance buckets", () => {
  const { run } = createGameContext();
  const result = run(`(() => ({
    businessDebt: isNegativeEvent({ effects: { businessDebt: 10000 } }),
    investments: isNegativeEvent({ effects: { investments: -10000 } }),
    positive: isNegativeEvent({ effects: { savings: 10000, happiness: 5 } })
  }))()`);

  assert.deepStrictEqual(result, {
    businessDebt: true,
    investments: true,
    positive: false
  });
});
