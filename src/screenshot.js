"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.capturePreview = capturePreview;
exports.closeBrowser = closeBrowser;
const playwright_1 = require("playwright");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const SCREENSHOT_WIDTH = 1400;
const THUMBNAIL_MAX_WIDTH = 500;
let browser = null;
async function getBrowser() {
    if (!browser || !browser.isConnected()) {
        browser = await playwright_1.chromium.launch({
            channel: 'msedge',
            headless: true,
            args: ['--no-sandbox']
        });
    }
    return browser;
}
async function capturePreview(templateName) {
    const b = await getBrowser();
    const page = await b.newPage();
    try {
        // Set viewport width; height will be adjusted after we know element size
        await page.setViewportSize({ width: SCREENSHOT_WIDTH, height: 900 });
        // Navigate to the preview page (same server, so already running)
        const url = `http://localhost:3000/preview/${encodeURIComponent(templateName)}`;
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        // Wait for custom fonts to finish loading
        await page.evaluate(() => { var _a; return (_a = document.fonts) === null || _a === void 0 ? void 0 : _a.ready; });
        // Locate the main content element to screenshot
        const contentElement = await page.$('main.content');
        if (!contentElement) {
            throw new Error('Could not find main.content element');
        }
        // Hide the floating toolbar buttons before capturing
        await page.evaluate(() => {
            const toolbar = document.querySelector('.btn-group');
            if (toolbar) {
                toolbar.style.display = 'none';
            }
        });
        // Get the element's bounding box and adjust viewport height so nothing is clipped
        const box = await contentElement.boundingBox();
        if (box) {
            await page.setViewportSize({
                width: SCREENSHOT_WIDTH,
                height: Math.max(Math.ceil(box.height), 900)
            });
        }
        // Full-size screenshot of the content element
        const screenshotBuffer = await contentElement.screenshot({ type: 'png' });
        // Ensure thumbs directory exists
        const thumbsDir = path_1.default.resolve(__dirname, 'public/thumbs');
        if (!fs_1.default.existsSync(thumbsDir)) {
            fs_1.default.mkdirSync(thumbsDir, { recursive: true });
        }
        // Save original image
        const originalFilename = `${templateName}.png`;
        const originalFilePath = path_1.default.join(thumbsDir, originalFilename);
        fs_1.default.writeFileSync(originalFilePath, screenshotBuffer);
        // Create thumbnail via sharp (resize to max 500px wide)
        const metadata = await (0, sharp_1.default)(screenshotBuffer).metadata();
        const scale = Math.min(1, THUMBNAIL_MAX_WIDTH / (metadata.width || SCREENSHOT_WIDTH));
        const thumbWidth = Math.round((metadata.width || SCREENSHOT_WIDTH) * scale);
        const thumbnailFilename = `${templateName}-m.png`;
        const thumbnailFilePath = path_1.default.join(thumbsDir, thumbnailFilename);
        await (0, sharp_1.default)(screenshotBuffer)
            .resize({ width: thumbWidth })
            .png({ quality: 90, compressionLevel: 9 })
            .toFile(thumbnailFilePath);
        return { originalFilename, thumbnailFilename };
    }
    finally {
        await page.close();
    }
}
async function closeBrowser() {
    if (browser) {
        await browser.close();
        browser = null;
    }
}
//# sourceMappingURL=screenshot.js.map