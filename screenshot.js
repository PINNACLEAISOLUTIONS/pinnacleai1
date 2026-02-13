const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });

    const filePath = path.join(__dirname, 'og-generator.html');
    await page.goto(`file://${filePath}`);

    await page.screenshot({ path: 'og-logo-black.png' });

    await browser.close();
    console.log('Screenshot saved to og-logo-black.png');
})();
