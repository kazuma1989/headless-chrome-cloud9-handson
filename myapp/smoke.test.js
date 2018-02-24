const { URL } = require('url');
const puppeteer = require('puppeteer');

(async() => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on('request', request => {
        const { pathname } = new URL(request.url());
        if (pathname === '/users') {
            const mockedData = [{
                id: 3,
                name: 'Jackson Doe'
            }];
            request.respond({
                contentType: 'application/json',
                body: JSON.stringify(mockedData)
            });
        }
        else {
            request.continue();
        }
    });

    await page.goto('http://localhost:8080/');

    await page.click('#name');
    await page.keyboard.type('doe');
    await page.click('#search');

    await page.screenshot({ path: 'screenshot.png' });

    await page.close();
    await browser.close();
})();
