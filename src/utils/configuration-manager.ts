import fs from "fs-extra";
import path from "path";
import { spawn } from "child_process";
import ora from "ora";

export interface ConfigurationOptions {
  prettier: boolean;
  husky: boolean;
  shadcn?: boolean;
  eslint?: boolean;
}

export class ConfigurationManager {
  private projectPath: string;
  private packageManager: string;

  constructor(projectName: string, packageManager: string = "npm") {
    this.projectPath = path.resolve(process.cwd(), projectName);
    this.packageManager = packageManager;
  }

  async applyConfigurations(options: ConfigurationOptions): Promise<void> {
    if (options.prettier) {
      await this.setupPrettier();
    }

    if (options.eslint) {
      await this.setupEslint();
    }

    if (options.husky) {
      await this.setupHusky();
    }

    if (options.shadcn) {
      await this.setupShadcn();
    }
  }

  private async setupPrettier(): Promise<void> {
    const spinner = ora("Setting up Prettier...").start();

    try {
      // Install Prettier and related packages using the selected package manager
      await this.installPackages(
        ["prettier", "eslint-config-prettier", "eslint-plugin-prettier"],
        true
      );

      // Create .prettierrc file
      const prettierConfig = {
        semi: true,
        trailingComma: "es5",
        singleQuote: true,
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
      };

      await fs.writeJson(
        path.join(this.projectPath, ".prettierrc"),
        prettierConfig,
        { spaces: 2 }
      );

      // Create .prettierignore file
      const prettierIgnore = `
node_modules
.next
out
dist
build
*.log
.env*
.vercel
.DS_Store
`;

      await fs.writeFile(
        path.join(this.projectPath, ".prettierignore"),
        prettierIgnore.trim()
      );

      // Update package.json scripts
      await this.updatePackageJsonScripts({
        format: "prettier --write .",
        "format:check": "prettier --check .",
      });

      // Update ESLint config if it exists
      await this.updateEslintConfig();

      spinner.succeed("Prettier configured successfully");
    } catch (error) {
      spinner.fail("Failed to setup Prettier");
      throw error;
    }
  }

  private async setupEslint(): Promise<void> {
    const spinner = ora("Setting up ESLint...").start();

    try {
      await this.installPackages(
        [
          "eslint",
          "@typescript-eslint/parser",
          "@typescript-eslint/eslint-plugin",
          "@eslint/js",
          "typescript-eslint",
        ],
        true
      );

      const eslintConfigContent = `import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.js',
      '*.d.ts',
    ],
  },
];
`;

      await fs.writeFile(
        path.join(this.projectPath, "eslint.config.js"),
        eslintConfigContent
      );

      // Update package.json scripts
      await this.updatePackageJsonScripts({
        lint: "eslint . && prettier --check .",
        "lint:fix": "eslint . --fix && prettier --write .",
      });

      spinner.succeed("ESLint configured successfully");
    } catch (error) {
      spinner.fail("Failed to setup ESLint");
      throw error;
    }
  }

  private async setupHusky(): Promise<void> {
    const spinner = ora("Setting up Husky...").start();

    try {
      await this.installPackages(["husky", "lint-staged"], true);

      await this.runCommand("npx", ["husky", "init"]);

      const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;

      await fs.ensureDir(path.join(this.projectPath, ".husky"));
      await fs.writeFile(
        path.join(this.projectPath, ".husky", "pre-commit"),
        preCommitHook
      );

      const packageJsonPath = path.join(this.projectPath, "package.json");
      const packageJson = await fs.readJson(packageJsonPath);

      packageJson["lint-staged"] = {
        "*.{js,jsx,ts,tsx}": ["eslint --cache --fix", "prettier --write"],
        "*.{json,css,md}": ["prettier --write"],
      };

      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

      spinner.succeed("Husky configured successfully");
    } catch (error) {
      spinner.fail("Failed to setup Husky");
      throw error;
    }
  }

  private async setupShadcn(): Promise<void> {
    const spinner = ora("Setting up shadcn/ui...").start();

    try {
      // Initialize shadcn/ui
      await this.runCommand("npx", ["shadcn-ui@latest", "init", "--yes"]);

      spinner.succeed("shadcn/ui configured successfully");
    } catch (error) {
      spinner.fail("Failed to setup shadcn/ui");
      throw error;
    }
  }

  private async updatePackageJsonScripts(
    newScripts: Record<string, string>
  ): Promise<void> {
    const packageJsonPath = path.join(this.projectPath, "package.json");
    const packageJson = await fs.readJson(packageJsonPath);

    packageJson.scripts = {
      ...packageJson.scripts,
      ...newScripts,
    };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  private async updateEslintConfig(): Promise<void> {
    const eslintConfigPath = path.join(this.projectPath, ".eslintrc.json");

    if (await fs.pathExists(eslintConfigPath)) {
      const eslintConfig = await fs.readJson(eslintConfigPath);

      if (!eslintConfig.extends) {
        eslintConfig.extends = [];
      }

      if (!eslintConfig.extends.includes("prettier")) {
        eslintConfig.extends.push("prettier");
      }

      await fs.writeJson(eslintConfigPath, eslintConfig, { spaces: 2 });
    }
  }

  private async installPackages(
    packages: string[],
    isDev: boolean = false
  ): Promise<void> {
    const args: string[] = [];

    switch (this.packageManager) {
      case "npm":
        args.push("install");
        if (isDev) args.push("--save-dev");
        args.push(...packages);
        break;
      case "yarn":
        args.push("add");
        if (isDev) args.push("--dev");
        args.push(...packages);
        break;
      case "pnpm":
        args.push("add");
        if (isDev) args.push("--save-dev");
        args.push(...packages);
        break;
      case "bun":
        args.push("add");
        if (isDev) args.push("--dev");
        args.push(...packages);
        break;
      default:
        throw new Error(`Unsupported package manager: ${this.packageManager}`);
    }

    await this.runCommand(this.packageManager, args);
  }

  private async runCommand(command: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        cwd: this.projectPath,
        stdio: "pipe",
        shell: true,
      });

      child.on("close", (code: number | null) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });

      child.on("error", (error: Error) => {
        reject(error);
      });
    });
  }
}
