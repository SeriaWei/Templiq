const express = require('express');
const { Liquid } = require('liquidjs');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const engine = new Liquid({
  root: path.resolve(__dirname, './templates'),
  extname: '.liquid',
  cache: process.env.NODE_ENV === 'production'
});

app.engine('liquid', engine.express());
app.set('views', path.resolve(__dirname));
app.set('view engine', 'liquid');

app.use(express.static(path.resolve(__dirname, './public')));

app.get('/', (req, res) => {
  try {
    const dataDir = path.resolve(__dirname, './data');
    const templateDir = path.resolve(__dirname, './templates');

    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.json'));

    const examples = [];

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
        const layoutData = {
          content: content
        };
        res.render('layout', layoutData);
      })
      .catch(error => {
        res.status(500).send(`渲染错误: ${error.message}`);
      });
  } catch (error) {
    res.status(500).send(`渲染错误: ${error.message}`);
  }
});

app.get('/preview/:template', (req, res) => {
  const templateName = req.params.template;
  const dataPath = path.resolve(__dirname, `./data/${templateName}.json`);

  try {
    let data = {};
    if (fs.existsSync(dataPath)) {
      const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      
      // 转换函数：将新格式转换为模板所需的旧格式
      const convertData = (data) => {
        if (!data || typeof data !== 'object') return data;
        
        if (data.FieldType) {
          switch(data.FieldType) {
            case 'SingleLine':
            case 'Paragraph':
            case 'HtmlBox':
              return data.Value || '';
            case 'Checkbox':
              return data.Value === 'true';
            case 'Address':
              return data.ValueArray ? data.ValueArray.join(' ') : '';
            case 'Radio':
              return data.Value;
            case 'Array':
              return data.Children ? data.Children.map(child => convertData(child)) : [];
            case 'Object':
              return data.Children ? convertData(data.Children) : {};
            default:
              return data.Value || '';
          }
        }
        
        if (Array.isArray(data)) {
          return data.map(item => convertData(item));
        }
        
        const result = {};
        for (const key in data) {
          result[key] = convertData(data[key]);
        }
        return result;
      };
      
      data = convertData(rawData);
    }

    const modelData = {
      this: {
        Model: data
      }
    };

    engine.renderFile(templateName, modelData)
      .then(content => {
        const layoutData = {
          content: content
        };
        res.render('layout', layoutData);
      })
      .catch(error => {
        res.status(500).send(`渲染错误: ${error.message}`);
      });
  } catch (error) {
    res.status(500).send(`渲染错误: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`服务器已启动: http://localhost:${PORT}`);
});