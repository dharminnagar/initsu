#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { version } from '../package.json';

const program = new Command();

program
  .name('nextjs-init')
  .description('A CLI tool to initialize and configure Next.js repositories')
  .version(version);

program
  .command('init')
  .description('Initialize a new Next.js project with custom configurations')
  .argument('[project-name]', 'Name of the project directory')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('--skip-install', 'Skip package installation')
  .option('--no-git', 'Skip git initialization')
  .action(initCommand);

program.parse();
