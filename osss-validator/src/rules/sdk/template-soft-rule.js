/**
 * TEMPLATE: Soft Constraint Rule
 *
 * Use this template to create a new soft constraint rule.
 * Soft constraints add penalties when violated but don't make a schedule infeasible.
 *
 * Rule ID: [your_rule_id]
 * Category: [time|venue|travel|fairness|broadcast]
 * Description: [Brief description of what this rule optimizes]
 */

import {
  validateParams,
  createPenalty,
  linearPenalty,
  quadraticPenalty,
  flatPenalty,
  getFixturesForTeam,
  parseDate
} from './helpers.js';

/**
 * Parameter schema for this rule
 * Define the parameters your rule accepts and their validation rules
 */
const PARAM_SCHEMA = {
  required: [],  // e.g., ['max_delta', 'penalty_weight']
  properties: {
    // Example:
    // max_delta: {
    //   type: 'integer',
    //   minimum: 0,
    //   description: 'Maximum allowable deviation'
    // },
    // penalty_weight: {
    //   type: 'number',
    //   minimum: 0,
    //   description: 'Penalty multiplier'
    // }
  }
};

/**
 * Default penalty model
 * Define how penalties are calculated for this rule
 */
const DEFAULT_PENALTY = {
  type: 'linear',  // or quadratic, exponential, flat
  perViolation: 10,
  description: 'Linear penalty per unit of violation'
};

/**
 * Calculate penalties for the soft constraint
 *
 * @param {object} instance - The OSSS instance (teams, venues, fixtures, constraints)
 * @param {object} result - The OSSS result (schedule, assignments)
 * @param {object} constraint - The constraint definition (params, selector, penalty)
 * @returns {Array<object>} Array of penalties
 */
export function calculate(instance, result, constraint) {
  const penalties = [];

  // 1. Validate parameters
  const paramValidation = validateParams(constraint.params || {}, PARAM_SCHEMA);
  if (!paramValidation.valid) {
    // Skip penalty calculation if params are invalid
    return penalties;
  }

  // 2. Extract parameters and penalty model
  // const { max_delta } = constraint.params || {};
  const penaltyModel = constraint.penalty || DEFAULT_PENALTY;
  const penaltyWeight = penaltyModel.perViolation || DEFAULT_PENALTY.perViolation;

  // 3. Get relevant entities (teams, venues, or fixtures)
  // Example: Check each team's schedule quality
  // for (const team of instance.teams) {
  //   const fixtures = getFixturesForTeam(result.schedule?.fixtures || [], team.id);
  //
  //   // Calculate violation amount
  //   const violation = 0;  // Your calculation here
  //
  //   if (violation > 0) {
  //     const penaltyAmount = linearPenalty(violation, penaltyWeight);
  //     penalties.push(createPenalty(
  //       'your_rule_id',
  //       penaltyAmount,
  //       `Violation description for ${team.id}`,
  //       { teamId: team.id, violation }
  //     ));
  //   }
  // }

  // TODO: Implement your penalty calculation logic
  // Return penalties array

  return penalties;
}

/**
 * Export metadata about this rule (optional but recommended)
 */
export const metadata = {
  ruleId: 'your_rule_id',
  category: 'fairness',  // or time, venue, travel, broadcast
  type: 'soft',
  description: 'Brief description of what this rule optimizes',
  appliesTo: 'team',  // or venue, fixture
  paramsSchema: PARAM_SCHEMA,
  defaultPenaltyModel: DEFAULT_PENALTY,
  examples: [
    {
      params: {},
      penalty: { perViolation: 10 },
      description: 'Example usage of this rule'
    }
  ],
  recommendedRanges: {
    // Example parameter ranges
    // max_delta: { youth: [1, 2], amateur: [2, 3], pro: [0, 1] }
  }
};

/**
 * Default export
 */
export default { calculate, metadata };
