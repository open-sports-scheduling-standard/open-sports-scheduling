export function printReport(report, format = "text") {
  if (format === "json") {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const icon = report.valid ? "✔" : "✖";
  console.log(`${icon} ${report.summary}`);

  if (report.details?.totalPenalty !== undefined) {
    console.log(`Total penalty: ${report.details.totalPenalty}`);
  }

  if (report.warnings?.length) {
    console.log("\nWarnings:");
    for (const w of report.warnings) console.log(`- ${w}`);
  }

  if (report.errors?.length) {
    console.log("\nErrors:");
    for (const e of report.errors) console.log(`- ${e}`);
  }

  // Optional: show violations summary
  if (report.details?.hardViolations?.length) {
    console.log("\nHard constraint violations:");
    for (const v of report.details.hardViolations) console.log(`- ${v}`);
  }
}
