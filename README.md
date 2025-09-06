# Next.js CLI Configurator

A powerful CLI tool to initialize and configure Next.js repositories with various templates and configurations. This tool streamlines the setup process by automating common development configurations and applying custom templates.

## Features

- 🚀 **Next.js Initialization**: Interactive setup with all Next.js options
- 🎨 **Code Formatting**: Automatic Prettier configuration
- 🪝 **Git Hooks**: Husky setup with pre-commit hooks
- 🎯 **Linting**: ESLint integration with Prettier
- 🌟 **UI Components**: shadcn/ui installation and setup
- 📋 **Template System**: Modular template system for future extensibility
- 💻 **TypeScript Support**: Built with TypeScript for better developer experience

## Installation

### Global Installation
```bash
npm install -g nextjs-cli-configurator
```

### Local Installation
```bash
npm install nextjs-cli-configurator
```

## Usage

### Initialize a new Next.js project
```bash
nextjs-init init my-project
```

### Initialize with options
```bash
nextjs-init init my-project --template default --skip-install
```

### Interactive mode
```bash
nextjs-init init
```

## Configuration Options

The CLI will interactively ask you about:

### Next.js Setup
- TypeScript support
- ESLint configuration
- Tailwind CSS integration
- `src/` directory structure
- App Router (recommended)
- Custom import aliases

### Additional Configurations
- **Prettier**: Code formatting with opinionated defaults
- **Husky**: Git hooks for pre-commit linting and formatting
- **shadcn/ui**: Modern UI component library setup

## Template System

The tool includes a modular template system that can be extended:

### Available Templates
- `default`: Standard Next.js template with custom styling

### Future Templates
The architecture supports adding more templates:
- Blog template
- E-commerce template
- Dashboard template
- Portfolio template

## Development

### Setup
```bash
git clone <repository-url>
cd nextjs-cli-configurator
npm install
```

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

## Project Structure

```
src/
├── commands/
│   └── init.ts              # Main initialization command
├── utils/
│   ├── configuration-manager.ts  # Handles Prettier, Husky, ESLint setup
│   └── template-manager.ts       # Manages template application
└── index.ts                 # CLI entry point
```

## Configuration Details

### Prettier Configuration
- Semi-colons enabled
- Single quotes
- Trailing commas (ES5)
- 80 character line width
- 2-space indentation

### Husky & lint-staged
- Pre-commit hooks for linting and formatting
- Automatic formatting on commit
- Prevents commits with linting errors

### ESLint Integration
- Prettier integration
- Next.js recommended rules
- TypeScript support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Roadmap

- [ ] Additional templates (blog, e-commerce, dashboard)
- [ ] Custom configuration profiles
- [ ] Plugin system for third-party integrations
- [ ] Template marketplace
- [ ] Configuration presets

## License

MIT License - see LICENSE file for details

## Credits

- Built on top of [create-next-app](https://nextjs.org/docs/pages/api-reference/create-next-app)
- Uses configuration patterns from [Next.js Template](https://github.com/dharminnagar/nextjs-template)
- Configuration setup inspired by [this gist](https://gist.github.com/dharminnagar/27a8f8263d33c09f409c51bb8b195a08)
