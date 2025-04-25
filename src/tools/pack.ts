import * as fs from 'fs';
import path from 'path';
import * as zlib from 'zlib';
import * as https from 'https';
import * as crypto from 'crypto';
import sharp from 'sharp';


const CONFIG = {
    ASSEMBLY_NAME: 'ZKEACMS.Fluid',
    SERVICE_TYPE_NAME: 'ZKEACMS.Fluid.Service.ExtendableWidgetService',
    VIEW_MODEL_TYPE_NAME: 'ZKEACMS.Fluid.Models.ExtendableWidget',
    PACKAGE_INSTALLER: 'WidgetPackageInstaller'
};

function getViewName(template: string): string {
    const tplName = template.split("-")[1];
    return `Widget.Extend-${tplName}`;
}

function readFileAsBase64(filePath: string): string {
    return Buffer.from(fs.readFileSync(filePath)).toString("base64");
}

function generateUniqueFileName(url: string): string {
    const hash = crypto.createHash('md5').update(url).digest('hex');
    if (url.startsWith('/')) {
        return hash + path.extname(url);
    }
    let ext = '.jpg';
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const fileExt = path.extname(pathname);
        if (fileExt) ext = fileExt;
    } catch (e) {
        // If URL parsing fails, fallback to default extension
        console.warn(`Failed to parse URL: ${url}, using default extension`);
    }
    return hash + ext;
}

async function downloadFile(url: string): Promise<Buffer> {
    const fileName = generateUniqueFileName(url);
    const cachePath = path.resolve(__dirname, '../public/thumbs/cached', fileName);

    if (fs.existsSync(cachePath)) {
        console.log(`Using cached file: ${fileName}`);
        return fs.readFileSync(cachePath);
    }

    if (url.startsWith('/')) {
        console.log(`Reading local file: ${url}`);
        const buffer = fs.readFileSync(path.resolve(__dirname, '../public', url.slice(1)));
        return buffer;
    }

    console.log(`Downloading: ${url}`);
    return new Promise((resolve, reject) => {
        const options = {
            rejectUnauthorized: false,
            timeout: 10000
        };

        https.get(url, options, async (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                if (response.headers.location) {
                    return downloadFile(response.headers.location)
                        .then(resolve)
                        .catch(reject);
                }
            }

            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', async () => {
                try {
                    const buffer = Buffer.concat(chunks);
                    const image = sharp(buffer);
                    const metadata = await image.metadata();

                    let processedBuffer: Buffer;
                    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                        processedBuffer = await image
                            .resize(metadata.width && metadata.width > 1920 ? 1920 : metadata.width, undefined, {
                                fit: 'inside',
                                withoutEnlargement: true
                            })
                            .jpeg({ quality: 80, mozjpeg: true })
                            .toBuffer();
                    } else if (metadata.format === 'png') {
                        processedBuffer = await image
                            .resize(metadata.width && metadata.width > 1920 ? 1920 : metadata.width, undefined, {
                                fit: 'inside',
                                withoutEnlargement: true
                            })
                            .png({ compressionLevel: 9, palette: true, quality: 80 })
                            .toBuffer();
                    } else if (metadata.format === 'webp') {
                        processedBuffer = await image
                            .resize(metadata.width && metadata.width > 1920 ? 1920 : metadata.width, undefined, {
                                fit: 'inside',
                                withoutEnlargement: true
                            })
                            .webp({ quality: 80 })
                            .toBuffer();
                    } else {
                        processedBuffer = buffer;
                    }

                    const cacheDir = path.dirname(cachePath);
                    if (!fs.existsSync(cacheDir)) {
                        fs.mkdirSync(cacheDir, { recursive: true });
                    }

                    fs.writeFileSync(cachePath, processedBuffer);
                    resolve(processedBuffer);
                } catch (error) {
                    reject(error);
                }
            });
            response.on('error', reject);
        }).on('error', reject);
    });
}

