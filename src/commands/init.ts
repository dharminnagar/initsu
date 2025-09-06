import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { ConfigurationManager } from '../utils/configuration-manager';
import { TemplateManager } from '../utils/template-manager';

export interface InitOptions {
  template?: string;
  skipInstall?: boolean;
  git?: boolean;
}

export async function initCommand(projectName?: string, options: InitOptions = {}) {
  console.log(chalk.blue.bold('\n🚀 Next.js CLI Configurator\n'));

  try {
    // Get project name if not provided
    if (!projectName) {
      const namePrompt = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Project name is required';
            }
            if (!/^[a-z0-9-_]+$/i.test(input)) {
              return 'Project name can only contain letters, numbers, hyphens, and underscores';
            }
            return true;
          }
        }
      ]);
      projectName = namePrompt.projectName;
    }

    // Get Next.js initialization options
    const nextjsOptions = await getNextjsOptions();
    
    // Create Next.js app
    await createNextjsApp(projectName!, nextjsOptions, options);

    // Get additional configuration options
    const configOptions = await getConfigurationOptions();

    // Apply configurations
    const configManager = new ConfigurationManager(projectName!);
    await configManager.applyConfigurations(configOptions);

    // Apply template
    const templateManager = new TemplateManager(projectName!);
    await templateManager.applyTemplate(options.template || 'default');

    console.log(chalk.green.bold(`\n✅ Project ${projectName} has been successfully created and configured!\n`));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan('  npm run dev'));

  } catch (error) {
    console.error(chalk.red.bold('\n❌ Error creating project:'), error);
    process.exit(1);
  }
}

async function getNextjsOptions() {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Would you like to use TypeScript?',
      default: true
    },
    {
      type: 'confirm',
      name: 'eslint',
      message: 'Would you like to use ESLint?',
      default: true
    },
    {
      type: 'confirm',
      name: 'tailwind',
      message: 'Would you like to use Tailwind CSS?',
      default: true
    },
    {
      type: 'confirm',
      name: 'srcDir',
      message: 'Would you like to use `src/` directory?',
      default: true
    },
    {
      type: 'confirm',
      name: 'appRouter',
      message: 'Would you like to use App Router? (recommended)',
      default: true
    },
    {
      type: 'confirm',
      name: 'importAlias',
      message: 'Would you like to customize the default import alias (@/*)?',
      default: false
    }
  ]);

  if (answers.importAlias) {
    const aliasAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'customAlias',
        message: 'What import alias would you like configured?',
        default: '@/*'
      }
    ]);
    answers.customAlias = aliasAnswer.customAlias;
  }

  return answers;
}

async function getConfigurationOptions() {
  return await inquirer.prompt([
    {
      type: 'confirm',
      name: 'prettier',
      message: 'Would you like to configure Prettier?',
      default: true
    },
    {
      type: 'confirm',
      name: 'husky',
      message: 'Would you like to set up Husky for git hooks?',
      default: true
    },
    {
      type: 'confirm',
      name: 'shadcn',
      message: 'Would you like to install shadcn/ui?',
      default: true
    }
  ]);
}

async function createNextjsApp(projectName: string, nextjsOptions: any, options: InitOptions) {
  const spinner = ora('Creating Next.js application...').start();

  const args = ['create-next-app@latest', projectName];

  // Add flags based on user choices
  if (nextjsOptions.typescript) args.push('--typescript');
  else args.push('--javascript');

  if (nextjsOptions.eslint) args.push('--eslint');
  else args.push('--no-eslint');

  if (nextjsOptions.tailwind) args.push('--tailwind');
  else args.push('--no-tailwind');

  if (nextjsOptions.srcDir) args.push('--src-dir');
  else args.push('--no-src-dir');

  if (nextjsOptions.appRouter) args.push('--app');
  else args.push('--no-app');

  if (nextjsOptions.customAlias) args.push('--import-alias', nextjsOptions.customAlias);

  return new Promise<void>((resolve, reject) => {
    const child = spawn('npx', args, {
      stdio: 'pipe',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        spinner.succeed('Next.js application created successfully');
        resolve();
      } else {
        spinner.fail('Failed to create Next.js application');
        reject(new Error(`create-next-app exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      spinner.fail('Failed to create Next.js application');
      reject(error);
    });
  });
}
