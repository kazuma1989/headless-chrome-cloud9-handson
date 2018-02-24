const puppeteer = require('puppeteer');

(async() => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:8080/');
    await page.screenshot({ path: 'screenshot.png' });

    await page.close();
    await browser.close();
})();
