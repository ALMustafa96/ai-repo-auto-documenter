#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs";
import chalk from "chalk";
import ora from "ora";
import dotenv from "dotenv";

import { scanRepository } from "../src/fileScanner.js";
import { buildPrompt } from "../src/promptBuilder.js";
import { generateReadme } from "../src/generator.js";

dotenv.config();

const program = new Command();

program
  .name("ai-doc")
  .description("Automatically generate a professional README.md for a repository using OpenAI")
  .argument("<directory>", "path to the target repository")
  .option("-o, --output <filename>", "output filename", "README.md")
  .action(async (directory, options) => {
    const rootDir = path.resolve(directory);

    if (!fs.existsSync(rootDir) || !fs.statSync(rootDir).isDirectory()) {
      console.error(chalk.red(`❌ Error: "${rootDir}" is not a valid directory.`));
      process.exit(1);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error(
        chalk.red("❌ Error: OPENAI_API_KEY is not set. Add it to a .env file or export it in your shell.")
      );
      process.exit(1);
    }

    const spinner = ora("Scanning repository...").start();

    try {
      const { structureTree, fileContents, totalFilesScanned } = await scanRepository(rootDir);
      spinner.succeed(`Scanned repository (${totalFilesScanned} relevant files found).`);

      const projectName = path.basename(rootDir);
      const { systemPrompt, userPrompt } = buildPrompt({
        structureTree,
        fileContents,
        projectName,
      });

      const genSpinner = ora("Generating README.md with OpenAI...").start();
      const readmeContent = await generateReadme({ systemPrompt, userPrompt, apiKey });
      genSpinner.succeed("README content generated.");

      const outputPath = path.join(rootDir, options.output);
      fs.writeFileSync(outputPath, readmeContent, "utf-8");

      console.log(chalk.green(`\n✅ Success! README saved at: ${outputPath}\n`));
    } catch (err) {
      spinner.fail("Something went wrong.");
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });

program.parse();
