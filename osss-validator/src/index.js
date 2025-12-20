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
            valid: false,
            exitCode: 1,
            summary: "Missing osss-instance.json",
            warnings: [],
            errors: [`Missing file: ${instancePath}`]
          });
          worstExit = Math.max(worstExit, 1);
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

  await program.parseAsync(argv);
}
