import * as fs from 'fs';
import path from 'path';
import * as zlib from 'zlib';
import * as https from 'https';
import * as crypto from 'crypto';
import url from 'url';

const template = process.argv[2] || "section-87r39g";
const tplName = template.split("-")[1];
const viewName = `Widget.Extend-${tplName}`;
const tpl = fs.readFileSync(path.resolve(__dirname, `../templates/${template}.liquid`), "utf8");
const tplBase64 = Buffer.from(tpl).toString("base64");
const packageFiles = [
    {
        "FileName": `${viewName}.liquid`,
        "FilePath": `~/Plugins/ZKEACMS.Fluid/Views/${viewName}.liquid`,
        "Content": tplBase64
    },
    {
        "FileName": `${template}.png`,
        "FilePath": `~/UpLoad/Images/Widget/${template}.png`,
        "Content": Buffer.from(fs.readFileSync(path.resolve(__dirname, `../public/thumbs/${template}.png`))).toString("base64")
    }
];
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../data/${template}.json`), "utf8"));
const schemaDef = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../data/${template}.def.json`), "utf8"));

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
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            const chunks: Buffer[] = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => resolve(Buffer.concat(chunks)));
            response.on('error', reject);
        }).on('error', reject);
    });
}

async function mergeDataToSchema(schema: any, data: any): Promise<any> {
    if (!schema || !data) return Promise.resolve(schema);

    const result = JSON.parse(JSON.stringify(schema));
    const downloadPromises: Promise<void>[] = [];

    for (const key in result) {
        if (data[key] !== undefined) {
            if (result[key].FieldType === 'Array' && Array.isArray(data[key])) {
                if (result[key].Children && result[key].Children.length > 0 && data[key].length > 0) {
                    if (!Array.isArray(result[key].Children)) {
                        result[key].Children = [result[key].Children];
                    }

                    const childTemplate = result[key].Children[0];
                    const childPromises = data[key].map((item: any) => mergeDataToSchema(childTemplate, item));
                    downloadPromises.push(...childPromises);
                    result[key].Children = await Promise.all(childPromises);
                }
            } else {
                if(result[key].FieldType === 'Media' && data[key]) {
                    const url = data[key];
                    const fileName = generateUniqueFileName(url);
                    const newPath = `~/UpLoad/Images/Widget/${fileName}`;
                    result[key].Value = newPath;
                    
                    const downloadPromise = downloadFile(url)
                        .then(fileContent => {
                            packageFiles.push({
                                FileName: path.basename(newPath),
                                FilePath: newPath,
                                Content: fileContent.toString('base64')
                            });
                        })
                        .catch(error => {
                            console.error(`Failed to download file from ${url}:`, error);
                        });
                    downloadPromises.push(downloadPromise);
                } else {
                    result[key].Value = data[key];
                }
            }
        }
    }

    await Promise.all(downloadPromises);
    return result;
}

// Update the main execution flow to be async
async function main() {
    const schemaDefWidthData = await mergeDataToSchema(schemaDef, data);
    const extendData = {
        "Properties": schemaDefWidthData,
        "PropertySchema": JSON.stringify(schemaDef),
        "IsInDesign": true,
        "InitPartialView": viewName
    };
    const fullPackage = {
        "Widget": {
            "Properties": schemaDefWidthData,
            "PropertySchema": JSON.stringify(schemaDef),
            "IsInDesign": true,
            "InitPartialView": viewName,
            "AssemblyName": "ZKEACMS.Fluid",
            "FormView": null,
            "IsSystem": false,
            "IsTemplate": true,
            "LayoutId": null,
            "PageId": null,
            "PartialView": viewName,
            "Position": 1,
            "ServiceTypeName": "ZKEACMS.Fluid.Service.ExtendableWidgetService",
            "StyleClass": "full",
            "Thumbnail": `~/UpLoad/Images/Widget/${template}.png`,
            "ViewModelTypeName": "ZKEACMS.Fluid.Models.ExtendableWidget",
            "WidgetName": "Banner",
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
        },
        "Files": packageFiles,
        "PackageInstaller": "WidgetPackageInstaller"
    };

    const outputDir = path.resolve(__dirname, '../../output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const packageJson = JSON.stringify(fullPackage, null, 2);

    const outputPath = path.join(outputDir, `${template}.wgt`);
    const gzip = zlib.createGzip();
    const writeStream = fs.createWriteStream(outputPath);
    const buffer = Buffer.from(packageJson, 'utf8');

    gzip.pipe(writeStream);
    gzip.write(buffer);
    gzip.end();

    console.log(`Widget package created at ${outputPath}`);
}

main().catch(error => {
    console.error('Error creating widget package:', error);
    process.exit(1);
});