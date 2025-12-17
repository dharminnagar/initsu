import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { spawn } from "child_process";
import path from "path";
import fs from "fs-extra";
import { ConfigurationManager } from "../utils/configuration-manager";
import { TemplateManager } from "../utils/template-manager";
import figlet from "figlet";

export interface InitOptions {
  template?: string;
  skipInstall?: boolean;
  git?: boolean;
  packageManager?: "npm" | "pnpm" | "yarn" | "bun";
  linter?: "eslint" | "biome" | "none";
  turbopack?: boolean;
  empty?: boolean;
  api?: boolean;
}

export interface TypescriptOptions {
  packageManager: "npm" | "pnpm" | "yarn" | "bun";
}

export interface NextjsOptions {
  version: string;
  typescript: boolean;
  linter: "eslint" | "biome" | "none";
  tailwind: boolean;
  srcDir: boolean;
  appRouter: boolean;
  turbopack: boolean;
  reactCompiler: boolean;
  packageManager: "npm" | "pnpm" | "yarn" | "bun";
  importAlias: boolean;
  customAlias?: string;
}

export async function initCommand(
  projectName?: string,
  options: InitOptions = {}
) {
  // Display banner
  console.log(
    "\n" +
      chalk.bold.cyan(
        figlet.textSync("Initsu", {
          font: "Speed",
          horizontalLayout: "default",
          verticalLayout: "default",
          width: 100,
          whitespaceBreak: true,
        })
      )
  );

  console.log(chalk.bold.white("Setup. Code. Ship.\n"));

  try {
    if (!projectName) {
      const namePrompt = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "What is your project name?",
          validate: (input: string) => {
            if (!input.trim()) {
              return "Project name is required";
            }
            if (!/^[a-z0-9-_]+$/i.test(input)) {
              return "Project name can only contain letters, numbers, hyphens, and underscores";
            }
            return true;
          },
        },
      ]);
      projectName = namePrompt.projectName;
    }

    // Ask what type of project they want to create
    const projectTypeAnswer = await inquirer.prompt([
      {
        type: "list",
        name: "projectType",
        message: "What type of project would you like to create?",
        choices: [
          { name: "Next.js Project", value: "nextjs" },
          { name: "TypeScript Project", value: "typescript" },
        ],
        default: "nextjs",
      },
    ]);

    if (projectTypeAnswer.projectType === "nextjs") {
      // Ask if they want the preset configuration
      const presetAnswer = await inquirer.prompt([
        {
          type: "confirm",
          name: "usePreset",
          message: "Should I cook up the usual?",
          default: true,
        },
      ]);

      await createNextjsProject(projectName!, options, presetAnswer.usePreset);
    } else {
      await createTypescriptProject(projectName!, options);
    }
  } catch (error) {
    console.error(chalk.red.bold("\n❌ Error creating project:"), error);
    process.exit(1);
  }
}

