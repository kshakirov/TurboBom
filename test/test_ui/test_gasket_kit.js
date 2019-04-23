const assert = require('assert');
const puppeteer = require('puppeteer');
let browser;
let page;

before(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage()
});

describe('Gasket Test', () => {
    it('gasket kit link ', async () => {
        await page.goto('http://timms-ui.turbointernational.com/login');
        await page.waitForSelector('#username');
        await page.type('#username', "pims");
        await page.waitForSelector('#password');
        await page.type('#password', "test");
        await page.screenshot({path: 'login_gasket.png'});
        await page.waitForSelector('#bttn-login');
        await page.click('#bttn-login');
        await page.waitForSelector('#state');
        await page.screenshot({path: 'list.png'});
        await page.goto('http://timms-ui.turbointernational.com/PartList/view/1411141');
        //wait until part details shows up
        await page.waitForSelector('#details > div:nth-child(1) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(10) > td.val.ng-binding > button');
        await page.screenshot({path: 'gasket.png'});
        //link
        await page.click('#details > div:nth-child(1) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(10) > td.val.ng-binding > button');
        await page.waitForSelector('body > app-root > app-gasket-kit-to-turbo > app-part-list-search > div > div > div.col-xs-12.col-sm-9 > div.bg-info > div > table > tbody > tr:nth-child(3) > td:nth-child(7) > a.btn.btn-success.btn-xs.ng-scope');
        // now pick selector
        await page.click('body > app-root > app-gasket-kit-to-turbo > app-part-list-search > div > div > div.col-xs-12.col-sm-9 > div.bg-info > div > table > tbody > tr:nth-child(3) > td:nth-child(7) > a.btn.btn-success.btn-xs.ng-scope');
        //wait until set gasket appears
        await page.waitForSelector('body > app-root > app-gasket-kit-to-turbo > ul > li:nth-child(2) > button');
        //click set gasket kit
        await page.click('body > app-root > app-gasket-kit-to-turbo > ul > li:nth-child(2) > button');
        // wait until View Part appears

         await page.waitForSelector('body > app-root > app-gasket-kit-to-turbo > ul > li:nth-child(1) > button');
         //click view part
         await page.click('body > app-root > app-gasket-kit-to-turbo > ul > li:nth-child(1) > button');
         await page.waitForSelector('#details > div:nth-child(1) > div:nth-child(1) > div > div > table > tbody > tr:nth-child(10) > td.val.ng-binding > button');

        assert.equal(1, 1);
    }).timeout(20000);


});

after(async () => {
    await browser.close()
});

