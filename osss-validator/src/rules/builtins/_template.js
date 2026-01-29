export async function evaluate(ctx) {
  const { ruleId, type, selector, params } = ctx;

  // Example: if something is wrong:
  // return {
  //   violations: [{
  //     ruleId,
  //     type,
  //     message: "Explain what failed",
  //     selector,
  //     meta: { params }
  //   }],
  //   penalty: 0
  // };

  // Example: soft penalty
  // return {
  //   violations: [{
  //     ruleId,
  //     type: "soft",
  //     message: "Soft constraint penalty applied",
  //     selector,
  //   }],
  //   penalty: 5
  // };

  return { violations: [], penalty: 0 };
}
