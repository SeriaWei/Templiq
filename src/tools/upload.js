"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const backblaze_b2_1 = __importDefault(require("backblaze-b2"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
;
const b2 = new backblaze_b2_1.default({
    applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
    applicationKey: process.env.B2_APPLICATION_KEY
});
class B2Uploader {
    constructor() {
        this.authorized = false;
    }
    async init() {
        if (!this.authorized) {
            await b2.authorize();
            this.authorized = true;
        }
    }
    async listFiles(bucketId, prefix) {
        await this.init();
        const response = await b2.listFileNames({
            bucketId: bucketId,
            maxFileCount: 1000,
            startFileName: '',
            prefix: prefix,
            delimiter: ''
        });
        return response.data.files;
    }
    async deleteFile(bucketId, fileName) {
        await this.init();
        const files = await this.listFiles(bucketId, fileName);
        const existingFile = files.find(file => file.fileName === fileName);
        if (existingFile) {
            console.log(`Deleting: ${fileName}`);
            await b2.deleteFileVersion({
                fileId: existingFile.fileId,
                fileName: existingFile.fileName
            });
            console.log(`Deleted: ${fileName}`);
        }
    }
    async uploadFile(bucketId, filePath, fileName) {
        if (!fs_1.default.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return { fileId: '', fileName: '' };
        }
        await this.init();
        const actualFileName = fileName || path_1.default.basename(filePath);
        await this.deleteFile(bucketId, actualFileName);
        const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
            bucketId: bucketId
        });
        const fileBuffer = fs_1.default.readFileSync(filePath);
        const response = await b2.uploadFile({
            uploadUrl: uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: actualFileName,
            data: fileBuffer,
            onUploadProgress: (event) => {
                const percent = Math.round((event.loaded * 100) / event.total);
                console.log(`Upload progress: ${percent}%`);
            }
        });
        return response.data;
    }
    async uploadBuffer(bucketId, buffer, fileName) {
        await this.init();
        const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
            bucketId: bucketId
        });
        const response = await b2.uploadFile({
            uploadUrl: uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: fileName,
            data: buffer
        });
        return response.data;
    }
}
async function uploadTemplate(uploader, bucketId, template) {
    console.log(`Uploading ${template}.wgt to B2`);
    const wgtResult = await uploader.uploadFile(bucketId, `./output/${template}.wgt`, `widgets/${template}.wgt`);
    console.log('Complete:', wgtResult.fileName);
    console.log(`Uploading ${template}.png to B2`);
    const thubResult = await uploader.uploadFile(bucketId, `./src/public/thumbs/${template}.png`, `widgets/thumb/${template}.png`);
    console.log('Complete:', thubResult.fileName);
    console.log(`Uploading ${template}-m.png to B2`);
    const thubmResult = await uploader.uploadFile(bucketId, `./src/public/thumbs/${template}-m.png`, `widgets/thumb/${template}-m.png`);
    console.log('Complete:', thubmResult.fileName);
}
async function upload(template) {
    const bucketId = process.env.B2_BUCKET_ID;
    const uploader = new B2Uploader();
    if (template === 'all') {
        const outputDir = './output';
        const files = fs_1.default.readdirSync(outputDir);
        const wgtFiles = files.filter(f => f.endsWith('.wgt'));
        for (const wgtFile of wgtFiles) {
            const tplName = path_1.default.basename(wgtFile, '.wgt');
            await uploadTemplate(uploader, bucketId, tplName);
        }
    }
    else {
        await uploadTemplate(uploader, bucketId, template);
    }
}
exports.upload = upload;
if (require.main === module) {
    (async () => {
        // const uploader = new B2Uploader();
        // const bucketId = process.env.B2_BUCKET_ID as string;
        // await uploader.uploadFile(bucketId, `./src/cms-v4.3.zip`, `cms-v4.3.zip`);
        await upload(process.argv[2]);
    })();
}
//# sourceMappingURL=upload.js.map