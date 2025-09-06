import { TemplateManager } from '../utils/template-manager';

describe('TemplateManager', () => {
  it('should list available templates', async () => {
    const templateManager = new TemplateManager('test-project');
    const templates = await templateManager.listAvailableTemplates();
    
    expect(templates).toHaveLength(1);
    expect(templates[0].name).toBe('default');
  });
});
