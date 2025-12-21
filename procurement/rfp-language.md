# RFP Language for OSSS Compliance

**Ready-to-use language for procurement teams requiring OSSS-compliant scheduling solutions**

---

## Purpose

This document provides template language for RFPs (Requests for Proposal) that require OSSS (Open Sports Scheduling Standard) compliance. Procurement teams can copy and adapt these sections for their specific needs.

---

## Section 1: Background & Requirements

### Template Language

```
[ORGANIZATION NAME] is seeking a sports scheduling solution that supports the Open Sports Scheduling Standard (OSSS). OSSS is an open, vendor-neutral standard for expressing scheduling problems, constraints, and solutions in a machine-readable format.

OSSS compliance is required to ensure:
- Transparency and auditability of scheduling decisions
- Portability of scheduling data and rules
- Vendor neutrality and reduced lock-in risk
- Comparability of scheduling outcomes
- Long-term maintainability of scheduling rules

The selected solution MUST demonstrate compliance with OSSS specifications as defined at:
https://github.com/[osss-org]/open-sports-scheduling
```

---

## Section 2: Mandatory Requirements

### Compliance Level Requirements

**Choose the appropriate compliance level for your needs:**

#### Option A: Basic Compliance (Minimum)

```
The proposed solution MUST meet OSSS Basic Compliance (Level 1):

1. **Input/Output Format**
   - Accept OSSS instance files (osss-instance.json) conforming to osss-core.schema.json
   - Produce OSSS result files (osss-results.json) conforming to osss-results.schema.json
   - Pass JSON Schema validation for all inputs and outputs

2. **Core Constraints**
   - Implement at least the following hard constraints:
     - no_overlap_team (teams cannot play simultaneously)
     - no_overlap_venue_resource (venues cannot host multiple fixtures simultaneously)
   - Support basic rest period constraints (min_rest_time)

3. **Validation**
   - Pass OSSS conformance tests located in /conformance/must-pass/
   - Fail appropriately on invalid inputs in /conformance/must-fail/

4. **Documentation**
   - Provide documentation of OSSS implementation
   - List supported constraints and objectives
   - Include examples of OSSS input/output files
```

#### Option B: Standard Compliance (Recommended)

```
The proposed solution MUST meet OSSS Standard Compliance (Level 2):

All Level 1 requirements, plus:

5. **Constraint Profiles**
   - Support all standard constraint profiles: baseline, youth, amateur, professional
   - Implement all constraints referenced in profiles
   - Support both hard and soft constraints with configurable penalties

6. **Violation Reporting**
   - Report all constraint violations in standardized format
   - Include violation details: fixture IDs, constraint IDs, severity
   - Provide human-readable explanations of violations

7. **Objective Functions**
   - Calculate and report all standard objectives defined in registry/objectives.json
   - Support weighted objective aggregation
   - Include objective scores in result output

8. **Result Attestation**
   - Generate cryptographic hashes of instances and results
   - Include validator metadata (version, timestamp)
   - Support result verification workflow
```

#### Option C: Advanced Compliance (For Complex Needs)

```
The proposed solution MUST meet OSSS Advanced Compliance (Level 3):

All Level 2 requirements, plus:

9. **Advanced Selectors**
   - Support Selector DSL v2 including:
     - Boolean logic (allOf, anyOf, not)
     - Temporal selectors (dateRange, dayOfWeek, phase)
     - Team selectors (division, ageGroup, role)
     - Venue selectors (venueType, capacity)

10. **Venue Resources**
    - Support multi-resource venues (fields, courts, arenas, etc.)
    - Handle venue availability windows and blackouts
    - Respect changeover time requirements
    - Manage operational constraints (max fixtures per day, required gaps)

11. **Custom Constraints**
    - Allow definition of league-specific constraints
    - Support custom constraint parameters
    - Enable custom penalty functions

12. **Explainability**
    - Generate human-readable explanations for scheduling decisions
    - Provide "what-if" analysis capabilities
    - Export violation reports in multiple formats (JSON, CSV, PDF)
```

