import express, { Request, Response } from 'express';
import { Liquid } from 'liquidjs';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';

// 定义接口
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const engine = new Liquid({
  root: path.resolve(__dirname, './templates'),
  extname: '.liquid',
  cache: process.env.NODE_ENV === 'production'
});

engine.registerTag("header", {
  parse: function(tagToken: any, remainTokens: any[]): void {
    this.tpls = []
    let closed = false
    while(remainTokens.length) {
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
  render: function(ctx: any): any {
    return this.liquid.renderer.renderTemplates(this.tpls, ctx);
  }
});

engine.registerTag("footer", {
  parse: function(tagToken: any, remainTokens: any[]): void {
    this.tpls = []
    let closed = false
    while(remainTokens.length) {
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
  render: function(ctx: any): any {
    return this.liquid.renderer.renderTemplates(this.tpls, ctx);
  }
});

engine.registerTag("url", {
  parse: function(tagToken: any): void {
    this.str = tagToken.args;
  },
  render: async function(ctx: any): Promise<string> {
    const value = this.str;
    if (typeof value === 'string' && value.startsWith('~')) {
      return value.substring(1);
    }
    return value;
  }
});

app.engine('liquid', engine.express());
app.set('views', path.resolve(__dirname));
app.set('view engine', 'liquid');

app.use(express.static(path.resolve(__dirname, './public')));

app.get('/', (req: Request, res: Response) => {
  try {
    const dataDir = path.resolve(__dirname, './data');
    const templateDir = path.resolve(__dirname, './templates');

    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.json'));

    const examples: Example[] = [];

    for (const file of files) {
      const baseName = file.replace('.json', '');
      const templatePath = path.join(templateDir, `${baseName}.liquid`);

      if (fs.existsSync(templatePath)) {
        examples.push({
          name: baseName
        });
      }
    }

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

const convertToViewModel = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  if ((data as Field).FieldType) {
    const field = data as Field;
    switch(field.FieldType) {
      case 'SingleLine':
      case 'Paragraph':
      case 'HtmlBox':
        return field.Value || '';
      case 'Checkbox':
        if (field.ValueArray) {
          return field.FieldOptions
            ? field.FieldOptions
                .filter((option, index) => field.ValueArray![index] === 'true' || field.ValueArray![index] === option.Value)
                .map(option => option.Value)
            : field.ValueArray.filter(val => val === 'true' || val !== '');
        }
        return field.Value === 'true';
      case 'Address':
        return field.ValueArray ? field.ValueArray.join(' ') : '';
      case 'Radio':
        return field.Value;
      case 'Array':
        return field.Children ? field.Children.map((child: any) => convertToViewModel(child)) : [];
      case 'Object':
        return field.Children ? convertToViewModel(field.Children) : {};
      default:
        return field.Value || '';
    }
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertToViewModel(item));
  }
  
  const result: Record<string, any> = {};
  for (const key in data) {
    result[key] = convertToViewModel(data[key]);
  }
  return result;
};

const renderTemplate = (templateName: string, data: any): Promise<LayoutData> => {
  const modelData = {
    this: {
      Model: data
    }
  };

  return engine.renderFile(templateName, modelData)
    .then(content => ({
      content: content
    }));
};

app.get('/preview/:template', async (req: Request, res: Response) => {
  const templateName = req.params.template;
  const dataPath = path.resolve(__dirname, `./data/${templateName}.json`);

  try {
    let data: any = {};
    if (fs.existsSync(dataPath)) {
      const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      data = convertToViewModel(rawData);
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

app.listen(PORT, () => {
  console.log(`服务器已启动: http://localhost:${PORT}`);
}); 