const RESERVED_FIELD_NAMES = [
    'Properties', 'PropertySchema', 'IsInDesign', 'InitPartialView',
    'AssemblyName', 'FormView', 'IsSystem', 'IsTemplate', 'LayoutId',
    'PageId', 'PartialView', 'Position', 'ServiceTypeName', 'StyleClass',
    'Thumbnail', 'ViewModelTypeName', 'WidgetName', 'ZoneId', 'CreateBy',
    'CreatebyName', 'CreateDate', 'Description', 'Status', 'Title',
    'ExtendData', 'ActionType', 'RuleID', 'InnerStyle', 'CustomClass',
    'CustomStyle', 'DataSourceLink', 'DataSourceLinkTitle', 'EditTemplateOnline'
];

const VALID_FIELD_TYPES = [
    'SingleLine', 'Paragraph', 'HtmlBox', 'Address', 'Checkbox',
    'Radio', 'Date', 'Dropdown', 'Email', 'Number', 'Phone',
    'Media', 'Array'
];

export function validateSchema(schema: any, verifyFieldName: boolean, data?: any): void {
    if (data) {
        for (const key in data) {
            if (!schema[key]) {
                throw new Error(`Property '${key}' in data is not defined in schema. Please ensure all data properties have corresponding schema definitions.`);
            }
            if (Array.isArray(data[key]) && schema[key].FieldType !== 'Array') {
                throw new Error(`Property '${key}' in schema is not Array.`);
            }
            if (!Array.isArray(data[key]) && schema[key].FieldType === 'Array') {
                throw new Error(`Property '${key}' in data is not Array.`);
            }
            if (schema[key].Children && !Array.isArray(schema[key].Children)) {
                schema[key].Children = [schema[key].Children];
            }

            if (schema[key].FieldType === 'Array' && Array.isArray(data[key])) {
                if (!schema[key].Children || schema[key].Children.length == 0) {
                    throw new Error(`Property '${key}' in data is Array, but Children is not defined in schema.`);
                }
                if (data[key].length > 0) {
                    for (const item of data[key]) {
                        validateSchema(schema[key].Children[0], false, item);
                    }
                }
            }
        }
    }
    for (const key in schema) {
        if (verifyFieldName && RESERVED_FIELD_NAMES.includes(key)) {
            throw new Error(`Detected reserved field name '${key}', to avoid system conflicts, the packaging process has been terminated. Please modify the field name and retry.`);
        }
        if (!schema[key].FieldType) {
            throw new Error(`Field '${key}' is missing required property 'FieldType'.`);
        }
        if (!schema[key].DisplayName) {
            throw new Error(`Field '${key}' is missing required property 'DisplayName'.`);
        }
        if (!VALID_FIELD_TYPES.includes(schema[key].FieldType)) {
            throw new Error(`Invalid FieldType '${schema[key].FieldType}' for field '${key}'. Valid types are: ${VALID_FIELD_TYPES.join(', ')}.`);
        }
        if (schema[key].FieldType === 'Radio' || schema[key].FieldType === 'Dropdown') {
            if (!schema[key].FieldOptions) {
                throw new Error(`Field '${key}' is missing required property 'FieldOptions'.`);
            }
            if (!Array.isArray(schema[key].FieldOptions)) {
                throw new Error(`FieldOptions for field '${key}' should be an array.`);
            }
            if (schema[key].FieldOptions.length < 1) {
                throw new Error(`FieldOptions for field '${key}' should more than 1.`);
            }
            for (const option of schema[key].FieldOptions) {
                if (!option.DisplayText || !option.Value) {
                    throw new Error(`Invalid FieldOptions for field '${key}'. Each option should have 'DisplayText' and 'Value' properties.`);
                }
            }
        }
        if (schema[key].Children && Array.isArray(schema[key].Children)) {
            for (const child of schema[key].Children) {
                validateSchema(child, false);
            }
        }
    }
}