---

## Section 3: Evaluation Criteria

### Scoring Matrix Template

```
Vendor proposals will be evaluated using the following weighted criteria:

| Criterion | Weight | Evaluation Method |
|-----------|--------|-------------------|
| OSSS Compliance Level | 25% | Conformance test results, documentation review |
| Implementation Completeness | 20% | Feature checklist, constraint coverage |
| Data Portability | 15% | Import/export capabilities, format fidelity |
| Auditability | 15% | Violation reporting, explanation quality |
| Performance | 10% | Benchmark results, scalability testing |
| Documentation Quality | 10% | Completeness, clarity, examples |
| Long-term Support | 5% | Roadmap, versioning policy, update commitment |

**Compliance Verification:**
Vendors must demonstrate compliance by:
1. Running osss-validate conformance against the conformance suite
2. Providing sample OSSS input and output files
3. Documenting any deviations or limitations
4. Completing the OSSS Vendor Checklist (see vendor-checklist.md)
```

---

## Section 4: Vendor Questionnaire

### Required Questions

```
Vendors must respond to the following questions in their proposal:

**OSSS Implementation**

1. What level of OSSS compliance does your solution support? (Basic / Standard / Advanced)

2. Which version of the OSSS specification is supported?

3. List all OSSS constraints currently implemented in your solution.
   (Reference: registry/constraints.json)

4. List all OSSS objectives currently implemented in your solution.
   (Reference: registry/objectives.json)

5. Have you run your solution against the OSSS conformance suite?
   - If yes, attach conformance test results
   - If no, commit to timeline for compliance testing

6. Does your solution support custom constraints beyond the OSSS registry?
   - If yes, describe the extensibility mechanism

**Data Portability**

7. Can schedules created in your system be exported as valid OSSS instances?

8. Can your system import OSSS instances created by other tools?

9. What data formats do you support for import/export beyond OSSS?

10. Is there any loss of fidelity when exporting to OSSS format?
    - If yes, describe what information is lost

**Auditability & Transparency**

11. How does your solution report constraint violations?

12. Can you generate cryptographic attestations of results (OSSS result hashing)?

13. Do you provide human-readable explanations of scheduling decisions?

14. Can auditors verify schedule compliance independently using OSSS tools?

**Privacy & Security**

15. How do you handle personally identifiable information (PII) in scheduling data?

16. Do you support data anonymization for research or testing purposes?

17. What data retention and deletion policies do you support?

**Versioning & Long-Term Support**

18. What is your policy for supporting older OSSS specification versions?

19. How do you handle deprecation of OSSS features?

20. What is your roadmap for OSSS feature support?

**Performance & Scalability**

21. What is the maximum league size (teams/fixtures) your OSSS implementation supports?

22. Provide typical runtime for OSSS-compliant schedule generation for:
    - 10 teams, 90 fixtures (youth league)
    - 16 teams, 240 fixtures (amateur league)
    - 32 teams, 496 fixtures (professional league)
```

---

## Section 5: Deliverables & Proof of Compliance

### Required Deliverables

```
Vendors must provide the following as part of their proposal response:

**1. OSSS Compliance Evidence**
   - Completed OSSS Vendor Checklist
   - Conformance test results (osss-validate conformance output)
   - List of supported constraints with version numbers

**2. Sample Files**
   - At least 3 sample OSSS instance files demonstrating:
     - Simple scenario (youth league)
     - Medium complexity (amateur league)
     - Complex scenario (professional multi-division)
   - Corresponding OSSS result files for each instance
   - Validation reports showing successful validation

**3. Documentation**
   - OSSS implementation guide
   - User manual sections covering OSSS import/export
   - API documentation for OSSS endpoints (if applicable)
   - List of known limitations or deviations from OSSS spec

**4. Demonstration**
   - Live demonstration of OSSS file import
   - Schedule generation using OSSS constraints
   - Export of results in OSSS format
   - Validation using osss-validate CLI tool
```

---

## Section 6: Contract Language

### Compliance Guarantee

