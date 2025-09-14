export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  files: string[];
}

export const TEMPLATE_CONFIGS: Record<string, GitHubConfig> = {
  default: {
    owner: "dharminnagar",
    repo: "nextjs-template",
    branch: "main",
    files: ["src/app/page.tsx", "src/app/globals.css"],
  },
};

export const GIST_CONFIG = {
  url: "https://gist.github.com/dharminnagar/27a8f8263d33c09f409c51bb8b195a08",
  description: "Configuration steps for Prettier, Husky, and linting",
};
