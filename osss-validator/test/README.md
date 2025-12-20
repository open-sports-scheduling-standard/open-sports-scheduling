# OSSS Validator Test Suite

This directory contains the test suite for the OSSS (Open Sports Scheduling Standard) validator.

## Overview

The test suite is organized into:

- **Unit Tests** (`test/rules/`): Tests for individual constraint rules
- **Integration Tests** (`test/integration/`): End-to-end tests using example instances

## Running Tests

### Prerequisites

Install dependencies:

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Test Structure

### Unit Tests

Unit tests validate individual constraint checking functions:

#### `test/rules/min_rest_time.test.js`

Tests for the `min_rest_time` constraint rule:

- **Basic functionality**: Validates correct rest time detection
- **Edge cases**: Handles missing parameters, invalid inputs, empty data
- **Rest time calculation**: Verifies accurate time difference calculations
- **Multiple consecutive games**: Tests scenarios with 3+ games
- **Game ordering**: Ensures non-chronological inputs are handled correctly

**Key test scenarios:**
- No violations when rest time meets minimum
- Detects violations when rest < minimum
- Handles multiple teams independently
- Reports actual rest hours in violation messages

#### `test/rules/no_overlap_team.test.js`

Tests for the `no_overlap_team` constraint rule:

- **Basic functionality**: Validates team availability checking
- **Overlap detection**: Tests various overlap scenarios (complete, partial, exact)
- **Multiple teams and games**: Validates independent team tracking
- **Edge cases**: Handles empty data, missing fixtures, missing participants
- **Violation messages**: Ensures clear reporting

**Key test scenarios:**
- No violations when teams don't overlap
- Detects when same team plays simultaneously
- Allows different teams to play simultaneously
- Correctly identifies overlapping time windows

### Integration Tests

Integration tests validate complete OSSS instances:

#### `test/integration/validator.test.js`

Tests for example instance files:

- **Youth League**: Basic instance validation
- **Amateur League**: Soft constraints and objectives
- **Pro League**: Advanced features (blackouts, officials, priorities)
- **Cross-Example Consistency**: Common requirements across all examples

**Validation checks:**
- Valid JSON parsing
- Required fields present
- Correct data types
- Referential integrity (team/venue IDs exist)
- ISO-8601 timestamp format
- Constraint structure compliance
- Season date logic

## Writing New Tests

### Unit Test Template

```javascript
import { expect } from 'chai';
import { checkYourRule } from '../../src/rules/hard/your_rule.js';

describe('your_rule constraint', () => {
  describe('basic functionality', () => {
    it('should return no violations when constraint is satisfied', () => {
      const constraint = { params: { /* ... */ } };
      const idx = { fixtures: new Map(), assignments: [] };
      const violations = checkYourRule(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should detect violations when constraint is violated', () => {
      // ... test implementation
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      // ... test implementation
    });
  });
});
```

### Integration Test Template

```javascript
describe('Your Feature', () => {
  let instance;

  before(async () => {
    const instancePath = join(examplesDir, 'your-example/osss-instance.json');
    const content = await readFile(instancePath, 'utf-8');
    instance = JSON.parse(content);
  });

  it('should validate your feature', () => {
    expect(instance).to.have.property('yourField');
    // ... assertions
  });
});
```

## Test Coverage

Current coverage includes:

- ✅ `min_rest_time` constraint (unit tests)
- ✅ `no_overlap_team` constraint (unit tests)
- ✅ Youth league example validation (integration)
- ✅ Amateur league example validation (integration)
- ✅ Pro league example validation (integration)

### Adding Coverage for New Constraints

When adding a new constraint rule:

1. Create unit test file: `test/rules/your_rule.test.js`
2. Test basic functionality (pass/fail cases)
3. Test edge cases (empty data, invalid params)
4. Test calculation accuracy (if applicable)
5. Test violation message format

When adding a new example:

1. Add parsing test to `test/integration/validator.test.js`
2. Add validation tests for unique features
3. Add to cross-example consistency tests

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm install

- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Descriptions**: Use descriptive test names
3. **Comprehensive Coverage**: Test happy path, edge cases, and error conditions
4. **Fast Execution**: Keep tests fast for quick feedback
5. **Maintainability**: Keep tests simple and readable

## Debugging Tests

### Run Specific Test File

```bash
npx mocha test/rules/min_rest_time.test.js
```

### Run Specific Test Suite

```bash
npx mocha test/rules/min_rest_time.test.js --grep "basic functionality"
```

### Run Single Test

```bash
npx mocha test/rules/min_rest_time.test.js --grep "should return no violations"
```

### Enable Debug Output

```bash
DEBUG=* npm test
```

## Dependencies

- **Mocha**: Test framework
- **Chai**: Assertion library
- **c8**: Code coverage tool

## Contributing

When contributing tests:

1. Follow existing test structure and naming conventions
2. Ensure all tests pass before submitting
3. Maintain or improve code coverage
4. Add documentation for complex test scenarios
5. Use meaningful assertion messages for easier debugging

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [OSSS Specification](../specs/)