async function mergeDataToSchema(schema: any, data: any, packageFiles: any[]): Promise<any> {
    if (!schema || !data) return Promise.resolve(schema);

    const result = JSON.parse(JSON.stringify(schema));
    for (const key in result) {
        if (data[key] !== undefined) {
            if (result[key].FieldType === 'Array' && Array.isArray(data[key])) {
                if (result[key].Children && result[key].Children.length > 0 && data[key].length > 0) {
                    const childTemplate = result[key].Children[0];
                    const childResults = [];
                    for (const item of data[key]) {
                        const childResult = await mergeDataToSchema(childTemplate, item, packageFiles);
                        childResults.push(childResult);
                    }
                    result[key].Children = childResults;
                }
            } else {
                if (result[key].FieldType === 'Media' && data[key]) {
                    const url = data[key];
                    const fileName = generateUniqueFileName(url);
                    const fileExt = path.extname(fileName).toLowerCase();
                    
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                    if (imageExtensions.includes(fileExt)) {
                        const newPath = `~/UpLoad/Images/Widget/${fileName}`;
                        const fileContent = await downloadFile(url);
                        console.log(`New path: ${newPath}`);
                        result[key].Value = newPath;
                        packageFiles.push({
                            FileName: path.basename(newPath),
                            FilePath: newPath,
                            Content: fileContent.toString('base64')
                        });
                    } else {
                        result[key].Value = data[key];
                    }
                } else {
                    result[key].Value = data[key];
                }
            }
        }
    }

    return result;
}

function createPackageFiles(template: string, viewName: string): any[] {
    // Read the template, remove the first line if it's an HTML comment, then encode
    const templatePath = path.resolve(__dirname, `../templates/${template}.liquid`);
    let templateContent = fs.readFileSync(templatePath, 'utf8');
    const lines = templateContent.split('\n');
    if (lines.length > 0 && lines[0].trim().startsWith('<!--') && lines[0].trim().endsWith('-->')) {
        lines.shift();
        templateContent = lines.join('\n');
    }
    return [
        {
            "FileName": `${viewName}.liquid`,
            "FilePath": `~/Plugins/ZKEACMS.Fluid/Views/${viewName}.liquid`,
            "Content": Buffer.from(templateContent).toString('base64')
        },
        {
            "FileName": `${template}.png`,
            "FilePath": `~/UpLoad/Images/Widget/${template}.png`,
            "Content": readFileAsBase64(path.resolve(__dirname, `../public/thumbs/${template}-m.png`))
        }
    ];
}

function getWidgetNameFromTemplate(template: string): string {
    const templatePath = path.resolve(__dirname, `../templates/${template}.liquid`);
    const content = fs.readFileSync(templatePath, 'utf8');
    const firstLine = content.split('\n')[0].trim();
    // Remove <!-- and --> and trim whitespace
    if (firstLine.startsWith('<!--') && firstLine.endsWith('-->')) {
        return firstLine.slice(4, -3).trim();
    }
    // fallback to template name if not found
    return template;
}

function createWidgetConfig(template: string, viewName: string, schemaDefWidthData: any, schemaDef: any): any {
    const extendData = {
        "Properties": schemaDefWidthData,
        "PropertySchema": JSON.stringify(schemaDef),
        "IsInDesign": true,
        "InitPartialView": viewName
    };

    return {
        "Properties": schemaDefWidthData,
        "PropertySchema": JSON.stringify(schemaDef),
        "IsInDesign": true,
        "InitPartialView": viewName,
        "AssemblyName": CONFIG.ASSEMBLY_NAME,
        "FormView": null,
        "IsSystem": false,
        "IsTemplate": true,
        "LayoutId": null,
        "PageId": null,
        "PartialView": viewName,
        "Position": 1,
        "ServiceTypeName": CONFIG.SERVICE_TYPE_NAME,
        "StyleClass": "full",
        "Thumbnail": `~/UpLoad/Images/Widget/${template}.png`,
        "ViewModelTypeName": CONFIG.VIEW_MODEL_TYPE_NAME,
        "WidgetName": getWidgetNameFromTemplate(template),
        "ZoneId": null,
        "CreateBy": null,
        "CreatebyName": null,
        "CreateDate": null,
        "Description": null,
        "Status": 1,
        "Title": null,
        "ExtendData": JSON.stringify(extendData),
        "ActionType": null,
        "RuleID": null,
        "InnerStyle": null,
        "CustomClass": "full",
        "CustomStyle": "",
        "DataSourceLink": null,
        "DataSourceLinkTitle": null,
        "EditTemplateOnline": false
    };
}

