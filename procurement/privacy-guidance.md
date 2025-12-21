# OSSS Privacy Guidance

**Best practices for handling sensitive data in OSSS implementations**

Version: 0.1-draft
Last Updated: 2025-01-01

---

## Purpose

This guide helps organizations:
- Identify personally identifiable information (PII) in OSSS data
- Implement appropriate anonymization strategies
- Comply with privacy regulations (GDPR, CCPA, etc.)
- Safely share datasets for research and competition
- Establish data retention and deletion policies

---

## Key Principles

1. **Data Minimization** - Collect only what's necessary for scheduling
2. **Purpose Limitation** - Use data only for stated scheduling purposes
3. **Transparency** - Be clear about data usage
4. **Security** - Protect data from unauthorized access
5. **Accountability** - Document data handling practices

---

## PII Identification in OSSS Data

### High-Risk PII (Direct Identifiers)

**Should NEVER be included in OSSS instances:**

| Data Type | Examples | Risk Level |
|-----------|----------|------------|
| Full names | "John Smith", "Jane Doe" | **CRITICAL** |
| Email addresses | "coach@team.com" | **CRITICAL** |
| Phone numbers | "+1-555-1234" | **CRITICAL** |
| Home addresses | "123 Main St" | **CRITICAL** |
| ID numbers | SSN, driver's license | **CRITICAL** |
| Photos/biometrics | Player headshots | **CRITICAL** |
| Financial info | Credit cards, bank accounts | **CRITICAL** |

**Recommendation:** Replace with anonymous IDs before OSSS export

---

### Medium-Risk PII (Indirect Identifiers)

**Use with caution, anonymize before sharing:**

| Data Type | Examples | Risk Level | Anonymization Strategy |
|-----------|----------|------------|----------------------|
| Team names | "Jefferson High Tigers" | **HIGH** | Generic IDs ("team-001") |
| Venue names | "Lincoln Memorial Stadium" | **HIGH** | Generic IDs ("venue-A") |
| Precise coordinates | lat: 40.7128, lon: -74.0060 | **HIGH** | Add ±10km noise |
| Exact dates | "2024-03-15T19:00:00Z" | **MEDIUM** | Relativize dates |
| Coach names | "Coach Williams" | **HIGH** | Remove or use role only |
| Contact info | Team email/phone | **HIGH** | Remove entirely |

---

### Low-Risk Data (Generally Safe)

**Can typically be included in OSSS instances:**

| Data Type | Examples | Notes |
|-----------|----------|-------|
| Team IDs | "team-001", "AFC-team-5" | If truly anonymous |
| Venue IDs | "venue-A", "field-3" | If truly anonymous |
| Generic roles | "home", "away" | Safe |
| Time windows | "19:00-21:00" | Safe without dates |
| Constraints | "min_rest_time: 48h" | Safe |
| Objectives | "minimize travel" | Safe |
| Aggregate stats | "avg travel: 50km" | Safe if aggregated |

---

## Privacy Risk Assessment

### Risk Factors

**Assess your OSSS data's privacy risk:**

```
□ Contains team/venue names that could identify individuals?
□ Contains precise geographic coordinates?
□ Contains exact dates linked to real-world events?
□ Could be cross-referenced with public data to identify people?
□ Involves youth/minor participants? (Higher risk)
□ Includes special categories (health, religion)? (Prohibited)
□ Will be shared publicly or with third parties?
□ Will be retained long-term?
```

**Risk Score:**
- 0-2 checks: Low risk - Basic protections sufficient
- 3-4 checks: Medium risk - Anonymization recommended
- 5+ checks: High risk - Full anonymization required

---

## Anonymization Strategies

### Strategy 1: Identifier Replacement

**Before (Real Data):**
```json
{
  "teams": [
    {
      "teamId": "jefferson-high-tigers",
      "name": "Jefferson High Tigers",
      "division": "Division 1A",
      "homeVenue": "jefferson-stadium",
      "contact": {
        "coach": "John Smith",
        "email": "jsmith@school.edu",
        "phone": "+1-555-0100"
      }
    }
  ]
}
```

**After (Anonymized):**
```json
{
  "teams": [
    {
      "teamId": "team-001",
      "name": "Team 001",
      "division": "Division 1A",
      "homeVenue": "venue-001"
      // Contact removed entirely
    }
  ]
}
```

**Use OSSS anonymizer tool:**
```bash
osss-validate dataset-anonymize \
  --input real-instance.json \
  --output anon-instance.json \
  --verify
```

