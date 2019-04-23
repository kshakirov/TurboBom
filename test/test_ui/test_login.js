const assert = require('assert');
const puppeteer = require('puppeteer');
let browser;
let page;

before(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage()
});

describe('Login Test', () => {
    it('logins with pims', async () => {
        await page.goto('http://timms-ui.turbointernational.com/login');
        await page.waitForSelector('#username');
        await page.type('#username', "pims");
        await page.waitForSelector('#password');
        await page.type('#password', "test");
        await page.screenshot({path: 'login.png'});
        await page.waitForSelector('#bttn-login');
        await page.click('#bttn-login');
        await page.waitForSelector('#state');
        await page.screenshot({path: 'list.png'});
        assert.equal(1, 1);
    }).timeout(20000);

    it('logins with awilson', async () => {
        await page.goto('http://timms-ui.turbointernational.com/login');
        await page.waitForSelector('#username');
        await page.type('#username', "awislon");
        await page.waitForSelector('#password');
        await page.type('#password', "turbotest");
        await page.screenshot({path: 'login.png'});
        await page.waitForSelector('#bttn-login');
        await page.click('#bttn-login');
        await page.waitForSelector('#state');
        await page.screenshot({path: 'list.png'});
        assert.equal(1, 1);
    }).timeout(10000)
});

after(async () => {
    await browser.close()
});

