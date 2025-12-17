import fs from "fs-extra";
import path from "path";
import ora from "ora";
import { GitHubFetcher } from "./github-fetcher";
import { TEMPLATE_CONFIGS } from "../config/templates";

export interface Template {
  name: string;
  description: string;
  files: TemplateFile[];
}

export interface TemplateFile {
  path: string;
  content: string;
}

export class TemplateManager {
  private projectPath: string;
  private templatesPath: string;
  private useSrcDir: boolean;

  constructor(projectName: string, useSrcDir: boolean = true) {
    this.projectPath = path.resolve(process.cwd(), projectName);
    this.templatesPath = path.join(__dirname, "..", "templates");
    this.useSrcDir = useSrcDir;
  }

  async applyTemplate(templateName: string): Promise<void> {
    const spinner = ora(`Applying ${templateName} template...`).start();

    try {
      const template = await this.getTemplate(templateName);
      await this.applyTemplateFiles(template);
      spinner.succeed(`${templateName} template applied successfully`);
    } catch (error) {
      spinner.fail(`Failed to apply ${templateName} template`);
      throw error;
    }
  }

  private async getTemplate(templateName: string): Promise<Template> {
    switch (templateName) {
      case "default":
        return this.getDefaultTemplate();
      default:
        throw new Error(`Template "${templateName}" not found`);
    }
  }

  private async getDefaultTemplate(): Promise<Template> {
    // Fetch template files from GitHub repo
    const config = TEMPLATE_CONFIGS.default;
    const files = await GitHubFetcher.fetchMultipleFiles(config);

    return {
      name: "default",
      description:
        "Default Next.js template with custom page content from GitHub",
      files: Object.entries(files).map(([filePath, content]) => ({
        path: filePath,
        content,
      })),
    };
  }

  async listAvailableTemplates(): Promise<Template[]> {
    return [
      {
        name: "default",
        description:
          "Default Next.js template with custom styling from GitHub repo",
        files: [],
      },
    ];
  }

  private async applyTemplateFiles(template: Template): Promise<void> {
    for (const file of template.files) {
      // Adjust the file path based on srcDir option
      let adjustedPath = file.path;
      if (!this.useSrcDir && adjustedPath.startsWith("src/")) {
        // Remove 'src/' prefix if not using src directory
        adjustedPath = adjustedPath.replace(/^src\//, "");
      }

      const filePath = path.join(this.projectPath, adjustedPath);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, file.content);
    }
  }
}
