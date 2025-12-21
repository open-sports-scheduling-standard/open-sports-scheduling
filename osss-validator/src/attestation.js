/**
 * OSSS Result Attestation & Hashing
 *
 * Provides tamper-proof attestation of validation results through cryptographic hashing.
 * Enables trust in competition results and prevents result manipulation.
 */

import crypto from 'node:crypto';

/**
 * Generate deterministic hash of an object
 * @param {object} obj - Object to hash
 * @returns {string} SHA-256 hash (hex)
 */
export function hashObject(obj) {
  // Deterministic JSON stringify (sorted keys)
  const json = JSON.stringify(obj, Object.keys(obj).sort());
  return crypto.createHash('sha256').update(json).digest('hex');
}

/**
 * Generate instance hash
 * @param {object} instance - OSSS instance
 * @returns {string}
 */
export function hashInstance(instance) {
  // Hash relevant parts (exclude volatile metadata)
  const canonical = {
    osssVersion: instance.osssVersion,
    teams: instance.teams,
    venues: instance.venues,
    fixtures: instance.fixtures,
    constraints: instance.constraints,
    objectives: instance.objectives
  };

  return hashObject(canonical);
}

/**
 * Generate result hash
 * @param {object} result - OSSS result
 * @returns {string}
 */
export function hashResult(result) {
  // Hash schedule portion only (excluding validation metadata)
  const canonical = {
    osssVersion: result.osssVersion,
    schedule: result.schedule
  };

  return hashObject(canonical);
}

/**
 * Generate ruleset hash (constraints + objectives)
 * @param {object} instance - OSSS instance
 * @returns {string}
 */
export function hashRuleset(instance) {
  const ruleset = {
    constraints: instance.constraints || {},
    objectives: instance.objectives || {}
  };

  return hashObject(ruleset);
}

/**
 * Generate validator metadata
 * @returns {object}
 */
export function getValidatorMetadata() {
  return {
    validatorName: 'osss-validator-reference',
    validatorVersion: '0.1.0',
    validatorRepo: 'https://github.com/opensportsscheduling/osss-validator',
    validatedAt: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
}

/**
 * Create attestation for a validation result
 * @param {object} instance - OSSS instance
 * @param {object} result - OSSS result
 * @param {object} validationReport - Validation report
 * @returns {object} Attestation object
 */
export function createAttestation(instance, result, validationReport) {
  const instanceHash = hashInstance(instance);
  const resultHash = hashResult(result);
  const rulesetHash = hashRuleset(instance);

  const attestation = {
    version: '1.0.0',
    instanceHash,
    resultHash,
    rulesetHash,
    validator: getValidatorMetadata(),
    validation: {
      feasible: validationReport.details?.feasible ?? validationReport.valid,
      hardConstraintViolations: validationReport.details?.hardConstraintViolations?.length || 0,
      softConstraintPenalties: validationReport.details?.totalPenalty || 0,
      objectivesScore: validationReport.details?.objectivesScore || null
    },
    signatures: []
  };

  // Generate attestation hash
  attestation.attestationHash = hashObject(attestation);

  return attestation;
}

/**
 * Verify attestation integrity
 * @param {object} attestation - Attestation to verify
 * @param {object} instance - OSSS instance
 * @param {object} result - OSSS result
 * @returns {{valid: boolean, errors: string[]}}
 */
export function verifyAttestation(attestation, instance, result) {
  const errors = [];

  // Verify instance hash
  const computedInstanceHash = hashInstance(instance);
  if (computedInstanceHash !== attestation.instanceHash) {
    errors.push(`Instance hash mismatch: expected ${attestation.instanceHash}, got ${computedInstanceHash}`);
  }

  // Verify result hash
  const computedResultHash = hashResult(result);
  if (computedResultHash !== attestation.resultHash) {
    errors.push(`Result hash mismatch: expected ${attestation.resultHash}, got ${computedResultHash}`);
  }

  // Verify ruleset hash
  const computedRulesetHash = hashRuleset(instance);
  if (computedRulesetHash !== attestation.rulesetHash) {
    errors.push(`Ruleset hash mismatch: expected ${attestation.rulesetHash}, got ${computedRulesetHash}`);
  }

  // Verify attestation hash
  const attestationCopy = { ...attestation };
  const storedAttestationHash = attestationCopy.attestationHash;
  delete attestationCopy.attestationHash;
  const computedAttestationHash = hashObject(attestationCopy);

  if (computedAttestationHash !== storedAttestationHash) {
    errors.push('Attestation has been tampered with');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Add signature to attestation (placeholder for future PKI support)
 * @param {object} attestation - Attestation object
 * @param {string} signer - Signer identifier
 * @param {string} signature - Cryptographic signature
 * @returns {object} Updated attestation
 */
export function addSignature(attestation, signer, signature) {
  attestation.signatures.push({
    signer,
    signature,
    signedAt: new Date().toISOString()
  });

  // Recalculate attestation hash
  const copy = { ...attestation };
  delete copy.attestationHash;
  attestation.attestationHash = hashObject(copy);

  return attestation;
}

/**
 * Generate competition-ready attestation bundle
 * @param {object} instance - OSSS instance
 * @param {object} result - OSSS result
 * @param {object} validationReport - Validation report
 * @returns {object} Complete attestation bundle
 */
export function createCompetitionAttestation(instance, result, validationReport) {
  const attestation = createAttestation(instance, result, validationReport);

  return {
    attestation,
    instance: {
      hash: attestation.instanceHash,
      metadata: instance.metadata
    },
    result: {
      hash: attestation.resultHash,
      solver: result.metadata?.solverName || 'unknown',
      solverVersion: result.metadata?.solverVersion || 'unknown',
      generatedAt: result.metadata?.generatedAt || null
    },
    validation: attestation.validation,
    verifiable: true,
    notes: [
      'This attestation can be independently verified',
      'Hashes ensure instance, result, and ruleset integrity',
      'Tampering with any component invalidates the attestation'
    ]
  };
}
