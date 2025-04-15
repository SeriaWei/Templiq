import express, { Request, Response } from 'express';
import { Liquid } from 'liquidjs';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { packWidget } from './tools/pack';
import { createNewSection } from './tools/new-section';
import * as B2 from './tools/upload';

interface Example {
  name: string;
}

interface LayoutData {
  content: string;
}

interface FieldOption {
  Value: string;
}

interface Field {
  FieldType?: string;
  Value?: string;
  ValueArray?: string[];
  FieldOptions?: FieldOption[];
  Children?: any[] | any;
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

const engine = new Liquid({
  root: path.resolve(__dirname, './templates'),
  extname: '.liquid',
  cache: process.env.NODE_ENV === 'production'
});

engine.registerTag("header", {
  parse: function (tagToken: any, remainTokens: any[]): void {
    this.tpls = []
    let closed = false
    while (remainTokens.length) {
      let token = remainTokens.shift()
      if (token.name === 'endheader') {
        closed = true
        break
      }
      let tpl = this.liquid.parser.parseToken(token, remainTokens)
      this.tpls.push(tpl)
    }
    if (!closed) throw new Error(`tag ${tagToken.getText()} not closed`)
  },
  render: function (ctx: any): any {
    return this.liquid.renderer.renderTemplates(this.tpls, ctx);
  }
});

engine.registerTag("footer", {
  parse: function (tagToken: any, remainTokens: any[]): void {
    this.tpls = []
    let closed = false
    while (remainTokens.length) {
      let token = remainTokens.shift()
      if (token.name === 'endfooter') {
        closed = true
        break
      }
      let tpl = this.liquid.parser.parseToken(token, remainTokens)
      this.tpls.push(tpl)
    }
    if (!closed) throw new Error(`tag ${tagToken.getText()} not closed`)
  },
  render: function (ctx: any): any {
    return this.liquid.renderer.renderTemplates(this.tpls, ctx);
  }
});

engine.registerTag("url", {
  parse: function (tagToken: any): void {
    this.args = tagToken.args;
  },
  render: async function (ctx: any): Promise<string> {
    const value = await this.liquid.evalValue(this.args, ctx);
    if (typeof value === 'string' && value.startsWith('~')) {
      return value.substring(1);
    }
    return value || '';
  }
});

app.engine('liquid', engine.express());
app.set('views', path.resolve(__dirname));
app.set('view engine', 'liquid');

app.use(express.static(path.resolve(__dirname, './public')));

app.get('/', (req: Request, res: Response) => {
  try {
    const templateDir = path.resolve(__dirname, './templates');

    const templates = fs.readdirSync(templateDir)
      .filter(file => file.endsWith('.liquid'));

    const examples: Example[] = templates.map(file => ({
      name: file.replace('.liquid', '')
    })).sort((a, b) => a.name.localeCompare(b.name)? -1 : 1);

    engine.renderFile('../index', { examples: examples })
      .then(content => {
        const layoutData: LayoutData = {
          content: content
        };
        res.render('layout', layoutData);
      })
      .catch(error => {
        res.status(500).send(`渲染错误: ${error.message}`);
      });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(`渲染错误: ${error.message}`);
    } else {
      res.status(500).send('发生未知错误');
    }
  }
});

const renderTemplate = (templateName: string, data: any): Promise<LayoutData> => {
  const modelData = {
    this: {
      Model: data
    }
  };

  return engine.renderFile(templateName, modelData)
    .then(content => ({
      templateName: templateName,
      isPreview: true,
      content: content
    }));
};

app.get('/preview/:template', async (req: Request, res: Response) => {
  const templateName = req.params.template;
  const dataPath = path.resolve(__dirname, `./data/${templateName}.json`);

  try {
    let data: any = {};
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    const layoutData = await renderTemplate(templateName, data);
    res.render('layout', layoutData);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(`渲染错误: ${error.message}`);
    } else {
      res.status(500).send('发生未知错误');
    }
  }
});

app.post('/api/save-preview', async (req: Request, res: Response) => {
  try {
    const { originalImageData, thumbnailImageData, templateName } = req.body;
    if (!originalImageData || !thumbnailImageData) {
      return res.status(400).json({ success: false, error: '未提供图片数据' });
    }
    if (!templateName) {
      return res.status(400).json({ success: false, error: '未提供模板名称' });
    }

    const thumbsDir = path.resolve(__dirname, 'public/thumbs');
    if (!fs.existsSync(thumbsDir)) {
      fs.mkdirSync(thumbsDir, { recursive: true });
    }

    const originalBase64Data = originalImageData.replace(/^data:image\/[^;]+;base64,/, '');
    const originalImageBuffer = Buffer.from(originalBase64Data, 'base64');
    const originalFilename = `${templateName}.png`;
    const originalFilePath = path.join(thumbsDir, originalFilename);
    
    await sharp(originalImageBuffer)
      .png({ quality: 70, compressionLevel: 9 })
      .toFile(originalFilePath);

    const thumbnailBase64Data = thumbnailImageData.replace(/^data:image\/[^;]+;base64,/, '');
    const thumbnailImageBuffer = Buffer.from(thumbnailBase64Data, 'base64');
    const thumbnailFilename = `${templateName}-m.png`;
    const thumbnailFilePath = path.join(thumbsDir, thumbnailFilename);
    
    await sharp(thumbnailImageBuffer)
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(thumbnailFilePath);

    res.json({
      success: true,
      originalFilename,
      thumbnailFilename
    });
  } catch (error) {
    console.error('保存预览图失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '保存预览图时发生未知错误'
    });
  }
});

app.post('/api/create-template', async (req: Request, res: Response) => {
  try {
    const { customName } = req.body;
    const { sectionName } = createNewSection(customName);
    res.json({
      success: true,
      templateName: sectionName
    });
  } catch (error) {
    console.error('创建模板失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建模板时发生未知错误'
    });
  }
});

app.post('/api/pack', async (req: Request, res: Response) => {
  try {
    const { templateName } = req.body;
    if (!templateName) {
      return res.status(400).json({ success: false, error: '未提供模板名称' });
    }

    const packageBuffer = await packWidget(templateName);
    const outputPath = path.resolve(__dirname, `../output/${templateName}.wgt`);

    fs.writeFileSync(outputPath, packageBuffer);

    res.json({
      success: true,
      filename: `${templateName}.wgt`
    });
  } catch (error) {
    console.error('打包失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '打包时发生未知错误'
    });
  }
});

app.post('/api/upload', async (req: Request, res: Response) => {
  try {
    const { templateName } = req.body;
    if (!templateName) {
      return res.status(400).json({ success: false, error: '未提供模板名称' });
    }

    await B2.upload(templateName);

    res.json({
      success: true
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '上传时发生未知错误'
    });
  }
});

app.listen(PORT, () => {
  console.log(`服务器已启动: http://localhost:${PORT}`);
});