/**
 * @typedef {Object} RuleContext
 * @property {any} instance
 * @property {any} result
 * @property {string} ruleId
 * @property {"hard"|"soft"} type
 * @property {any} selector
 * @property {any} params
 * @property {Object} registryEntry
 * @property {Function} warn
 */

/**
 * @typedef {Object} RuleEvaluation
 * @property {boolean} ok
 * @property {Array<{ruleId:string,type:"hard"|"soft",message:string,selector?:any,meta?:any}>} [violations]
 * @property {number} [penalty]
 * @property {any} [meta]
 */
export {};
