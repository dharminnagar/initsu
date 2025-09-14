#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/init";
import { version } from "../package.json";

const program = new Command();

program
  .name("initsu")
  .description("A CLI tool to initialize and configure projects")
  .version(version)
  .argument("[project-name]", "Name of the project directory")
  .option("-t, --template <template>", "Template to use", "default")
  .option("--skip-install", "Skip package installation")
  .option("--no-git", "Skip git initialization")
  .action(initCommand);

program.parse();
