# OSSS Result Attestation & Hashing

Result attestation makes OSSS schedules competition-proof through cryptographic hashing and tamper detection.

## Purpose

Attestation provides:
- ✅ Tamper-proof validation results
- ✅ Competition integrity
- ✅ Reproducible verification
- ✅ Trust in automated decisions
- ✅ Audit trails

## Threat Model

### What Attestation Prevents

1. **Result Tampering** - Changing schedule after validation
2. **Instance Modification** - Altering constraints post-submission
3. **Ruleset Manipulation** - Changing rules after competition starts
4. **Score Fabrication** - Claiming better results than achieved
5. **Validator Bypass** - Submitting unvalidated schedules

### What Attestation Does NOT Prevent

- Invalid solver implementations (garbage in, garbage out)
- Computational resource advantages
- Access to better hardware/algorithms

## Hash Types

### Instance Hash
Cryptographic hash of the problem definition:
```
instanceHash = SHA256(osssVersion + teams + venues + fixtures + constraints + objectives)
```

**Purpose**: Prove problem hasn't changed since validation

### Result Hash
Hash of the solver's solution:
```
resultHash = SHA256(osssVersion + schedule)
```

**Purpose**: Prove schedule hasn't been modified

### Ruleset Hash
Hash of constraints and objectives:
```
rulesetHash = SHA256(constraints + objectives)
```

**Purpose**: Prove scoring rules haven't changed

### Attestation Hash
Hash of the complete attestation:
```
attestationHash = SHA256(entire_attestation_object)
```

**Purpose**: Detect tampering with attestation itself

## Attestation Structure

```json
{
  "version": "1.0.0",
  "instanceHash": "a3f2e1b...",
  "resultHash": "9d4c8f2...",
  "rulesetHash": "5e7a3b1...",
  "validator": {
    "validatorName": "osss-validator-reference",
    "validatorVersion": "0.1.0",
    "validatorRepo": "https://github.com/opensportsscheduling/osss-validator",
    "validatedAt": "2025-01-15T10:30:00Z",
    "environment": {
      "nodeVersion": "v20.0.0",
      "platform": "linux",
      "arch": "x64"
    }
  },
  "validation": {
    "feasible": true,
    "hardConstraintViolations": 0,
    "softConstraintPenalties": 125,
    "objectivesScore": 37003
  },
  "signatures": [],
  "attestationHash": "1c9f4e6..."
}
```

## Verification Process

### Step 1: Recompute Hashes
```
computed_instance_hash = SHA256(instance)
computed_result_hash = SHA256(result)
computed_ruleset_hash = SHA256(ruleset)
```

### Step 2: Compare Against Attestation
```
assert computed_instance_hash == attestation.instanceHash
assert computed_result_hash == attestation.resultHash
assert computed_ruleset_hash == attestation.rulesetHash
```

### Step 3: Verify Attestation Integrity
```
temp = attestation.copy()
stored_hash = temp.attestationHash
delete temp.attestationHash
computed_attestation_hash = SHA256(temp)
assert computed_attestation_hash == stored_hash
```

### Step 4: Check Signatures (Optional)
```
for signature in attestation.signatures:
    verify_signature(signature)
```

If all steps pass, the attestation is valid.

## CLI Usage

### Generate Attestation
```bash
osss-validate result \
  --instance instance.json \
  --result result.json \
  --schemas ./schemas \
  --registry ./registry \
  --attest \
  --output attestation.json
```

### Verify Attestation
```bash
osss-validate verify \
  --instance instance.json \
  --result result.json \
  --attestation attestation.json
```

### Competition Bundle
```bash
osss-validate competition-bundle \
  --instance instance.json \
  --result result.json \
  --schemas ./schemas \
  --registry ./registry \
  --output submission.json
```

Creates a complete, verifiable submission package.

## Competition Workflow

### 1. Problem Release
Organizers publish:
- `instance.json`
- `instanceHash`
- `rulesetHash`
- Deadline

### 2. Solver Submission
Participants submit:
- `result.json`
- Request attestation

### 3. Automated Validation
Validator generates:
- Validation report
- Attestation with hashes
- Competition bundle

