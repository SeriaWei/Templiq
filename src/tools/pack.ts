import * as fs from 'fs';
import path from 'path';
import * as zlib from 'zlib';

const template = process.argv[2] || "section-87r39g";
const tpl = fs.readFileSync(path.resolve(__dirname,`../templates/${template}.liquid`), "utf8");
const tplBase64 = Buffer.from(tpl).toString("base64");

const tplName = template.split("-")[1];
const viewName=`Widget.Extend-${tplName}`;
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../data/${template}.json`), "utf8"));
const schemaDef = JSON.parse(fs.readFileSync(path.resolve(__dirname,`../data/${template}.def.json`), "utf8"));

function mergeDataToSchema(schema: any, data: any): any {
    if (!schema || !data) return schema;
    
    const result = JSON.parse(JSON.stringify(schema));
    
    for (const key in result) {
        if (data[key] !== undefined) {
            if (result[key].FieldType === 'Array' && Array.isArray(data[key])) {                
                if (result[key].Children && result[key].Children.length > 0 && data[key].length > 0) {
                    if (!Array.isArray(result[key].Children)) {
                        result[key].Children = [result[key].Children];
                    }
                    
                    const childTemplate = result[key].Children[0];
                    result[key].Children = data[key].map((item: any) => mergeDataToSchema(childTemplate, item));
                }
            } else {
                result[key].Value = data[key];
            }
        }
    }
    
    return result;
}

const schemaDefWidthData = mergeDataToSchema(schemaDef, data);
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
        "Thumbnail": "~/UpLoad/Images/202504/abqdr5kdi6tc.png",
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
    "Files": [
        {
            "FileName": `${viewName}.liquid`,
            "FilePath": `~/Plugins/ZKEACMS.Fluid/Views/${viewName}.liquid`,
            "Content": tplBase64
        }
    ],
    "PackageInstaller": "WidgetPackageInstaller"
}

// Create the output directory if it doesn't exist
const outputDir = path.resolve(__dirname, '../../output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Convert package data to JSON string
const packageJson = JSON.stringify(fullPackage, null, 2);

// Create a gzip stream and compress the data using streaming
const outputPath = path.join(outputDir, `${template}.wgt`);
const gzip = zlib.createGzip();
const writeStream = fs.createWriteStream(outputPath);
const buffer = Buffer.from(packageJson, 'utf8');

gzip.pipe(writeStream);
gzip.write(buffer);
gzip.end();

console.log(`Widget package created at ${outputPath}`);