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

const convertToViewModel = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  if (data.FieldType) {
    switch(data.FieldType) {
      case 'SingleLine':
      case 'Paragraph':
      case 'HtmlBox':
        return data.Value || '';
      case 'Checkbox':
        if (data.ValueArray) {
          return data.FieldOptions
            ? data.FieldOptions
                .filter((option, index) => data.ValueArray[index] === 'true' || data.ValueArray[index] === option.Value)
                .map(option => option.Value)
            : data.ValueArray.filter(val => val === 'true' || val !== '');
        }
        return data.Value === 'true';
      case 'Address':
        return data.ValueArray ? data.ValueArray.join(' ') : '';
      case 'Radio':
        return data.Value;
      case 'Array':
        return data.Children ? data.Children.map(child => convertToViewModel(child)) : [];
      case 'Object':
        return data.Children ? convertToViewModel(data.Children) : {};
      default:
        return data.Value || '';
    }
  }
  
  if (Array.isArray(data)) {
    return data.map(item => convertToViewModel(item));
  }
  
  const result = {};
  for (const key in data) {
    result[key] = convertToViewModel(data[key]);
  }
  return result;
};

const renderTemplate = (templateName, data) => {
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

app.get('/preview/:template', async (req, res) => {
  const templateName = req.params.template;
  const dataPath = path.resolve(__dirname, `./data/${templateName}.json`);

  try {
    let data = {};
    if (fs.existsSync(dataPath)) {
      const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      data = convertToViewModel(rawData);
    }

    const layoutData = await renderTemplate(templateName, data);
    res.render('layout', layoutData);
  } catch (error) {
    res.status(500).send(`渲染错误: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`服务器已启动: http://localhost:${PORT}`);
});