async function getNextjsOptions(usePreset: boolean = false) {
  // If using preset, only ask for package manager
  if (usePreset) {
    const packageManagerAnswer = await inquirer.prompt([
      {
        type: "list",
        name: "packageManager",
        message: "Which package manager would you like to use?",
        choices: [
          { name: "npm", value: "npm" },
          { name: "pnpm", value: "pnpm" },
          { name: "yarn", value: "yarn" },
          { name: "bun", value: "bun" },
        ],
        default: "yarn",
      },
    ]);

    // Return preset configuration
    return {
      version: "latest",
      packageManager: packageManagerAnswer.packageManager,
      typescript: true,
      linter: "eslint",
      tailwind: true,
      srcDir: false,
      appRouter: true,
      turbopack: false,
      reactCompiler: false,
      importAlias: false,
      customAlias: undefined,
    };
  }

  // Regular flow - ask all questions
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "version",
      message: "Which Next.js version would you like to use?",
      choices: [
        { name: "Latest (recommended)", value: "latest" },
        { name: "Next.js 15", value: "15" },
        { name: "Next.js 14", value: "14" },
        { name: "Next.js 13", value: "13" },
        { name: "Custom version", value: "custom" },
      ],
      default: "latest",
    },
    {
      type: "list",
      name: "packageManager",
      message: "Which package manager would you like to use?",
      choices: [
        { name: "npm", value: "npm" },
        { name: "pnpm", value: "pnpm" },
        { name: "yarn", value: "yarn" },
        { name: "bun", value: "bun" },
      ],
      default: "npm",
    },
    {
      type: "confirm",
      name: "typescript",
      message: "Would you like to use TypeScript?",
      default: true,
    },
    {
      type: "list",
      name: "linter",
      message: "Which linter would you like to use?",
      choices: [
        { name: "ESLint", value: "eslint" },
        { name: "Biome", value: "biome" },
        { name: "None", value: "none" },
      ],
      default: "eslint",
    },
    {
      type: "confirm",
      name: "tailwind",
      message: "Would you like to use Tailwind CSS?",
      default: true,
    },
    {
      type: "confirm",
      name: "srcDir",
      message: "Would you like to use `src/` directory?",
      default: true,
    },
    {
      type: "confirm",
      name: "appRouter",
      message: "Would you like to use App Router? (recommended)",
      default: true,
    },
    {
      type: "confirm",
      name: "turbopack",
      message: "Would you like to enable Turbopack for development?",
      default: false,
    },
    {
      type: "confirm",
      name: "reactCompiler",
      message: "Would you like to enable the React Compiler?",
      default: false,
    },
    {
      type: "confirm",
      name: "importAlias",
      message: "Would you like to customize the default import alias (@/*)?",
      default: false,
    },
  ]);

  if (answers.version === "custom") {
    const versionAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "customVersion",
        message: "Enter the Next.js version (e.g., 14.2.3):",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Version is required";
          }
          // Basic version format validation
          if (!/^\d+(\.\d+)?(\.\d+)?$/.test(input.trim())) {
            return "Please enter a valid version format (e.g., 14.2.3 or 14.2 or 14)";
          }
          return true;
        },
      },
    ]);
    answers.version = versionAnswer.customVersion;
  }

  if (answers.importAlias) {
    const aliasAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "customAlias",
        message: "What import alias would you like configured?",
        default: "@/*",
      },
    ]);
    answers.customAlias = aliasAnswer.customAlias;
  }

  return answers;
}

async function getConfigurationOptions() {
  return await inquirer.prompt([
    {
      type: "confirm",
      name: "prettier",
      message: "Would you like to configure Prettier?",
      default: true,
    },
    {
      type: "confirm",
      name: "husky",
      message: "Would you like to set up Husky for git hooks?",
      default: true,
    },
    {
      type: "confirm",
      name: "shadcn",
      message: "Would you like to install shadcn/ui?",
      default: true,
    },
  ]);
}

async function getTypescriptOptions() {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "packageManager",
      message: "Which package manager would you like to use?",
      choices: [
        { name: "bun (recommended)", value: "bun" },
        { name: "npm", value: "npm" },
        { name: "pnpm", value: "pnpm" },
        { name: "yarn", value: "yarn" },
      ],
      default: "bun",
    },
  ]);

  return answers;
}

async function getTypescriptConfigurationOptions() {
  return await inquirer.prompt([
    {
      type: "confirm",
      name: "prettier",
      message: "Would you like to configure Prettier?",
      default: true,
    },
    {
      type: "confirm",
      name: "eslint",
      message: "Would you like to configure ESLint?",
      default: true,
    },
    {
      type: "confirm",
      name: "husky",
      message: "Would you like to set up Husky for git hooks?",
      default: true,
    },
  ]);
}

