# osss-validator

Reference validator CLI for the Open Sports Scheduling Standard (OSSS).

## What it does
- Validates OSSS instance + constraints + objectives against JSON Schemas
- Validates solver results against JSON Schema
- Checks registry references (constraint IDs, objective metrics)
- Checks basic hard constraints:
  - no_overlap_team
  - no_overlap_venue_resource
  - min_rest_time
- Checks scoring consistency:
  - totalPenalty equals sum of byConstraint penalties
- Produces human or JSON output, and standard exit codes.

## Install
```bash
npm install
npm link
````
## Validate
Validate an instance

```bash
osss-validate instance \
  --instance ./examples/youth-league/osss-instance.json \
  --schemas ./schemas \
  --registry ./registry

````

Validate a solver result
```bash
osss-validate result \
  --instance ./examples/youth-league/osss-instance.json \
  --result ./examples/youth-league/osss-results.json \
  --schemas ./schemas \
  --registry ./registry
````
Compare solver results (leaderboard)
```bash
osss-validate compare \
  --instance ./examples/amateur-league/osss-instance.json \
  --results ./out/solverA.json ./out/solverB.json \
  --schemas ./schemas \
  --registry ./registry

````
## Exit Codes
```bash
0: valid (and feasible where applicable)
1: schema or registry error
2: result says feasible=false
3: hard constraint violation detected
4: scoring inconsistency
5: unexpected runtime error

````
## Notes
This is a reference implementation with conservative rule semantics.
Extend src/rules/hard/ to add additional OSSS constraints as they are standardized.


---
```bash
## `bin/osss-validate.js`

```js
#!/usr/bin/env node
import { main } from "../src/index.js";

main(process.argv).catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(5);
});
````