export async function evaluate(ctx) {
  // ctx: { instance, result, ruleId, type, selector, params, registryEntry, warn }
  return { violations: [], penalty: 0 };
}
