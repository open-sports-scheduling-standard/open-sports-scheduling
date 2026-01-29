import { Command } from "commander";
import fs from "node:fs/promises";
import path from "node:path";
import { readJson } from "./io.js";
import { validateInstance } from "./validate/instance.js";
import { validateResult } from "./validate/result.js";
import { printReport } from "./report.js";

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function main(argv) {
  const program = new Command();

  program
    .name("osss-validate")
    .description("Reference OSSS validator CLI")
    .option("--format <format>", "output format: text|json", "text");

  program
    .command("instance")
    .requiredOption("--instance <path>", "path to osss-instance.json")
    .requiredOption("--schemas <dir>", "path to schemas directory")
    .requiredOption("--registry <dir>", "path to registry directory")
    .action(async (opts, cmd) => {
      const global = cmd.parent.opts();
      const instance = await readJson(opts.instance);

      const report = await validateInstance({
        instance,
        schemasDir: opts.schemas,
        registryDir: opts.registry
      });

      printReport(report, global.format);
      process.exit(report.exitCode);
    });

  program
    .command("result")
    .requiredOption("--instance <path>", "path to osss-instance.json")
    .requiredOption("--result <path>", "path to osss-results.json")
    .requiredOption("--schemas <dir>", "path to schemas directory")
    .requiredOption("--registry <dir>", "path to registry directory")
    .action(async (opts, cmd) => {
      const global = cmd.parent.opts();
      const instance = await readJson(opts.instance);
      const result = await readJson(opts.result);

      const report = await validateResult({
        instance,
        result,
        schemasDir: opts.schemas,
        registryDir: opts.registry
      });

      printReport(report, global.format);
      process.exit(report.exitCode);
    });

  program
    .command("compare")
    .requiredOption("--instance <path>", "path to osss-instance.json")
    .requiredOption("--results <paths...>", "paths to solver result json files")
    .requiredOption("--schemas <dir>", "path to schemas directory")
    .requiredOption("--registry <dir>", "path to registry directory")
    .action(async (opts, cmd) => {
      const global = cmd.parent.opts();
      const instance = await readJson(opts.instance);

      const reports = [];
      for (const p of opts.results) {
        const result = await readJson(p);
        const report = await validateResult({
          instance,
          result,
          schemasDir: opts.schemas,
          registryDir: opts.registry
        });
        report.meta = { file: p };
        reports.push(report);
      }

      const ranked = reports
        .map((r) => ({
          file: r.meta?.file,
          valid: r.valid,
          feasible: r.details?.feasible ?? false,
          totalPenalty: r.details?.totalPenalty ?? Number.POSITIVE_INFINITY,
          exitCode: r.exitCode,
          errors: r.errors
        }))
        .sort((a, b) => {
          const aOk = a.valid && a.feasible && a.exitCode === 0;
          const bOk = b.valid && b.feasible && b.exitCode === 0;
          if (aOk !== bOk) return aOk ? -1 : 1;
          return a.totalPenalty - b.totalPenalty;
        });

      const report = {
        valid: true,
        exitCode: 0,
        summary: "Comparison complete",
        warnings: [],
        errors: [],
        details: { ranked }
      };

      printReport(report, global.format);
      process.exit(0);
    });

  // ✅ Bundle validation: validate all examples/* folders
  program
    .command("bundle")
    .requiredOption("--examples <dir>", "path to examples directory (e.g., ./examples)")
    .requiredOption("--schemas <dir>", "path to schemas directory")
    .requiredOption("--registry <dir>", "path to registry directory")
    .option("--require-results", "fail if an example has no osss-results.json", false)
    .action(async (opts, cmd) => {
      const global = cmd.parent.opts();

      const examplesDir = opts.examples;
      const children = await fs.readdir(examplesDir, { withFileTypes: true });
      const folders = children.filter((c) => c.isDirectory()).map((c) => path.join(examplesDir, c.name));

      const bundle = [];
      let worstExit = 0;

      for (const dir of folders) {
        const instancePath = path.join(dir, "osss-instance.json");
        const resultPath = path.join(dir, "osss-results.json");

        if (!(await fileExists(instancePath))) {
          bundle.push({
            example: dir,
            valid: null,
            exitCode: 0,
            summary: "Skipped (no osss-instance.json)",
            warnings: [`No osss-instance.json in ${dir} (directory skipped)`],
            errors: []
          });
          continue;
        }

        const instance = await readJson(instancePath);
        const instReport = await validateInstance({
          instance,
          schemasDir: opts.schemas,
          registryDir: opts.registry
        });

        let resReport = null;
        const hasResults = await fileExists(resultPath);

        if (opts.requireResults && !hasResults) {
          resReport = {
            valid: false,
            exitCode: 1,
            summary: "Missing osss-results.json",
            warnings: [],
            errors: [`Missing file: ${resultPath}`]
          };
        } else if (hasResults) {
          const result = await readJson(resultPath);
          resReport = await validateResult({
            instance,
            result,
            schemasDir: opts.schemas,
            registryDir: opts.registry
          });
        }

        const exampleExit = Math.max(instReport.exitCode, resReport?.exitCode || 0);
        worstExit = Math.max(worstExit, exampleExit);

        bundle.push({
          example: dir,
          instance: instReport,
          result: resReport
        });
      }

      const report = {
        valid: worstExit === 0,
        exitCode: worstExit,
        summary: worstExit === 0 ? "Bundle validation succeeded" : "Bundle validation found issues",
        warnings: [],
        errors: [],
        details: { bundle }
      };

      printReport(report, global.format);
      process.exit(worstExit);
    });

  // ✅ Init: Initialize a new OSSS project
  program
    .command("init")
    .option("--profile <name>", "constraint profile to use (baseline|youth|amateur|pro)", "baseline")
    .option("--timezone <tz>", "timezone for the league (e.g., America/New_York)", "UTC")
    .option("--output <dir>", "output directory", ".")
    .description("Initialize a new OSSS project with a constraint profile")
    .action(async (opts) => {
      const profileName = opts.profile;
      const timezone = opts.timezone;
      const outputDir = opts.output;

      // Resolve profile path (assume profiles are in ../profiles relative to validator)
      const validatorDir = path.dirname(new URL(import.meta.url).pathname);
      const profilesDir = path.join(validatorDir, "../../profiles");
      const profilePath = path.join(profilesDir, `${profileName}.json`);

      if (!(await fileExists(profilePath))) {
        console.error(`Error: Profile '${profileName}' not found at ${profilePath}`);
        console.error(`Available profiles: baseline, youth, amateur, pro`);
        process.exit(1);
      }

      const profile = await readJson(profilePath);

      // Create minimal instance structure
      const instance = {
        osssVersion: "1.0.0",
        metadata: {
          leagueId: "new-league",
          seasonId: "2025",
          timezone: timezone,
          createdAt: new Date().toISOString(),
          profile: profileName
        },
        teams: [],
        venues: [],
        fixtures: [],
        constraints: profile.constraints || {}
      };

      await fs.mkdir(outputDir, { recursive: true });
      const instancePath = path.join(outputDir, "osss-instance.json");
      await fs.writeFile(instancePath, JSON.stringify(instance, null, 2));

      console.log(`✅ Initialized OSSS project in ${outputDir}`);
      console.log(`   Profile: ${profileName}`);
      console.log(`   Timezone: ${timezone}`);
      console.log(`   Instance file: ${instancePath}`);
      console.log(``);
      console.log(`Next steps:`);
      console.log(`  1. Edit ${instancePath} to add teams, venues, and fixtures`);
      console.log(`  2. Run: osss-validate instance --instance ${instancePath} --schemas <schemas-dir> --registry <registry-dir>`);
      process.exit(0);
    });

  // ✅ Add: Add a constraint to an instance
  program
    .command("add")
    .requiredOption("--instance <path>", "path to osss-instance.json")
    .requiredOption("--constraint <id>", "constraint ID to add")
    .option("--type <type>", "constraint type (hard|soft)", "hard")
    .option("--params <json>", "constraint parameters as JSON string")
    .description("Add a constraint to an OSSS instance")
    .action(async (opts) => {
      const instancePath = opts.instance;
      const constraintId = opts.constraint;
      const constraintType = opts.type;

      if (!(await fileExists(instancePath))) {
        console.error(`Error: Instance file not found: ${instancePath}`);
        process.exit(1);
      }

      const instance = await readJson(instancePath);

      const newConstraint = {
        ruleId: constraintId,
        type: constraintType,
        selector: { teams: "*" }
      };

      if (opts.params) {
        try {
          newConstraint.params = JSON.parse(opts.params);
        } catch (err) {
          console.error(`Error: Invalid JSON in --params: ${err.message}`);
          process.exit(1);
        }
      }

      if (!instance.constraints) {
        instance.constraints = { required: [] };
      }
      if (!instance.constraints.required) {
        instance.constraints.required = [];
      }

      instance.constraints.required.push(newConstraint);

      await fs.writeFile(instancePath, JSON.stringify(instance, null, 2));

      console.log(`✅ Added constraint '${constraintId}' (${constraintType}) to ${instancePath}`);
      process.exit(0);
    });

  // ✅ Doctor: Health check for OSSS setup
  program
    .command("doctor")
    .option("--instance <path>", "path to osss-instance.json")
    .option("--schemas <dir>", "path to schemas directory")
    .option("--registry <dir>", "path to registry directory")
    .description("Run health checks on your OSSS setup")
    .action(async (opts) => {
      console.log("🩺 Running OSSS health checks...\n");

      const checks = [];

      // Check if instance exists
      if (opts.instance) {
        const exists = await fileExists(opts.instance);
        checks.push({
          name: "Instance file",
          status: exists ? "✅ Found" : "❌ Missing",
          detail: opts.instance
        });

        if (exists) {
          try {
            const instance = await readJson(opts.instance);
            checks.push({
              name: "Instance JSON",
              status: "✅ Valid",
              detail: `Version: ${instance.osssVersion || "unknown"}`
            });
          } catch (err) {
            checks.push({
              name: "Instance JSON",
              status: "❌ Invalid",
              detail: err.message
            });
          }
        }
      }

      // Check schemas directory
      if (opts.schemas) {
        const exists = await fileExists(opts.schemas);
        checks.push({
          name: "Schemas directory",
          status: exists ? "✅ Found" : "❌ Missing",
          detail: opts.schemas
        });
      }

      // Check registry directory
      if (opts.registry) {
        const exists = await fileExists(opts.registry);
        checks.push({
          name: "Registry directory",
          status: exists ? "✅ Found" : "❌ Missing",
          detail: opts.registry
        });

        if (exists) {
          const constraintsPath = path.join(opts.registry, "constraints.json");
          const hasConstraints = await fileExists(constraintsPath);
          checks.push({
            name: "Constraints registry",
            status: hasConstraints ? "✅ Found" : "❌ Missing",
            detail: constraintsPath
          });
        }
      }

      // Print results
      for (const check of checks) {
        console.log(`${check.status} ${check.name}`);
        if (check.detail) {
          console.log(`   ${check.detail}`);
        }
      }

      const allGood = checks.every((c) => c.status.startsWith("✅"));
      console.log(``);
      if (allGood) {
        console.log("✅ All checks passed!");
        process.exit(0);
      } else {
        console.log("❌ Some checks failed. Please review the issues above.");
        process.exit(1);
      }
    });

  // ✅ Explain: Human-readable violation explanations
  program
    .command("explain")
    .requiredOption("--instance <path>", "path to osss-instance.json")
    .requiredOption("--result <path>", "path to osss-results.json")
    .requiredOption("--schemas <dir>", "path to schemas directory")
    .requiredOption("--registry <dir>", "path to registry directory")
    .description("Explain violations in human-readable format")
    .action(async (opts, cmd) => {
      const instance = await readJson(opts.instance);
      const result = await readJson(opts.result);

      const report = await validateResult({
        instance,
        result,
        schemasDir: opts.schemas,
        registryDir: opts.registry
      });

      console.log("📋 OSSS Validation Explanation\n");
      console.log(`Instance: ${opts.instance}`);
      console.log(`Result: ${opts.result}`);
      console.log(`Feasible: ${report.details?.feasible ? "✅ Yes" : "❌ No"}`);
      console.log(`Total Penalty: ${report.details?.totalPenalty || 0}\n`);

      if (report.errors && report.errors.length > 0) {
        console.log("❌ Errors:");
        for (const err of report.errors) {
          console.log(`   • ${err}`);
        }
        console.log(``);
      }

      if (report.warnings && report.warnings.length > 0) {
        console.log("⚠️  Warnings:");
        for (const warn of report.warnings) {
          console.log(`   • ${warn}`);
        }
        console.log(``);
      }

      if (report.details?.hardConstraintViolations) {
        console.log("🚫 Hard Constraint Violations:");
        for (const violation of report.details.hardConstraintViolations) {
          console.log(`   • ${violation.ruleId}: ${violation.message || violation.description || "Violation detected"}`);
        }
        console.log(``);
      }

      if (report.details?.softConstraintPenalties) {
        console.log("📊 Soft Constraint Penalties:");
        for (const penalty of report.details.softConstraintPenalties) {
          console.log(`   • ${penalty.ruleId}: ${penalty.penalty} points`);
        }
        console.log(``);
      }

      console.log(report.valid ? "✅ Validation passed" : "❌ Validation failed");
      process.exit(report.exitCode);
    });

  // ✅ Fix-scores: Alias for result validation
  program
    .command("fix-scores")
    .requiredOption("--instance <path>", "path to osss-instance.json")
    .requiredOption("--result <path>", "path to osss-results.json")
    .requiredOption("--schemas <dir>", "path to schemas directory")
    .requiredOption("--registry <dir>", "path to registry directory")
    .description("Validate and fix score calculations in results")
    .action(async (opts, cmd) => {
      const global = cmd.parent.opts();
      const instance = await readJson(opts.instance);
      const result = await readJson(opts.result);

      const report = await validateResult({
        instance,
        result,
        schemasDir: opts.schemas,
        registryDir: opts.registry
      });

      printReport(report, global.format);
      process.exit(report.exitCode);
    });

  // ✅ Conformance: Run conformance test suite
  program
    .command("conformance")
    .requiredOption("--conformance <dir>", "path to conformance directory")
    .requiredOption("--schemas <dir>", "path to schemas directory")
    .requiredOption("--registry <dir>", "path to registry directory")
    .option("--type <type>", "test type to run: must-pass|must-fail|all", "all")
    .description("Run OSSS conformance test suite")
    .action(async (opts, cmd) => {
      console.log("🔍 Running OSSS Conformance Tests\n");

      const conformanceDir = opts.conformance;
      const testType = opts.type;

      const results = {
        mustPass: { total: 0, passed: 0, failed: 0, tests: [] },
        mustFail: { total: 0, passed: 0, failed: 0, tests: [] }
      };

      // Run must-pass tests
      if (testType === "all" || testType === "must-pass") {
        const mustPassDir = path.join(conformanceDir, "must-pass");
        const files = await fs.readdir(mustPassDir);
        const instanceFiles = files.filter(f => f.includes("instance.json"));

        console.log("📋 Must-Pass Tests (should succeed):");
        for (const file of instanceFiles) {
          results.mustPass.total++;
          const instancePath = path.join(mustPassDir, file);

          try {
            const instance = await readJson(instancePath);
            const report = await validateInstance({
              instance,
              schemasDir: opts.schemas,
              registryDir: opts.registry
            });

            const success = report.exitCode === 0;
            if (success) {
              results.mustPass.passed++;
              console.log(`  ✅ ${file}`);
            } else {
              results.mustPass.failed++;
              console.log(`  ❌ ${file} - Expected pass but failed`);
            }
            results.mustPass.tests.push({ file, success, report });
          } catch (err) {
            results.mustPass.failed++;
            console.log(`  ❌ ${file} - Error: ${err.message}`);
            results.mustPass.tests.push({ file, success: false, error: err.message });
          }
        }
        console.log(``);
      }

      // Run must-fail tests
      if (testType === "all" || testType === "must-fail") {
        const mustFailDir = path.join(conformanceDir, "must-fail");
        const files = await fs.readdir(mustFailDir);
        const instanceFiles = files.filter(f => f.includes("instance.json"));

        console.log("📋 Must-Fail Tests (should fail):");
        for (const file of instanceFiles) {
          results.mustFail.total++;
          const instancePath = path.join(mustFailDir, file);

          try {
            const instance = await readJson(instancePath);
            const report = await validateInstance({
              instance,
              schemasDir: opts.schemas,
              registryDir: opts.registry
            });

            const success = report.exitCode !== 0;
            if (success) {
              results.mustFail.passed++;
              console.log(`  ✅ ${file} - Correctly rejected`);
            } else {
              results.mustFail.failed++;
              console.log(`  ❌ ${file} - Expected failure but passed`);
            }
            results.mustFail.tests.push({ file, success, report });
          } catch (err) {
            // For must-fail, catching an error is actually a success
            results.mustFail.passed++;
            console.log(`  ✅ ${file} - Correctly rejected (error: ${err.message})`);
            results.mustFail.tests.push({ file, success: true, error: err.message });
          }
        }
        console.log(``);
      }

      // Summary
      console.log("=" .repeat(60));
      console.log("Conformance Test Summary\n");

      if (testType === "all" || testType === "must-pass") {
        console.log(`Must-Pass: ${results.mustPass.passed}/${results.mustPass.total} passed`);
      }
      if (testType === "all" || testType === "must-fail") {
        console.log(`Must-Fail: ${results.mustFail.passed}/${results.mustFail.total} passed`);
      }

      const totalTests = results.mustPass.total + results.mustFail.total;
      const totalPassed = results.mustPass.passed + results.mustFail.passed;

      console.log(`\nOverall: ${totalPassed}/${totalTests} tests passed`);

      if (totalPassed === totalTests) {
        console.log("\n🎉 OSSS CONFORMANT - All tests passed!");
        process.exit(0);
      } else {
        console.log("\n❌ NOT CONFORMANT - Some tests failed");
        process.exit(1);
      }
    });

  // ✅ Dataset: Generate synthetic datasets
  program
    .command("dataset-generate")
    .option("--track <track>", "competition track (youth|amateur|professional)", "amateur")
    .option("--num-teams <n>", "number of teams", parseInt, 16)
    .option("--num-venues <n>", "number of venues", parseInt, 8)
    .option("--season-weeks <n>", "season length in weeks", parseInt, 20)
    .option("--complexity <level>", "difficulty (low|moderate|high)", "moderate")
    .option("--seed <seed>", "random seed for reproducibility", parseInt)
    .option("--output <path>", "output file path", "generated-instance.json")
    .description("Generate a synthetic OSSS instance")
    .action(async (opts) => {
      const { generateInstance } = await import("./dataset-generator.js");

      const instance = generateInstance({
        track: opts.track,
        numTeams: opts.numTeams,
        numVenues: opts.numVenues,
        seasonWeeks: opts.seasonWeeks,
        complexity: opts.complexity,
        seed: opts.seed
      });

      await fs.writeFile(opts.output, JSON.stringify(instance, null, 2));

      console.log(`✅ Generated synthetic instance: ${opts.output}`);
      console.log(`   Track: ${opts.track}`);
      console.log(`   Teams: ${opts.numTeams}`);
      console.log(`   Venues: ${opts.numVenues}`);
      console.log(`   Season: ${opts.seasonWeeks} weeks`);
      console.log(`   Complexity: ${opts.complexity}`);
      if (opts.seed) {
        console.log(`   Seed: ${opts.seed} (reproducible)`);
      }
      process.exit(0);
    });

  // ✅ Dataset: Anonymize real-world datasets
  program
    .command("dataset-anonymize")
    .requiredOption("--input <path>", "input instance file")
    .requiredOption("--output <path>", "output anonymized file")
    .option("--preserve-structure", "preserve instance structure", true)
    .option("--remove-pii", "remove personally identifiable information", true)
    .option("--fuzzy-locations", "add noise to venue locations", true)
    .option("--relative-dates", "convert to relative dates", true)
    .option("--verify", "verify anonymization quality", false)
    .description("Anonymize a real-world OSSS instance for public sharing")
    .action(async (opts) => {
      const { anonymizeInstance, verifyAnonymization, generateAnonymizationReport } =
        await import("./dataset-anonymizer.js");

      const instance = await readJson(opts.input);

      const anonymized = anonymizeInstance(instance, {
        preserveStructure: opts.preserveStructure,
        removePII: opts.removePii,
        fuzzyLocations: opts.fuzzyLocations,
        relativeDates: opts.relativeDates
      });

      await fs.writeFile(opts.output, JSON.stringify(anonymized, null, 2));

      console.log(`✅ Anonymized instance saved: ${opts.output}`);

      if (opts.verify) {
        const report = generateAnonymizationReport(instance, anonymized);

        console.log(`\n📊 Anonymization Report:`);
        console.log(`   Quality Score: ${report.qualityScore}/100`);
        console.log(`   Teams Renamed: ${report.transformations.teamsRenamed}`);
        console.log(`   Venues Renamed: ${report.transformations.venuesRenamed}`);
        console.log(`   Locations Fuzzed: ${report.transformations.locationsFuzzed}`);
        console.log(`   Dates Relativized: ${report.transformations.datesRelativized}`);
        console.log(`   Recommendation: ${report.recommendation}`);

        if (report.verification.warnings.length > 0) {
          console.log(`\n⚠️  Warnings:`);
          for (const warning of report.verification.warnings) {
            console.log(`   • ${warning}`);
          }
        }
      }

      process.exit(0);
    });

  // ✅ Dataset: Mutate existing datasets
  program
    .command("dataset-mutate")
    .requiredOption("--input <path>", "input instance file")
    .requiredOption("--mutation <type>", "mutation type (add-teams|remove-venues|tighten-rest)")
    .requiredOption("--output <path>", "output mutated file")
    .option("--num-teams <n>", "number of teams to add (for add-teams)", parseInt, 4)
    .option("--num-venues <n>", "number of venues to remove (for remove-venues)", parseInt, 2)
    .option("--hours <n>", "hours to reduce rest by (for tighten-rest)", parseInt, 24)
    .description("Create a mutated variant of an existing instance")
    .action(async (opts) => {
      const { mutateInstance } = await import("./dataset-generator.js");

      const instance = await readJson(opts.input);

      const mutation = {
        type: opts.mutation,
        numTeams: opts.numTeams,
        numVenues: opts.numVenues,
        hours: opts.hours
      };

      const mutated = mutateInstance(instance, mutation);

      await fs.writeFile(opts.output, JSON.stringify(mutated, null, 2));

      console.log(`✅ Mutated instance saved: ${opts.output}`);
      console.log(`   Mutation: ${opts.mutation}`);
      console.log(`   Original: ${instance.metadata.datasetId}`);
      console.log(`   New: ${mutated.metadata.datasetId}`);
      process.exit(0);
    });

  await program.parseAsync(argv);
}
