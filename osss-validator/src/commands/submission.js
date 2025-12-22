import fs from "fs";
import { buildAjv, formatAjvErrors } from "../lib/schema.js";

export async function validateSubmission({ submission, schemasDir }) {
  const ajv = await buildAjv(schemasDir);

  const schema =
    ajv.getSchema("https://opensportsscheduling.org/schemas/osss-submission.schema.json") ||
    ajv.getSchema("osss-submission.schema.json");

  if (!schema) {
    throw new Error("Submission schema not found");
  }

  const data = JSON.parse(fs.readFileSync(submission, "utf8"));
  const valid = schema(data);

  if (!valid) {
    console.error("❌ Submission schema validation failed");
    console.error(formatAjvErrors(schema.errors));
    process.exit(1);
  }

  console.log("✅ Submission schema valid");
}
