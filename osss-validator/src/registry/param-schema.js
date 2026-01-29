export function buildParamsSchemaFromRegistryEntry(entry) {
  // Registry formats vary; support a few:
  // - entry.parameters: { foo: "number", bar: "string" }
  // - entry.params: { ... } (same)
  // - entry.parametersSchema: { ... } (already JSON Schema)
  const directSchema = entry?.parametersSchema || entry?.paramsSchema;
  if (directSchema && typeof directSchema === "object") {
    return {
      type: "object",
      additionalProperties: true,
      ...directSchema,
    };
  }

  const parameters = entry?.parameters || entry?.params;
  if (!parameters || typeof parameters !== "object") {
    // No param contract in registry → allow anything
    return { type: "object", additionalProperties: true };
  }

  // Simple type mapping if registry uses strings
  const properties = {};
  const required = [];

  for (const [k, v] of Object.entries(parameters)) {
    if (typeof v === "string") {
      properties[k] = mapSimpleType(v);
    } else if (v && typeof v === "object") {
      // If registry has richer structure, treat as schema-ish
      properties[k] = normalizeSchemaish(v);
      if (v.required === true) required.push(k);
    } else {
      properties[k] = {};
    }
  }

  return {
    type: "object",
    properties,
    required,
    additionalProperties: true,
  };
}

function mapSimpleType(t) {
  const s = String(t).toLowerCase();
  if (s.includes("int") || s.includes("number") || s.includes("float")) return { type: "number" };
  if (s.includes("bool")) return { type: "boolean" };
  if (s.includes("array") || s.includes("list")) return { type: "array" };
  if (s.includes("object") || s.includes("map")) return { type: "object" };
  return { type: "string" };
}

function normalizeSchemaish(obj) {
  // If it already looks like JSON Schema, keep it
  if (obj.type || obj.properties || obj.items || obj.anyOf || obj.oneOf) return obj;

  // Common registry shape: { type: "number", description: "...", default: ... }
  const out = {};
  if (obj.kind) out.type = mapSimpleType(obj.kind).type;
  if (obj.description) out.description = obj.description;
  if (Object.prototype.hasOwnProperty.call(obj, "default")) out.default = obj.default;
  return Object.keys(out).length ? out : {};
}
