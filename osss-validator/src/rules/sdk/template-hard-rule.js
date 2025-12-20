/**
 * TEMPLATE: Hard Constraint Rule
 *
 * Use this template to create a new hard constraint rule.
 * Hard constraints MUST be satisfied for a schedule to be feasible.
 *
 * Rule ID: [your_rule_id]
 * Category: [feasibility|time|venue|travel|fairness|broadcast]
 * Description: [Brief description of what this rule enforces]
 */

import { validateParams, createViolation, getFixturesForTeam, parseDate } from './helpers.js';

/**
 * Parameter schema for this rule
 * Define the parameters your rule accepts and their validation rules
 */
const PARAM_SCHEMA = {
  required: [],  // e.g., ['min_hours', 'max_count']
  properties: {
    // Example:
    // min_hours: {
    //   type: 'number',
    //   minimum: 0,
    //   description: 'Minimum hours between fixtures'
    // }
  }
};

/**
 * Validate the hard constraint
 *
 * @param {object} instance - The OSSS instance (teams, venues, fixtures, constraints)
 * @param {object} result - The OSSS result (schedule, assignments)
 * @param {object} constraint - The constraint definition (params, selector)
 * @returns {Array<object>} Array of violations (empty if constraint is satisfied)
 */
export function validate(instance, result, constraint) {
  const violations = [];

  // 1. Validate parameters
  const paramValidation = validateParams(constraint.params || {}, PARAM_SCHEMA);
  if (!paramValidation.valid) {
    for (const error of paramValidation.errors) {
      violations.push(createViolation(
        'your_rule_id',
        `Parameter error: ${error}`,
        { constraint }
      ));
    }
    return violations;
  }

  // 2. Extract parameters
  // const { min_hours } = constraint.params || {};

  // 3. Get relevant entities (teams, venues, or fixtures)
  // Example: Check each team's fixtures
  // for (const team of instance.teams) {
  //   const fixtures = getFixturesForTeam(result.schedule?.fixtures || [], team.id);
  //
  //   // Your validation logic here
  //   // If violation found:
  //   violations.push(createViolation(
  //     'your_rule_id',
  //     'Description of violation',
  //     { teamId: team.id, fixtureId: fixture.id }
  //   ));
  // }

  // TODO: Implement your constraint validation logic
  // Return empty array if no violations

  return violations;
}

/**
 * Export metadata about this rule (optional but recommended)
 */
export const metadata = {
  ruleId: 'your_rule_id',
  category: 'feasibility',  // or time, venue, travel, fairness, broadcast
  type: 'hard',
  description: 'Brief description of what this rule enforces',
  appliesTo: 'team',  // or venue, fixture
  paramsSchema: PARAM_SCHEMA,
  examples: [
    {
      params: {},
      description: 'Example usage of this rule'
    }
  ]
};

/**
 * Default export
 */
export default { validate, metadata };
