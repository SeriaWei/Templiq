import B2 from 'backblaze-b2';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const b2 = new B2({
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

    async listFiles(bucketId) {
        await this.init();
        const response = await b2.listFileNames({
            bucketId: bucketId,
            maxFileCount: 1000,
        });
        return response.data.files;
    }

    async uploadFile(bucketId, filePath, fileName) {
        await this.init();

        const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
            bucketId: bucketId
        });

        const fileBuffer = fs.readFileSync(filePath);
        const actualFileName = fileName || path.basename(filePath);

        const response = await b2.uploadFile({
            uploadUrl: uploadUrl,
            uploadAuthToken: authorizationToken,
            fileName: actualFileName,
            data: fileBuffer,
            onUploadProgress: (event) => {
                const percent = Math.round((event.loaded * 100) / event.total);
                console.log(`上传进度: ${percent}%`);
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

async function upload(template) {
    try {
        const bucketId = process.env.B2_BUCKET_ID;

        const uploader = new B2Uploader();
        console.log(`Uploading ${template}.wgt to B2`);
        const wgtResult = await uploader.uploadFile(bucketId, `./output/${template}.wgt`, `zkeasoft/widgets/${template}.wgt`);
        console.log('Complete:', wgtResult);
        console.log(`Uploading ${template}.png to B2`);
        const thubmResult = await uploader.uploadFile(bucketId, `./src/public/thumbs/${template}.png`, `zkeasoft/widgets/thumb/${template}.png`);
        console.log('Complete:', thubmResult);
    } catch (error) {
        console.error('Error:', error);
    }
}

await upload(process.argv[2]);