```
**OSSS Compliance Guarantee**

The Vendor warrants that the delivered solution will:

1. Maintain compliance with OSSS [VERSION] specification throughout the contract term
2. Pass all conformance tests in the official OSSS conformance suite
3. Support import and export of scheduling data in OSSS format without loss of fidelity for supported features
4. Provide updates to maintain compatibility with new OSSS versions within [TIMEFRAME] of specification release
5. Document any deviations from OSSS specifications in writing

**Acceptance Criteria**

The solution will be deemed acceptable only after:
1. Successful execution of all OSSS conformance tests
2. Validation of sample imports and exports
3. Verification of constraint and objective implementations
4. Documentation review and approval

**Non-Compliance Remedies**

If the solution fails to meet stated OSSS compliance levels:
1. Vendor must remediate within [TIMEFRAME] at no additional cost
2. If remediation fails, Client may [terminate/seek damages/obtain alternative solution]
```

---

## Section 7: Optional Advanced Requirements

### For Organizations with Specific Needs

```
**Optional Enhancement Requirements**

The following capabilities are optional but preferred:

1. **Competition Participation**
   - Support for OSSS Scheduling Challenge format
   - Ability to generate competition-ready attestations
   - Benchmark performance tracking

2. **Research Support**
   - Dataset anonymization capabilities
   - Support for public dataset contribution
   - Reproducible result generation (seeded random)

3. **Advanced Analytics**
   - What-if scenario analysis
   - Constraint sensitivity analysis
   - Multi-objective Pareto front generation

4. **Integration Capabilities**
   - REST API supporting OSSS formats
   - Webhook notifications for validation events
   - Batch processing of OSSS instances

5. **Ecosystem Participation**
   - Active contribution to OSSS development
   - Participation in OSSS governance
   - Public case studies or examples
```

---

## Section 8: Evaluation Checklist

### Quick Reference for Procurement Teams

```
Use this checklist when evaluating vendor responses:

□ Vendor has stated their OSSS compliance level clearly
□ Conformance test results are attached and show passing status
□ Sample OSSS files are provided and validate successfully
□ All supported constraints are listed and documented
□ Vendor has completed the OSSS Vendor Checklist
□ Data import/export capabilities are demonstrated
□ Violation reporting mechanism is documented
□ Privacy and data handling practices are described
□ Versioning and long-term support policy is clear
□ Contract includes OSSS compliance guarantees
□ Acceptance criteria include OSSS validation
□ Demonstration includes OSSS workflow
```

---

## Customization Guidance

### How to Adapt This Template

1. **Choose Compliance Level**
   - Select Basic, Standard, or Advanced based on your league's complexity
   - Consider starting with Basic and expanding over time

2. **Adjust Weights**
   - Modify evaluation criteria weights to match your priorities
   - Add organization-specific criteria as needed

3. **Define Timelines**
   - Fill in [TIMEFRAME] placeholders with your requirements
   - Consider 30-90 days for compliance updates

4. **Add Context**
   - Include your league's specific scheduling challenges
   - Reference any existing systems or data formats

5. **Legal Review**
   - Have contract language reviewed by legal counsel
   - Ensure compliance guarantees are enforceable

---

## Examples & References

### Example Organizations Using OSSS in RFPs

*[To be populated as real-world examples emerge]*

### Related Resources

- [OSSS Vendor Checklist](./vendor-checklist.md) - For vendor self-assessment
- [OSSS Auditability Guide](./auditability.md) - For compliance verification
- [OSSS Privacy Guidance](./privacy-guidance.md) - For data handling requirements
- [Conformance Suite](/conformance/) - For testing vendor implementations

---

## Updates & Maintenance

This RFP language template is maintained as part of the OSSS project.

- **Version:** 0.1-draft
- **Last Updated:** 2025-01-01
- **Feedback:** Submit issues or suggestions via GitHub

---

## License

This template is released under Apache-2.0.
You may use, modify, and distribute freely. Attribution appreciated but not required.

---

**Making procurement of standards-based scheduling solutions straightforward and objective.**