### 4. Public Verification
Anyone can verify:
- Download instance, result, attestation
- Run verification
- Confirm hashes match
- Trust is distributed

## Real-World Example

### Problem Instance
```json
{
  "osssVersion": "1.0.0",
  "metadata": {
    "leagueId": "challenge-2025",
    "seasonId": "round-1"
  },
  "teams": [...],
  "venues": [...],
  "fixtures": [...],
  "constraints": {...}
}
```

**Published Hash**: `a3f2e1b9d4c8f25e7a3b1c9f4e61d8a7`

### Solver Result
```json
{
  "osssVersion": "1.0.0",
  "metadata": {
    "solverName": "MyOptimizer",
    "solverVersion": "2.0.1",
    "generatedAt": "2025-01-15T10:00:00Z"
  },
  "schedule": {...}
}
```

### Attestation
```json
{
  "version": "1.0.0",
  "instanceHash": "a3f2e1b9d4c8f25e7a3b1c9f4e61d8a7",
  "resultHash": "9d4c8f25e7a3b1c9f4e61d8a7f3e2b5d",
  "rulesetHash": "5e7a3b1c9f4e61d8a7f3e2b5d8c4a1e6",
  "validator": {...},
  "validation": {
    "feasible": true,
    "hardConstraintViolations": 0,
    "softConstraintPenalties": 125
  },
  "attestationHash": "1c9f4e61d8a7f3e2b5d8c4a1e6f9b2d3"
}
```

### Verification
Anyone can:
1. Download files
2. Hash instance → verify matches `instanceHash`
3. Hash result → verify matches `resultHash`
4. Hash attestation → verify matches `attestationHash`

If hashes match: **Result is authentic and unmodified**

## Advanced Features

### Digital Signatures (Future)
Enable trusted validators to sign attestations:

```json
{
  "signatures": [
    {
      "signer": "official-osss-validator",
      "signature": "3f9e2d1a...",
      "signedAt": "2025-01-15T10:30:00Z",
      "algorithm": "RSA-SHA256",
      "publicKey": "-----BEGIN PUBLIC KEY-----..."
    }
  ]
}
```

### Timestamping (Future)
Prove validation happened at specific time:
- RFC 3161 timestamps
- Blockchain anchoring
- Distributed ledger

### Multi-Validator Consensus (Future)
Require N-of-M validators to agree:
```json
{
  "consensus": {
    "required": 3,
    "validators": [
      {"name": "validator-1", "agrees": true},
      {"name": "validator-2", "agrees": true},
      {"name": "validator-3", "agrees": true}
    ]
  }
}
```

## Security Considerations

### Hash Algorithm
- Current: SHA-256
- Future-proof: Algorithm agility support
- Resistant to: Collision attacks, preimage attacks

### Deterministic Hashing
- JSON canonicalization (sorted keys)
- Consistent serialization
- Platform-independent

### Attack Scenarios

**Scenario 1: Modify result after validation**
- Attestation `resultHash` won't match
- Verification fails
- Attack detected

**Scenario 2: Change instance, claim same result**
- Attestation `instanceHash` won't match
- Verification fails
- Attack detected

**Scenario 3: Alter attestation scores**
- Attestation `attestationHash` won't match
- Integrity check fails
- Attack detected

## Implementation Notes

### Hash Computation
```javascript
import crypto from 'node:crypto';

function hashObject(obj) {
  const json = JSON.stringify(obj, Object.keys(obj).sort());
  return crypto.createHash('sha256').update(json).digest('hex');
}
```

### Verification
```javascript
function verify(attestation, instance, result) {
  const errors = [];

  if (hashInstance(instance) !== attestation.instanceHash) {
    errors.push('Instance tampered');
  }

  if (hashResult(result) !== attestation.resultHash) {
    errors.push('Result tampered');
  }

  return { valid: errors.length === 0, errors };
}
```

## Adoption Impact

Result attestation enables:
- ✅ Trustworthy competitions
- ✅ Vendor accountability
- ✅ Research reproducibility
- ✅ Audit trails for governance
- ✅ Distributed verification

**No central authority needed for trust.**

---

**Prevents tampering, builds trust.**
