# OSSS Conformance Test Suite

This directory contains the official OSSS conformance test suite. Validators must pass these tests to be considered OSSS-conformant.

## Purpose

The conformance suite:
- ✅ Defines OSSS compliance clearly and objectively
- ✅ Enables validator authors to verify correctness
- ✅ Provides reference test cases for implementation
- ✅ Ensures consistent behavior across validators

## Structure

```
conformance/
├── expected.json           # Test suite definition and requirements
├── must-pass/             # Test cases that MUST pass
│   ├── baseline-minimal-instance.json
│   ├── baseline-with-constraints-instance.json
│   ├── feasible-result-instance.json
│   └── feasible-result-result.json
├── must-fail/             # Test cases that MUST fail
│   ├── missing-version-instance.json
│   ├── unknown-constraint-instance.json
│   ├── invalid-params-instance.json
│   ├── hard-violation-instance.json
│   └── hard-violation-result.json
└── README.md              # This file
```

## Test Categories

### Must-Pass Tests

These test cases represent **valid** OSSS instances and results. A conformant validator MUST:
- Accept these inputs without errors
- Validate them successfully
- Return exit code 0
- Correctly identify feasibility and constraints

**Current must-pass tests:**
1. **baseline-minimal** - Simplest valid OSSS instance
2. **baseline-with-constraints** - Instance with core baseline constraints
3. **feasible-result** - Valid result with no violations
4. **soft-penalties** - Feasible result with soft constraint penalties

### Must-Fail Tests

These test cases represent **invalid** inputs. A conformant validator MUST:
- Reject these inputs with errors
- Return non-zero exit code
- Provide meaningful error messages

**Current must-fail tests:**
1. **missing-version** - Missing required `osssVersion` field
2. **unknown-constraint** - Constraint with invalid `ruleId`
3. **invalid-params** - Constraint with wrong parameter type
4. **hard-violation** - Result that violates hard constraints

## Running Conformance Tests

### Using the CLI

```bash
# Run all conformance tests
osss-validate conformance run --conformance ./conformance --schemas ./schemas --registry ./registry

# Run must-pass tests only
osss-validate conformance run --conformance ./conformance --type must-pass --schemas ./schemas --registry ./registry

# Run must-fail tests only
osss-validate conformance run --conformance ./conformance --type must-fail --schemas ./schemas --registry ./registry
```

### Expected Outcomes

**Must-Pass Tests:**
- All tests should return exit code 0
- No validation errors
- Schema validation passes
- Registry validation passes

**Must-Fail Tests:**
- All tests should return non-zero exit code
- Appropriate error messages
- Fails for the expected reason

## Conformance Criteria

To earn the **OSSS Conformant** badge, a validator must:

1. ✅ Pass all must-pass tests (exit code 0)
2. ✅ Fail all must-fail tests (non-zero exit code)
3. ✅ Validate against JSON schemas correctly
4. ✅ Check constraint registry validity
5. ✅ Detect hard constraint violations
6. ✅ Calculate soft constraint penalties

## Conformance Levels

### Baseline Conformance
- Validates instances against schemas
- Checks constraint registry
- Detects basic hard constraint violations

### Full Conformance
- All baseline requirements
- Parameter schema validation
- Selector support verification
- Complete soft constraint penalty calculation
- Comprehensive violation reporting

## Adding New Test Cases

To contribute a new conformance test:

1. **Identify the test category**
   - Must-pass: Valid input that should be accepted
   - Must-fail: Invalid input that should be rejected

2. **Create test files**
   ```bash
   # For must-pass
   touch conformance/must-pass/my-test-instance.json

   # For must-fail
   touch conformance/must-fail/my-test-instance.json
   ```

3. **Update expected.json**
   Add your test case definition:
   ```json
   {
     "id": "my-test",
     "name": "My Test Name",
     "description": "What this test validates",
     "files": ["my-test-instance.json"],
     "expectedOutcome": {
       "schemaValid": true,
       "exitCode": 0
     }
   }
   ```

4. **Document the test**
   - Add rationale
   - Describe expected behavior
   - Note any edge cases

## Validator Requirements

A conformant OSSS validator MUST:

### Required Features
- ✅ JSON schema validation (osss-core.schema.json, osss-results.schema.json)
- ✅ Constraint registry lookup
- ✅ Hard constraint violation detection
- ✅ Soft constraint penalty calculation
- ✅ Appropriate exit codes (0 = success, non-zero = failure)

### Recommended Features
- ✅ Parameter schema validation
- ✅ Selector support verification
- ✅ Human-readable error messages
- ✅ JSON output format
- ✅ Detailed violation context

## Versioning

The conformance suite follows semantic versioning:
- **Major**: Breaking changes to test requirements
- **Minor**: New tests added (non-breaking)
- **Patch**: Test clarifications or fixes

Current version: **1.0.0**

## Conformance Badge

Validators that pass the conformance suite may display:

```markdown
[![OSSS Conformant](https://img.shields.io/badge/OSSS-Conformant%20v1.0-brightgreen)](https://github.com/your-org/open-sports-scheduling)
```

## Support

For questions about conformance:
- Review existing test cases
- Check the main OSSS specification
- Open a GitHub discussion
- File an issue for test clarifications

---

**Defines compliance clearly and objectively.**
