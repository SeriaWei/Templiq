import { Liquid } from 'liquidjs';
import * as fs from 'fs';
import * as path from 'path';
import { validateSchema } from '../pack';

// @ts-ignore
import { describe, expect, test } from '@jest/globals';

/**
 * 创建与 app.ts 中相同配置的 Liquid 引擎，包含自定义标签
 */
function createEngine(): Liquid {
  const engine = new Liquid({
    root: path.resolve(__dirname, '../../templates'),
    extname: '.liquid',
    cache: false,
  });

  // 注册自定义 header 标签
  engine.registerTag('header', {
    parse: function (this: any, tagToken: any, remainTokens: any[]): void {
      this.tpls = [];
      let closed = false;
      while (remainTokens.length) {
        const token = remainTokens.shift();
        if (token.name === 'endheader') {
          closed = true;
          break;
        }
        const tpl = this.liquid.parser.parseToken(token, remainTokens);
        this.tpls.push(tpl);
      }
      if (!closed) throw new Error(`tag ${tagToken.getText()} not closed`);
    },
    render: function (this: any, ctx: any): any {
      return this.liquid.renderer.renderTemplates(this.tpls, ctx);
    },
  });

  // 注册自定义 footer 标签
  engine.registerTag('footer', {
    parse: function (this: any, tagToken: any, remainTokens: any[]): void {
      this.tpls = [];
      let closed = false;
      while (remainTokens.length) {
        const token = remainTokens.shift();
        if (token.name === 'endfooter') {
          closed = true;
          break;
        }
        const tpl = this.liquid.parser.parseToken(token, remainTokens);
        this.tpls.push(tpl);
      }
      if (!closed) throw new Error(`tag ${tagToken.getText()} not closed`);
    },
    render: function (this: any, ctx: any): any {
      return this.liquid.renderer.renderTemplates(this.tpls, ctx);
    },
  });

  // 注册自定义 url 标签
  engine.registerTag('url', {
    parse: function (this: any, tagToken: any): void {
      this.args = tagToken.args;
    },
    render: async function (this: any, ctx: any): Promise<string> {
      const value = await this.liquid.evalValue(this.args, ctx);
      if (typeof value === 'string' && value.startsWith('~')) {
        return value.substring(1);
      }
      return value || '';
    },
  });

  return engine;
}

/**
 * 获取所有可用的模板名称列表
 */
function getAvailableTemplates(): string[] {
  const templateDir = path.resolve(__dirname, '../../templates');
  return fs.readdirSync(templateDir)
    .filter(file => file.endsWith('.liquid'))
    .map(file => file.replace('.liquid', ''))
    .sort();
}

/**
 * 渲染指定模板，使用其对应的数据文件
 */
async function renderTemplate(templateName: string): Promise<string> {
  const engine = createEngine();
  const dataPath = path.resolve(__dirname, `../../data/${templateName}.json`);

  let data: any = {};
  if (fs.existsSync(dataPath)) {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }

  const modelData = {
    this: {
      Model: data,
    },
  };

  return engine.renderFile(templateName, modelData);
}

// ===== 测试用例 =====

// 通过环境变量 TEST_TEMPLATE 指定要测试的模板名称（多个用逗号分隔）
// 用法: $env:TEST_TEMPLATE="section-mpgzxt86,section-87r39g"; npm run test:render
const targetTemplates = (process.env.TEST_TEMPLATE || '')
  .split(',')
  .map(t => t.trim())
  .filter(Boolean);

