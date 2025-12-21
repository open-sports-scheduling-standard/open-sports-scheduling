# OSSS Versioning & Deprecation Policy

**Formal stability guarantees for long-term adoption and vendor confidence**

Version: 1.0
Effective Date: 2025-01-01
Last Updated: 2025-01-01

---

## Purpose

This document establishes OSSS's versioning and deprecation policies to ensure:
- **Predictability** - Clear version compatibility rules
- **Stability** - Long-term support guarantees
- **Trust** - Vendors can invest confidently in OSSS
- **Evolution** - OSSS can improve without breaking existing implementations

---

## Versioning Scheme

OSSS follows **Semantic Versioning 2.0.0** (https://semver.org/)

### Format: MAJOR.MINOR.PATCH

```
Example: 2.3.1
         │ │ │
         │ │ └─ PATCH: Backwards-compatible bug fixes
         │ └─── MINOR: Backwards-compatible new features
         └───── MAJOR: Breaking changes
```

### Version Components

#### MAJOR Version (X.0.0)

**Incremented when:**
- Breaking changes to schemas (required fields removed, types changed)
- Breaking changes to constraint/objective semantics
- Breaking changes to validation logic
- Incompatible changes to file formats

**Example breaking changes:**
- Removing a required field from `osss-instance.json`
- Changing `dateTime` from ISO string to Unix timestamp
- Changing constraint parameter types (string → number)

**Compatibility:** Major versions are NOT backwards compatible

---

#### MINOR Version (0.X.0)

**Incremented when:**
- New optional fields added to schemas
- New constraints added to registry
- New objectives added to registry
- New optional features (e.g., Selector DSL v2)
- Backwards-compatible enhancements

**Example minor changes:**
- Adding optional `metadata` field to teams
- Adding new constraint `max_travel_per_week`
- Adding new selector type `customField`

**Compatibility:** Minor versions ARE backwards compatible within same major version

---

#### PATCH Version (0.0.X)

**Incremented when:**
- Documentation fixes
- Schema clarifications (no functional change)
- Bug fixes in validation logic
- Typo corrections in registry
- Example improvements

**Example patch changes:**
- Fixing typo in constraint description
- Clarifying ambiguous schema documentation
- Fixing bug where validator incorrectly rejected valid input

**Compatibility:** Patch versions ARE backwards compatible within same minor version

---

## Compatibility Guarantees

### Forward Compatibility

**Definition:** Older validators can process newer data (within same major version)

**Guarantee:**
- v1.2.X validator CAN process v1.3.0 instances (may ignore new optional fields)
- v1.X.X validator CANNOT process v2.0.0 instances

**Best Practice:**
- Ignore unknown optional fields
- Warn on unknown constraint/objective IDs
- Fail gracefully with clear error on major version mismatch

---

### Backward Compatibility

**Definition:** Newer validators can process older data

**Guarantee:**
- v1.3.0 validator MUST process v1.2.X instances
- v2.0.0 validator SHOULD support v1.X.X instances (optional but recommended)

**Implementation:**
- Schema validation must accept all previous minor versions
- Validators should detect and handle version-specific behaviors

---

## Schema Versioning

### Schema Version Field

All OSSS files MUST include version field:

```json
{
  "osssVersion": "1.2.0",
  "instance": { ... }
}
```

### Version Detection

Validators MUST:
1. Read `osssVersion` field
2. Check compatibility with validator version
3. Reject if major version mismatch (unless explicitly supporting multiple majors)
4. Warn if minor version newer than validator
5. Process if minor version older than validator

**Example validation logic:**

```javascript
function checkCompatibility(dataVersion, validatorVersion) {
  const [dataMajor, dataMinor] = dataVersion.split('.').map(Number);
  const [valMajor, valMinor] = validatorVersion.split('.').map(Number);

  if (dataMajor !== valMajor) {
    throw new Error(`Incompatible major version: data=${dataMajor}, validator=${valMajor}`);
  }

  if (dataMinor > valMinor) {
    console.warn(`Data version ${dataVersion} newer than validator ${validatorVersion}. Some features may be ignored.`);
  }

  return true;
}
```

---

## Registry Versioning

### Constraint & Objective Registry

**Registry location:** `registry/constraints.json`, `registry/objectives.json`

**Versioning rules:**

1. **Registries have independent versions**
   - `constraints.json` version: separate from core OSSS version
   - `objectives.json` version: separate from core OSSS version

2. **Registry format:**
   ```json
   {
     "registryVersion": "2.1.0",
     "osssVersion": "1.2.0",
     "rules": [ ... ]
   }
   ```

3. **Registry compatibility:**
   - Same semantic versioning rules apply
   - Breaking changes increment major version
   - New rules increment minor version
   - Fixes/clarifications increment patch version

---

### Rule ID Stability

**Critical guarantee:** Rule IDs NEVER change or get reused

**Rules:**

1. **No ID Reuse**
   - Once a rule ID is defined, it CANNOT be reused for a different rule
   - Even if deprecated or removed, ID is reserved forever

2. **No ID Modification**
   - Rule IDs are immutable
   - If rule semantics change significantly, create new ID

3. **ID Namespace**
   - Core rules: no prefix (e.g., `min_rest_time`)
   - Extension rules: vendor prefix (e.g., `acme:custom_rule`)

**Example:**

```json
{
  "ruleId": "min_rest_time",
  "version": "1.0.0",
  "status": "stable",
  "deprecated": false
}
```

If semantics change significantly:

```json
{
  "ruleId": "min_rest_time",
  "version": "1.0.0",
  "status": "deprecated",
  "deprecated": true,
  "deprecatedDate": "2025-06-01",
  "replacedBy": "min_rest_time_v2",
  "sunsetDate": "2026-06-01"
}
```

---

## Rule Lifecycle & Deprecation

### Rule Status Values

| Status | Description | Guarantee |
|--------|-------------|-----------|
| `draft` | Under development, may change | No stability guarantee |
| `experimental` | Available but unstable, may change | May break in minor versions |
| `stable` | Production-ready, backwards compatible | Won't break in minor versions |
| `deprecated` | Discouraged, will be removed | Supported for minimum window |
| `removed` | No longer supported | Error if used |

---

### Deprecation Process

**Timeline: Minimum 18 months from deprecation to removal**

#### Phase 1: Deprecation Announcement (T+0)

1. **Mark as deprecated in registry:**
   ```json
   {
     "ruleId": "old_constraint",
     "status": "deprecated",
     "deprecated": true,
     "deprecatedDate": "2025-01-01",
     "deprecationReason": "Replaced by new_constraint with better semantics",
     "replacedBy": "new_constraint",
     "sunsetDate": "2026-07-01"
   }
   ```

2. **Update documentation:**
   - Add deprecation notice to spec
   - Document migration path
   - Update examples to use replacement

3. **Validator warnings:**
   - Validators MUST warn when deprecated rule used
   - Warning includes: deprecation date, sunset date, replacement ID

---

#### Phase 2: Deprecation Period (T+0 to T+18 months)

**Minimum duration: 18 months**

**During this period:**
- ✅ Deprecated rule MUST still work
- ✅ Validators MUST support it
- ⚠️ Validators SHOULD warn users
- ✅ Documentation retained but marked deprecated
- ✅ Examples moved to "legacy" section

**Recommended migration support:**
- Provide migration scripts
- Offer side-by-side comparison examples
- Document semantic differences

---

#### Phase 3: Sunset & Removal (T+18 months)

**After minimum 18 months:**

1. **Remove from active registry:**
   ```json
   {
     "ruleId": "old_constraint",
     "status": "removed",
     "deprecated": true,
     "deprecatedDate": "2025-01-01",
     "removedDate": "2026-07-01",
     "replacedBy": "new_constraint"
   }
   ```

2. **Validator behavior:**
   - Validators MUST reject instances using removed rules
   - Error message MUST include replacement rule ID

3. **Documentation:**
   - Moved to "removed rules" appendix
   - Migration guide retained indefinitely

---

### Exceptional Circumstances

**Security or correctness issues may require faster deprecation:**

1. **Critical severity:** May be removed in next patch version (with clear communication)
2. **High severity:** May be removed in next minor version
3. **Medium severity:** Standard 18-month timeline
4. **Low severity:** May extend beyond 18 months

**Example critical issue:**
```json
{
  "ruleId": "broken_constraint",
  "status": "removed",
  "deprecated": true,
  "deprecatedDate": "2025-03-01",
  "removedDate": "2025-03-15",  // Only 14 days!
  "deprecationReason": "Critical: Constraint logic was fundamentally broken, producing incorrect results",
  "severity": "critical",
  "replacedBy": "corrected_constraint"
}
```

---

## Minimum Support Windows

### For Implementers (Vendors, Libraries)

**Requirement:** Must support current major version + previous major version for minimum 12 months after new major release

**Example:**
- OSSS v2.0.0 released on 2025-01-01
- Validators must support v1.X.X until at least 2026-01-01

**Recommendation:** Support N-1 and N-2 major versions for maximum compatibility

---

### For Users (Leagues, Organizations)

**Guarantee:** Any OSSS instance created today will be supported for at least:
- Same major version: Indefinitely
- After next major version: Minimum 12 months

**Example:**
- Instance created with v1.5.0 on 2025-01-01
- OSSS v2.0.0 released on 2026-01-01
- Instance MUST be supported until at least 2027-01-01

---

## Schema Evolution Rules

### Adding Fields

#### ✅ ALLOWED in Minor Versions (Backwards Compatible)

**Adding optional fields:**

```json
// v1.2.0
{
  "teams": [
    {
      "teamId": "team-001",
      "name": "Team A"
    }
  ]
}

// v1.3.0 - Added optional "division" field
{
  "teams": [
    {
      "teamId": "team-001",
      "name": "Team A",
      "division": "Division 1"  // NEW, OPTIONAL
    }
  ]
}
```

**Older validators ignore new optional field → Compatible ✅**

---

#### ❌ NOT ALLOWED in Minor Versions (Breaking)

**Adding required fields:**

```json
// v1.2.0
{
  "teams": [
    {
      "teamId": "team-001",
      "name": "Team A"
    }
  ]
}

// v2.0.0 - Added required "division" field (BREAKING)
{
  "teams": [
    {
      "teamId": "team-001",
      "name": "Team A",
      "division": "Division 1"  // NEW, REQUIRED
    }
  ]
}
```

**Older validators reject as invalid → Requires major version bump**

---

### Removing Fields

#### ❌ NEVER ALLOWED in Minor/Patch Versions

**Removing any field is ALWAYS breaking:**

```json
// v1.2.0
{
  "fixtures": [
    {
      "fixtureId": "match-001",
      "homeTeam": "team-001",
      "awayTeam": "team-002",
      "venue": "venue-001"
    }
  ]
}

// v2.0.0 - Removed "venue" field (BREAKING)
{
  "fixtures": [
    {
      "fixtureId": "match-001",
      "homeTeam": "team-001",
      "awayTeam": "team-002"
      // "venue" removed - BREAKING CHANGE
    }
  ]
}
```

**Must increment major version**

---

### Changing Field Types

#### ❌ NEVER ALLOWED in Minor/Patch Versions

**Type changes are ALWAYS breaking:**

```json
// v1.2.0
{
  "dateTime": "2025-01-15T19:00:00Z"  // String
}

// v2.0.0 - Changed to Unix timestamp (BREAKING)
{
  "dateTime": 1705345200  // Number - BREAKING CHANGE
}
```

**Must increment major version**

---

### Changing Enums

#### ✅ ALLOWED: Adding new enum values (Minor Version)

```json
// v1.2.0 - venueType enum
["field", "court", "arena"]

// v1.3.0 - Added new types (BACKWARDS COMPATIBLE)
["field", "court", "arena", "track", "pool"]
```

#### ❌ NOT ALLOWED: Removing enum values (Breaking)

```json
// v1.2.0
["field", "court", "arena"]

// v2.0.0 - Removed "field" (BREAKING)
["court", "arena"]
```

---

## Version Announcement & Communication

### Advance Notice Requirements

| Change Type | Minimum Notice | Announcement Channels |
|-------------|----------------|---------------------|
| Major version | 6 months | Mailing list, GitHub, website |
| Minor version | 1 month | GitHub releases, changelog |
| Patch version | None required | GitHub releases |
| Rule deprecation | 18 months before removal | All channels |
| Critical fix | ASAP | All channels + security advisory |

---

### Release Communication Template

**For Major Releases:**

```markdown
# OSSS v2.0.0 Release Announcement

**Release Date:** 2026-01-01
**Migration Deadline:** 2027-01-01 (v1.X support ends)

## Breaking Changes

1. **[Change 1]**
   - Impact: [Who is affected]
   - Migration: [How to update]
   - Timeline: [When you must update by]

2. **[Change 2]**
   ...

## New Features

- [Feature 1]
- [Feature 2]

## Deprecations

The following are now deprecated and will be removed in v3.0:
- [Deprecated item 1] - Replace with [alternative]

## Migration Guide

See: [Link to migration guide]

## Support

v1.X will be supported until 2027-01-01.
Questions: [Contact info]
```

---

## Validator Version Support Matrix

**Reference implementation must support:**

| Validator Version | Supports Data Versions | Notes |
|-------------------|----------------------|-------|
| v1.3.0 | v1.0.0 - v1.3.0 | Full support for all v1.X |
| v2.0.0 | v2.0.0, v1.0.0 - v1.X | v1.X support required for 12 months |
| v2.1.0 | v2.0.0 - v2.1.0, v1.0.0 - v1.X | v1.X support until 2027-01-01 |
| v3.0.0 | v3.0.0, v2.0.0 - v2.X | v2.X support required for 12 months |

**Recommendation for vendors:** Support N-2 major versions for best compatibility

---

## Governance & Decision Making

### Who Decides?

**Version increments:**
- PATCH: Maintainer discretion
- MINOR: Maintainer discretion (with community review)
- MAJOR: Steering council approval required

**Deprecations:**
- Draft/Experimental rules: Maintainer discretion
- Stable rules: Steering council approval required
- Critical issues: Emergency process (post-facto approval)

### RFC Process for Breaking Changes

**Before any major version increment:**

1. **RFC Creation**
   - Document proposed breaking changes
   - Explain rationale and alternatives considered
   - Outline migration path

2. **Community Review**
   - Minimum 60-day comment period
   - Public discussion on GitHub
   - Vendor and user feedback solicited

3. **Approval**
   - Steering council vote
   - Requires 2/3 majority

4. **Implementation**
   - Beta period before final release
   - Migration tools provided
   - Documentation updated

---

## Tooling Support

### Version Detection

**Validators MUST implement:**

```javascript
// Check instance version compatibility
function validateVersion(instance, validatorVersion) {
  const instanceVersion = instance.osssVersion;

  if (!instanceVersion) {
    throw new Error("Missing osssVersion field");
  }

  // Check compatibility
  checkCompatibility(instanceVersion, validatorVersion);
}
```

### Version Migration Tools

**OSSS provides:**

```bash
# Upgrade instance to new version
osss-migrate --from 1.5.0 --to 2.0.0 --input old.json --output new.json

# Check compatibility without migrating
osss-validate version --instance instance.json --target-version 2.0.0
```

---

## Summary of Guarantees

### For Vendors & Implementers

✅ **You can rely on:**
- Semantic versioning (MAJOR.MINOR.PATCH)
- No breaking changes in minor/patch versions
- Minimum 18-month deprecation notice
- Minimum 12-month support for previous major version
- Rule IDs never reused or changed

✅ **You must:**
- Support current + previous major version (minimum 12 months)
- Validate osssVersion field
- Handle deprecation warnings gracefully

---

### For Users & Leagues

✅ **You can rely on:**
- Instances created today work indefinitely (same major version)
- Minimum 12 months support after major version change
- Minimum 18 months notice before rule removal
- Clear migration guides for breaking changes

✅ **You should:**
- Monitor deprecation warnings
- Plan migrations during deprecation windows
- Test with new versions before updating production

---

## Updates to This Policy

**This policy itself is versioned:**

- Version: 1.0
- Date: 2025-01-01

**Changes to this policy:**
- Require steering council approval
- Minimum 6-month notice for changes
- Published via same channels as major releases

---

## References

- **Semantic Versioning 2.0.0:** https://semver.org/
- **OSSS Charter:** [OSSS-CHARTER.md](./OSSS-CHARTER.md)
- **Governance:** [GOVERNANCE.md](./GOVERNANCE.md)

---

## License

CC-BY-4.0

---

**Clear versioning and deprecation policies build trust and enable long-term investment in OSSS.**
