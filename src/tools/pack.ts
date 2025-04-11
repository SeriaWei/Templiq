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
    const cachePath = path.resolve(__dirname, '../public/thumbs', fileName);

    if (fs.existsSync(cachePath)) {
        console.log(`Using cached file: ${fileName}`);
        return fs.readFileSync(cachePath);
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
                    if (metadata.width && metadata.width > 1920) {
                        processedBuffer = await image
                            .resize(1920, undefined, {
                                fit: 'inside',
                                withoutEnlargement: true
                            })
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

async function mergeDataToSchema(schema: any, data: any, packageFiles: any[]): Promise<any> {
    if (!schema || !data) return Promise.resolve(schema);

    const result = JSON.parse(JSON.stringify(schema));
    
    for (const key in result) {
        if (data[key] !== undefined) {
            if (result[key].FieldType === 'Array' && Array.isArray(data[key])) {
                if (result[key].Children && result[key].Children.length > 0 && data[key].length > 0) {
                    if (!Array.isArray(result[key].Children)) {
                        result[key].Children = [result[key].Children];
                    }

                    const childTemplate = result[key].Children[0];
                    const childResults = [];
                    for (const item of data[key]) {
                        const childResult = await mergeDataToSchema(childTemplate, item, packageFiles);
                        childResults.push(childResult);
                    }
                    result[key].Children = childResults;
                }
            } else {
                if(result[key].FieldType === 'Media' && data[key] && data[key].startsWith('http')) {
                    const url = data[key];
                    const fileName = generateUniqueFileName(url);
                    const newPath = `~/UpLoad/Images/Widget/${fileName}`;

                    try {
                        const fileContent = await downloadFile(url);
                        console.log(`New path: ${newPath}`);
                        result[key].Value = newPath;
                        packageFiles.push({
                            FileName: path.basename(newPath),
                            FilePath: newPath,
                            Content: fileContent.toString('base64')
                        });
                    } catch (error) {
                        result[key].Value = url;
                        console.error(`Failed to download file from ${url}:`, error);
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
    return [
        {
            "FileName": `${viewName}.liquid`,
            "FilePath": `~/Plugins/ZKEACMS.Fluid/Views/${viewName}.liquid`,
            "Content": readFileAsBase64(path.resolve(__dirname, `../templates/${template}.liquid`))
        },
        {
            "FileName": `${template}.png`,
            "FilePath": `~/UpLoad/Images/Widget/${template}.png`,
            "Content": readFileAsBase64(path.resolve(__dirname, `../public/thumbs/${template}.png`))
        }
    ];
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
        "WidgetName": template,
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
    
    const packageFiles = createPackageFiles(template, viewName);
    const schemaDefWidthData = await mergeDataToSchema(schemaDef, data, packageFiles);
    const widgetConfig = createWidgetConfig(template, viewName, schemaDefWidthData, schemaDef);
    console.log(`Widget config created for template: ${template}`);
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