---

### Strategy 2: Location Fuzzing

**Add geographic noise to protect venue locations:**

**Before:**
```json
{
  "venues": [
    {
      "venueId": "venue-001",
      "coordinates": {
        "lat": 40.748817,
        "lon": -73.985428
      }
    }
  ]
}
```

**After (±10km noise):**
```json
{
  "venues": [
    {
      "venueId": "venue-001",
      "coordinates": {
        "lat": 40.789234,  // Original ± random offset
        "lon": -74.012156
      }
    }
  ]
}
```

**Implementation:**
```javascript
function fuzzCoordinates(lat, lon, radiusKm = 10) {
  const offsetLat = (Math.random() - 0.5) * (radiusKm / 111); // ~111km per degree lat
  const offsetLon = (Math.random() - 0.5) * (radiusKm / (111 * Math.cos(lat * Math.PI / 180)));

  return {
    lat: lat + offsetLat,
    lon: lon + offsetLon
  };
}
```

**Note:** Travel distances will be approximate but structure preserved

---

### Strategy 3: Date Relativization

**Convert absolute dates to relative dates:**

**Before:**
```json
{
  "fixtures": [
    {
      "fixtureId": "match-001",
      "dateTime": "2024-09-07T19:00:00-04:00"
    },
    {
      "fixtureId": "match-002",
      "dateTime": "2024-09-14T15:00:00-04:00"
    }
  ]
}
```

**After:**
```json
{
  "metadata": {
    "dateBaseline": "T0",
    "dateNote": "Dates are relative. T0 is arbitrary start date."
  },
  "fixtures": [
    {
      "fixtureId": "match-001",
      "dateTime": "T0+0d T19:00:00-04:00"  // Day 0, 7pm
    },
    {
      "fixtureId": "match-002",
      "dateTime": "T0+7d T15:00:00-04:00"  // Day 7, 3pm
    }
  ]
}
```

**Benefits:**
- Preserves schedule structure
- Prevents linking to real-world events
- Maintains time-of-day and day-of-week patterns

---

### Strategy 4: Aggregation & Generalization

**Replace specific values with ranges or categories:**

**Before:**
```json
{
  "teams": [
    {"teamId": "team-001", "ageGroup": "U-14"},
    {"teamId": "team-002", "ageGroup": "U-15"}
  ]
}
```

**After:**
```json
{
  "teams": [
    {"teamId": "team-001", "ageGroup": "Youth"},
    {"teamId": "team-002", "ageGroup": "Youth"}
  ]
}
```

---

### Strategy 5: Data Removal

**When in doubt, remove it:**

**Remove entirely:**
- Contact information
- Notes/comments fields
- Metadata not needed for scheduling
- Custom fields added by specific systems

**Safe to remove:**
```json
{
  "teams": [
    {
      "teamId": "team-001",
      // REMOVED: "name", "contact", "notes", "logo"
      "division": "Division 1A",
      "homeVenue": "venue-001"
    }
  ]
}
```

---

## OSSS Anonymization Tool Usage

### Built-in Anonymizer

**Full anonymization pipeline:**

```bash
osss-validate dataset-anonymize \
  --input real-instance.json \
  --output anonymous-instance.json \
  --location-noise 10 \
  --relativize-dates \
  --remove-names \
  --remove-contact \
  --verify
```

**Options:**
- `--location-noise <km>` - Add random noise to coordinates (default: 10km)
- `--relativize-dates` - Convert to relative dates from T0
- `--remove-names` - Replace team/venue names with generic IDs
- `--remove-contact` - Remove all contact information
- `--remove-metadata` - Remove non-essential metadata
- `--verify` - Validate anonymized output still passes OSSS schema

**Verification:**

After anonymization, the tool:
1. Validates anonymized instance against OSSS schema
2. Checks no PII fields remain
3. Verifies structure preservation
4. Generates anonymization report

**Anonymization report:**
```json
{
  "anonymizationDate": "2024-01-15T10:30:00Z",
  "method": "osss-dataset-anonymizer v1.0.0",
  "transformations": {
    "teams": "names replaced with generic IDs",
    "venues": "names replaced with generic IDs",
    "coordinates": "10km noise added",
    "dates": "relativized to T0",
    "contact": "removed"
  },
  "verification": {
    "schemaValid": true,
    "piiDetected": false,
    "structurePreserved": true
  }
}
```

---

## Regulatory Compliance

### GDPR (General Data Protection Regulation)