async function createFullPackage(template: string): Promise<any> {
    console.log(`Creating package for template: ${template}`);
    const viewName = getViewName(template);
    const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../data/${template}.json`), "utf8"));
    const schemaDef = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../data/${template}.def.json`), "utf8"));

    validateSchema(schemaDef, true, data);

    const packageFiles = createPackageFiles(template, viewName);
    const schemaDefWidthData = await mergeDataToSchema(schemaDef, data, packageFiles);
    const widgetConfig = createWidgetConfig(template, viewName, schemaDefWidthData, schemaDef);
    console.log(`Widget created for template: ${template}`);
    return {
        "Widget": widgetConfig,
        "Files": packageFiles,
        "PackageInstaller": CONFIG.PACKAGE_INSTALLER
    };
}

export async function packWidget(template: string): Promise<Buffer> {
    const fullPackage = await createFullPackage(template);
    const packageJson = JSON.stringify(fullPackage, null, 2);

    return new Promise((resolve, reject) => {
        zlib.gzip(Buffer.from(packageJson, 'utf8'), (err, buffer) => {
            if (err) reject(err);
            else resolve(buffer);
        });
    });
}

async function main() {
    const template = process.argv[2];

    if (template) {
        await packageSingleTemplate(template);
    } else {
        await packageUnpackagedTemplates();
    }
}

async function packageSingleTemplate(template: string): Promise<void> {
    console.log(`Packaging template: ${template}`);
    const fullPackage = await createFullPackage(template);
    const packageJson = JSON.stringify(fullPackage, null, 2);

    const outputDir = path.resolve(__dirname, '../../output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${template}.wgt`);
    const gzip = zlib.createGzip();
    const writeStream = fs.createWriteStream(outputPath);
    const buffer = Buffer.from(packageJson, 'utf8');

    gzip.pipe(writeStream);
    gzip.write(buffer);
    gzip.end();

    console.log(`Widget package created at ${outputPath}`);
}

async function packageUnpackagedTemplates(): Promise<void> {
    const templatesDir = path.resolve(__dirname, '../templates');
    const outputDir = path.resolve(__dirname, '../../output');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const templates = fs.readdirSync(templatesDir)
        .filter(file => file.endsWith('.liquid'))
        .map(file => file.replace('.liquid', ''));

    const existingPackages = fs.existsSync(outputDir)
        ? fs.readdirSync(outputDir)
            .filter(file => file.endsWith('.wgt'))
            .map(file => file.replace('.wgt', ''))
        : [];

    const unpackagedTemplates = templates.filter(template =>
        !existingPackages.includes(template)
    );

    if (unpackagedTemplates.length === 0) {
        console.log('All templates have been packaged.');
        return;
    }

    console.log(`Found ${unpackagedTemplates.length} unpackaged templates: ${unpackagedTemplates.join(', ')}`);

    for (const template of unpackagedTemplates) {
        try {
            await packageSingleTemplate(template);
        } catch (error) {
            console.error(`Error packaging template ${template}:`, error);
        }
    }

    console.log(`Packaged ${unpackagedTemplates.length} templates.`);
}

if (require.main === module) {
    main().catch(error => {
        console.error('Error creating widget package:', error);
        process.exit(1);
    });
}