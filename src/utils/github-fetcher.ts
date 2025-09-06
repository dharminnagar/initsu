import https from 'https';
import { GitHubConfig } from '../config/templates';

export class GitHubFetcher {
  static async fetchFileContent(config: GitHubConfig, filePath: string): Promise<string> {
    const url = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${filePath}`;
    
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          if (response.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`Failed to fetch ${filePath}: ${response.statusCode}`));
          }
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  static async fetchMultipleFiles(config: GitHubConfig): Promise<Record<string, string>> {
    const files: Record<string, string> = {};
    
    for (const filePath of config.files) {
      try {
        files[filePath] = await this.fetchFileContent(config, filePath);
      } catch (error) {
        console.warn(`Warning: Could not fetch ${filePath}, using default content`);
        // Fallback to default content if fetch fails
        files[filePath] = this.getDefaultContent(filePath);
      }
    }
    
    return files;
  }

  private static getDefaultContent(filePath: string): string {
    if (filePath.endsWith('page.tsx')) {
      return `export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Welcome to Next.js!</h1>
        <p className="text-lg">Get started by editing this page.</p>
      </main>
    </div>
  );
}`;
    }

    if (filePath.endsWith('globals.css')) {
      return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}`;
    }

    return '';
  }
}