**Applies to:** EU residents, regardless of where processing occurs

**Key requirements for OSSS data:**

1. **Lawful Basis**
   - Legitimate interest (scheduling)
   - Consent (if sharing beyond original purpose)
   - Contract (if part of league participation)

2. **Data Subject Rights**
   - Right to access their data in OSSS instances
   - Right to rectification (fix errors)
   - Right to erasure ("right to be forgotten")
   - Right to data portability (OSSS export helps here!)

3. **Data Protection by Design**
   - Use anonymous IDs where possible
   - Don't collect PII unless necessary
   - Implement retention limits

4. **Anonymization as Safe Harbor**
   - Truly anonymous data not subject to GDPR
   - Must be impossible to re-identify
   - OSSS anonymizer helps achieve this

**OSSS-specific guidance:**
```
□ Use anonymous teamIds and venueIds by default
□ Store name mappings separately, not in OSSS files
□ Anonymize before sharing with vendors or researchers
□ Document retention periods in data processing agreements
□ Implement deletion workflows for team/player data
```

---

### CCPA (California Consumer Privacy Act)

**Applies to:** California residents

**Key requirements:**
- Right to know what PII is collected
- Right to deletion
- Right to opt-out of sale (don't sell scheduling data!)

**OSSS-specific guidance:**
```
□ Maintain inventory of PII in scheduling systems
□ Provide mechanisms for data deletion
□ Don't share/sell OSSS instances containing PII
□ Anonymize before using for research or competitions
```

---

### COPPA (Children's Online Privacy Protection Act)

**Applies to:** Children under 13 (US)

**Extra protections required:**
- Parental consent before collecting data
- Limited data collection
- No public disclosure of children's data

**OSSS-specific guidance for youth leagues:**
```
□ NEVER include child names in OSSS instances
□ Use generic team names or IDs
□ Get parental consent before using data for research
□ Extra care with venue data (schools, homes)
□ Anonymize all youth datasets
```

---

## Data Retention Policies

### Retention Guidelines

| Data Type | Retention Period | Rationale |
|-----------|-----------------|-----------|
| **Active season instances** | Current season + 1 year | Operational + appeals |
| **Historical schedules** | 3-7 years (anonymized) | Analysis, planning |
| **Competition submissions** | Permanent (anonymized) | Research, benchmarks |
| **Personal contact info** | Current season only | Minimize exposure |
| **Audit logs** | 2-3 years | Compliance |

### Deletion Workflows

**End-of-season cleanup:**

```bash
# 1. Archive current season (anonymized)
osss-validate dataset-anonymize \
  --input 2024-season-instance.json \
  --output archive/2024-season-anonymous.json \
  --verify

# 2. Delete original with PII
rm 2024-season-instance.json

# 3. Purge contact databases
# (implementation specific)

# 4. Document in retention log
echo "2024-season: archived anonymously, original deleted" >> retention-log.txt
```

---

## Safe Dataset Sharing

### Before Sharing Publicly

**Complete this checklist:**

```
□ Run anonymization tool
□ Manual review for residual PII
□ Verify no names in comments/notes
□ Check coordinates are fuzzy (not exact)
□ Confirm dates are relativized or old enough to be safe
□ Remove any custom/proprietary fields
□ Validate schema compliance
□ Add dataset README with usage terms
□ Specify license (CC-BY, CC0, etc.)
□ Document anonymization method used
```

### Dataset README Template

```markdown
# [Dataset Name] - OSSS Scheduling Instance

## Overview
- **Description:** [Brief description of scheduling problem]
- **Size:** [X teams, Y fixtures, Z venues]
- **Complexity:** [Youth / Amateur / Professional]
- **Status:** Anonymized, safe for public use

## Anonymization
This dataset has been anonymized using OSSS dataset-anonymizer:
- Team/venue names replaced with generic IDs
- Coordinates have ±10km random noise added
- Dates relativized to arbitrary baseline
- All contact information removed

**Original data is NOT identifiable from this dataset.**

## License
[CC-BY-4.0 / CC0 / Other]

## Usage
This dataset may be used for:
- Algorithm research and development
- Benchmarking scheduling solvers
- Educational purposes
- Competition submissions

## Citation
If you use this dataset in research, please cite:
[Citation format]

## Contact
Questions: [contact info or GitHub issues]
```

---

## Implementation Checklist

### For Leagues & Organizations

```
□ Conduct privacy risk assessment
□ Document what PII is collected and why
□ Implement anonymization before vendor sharing
□ Establish data retention policy
□ Train staff on privacy requirements
□ Review contracts with vendors for data handling
□ Provide privacy notice to teams/players
□ Implement data deletion workflows
□ Regular audits of data storage
```

### For Vendors & Solution Providers

```
□ Design systems to use anonymous IDs by default
□ Store PII separately from OSSS instances
□ Implement export anonymization option
□ Document data handling in privacy policy
□ Support data deletion requests
□ Encrypt OSSS data in transit and at rest
□ Limit employee access to PII
□ Regular security audits
□ Incident response plan
```

### For Researchers

```
□ Use only anonymized datasets
□ Get IRB approval if working with youth data
□ Respect dataset usage terms
□ Don't attempt re-identification
□ Aggregate results (no individual team analysis if identifying)
□ Delete data after research concludes (or per retention policy)
□ Cite datasets appropriately
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: "It's just team names, not personal data"

**Reality:** Team names can identify schools, which can identify children

**Fix:** Anonymize team names when sharing publicly

---

### ❌ Mistake 2: "Removing names is enough"

**Reality:** Precise coordinates + dates can re-identify venues/events

**Fix:** Apply multiple anonymization strategies (location fuzzing + date relativization)

---

### ❌ Mistake 3: "We got consent, so we can share"

**Reality:** Consent for scheduling ≠ consent for public research dataset

**Fix:** Get separate consent or anonymize before sharing

---

### ❌ Mistake 4: "It's anonymized, so GDPR doesn't apply"

**Reality:** Pseudonymization (replaceable IDs) still falls under GDPR. True anonymization requires irreversibility.

**Fix:** Ensure IDs cannot be mapped back to individuals

---

### ❌ Mistake 5: "We'll anonymize before publishing"

**Reality:** Internal systems contain PII, increasing breach risk

**Fix:** Design systems with privacy from the start (use anonymous IDs everywhere, store mappings separately)

---

## Technical Safeguards

### Encryption

**In Transit:**
```
□ HTTPS/TLS for all OSSS file transfers
□ Encrypted email attachments
□ Secure file sharing platforms
```

**At Rest:**
```
□ Encrypted databases
□ Encrypted filesystems
□ Encrypted backups
```

### Access Control

```
□ Role-based access control (RBAC)
□ Principle of least privilege
□ Audit logs for data access
□ Multi-factor authentication for sensitive data
```

### Anonymization Quality Testing

**Test re-identification risk:**

1. **K-Anonymity Test** - Each record indistinguishable from at least K-1 others
2. **Linkage Attack Test** - Try to link to public datasets (school rosters, etc.)
3. **Expert Review** - Have privacy expert review anonymization

---

## Resources & Tools

### OSSS Tools

- **dataset-anonymizer** - Built-in anonymization tool
  ```bash
  osss-validate dataset-anonymize --help
  ```

- **PII Detection Script** - Scan for common PII patterns
  ```bash
  scripts/detect-pii.js instance.json
  ```

### External Resources

- **GDPR Guidance:** https://gdpr.eu/
- **CCPA Guidance:** https://oag.ca.gov/privacy/ccpa
- **ICO Anonymization Code:** https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/anonymisation-and-pseudonymisation/
- **NIST Privacy Framework:** https://www.nist.gov/privacy-framework

---

## Incident Response

### If PII is Accidentally Exposed

**Immediate actions:**

1. **Contain** - Remove exposed file immediately
2. **Assess** - Determine what PII was exposed, to whom, for how long
3. **Notify** - Inform affected individuals (72 hours under GDPR)
4. **Report** - Report to supervisory authority if required
5. **Remediate** - Fix process to prevent recurrence
6. **Document** - Maintain incident log

**Template incident report:**
```
Date: [ISO Date]
Incident: PII exposure in OSSS instance
Data exposed: [team names / coordinates / etc.]
Number affected: [X teams, Y individuals]
Exposure duration: [hours/days]
Root cause: [description]
Remediation: [actions taken]
Prevention: [process changes]
```

---

## Updates & Feedback

This guidance is maintained as part of OSSS.

- **Version:** 0.1-draft
- **Last Updated:** 2025-01-01
- **Feedback:** GitHub issues or discussions
- **Legal disclaimer:** This guidance is informational only, not legal advice. Consult qualified legal counsel for your specific situation.

---

## License

CC-BY-4.0 - Use and adapt with attribution

---

**Privacy-preserving practices make OSSS safer for everyone and enable valuable research while respecting individual rights.**