if (targetTemplates.length > 0) {
  // 测试指定的一个或多个模板
  describe.each(targetTemplates)(`Template Render: %s`, (templateName) => {
    const templateDir = path.resolve(__dirname, '../../templates');
    const dataDir = path.resolve(__dirname, '../../data');

    const templateFile = path.join(templateDir, `${templateName}.liquid`);
    const dataFile = path.join(dataDir, `${templateName}.json`);
    const defFile = path.join(dataDir, `${templateName}.def.json`);

    test('template file should exist', () => {
      expect(fs.existsSync(templateFile)).toBe(true);
    });

    test('data file should exist', () => {
      expect(fs.existsSync(dataFile)).toBe(true);
    });

    test('definition file should exist', () => {
      expect(fs.existsSync(defFile)).toBe(true);
    });

    test('should render without error', async () => {
      const result = await renderTemplate(templateName);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    }, 15000);

    test('rendered output should contain section class name', async () => {
      const result = await renderTemplate(templateName);
      expect(result).toContain(`section-${templateName.split('-')[1]}`);
    }, 15000);

    test('rendered output should have valid HTML structure', async () => {
      const result = await renderTemplate(templateName);
      // 检查是否有打开的 HTML 标签
      expect(result).toMatch(/<[a-z]/i);
    }, 15000);

    test('schema definition should be valid', () => {
      const defContent = fs.readFileSync(defFile, 'utf8');
      const schema = JSON.parse(defContent);
      expect(() => validateSchema(schema, true)).not.toThrow();
    });

    test('data should match schema definition', () => {
      const dataContent = fs.readFileSync(dataFile, 'utf8');
      const defContent = fs.readFileSync(defFile, 'utf8');
      const data = JSON.parse(dataContent);
      const schema = JSON.parse(defContent);
      expect(() => validateSchema(schema, true, data)).not.toThrow();
    });
  });
} else {
  // 未指定 TEST_TEMPLATE 时，对所有模板做基础渲染测试
  describe('All Templates - Basic Render Test', () => {
    const templates = getAvailableTemplates();
    console.log(`Found ${templates.length} templates to test`);

    // 为避免测试过多，只渲染前 5 个做抽样检查
    const sampleTemplates = templates.slice(0, 5);

    test.each(sampleTemplates)('%s should render without error', async (templateName) => {
      const result = await renderTemplate(templateName);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    }, 15000);
  });

  // 对所有模板的数据和字段定义做完整性验证
  describe('All Templates - Schema & Data Validation', () => {
    const dataDir = path.resolve(__dirname, '../../data');
    const dataFiles = fs.readdirSync(dataDir)
      .filter((file: string) => file.endsWith('.json') && !file.endsWith('.def.json'));

    test('should have at least one data file', () => {
      expect(dataFiles.length).toBeGreaterThan(0);
    });

    test.each(dataFiles)('%s data should match its schema definition', (dataFile) => {
      const baseName = dataFile.replace('.json', '');
      const schemaFile = `${baseName}.def.json`;
      const schemaFilePath = path.join(dataDir, schemaFile);
      const dataFilePath = path.join(dataDir, dataFile);

      // 跳过没有对应 .def.json 的数据文件
      if (!fs.existsSync(schemaFilePath)) {
        console.warn(`Schema file ${schemaFile} not found for data file ${dataFile}, skipping...`);
        return;
      }

      const schemaContent = fs.readFileSync(schemaFilePath, 'utf8');
      const dataContent = fs.readFileSync(dataFilePath, 'utf8');
      const schema = JSON.parse(schemaContent);
      const data = JSON.parse(dataContent);

      // 验证 schema 定义本身有效
      expect(() => validateSchema(schema, true)).not.toThrow();

      // 验证 data 与 schema 一致
      expect(() => validateSchema(schema, true, data)).not.toThrow();
    });
  });

  // 提示用户如何测试特定模板
  test('tip: how to test a specific template', () => {
    console.log('\n⚠️  提示：要测试特定模板，请设置 TEST_TEMPLATE 环境变量（多个用逗号分隔）：');
    console.log('   $env:TEST_TEMPLATE="section-mpgzxt86,section-87r39g"; npm run test:render');
    console.log('   或: $env:TEST_TEMPLATE="section-mpgzxt86"; npm run test:render\n');
    expect(true).toBe(true);
  });
}