async function initializeTypescriptApp(
  projectName: string,
  typescriptOptions: TypescriptOptions,
  _options: InitOptions
) {
  const spinner = ora("Creating TypeScript project...").start();

  try {
    const projectPath = path.resolve(process.cwd(), projectName);
    await fs.ensureDir(projectPath);

    const args = ["init", "-y"];

    await new Promise<void>((resolve, reject) => {
      const child = spawn("bun", args, {
        cwd: projectPath,
        stdio: "inherit",
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`bun init failed with code ${code}`));
        }
      });

      child.on("error", (error) => {
        reject(error);
      });
    });

    // Update package.json to add TypeScript and other dependencies
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = await fs.readJson(packageJsonPath);

    // Add TypeScript and @types/node as dependencies
    packageJson.devDependencies = packageJson.devDependencies || {};
    packageJson.devDependencies.typescript = "^5.0.0";
    packageJson.devDependencies["@types/node"] = "^20.0.0";

    // Add scripts
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.build = "tsc";
    packageJson.scripts.dev = "tsc --watch";
    packageJson.scripts.start = "node dist/index.js";

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    // Create tsconfig.json
    const tsconfigContent = {
      compilerOptions: {
        target: "ES2022",
        module: "commonjs",
        lib: ["ES2022"],
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"],
    };

    await fs.writeJson(
      path.join(projectPath, "tsconfig.json"),
      tsconfigContent,
      { spaces: 2 }
    );

    // Create src directory and index.ts
    const srcDir = path.join(projectPath, "src");
    await fs.ensureDir(srcDir);

    const indexContent = `console.log('Hello, TypeScript!');

export {};
`;

    await fs.writeFile(path.join(srcDir, "index.ts"), indexContent);

    // Install dependencies using the selected package manager
    if (typescriptOptions.packageManager !== "bun") {
      const installArgs = getPackageInstallArgs(
        typescriptOptions.packageManager
      );

      await new Promise<void>((resolve, reject) => {
        const child = spawn(typescriptOptions.packageManager, installArgs, {
          cwd: projectPath,
          stdio: "inherit",
          shell: true,
        });

        child.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Package installation failed with code ${code}`));
          }
        });

        child.on("error", (error) => {
          reject(error);
        });
      });
    }

    spinner.succeed("TypeScript project created successfully");
  } catch (error) {
    spinner.fail("Failed to create TypeScript project");
    throw error;
  }
}

function getPackageInstallArgs(packageManager: string): string[] {
  switch (packageManager) {
    case "npm":
      return ["install"];
    case "yarn":
      return ["install"];
    case "pnpm":
      return ["install"];
    default:
      return ["install"];
  }
}

async function initializeNextjsApp(
  projectName: string,
  nextjsOptions: NextjsOptions,
  options: InitOptions
) {
  const spinner = ora("Creating Next.js application...").start();

  // Determine the version to use
  const version =
    nextjsOptions.version === "latest" ? "latest" : nextjsOptions.version;
  const args = ["-y", `create-next-app@${version}`, projectName];

  // Add flags based on user choices
  if (nextjsOptions.typescript) args.push("--ts");
  else args.push("--js");

  if (nextjsOptions.linter === "eslint") args.push("--eslint");
  else if (nextjsOptions.linter === "biome") args.push("--biome");
  else if (nextjsOptions.linter === "none") args.push("--no-linter");

  if (nextjsOptions.tailwind) args.push("--tailwind");
  else args.push("--no-tailwind");

  if (nextjsOptions.srcDir) args.push("--src-dir");
  else args.push("--no-src-dir");

  if (nextjsOptions.appRouter) args.push("--app");
  else args.push("--no-app");

  // Always pass import alias to avoid interactive prompt
  const importAlias = nextjsOptions.customAlias || "@/*";
  args.push("--import-alias", importAlias);

  // Package manager selection
  if (nextjsOptions.packageManager) {
    switch (nextjsOptions.packageManager) {
      case "npm":
        args.push("--use-npm");
        break;
      case "pnpm":
        args.push("--use-pnpm");
        break;
      case "yarn":
        args.push("--use-yarn");
        break;
      case "bun":
        args.push("--use-bun");
        break;
    }
  }

  // Additional options
  if (options.skipInstall) args.push("--skip-install");
  if (options.git === false) args.push("--disable-git");
  if (nextjsOptions.turbopack) args.push("--turbopack");
  else args.push("--no-turbopack");
  if (nextjsOptions.reactCompiler) args.push("--react-compiler");
  else args.push("--no-react-compiler");
  if (options.empty) args.push("--empty");
  if (options.api) args.push("--api");

  // Add --yes flag to skip all interactive prompts
  args.push("--yes");

  return new Promise<void>((resolve, reject) => {
    // Add a timeout to prevent hanging
    const timeout = setTimeout(
      () => {
        child.kill();
        spinner.fail("Next.js application creation timed out");
        reject(new Error("Process timed out after 5 minutes"));
      },
      5 * 60 * 1000
    ); // 5 minutes

    const child = spawn("npx", args, {
      stdio: "inherit",
    });

    child.on("close", (code, _signal) => {
      clearTimeout(timeout);
      if (code === 0) {
        spinner.succeed("Next.js application created successfully");
        resolve();
      } else {
        spinner.fail("Failed to create Next.js application");
        reject(new Error(`create-next-app exited with code ${code}`));
      }
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      spinner.fail("Failed to create Next.js application");
      reject(error);
    });
  });
}

async function createNextjsProject(
  projectName: string,
  options: InitOptions,
  usePreset: boolean = false
) {
  // Get Next.js initialization options
  const nextjsOptions = await getNextjsOptions(usePreset);

  console.log();

  // Get configuration options - use preset if selected
  const configOptions = usePreset
    ? { prettier: true, husky: true, shadcn: true }
    : await getConfigurationOptions();

  await initializeNextjsApp(projectName, nextjsOptions, options);

  // Apply configurations
  const configManager = new ConfigurationManager(
    projectName,
    nextjsOptions.packageManager || "npm"
  );
  await configManager.applyConfigurations(configOptions);

  // Apply template
  const templateManager = new TemplateManager(
    projectName,
    nextjsOptions.srcDir
  );
  await templateManager.applyTemplate(options.template || "default");

  console.log(
    chalk.green.bold(
      `\n✅ Project ${projectName} has been successfully created and configured!\n`
    )
  );
  console.log(chalk.cyan("Next steps:"));
  console.log(chalk.cyan(`  cd ${projectName}`));

  const packageManager = nextjsOptions.packageManager || "npm";
  const devCommand =
    packageManager === "npm" ? "npm run dev" : `${packageManager} dev`;
  console.log(chalk.cyan(`  ${devCommand}`));
}

async function createTypescriptProject(
  projectName: string,
  options: InitOptions
) {
  // Get TypeScript project options
  const typescriptOptions = await getTypescriptOptions();

  console.log();

  const configOptions = await getTypescriptConfigurationOptions();

  // Create TypeScript project directory and initialize
  await initializeTypescriptApp(projectName, typescriptOptions, options);

  // Apply configurations
  const configManager = new ConfigurationManager(
    projectName,
    typescriptOptions.packageManager || "bun"
  );
  await configManager.applyConfigurations(configOptions);

  console.log(
    chalk.green.bold(
      `\n✅ TypeScript project ${projectName} has been successfully created and configured!\n`
    )
  );
  console.log(chalk.cyan("Next steps:"));
  console.log(chalk.cyan(`  cd ${projectName}`));

  const packageManager = typescriptOptions.packageManager || "bun";
  const runCommand =
    packageManager === "npm"
      ? "npm run start"
      : packageManager === "bun"
        ? "bun run index.ts"
        : `${packageManager} start`;
  console.log(chalk.cyan(`  ${runCommand}`));
}
