"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const liquidjs_1 = require("liquidjs");
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const engine = new liquidjs_1.Liquid({
    root: path_1.default.resolve(__dirname, './templates'),
    extname: '.liquid',
    cache: process.env.NODE_ENV === 'production'
});
engine.registerTag("header", {
    parse: function (tagToken, remainTokens) {
        this.tpls = [];
        let closed = false;
        while (remainTokens.length) {
            let token = remainTokens.shift();
            if (token.name === 'endheader') {
                closed = true;
                break;
            }
            let tpl = this.liquid.parser.parseToken(token, remainTokens);
            this.tpls.push(tpl);
        }
        if (!closed)
            throw new Error(`tag ${tagToken.getText()} not closed`);
    },
    render: function (ctx) {
        return this.liquid.renderer.renderTemplates(this.tpls, ctx);
    }
});
engine.registerTag("footer", {
    parse: function (tagToken, remainTokens) {
        this.tpls = [];
        let closed = false;
        while (remainTokens.length) {
            let token = remainTokens.shift();
            if (token.name === 'endfooter') {
                closed = true;
                break;
            }
            let tpl = this.liquid.parser.parseToken(token, remainTokens);
            this.tpls.push(tpl);
        }
        if (!closed)
            throw new Error(`tag ${tagToken.getText()} not closed`);
    },
    render: function (ctx) {
        return this.liquid.renderer.renderTemplates(this.tpls, ctx);
    }
});
engine.registerTag("url", {
    parse: function (tagToken) {
        this.args = tagToken.args;
    },
    render: async function (ctx) {
        const value = await this.liquid.evalValue(this.args, ctx);
        if (typeof value === 'string' && value.startsWith('~')) {
            return value.substring(1);
        }
        return value || '';
    }
});
app.engine('liquid', engine.express());
app.set('views', path_1.default.resolve(__dirname));
app.set('view engine', 'liquid');
app.use(express_1.default.static(path_1.default.resolve(__dirname, './public')));
app.get('/', (req, res) => {
    try {
        const dataDir = path_1.default.resolve(__dirname, './data');
        const templateDir = path_1.default.resolve(__dirname, './templates');
        const files = fs_1.default.readdirSync(dataDir)
            .filter(file => file.endsWith('.json'));
        const examples = [];
        for (const file of files) {
            const baseName = file.replace('.json', '');
            const templatePath = path_1.default.join(templateDir, `${baseName}.liquid`);
            if (fs_1.default.existsSync(templatePath)) {
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
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).send(`渲染错误: ${error.message}`);
        }
        else {
            res.status(500).send('发生未知错误');
        }
    }
});
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
    const dataPath = path_1.default.resolve(__dirname, `./data/${templateName}.json`);
    try {
        let data = {};
        if (fs_1.default.existsSync(dataPath)) {
            data = JSON.parse(fs_1.default.readFileSync(dataPath, 'utf8'));
            //data = convertToViewModel(rawData);
        }
        const layoutData = await renderTemplate(templateName, data);
        res.render('layout', layoutData);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).send(`渲染错误: ${error.message}`);
        }
        else {
            res.status(500).send('发生未知错误');
        }
    }
});
app.listen(PORT, () => {
    console.log(`服务器已启动: http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map