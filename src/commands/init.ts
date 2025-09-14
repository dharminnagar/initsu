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
  packageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun';
  linter?: 'eslint' | 'biome' | 'none';
  turbopack?: boolean;
  empty?: boolean;
  api?: boolean;
}

export async function initCommand(projectName?: string, options: InitOptions = {}) {
  console.log(chalk.blue.bold('\n🚀 Next.js CLI Configurator\n'));

  try {
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
    const configManager = new ConfigurationManager(projectName!, nextjsOptions.packageManager || 'npm');
    await configManager.applyConfigurations(configOptions);

    // Apply template
    const templateManager = new TemplateManager(projectName!);
    await templateManager.applyTemplate(options.template || 'default');

    console.log(chalk.green.bold(`\n✅ Project ${projectName} has been successfully created and configured!\n`));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.cyan(`  cd ${projectName}`));
    
    const packageManager = nextjsOptions.packageManager || 'npm';
    const devCommand = packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`;
    console.log(chalk.cyan(`  ${devCommand}`));

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
      type: 'list',
      name: 'linter',
      message: 'Which linter would you like to use?',
      choices: [
        { name: 'ESLint', value: 'eslint' },
        { name: 'Biome', value: 'biome' },
        { name: 'None', value: 'none' }
      ],
      default: 'eslint'
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
      name: 'turbopack',
      message: 'Would you like to enable Turbopack for development?',
      default: false
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'pnpm', value: 'pnpm' },
        { name: 'Yarn', value: 'yarn' },
        { name: 'Bun', value: 'bun' }
      ],
      default: 'npm'
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
  if (nextjsOptions.typescript) args.push('--ts');
  else args.push('--js');
 
  if (nextjsOptions.linter === 'eslint') args.push('--eslint');
  else if (nextjsOptions.linter === 'biome') args.push('--biome');
  else if (nextjsOptions.linter === 'none') args.push('--no-linter');

  if (nextjsOptions.tailwind) args.push('--tailwind');
  else args.push('--no-tailwind');

  if (nextjsOptions.srcDir) args.push('--src-dir');
  else args.push('--no-src-dir');

  if (nextjsOptions.appRouter) args.push('--app');
  else args.push('--no-app');

  if (nextjsOptions.customAlias) args.push('--import-alias', nextjsOptions.customAlias);

  // Package manager selection
  if (nextjsOptions.packageManager) {
    switch (nextjsOptions.packageManager) {
      case 'npm':
        args.push('--use-npm');
        break;
      case 'pnpm':
        args.push('--use-pnpm');
        break;
      case 'yarn':
        args.push('--use-yarn');
        break;
      case 'bun':
        args.push('--use-bun');
        break;
    }
  }

  // Additional options
  if (options.skipInstall) args.push('--skip-install');
  if (options.git === false) args.push('--disable-git');
  if (nextjsOptions.turbopack) args.push('--turbopack');
  else args.push('--no-turbopack'); 
  if (options.empty) args.push('--empty');
  if (options.api) args.push('--api');
  
  // Add --yes flag to skip all interactive prompts
  args.push('--yes');

  return new Promise<void>((resolve, reject) => {
    const child = spawn('npx', args, {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code, signal) => {
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

    // Add a timeout to prevent hanging
    const timeout = setTimeout(() => {
      child.kill();
      spinner.fail('Next.js application creation timed out');
      reject(new Error('Process timed out after 5 minutes'));
    }, 5 * 60 * 1000); // 5 minutes

    child.on('close', () => {
      clearTimeout(timeout);
    });
  });
}