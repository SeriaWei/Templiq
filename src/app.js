"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const liquidjs_1 = require("liquidjs");
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const pack_1 = require("./tools/pack");
const new_section_1 = require("./tools/new-section");
const B2 = __importStar(require("./tools/upload"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(body_parser_1.default.json({ limit: '5mb' }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '5mb' }));
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
        const templateDir = path_1.default.resolve(__dirname, './templates');
        const templates = fs_1.default.readdirSync(templateDir)
            .filter(file => file.endsWith('.liquid'));
        const pageSize = 18;
        const page = parseInt(req.query.page) || 1;
        const total = templates.length;
        const totalPages = Math.ceil(total / pageSize);
        // First, create the basic template objects with just the name
        const sortedTemplates = templates.map(file => ({
            name: file.replace('.liquid', ''),
            title: file.replace('.liquid', '')
        })).sort((a, b) => a.name.localeCompare(b.name) ? -1 : 1);
        const pagedExamples = sortedTemplates.slice((page - 1) * pageSize, page * pageSize);
        for (const example of pagedExamples) {
            const filePath = path_1.default.join(templateDir, `${example.name}.liquid`);
            try {
                const content = fs_1.default.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                if (lines.length > 0) {
                    const firstLine = lines[0].trim();
                    const commentMatch = firstLine.match(/<!--\s*(.*?)\s*-->/);
                    if (commentMatch && commentMatch[1]) {
                        example.title = commentMatch[1];
                    }
                }
            }
            catch (err) {
                console.error(`Error reading template ${example.name}:`, err);
            }
        }
        engine.renderFile('../index', {
            examples: pagedExamples,
            page,
            totalPages
        })
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
        templateName: templateName,
        isPreview: true,
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
app.post('/api/save-preview', async (req, res) => {
    try {
        const { originalImageData, thumbnailImageData, templateName } = req.body;
        if (!originalImageData || !thumbnailImageData) {
            return res.status(400).json({ success: false, error: '未提供图片数据' });
        }
        if (!templateName) {
            return res.status(400).json({ success: false, error: '未提供模板名称' });
        }
        const thumbsDir = path_1.default.resolve(__dirname, 'public/thumbs');
        if (!fs_1.default.existsSync(thumbsDir)) {
            fs_1.default.mkdirSync(thumbsDir, { recursive: true });
        }
        const originalBase64Data = originalImageData.replace(/^data:image\/[^;]+;base64,/, '');
        const originalImageBuffer = Buffer.from(originalBase64Data, 'base64');
        const originalFilename = `${templateName}.png`;
        const originalFilePath = path_1.default.join(thumbsDir, originalFilename);
        await (0, sharp_1.default)(originalImageBuffer)
            .png({ quality: 70, compressionLevel: 9 })
            .toFile(originalFilePath);
        const thumbnailBase64Data = thumbnailImageData.replace(/^data:image\/[^;]+;base64,/, '');
        const thumbnailImageBuffer = Buffer.from(thumbnailBase64Data, 'base64');
        const thumbnailFilename = `${templateName}-m.png`;
        const thumbnailFilePath = path_1.default.join(thumbsDir, thumbnailFilename);
        await (0, sharp_1.default)(thumbnailImageBuffer)
            .png({ quality: 90, compressionLevel: 9 })
            .toFile(thumbnailFilePath);
        res.json({
            success: true,
            originalFilename,
            thumbnailFilename
        });
    }
    catch (error) {
        console.error('保存预览图失败:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '保存预览图时发生未知错误'
        });
    }
});
app.post('/api/create-template', async (req, res) => {
    try {
        const { customName } = req.body;
        const { sectionName } = (0, new_section_1.createNewSection)(customName);
        res.json({
            success: true,
            templateName: sectionName
        });
    }
    catch (error) {
        console.error('创建模板失败:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '创建模板时发生未知错误'
        });
    }
});
app.post('/api/pack', async (req, res) => {
    try {
        const { templateName } = req.body;
        if (!templateName) {
            return res.status(400).json({ success: false, error: '未提供模板名称' });
        }
        const packageBuffer = await (0, pack_1.packWidget)(templateName);
        const outputPath = path_1.default.resolve(__dirname, `../output/${templateName}.wgt`);
        fs_1.default.writeFileSync(outputPath, packageBuffer);
        res.json({
            success: true,
            filename: `${templateName}.wgt`
        });
    }
    catch (error) {
        console.error('打包失败:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '打包时发生未知错误'
        });
    }
});
app.post('/api/upload', async (req, res) => {
    try {
        const { templateName } = req.body;
        if (!templateName) {
            return res.status(400).json({ success: false, error: '未提供模板名称' });
        }
        await B2.upload(templateName);
        res.json({
            success: true
        });
    }
    catch (error) {
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
//# sourceMappingURL=app.js.map