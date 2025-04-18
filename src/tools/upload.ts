import B2 from 'backblaze-b2';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
interface B2File { fileId: string; fileName: string };

const b2 = new B2({
    applicationKeyId: process.env.B2_APPLICATION_KEY_ID as string,
    applicationKey: process.env.B2_APPLICATION_KEY as string
});

class B2Uploader {
    authorized: boolean;
    constructor() {
        this.authorized = false;
    }

    async init() {
        if (!this.authorized) {
            await b2.authorize();
            this.authorized = true;
        }
    }

    async listFiles(bucketId: string, prefix: string): Promise<B2File[]> {
        await this.init();
        const response = await b2.listFileNames({
            bucketId: bucketId,
            maxFileCount: 1000,
            startFileName: '',
            prefix: prefix,
            delimiter: ''
        });
        return response.data.files as B2File[];
    }

    async deleteFile(bucketId: string, fileName: string) {
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

    async uploadFile(bucketId: string, filePath: string, fileName: string): Promise<B2File> {
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return { fileId: '', fileName: '' };
        }
        await this.init();
        const actualFileName = fileName || path.basename(filePath);
        await this.deleteFile(bucketId, actualFileName);

        const { data: { uploadUrl, authorizationToken } } = await b2.getUploadUrl({
            bucketId: bucketId
        });

        const fileBuffer = fs.readFileSync(filePath);

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

        return response.data as B2File;
    }

    async uploadBuffer(bucketId: string, buffer: Buffer, fileName: string) {
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

async function uploadTemplate(uploader: B2Uploader, bucketId: string, template: string) {
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

async function upload(template: string) {
    const bucketId = process.env.B2_BUCKET_ID as string;
    const uploader = new B2Uploader();
    if (template === 'all') {
        const outputDir = './output';
        const files = fs.readdirSync(outputDir);
        const wgtFiles = files.filter(f => f.endsWith('.wgt'));
        for (const wgtFile of wgtFiles) {
            const tplName = path.basename(wgtFile, '.wgt');
            await uploadTemplate(uploader, bucketId, tplName);
        }
    } else {
        await uploadTemplate(uploader, bucketId, template);
    }
}

export { upload };

if (require.main === module) {
    (async () => {
        await upload(process.argv[2]);
    })();
}
