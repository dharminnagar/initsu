# Initsu

<div align="center">

```
 ____            __
/\  _`\         /\ \__
\ \ \/\ \    ___\ \ ,_\  ___   __  __
 \ \ \ \ \ /' _ `\ \ \/  /',__\/\ \/\ \
  \ \ \_\ \/\ \/\ \ \ \_/\__, `\ \ \_\ \
   \ \____/\ \_\ \_\ \__\/\____/\ \____/
    \/___/  \/_/\/_/\/__/\/___/  \/___/
```

**⚡ Modern Project Scaffolding for Next.js & TypeScript**

_Don't spend time on setup, start coding faster!_

[![npm version](https://badge.fury.io/js/initsu.svg)](https://badge.fury.io/js/initsu)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## Features

**Multi Project Support**

- Next.js projects with full configuration
- Pure TypeScript projects
- (more coming soon)

**Smart Configuration**

- ESLint + Prettier + Husky pre-configured
- TypeScript setup with modern configs
- Package manager choice (npm, pnpm, yarn, bun)

**Next.js Extras**

- Tailwind CSS integration
- shadcn/ui component library setup
- App Router or Pages Router
- Custom import aliases

## Quick Start

### Installation

```bash
npm install -g initsu
```

### Usage

```bash
# Interactive mode - just run the command
initsu

# Or specify a project name directly
initsu my-awesome-project
```

## What You Get

### Next.js Projects

- **Latest Next.js** with App Router or Pages Router
- **TypeScript or JavaScript** - your choice
- **React Compiler** - experimental React optimization (optional)
- **Turbopack** - faster development builds (optional)
- **ESLint + Prettier** - code quality and formatting
- **Tailwind CSS** - utility-first styling (optional)
- **Husky + lint-staged** - git hooks for quality
- **shadcn/ui** - beautiful component system (optional)
- **Custom import aliases** - cleaner imports

### TypeScript Projects

- **Modern TypeScript** with latest compiler options
- **ESLint + Prettier** - consistent code style
- **Husky pre-commit hooks** - automated quality checks
- **Organized structure** - src/ directory with proper setup
- **Package manager choice** - npm, pnpm, yarn, or bun

## Interactive Experience

Initsu provides a guided, interactive experience:

1. **Project Name**: Enter your project name
2. **Project Type**: Choose Next.js or TypeScript
3. **Configuration Options**: Customize your setup
4. **Package Manager**: Pick your preferred tool
5. **Additional Tools**: Add Prettier, ESLint, Husky, etc.

## Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/dharminnagar/cli-tool.git
cd cli-tool

# Install dependencies
bun install  # or npm install

# Build the project
bun run build

# Test locally
node dist/index.js my-test-project
```

### Available Scripts

```bash
bun run build      # Compile TypeScript
bun run dev        # Watch mode for development
bun run lint       # Check code quality
bun run lint:fix   # Fix linting issues and format code
bun run test       # Run tests
```

## Project Structure

```
src/
├── commands/
│   └── init.ts                    # Main CLI command logic
├── utils/
│   ├── configuration-manager.ts  # Handles ESLint, Prettier, Husky setup
│   ├── template-manager.ts       # Template system for project scaffolding
│   └── github-fetcher.ts         # GitHub repository integration
├── config/
│   └── templates.ts              # Template configurations
└── index.ts                      # CLI entry point
```

## Code Quality Features

### ESLint Configuration

- **TypeScript-first**: Modern ESLint v9 with flat config
- **Strict rules**: Catches unused variables, missing types
- **Auto-fix**: Many issues fixed automatically
- **Performance**: Uses cache for faster subsequent runs

### Prettier Setup

- **Consistent formatting**: Double quotes, 2-space indentation
- **ES5 trailing commas**: Cross-browser compatibility
- **Bracket same line**: Compact JSX formatting
- **Auto-formatting**: Runs on save and pre-commit

### Husky Git Hooks

- **Pre-commit**: Runs lint-staged on staged files only
- **Prevents bad commits**: Blocks commits with linting errors
- **Fast execution**: Only processes staged files
- **Automatic setup**: Configured during project initialization

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Test** thoroughly: `bun run build && bun run lint`
6. **Commit** your changes: `git commit -m 'Add amazing feature'`
7. **Push** to your branch: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

## Requirements

- **Node.js**: >= 16.0.0
- **Package Manager**: npm, pnpm, yarn, or bun

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Next.js team** for the amazing framework
- **TypeScript team** for type safety
- **ESLint & Prettier** for code quality tools
- **Open source community** for inspiration and feedback

---

<div align="center">

**Made with ❤️ by [Dharmin Nagar](https://github.com/dharminnagar)**

_If Initsu helps you, consider giving it a ⭐ on GitHub!_

</div>
