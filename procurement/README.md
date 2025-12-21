# OSSS Procurement & Compliance Pack

**Making OSSS adoption safe, auditable, and procurement-ready**

This directory contains resources for organizations evaluating, procuring, and auditing OSSS-compliant scheduling solutions.

---

## Contents

### 1. [RFP Language](./rfp-language.md)
Ready-to-use RFP (Request for Proposal) language for procurement teams.

**Use when:**
- Issuing RFPs for scheduling software
- Requiring OSSS compliance in vendor responses
- Evaluating vendor proposals for standards compliance

**Includes:**
- Required capabilities
- Mandatory compliance points
- Evaluation criteria
- Vendor questionnaire

---

### 2. [Vendor Checklist](./vendor-checklist.md)
Self-assessment checklist for scheduling vendors and solution providers.

**Use when:**
- Implementing OSSS support
- Responding to RFPs
- Self-certifying compliance
- Planning feature roadmaps

**Includes:**
- Core compliance requirements
- Optional advanced features
- Testing & validation requirements
- Documentation standards

---

### 3. [Auditability Guide](./auditability.md)
Documentation on auditing OSSS compliance and schedule quality.

**Use when:**
- Conducting compliance audits
- Validating vendor implementations
- Reviewing schedule decisions
- Investigating constraint violations

**Includes:**
- Audit methodology
- Validation procedures
- Common audit scenarios
- Evidence collection
- Reporting templates

---

### 4. [Privacy Guidance](./privacy-guidance.md)
Best practices for handling sensitive data in OSSS implementations.

**Use when:**
- Implementing OSSS in production
- Sharing datasets for research
- Contributing to public competitions
- Evaluating data handling practices

**Includes:**
- PII identification
- Anonymization strategies
- Data retention policies
- Compliance considerations (GDPR, etc.)
- Safe dataset sharing

---

## Who Should Use This Pack?

### League Administrators & Procurement Teams
- Ensure vendor selection includes OSSS compliance
- Compare vendors on objective criteria
- Reduce vendor lock-in risks

### Scheduling Vendors & Solution Providers
- Understand compliance requirements
- Respond effectively to RFPs
- Self-assess implementation quality

### Auditors & Quality Assurance Teams
- Verify OSSS compliance
- Audit schedule decisions
- Validate constraint adherence

### Legal & Compliance Teams
- Understand privacy implications
- Review data handling practices
- Assess regulatory compliance

---

## Quick Start

### For Procurement Teams

1. **Review [RFP Language](./rfp-language.md)** - Copy relevant sections into your RFP
2. **Send to vendors** - Require compliance in proposals
3. **Evaluate responses** using the provided criteria
4. **Conduct audits** using the [Auditability Guide](./auditability.md)

### For Vendors

1. **Complete [Vendor Checklist](./vendor-checklist.md)** - Self-assess compliance
2. **Address gaps** in your implementation
3. **Review [Privacy Guidance](./privacy-guidance.md)** - Ensure data handling is compliant
4. **Test thoroughly** using conformance suite
5. **Document compliance** for customers and auditors

### For Auditors

1. **Read [Auditability Guide](./auditability.md)** - Understand audit methodology
2. **Collect evidence** using provided templates
3. **Run conformance tests** from `/conformance` directory
4. **Verify attestations** using validation tools
5. **Report findings** using provided templates

---

## Compliance Levels

OSSS compliance is structured in tiers:

### Level 1: Basic Compliance
- Valid OSSS instance generation
- Schema validation passes
- Core constraint support (no_overlap_team, no_overlap_venue_resource)
- Valid results format

### Level 2: Standard Compliance
- All Level 1 requirements
- Support for standard constraint profiles (baseline, youth, amateur, pro)
- Proper violation reporting
- Objective calculation support
- Result attestation

### Level 3: Advanced Compliance
- All Level 2 requirements
- Selector DSL v2 support
- Venue resources and availability
- Custom constraint definitions
- Multi-objective optimization
- Explainability features

### Level 4: Research-Grade Compliance
- All Level 3 requirements
- Reproducible results
- Competition-ready attestations
- Benchmark participation
- Open dataset contribution

---

## Conformance vs. Certification

### Conformance
**What:** Technical compliance with OSSS specifications
**How:** Automated validation using `osss conformance` command
**Who:** Self-service, any implementer
**Cost:** Free

### Certification (Future)
**What:** Third-party verification of compliance
**How:** Independent audit and testing
**Who:** Authorized certification bodies
**Cost:** TBD (when program launches)

**Current status:** Conformance testing is available now. Formal certification program is planned for future phases.

---

## Updates & Versioning

This procurement pack follows OSSS versioning:
- **Current version:** v0.1-draft
- **Last updated:** 2025-01-01
- **Compatibility:** OSSS Core v0.1+

When OSSS specifications are updated:
1. Procurement materials will be versioned accordingly
2. Deprecated requirements will be clearly marked
3. Minimum support windows will be documented

See [Versioning Policy](../VERSIONING.md) for details.

---

## Support & Questions

- **Issues:** https://github.com/osss/open-sports-scheduling/issues
- **Discussions:** https://github.com/osss/open-sports-scheduling/discussions
- **Email:** [TBD - governance contact]

---

## License

- Documentation: CC-BY-4.0
- Templates: Apache-2.0 (use freely, attribution appreciated)

---

**Making sports scheduling procurement transparent, safe, and standards-based.**
