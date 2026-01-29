# OSSS Rule Implementations (Built-ins)

This folder contains executable reference implementations of OSSS constraints.

## Contract

Each file must export:

```js
export async function evaluate(ctx) {
  return {
    violations: [{ ruleId, type, message, selector?, meta? }],
    penalty: 0
  }
}
