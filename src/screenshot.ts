import { chromium, Browser, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const SCREENSHOT_WIDTH = 1400;
const THUMBNAIL_MAX_WIDTH = 500;

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      channel: 'msedge',
      headless: true,
      args: ['--no-sandbox']
    });
  }
  return browser;
}

export async function capturePreview(templateName: string): Promise<{ originalFilename: string; thumbnailFilename: string }> {
  const b = await getBrowser();
  const page = await b.newPage();

  try {
    // Set viewport width; height will be adjusted after we know element size
    await page.setViewportSize({ width: SCREENSHOT_WIDTH, height: 900 });

    // Navigate to the preview page (same server, so already running)
    const url = `http://localhost:3000/preview/${encodeURIComponent(templateName)}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for custom fonts to finish loading
    await page.evaluate(() => (document as any).fonts?.ready);

    // Locate the main content element to screenshot
    const contentElement = await page.$('main.content');
    if (!contentElement) {
      throw new Error('Could not find main.content element');
    }

    // Hide the floating toolbar buttons before capturing
    await page.evaluate(() => {
      const toolbar = document.querySelector('.btn-group');
      if (toolbar) {
        (toolbar as HTMLElement).style.display = 'none';
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
    const thumbsDir = path.resolve(__dirname, 'public/thumbs');
    if (!fs.existsSync(thumbsDir)) {
      fs.mkdirSync(thumbsDir, { recursive: true });
    }

    // Save original image
    const originalFilename = `${templateName}.png`;
    const originalFilePath = path.join(thumbsDir, originalFilename);
    fs.writeFileSync(originalFilePath, screenshotBuffer);

    // Create thumbnail via sharp (resize to max 500px wide)
    const metadata = await sharp(screenshotBuffer).metadata();
    const scale = Math.min(1, THUMBNAIL_MAX_WIDTH / (metadata.width || SCREENSHOT_WIDTH));
    const thumbWidth = Math.round((metadata.width || SCREENSHOT_WIDTH) * scale);

    const thumbnailFilename = `${templateName}-m.png`;
    const thumbnailFilePath = path.join(thumbsDir, thumbnailFilename);

    await sharp(screenshotBuffer)
      .resize({ width: thumbWidth })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(thumbnailFilePath);

    return { originalFilename, thumbnailFilename };
  } finally {
    await page.close();
  }
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}