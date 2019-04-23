const puppeteer = require('puppeteer');

let adoptUrl = function (selected) {
    let partType = selected.split('(')[0].replace(/\s+/g, '%20');
    return `http://timms-ui.turbointernational.com/rest/entity/all?pageSize=25&fromIndx=0&Type=${partType}&role=part_list&sortOrder=asc&sortColumn=Type&filter=`
};


(async () => {
    const all_url = "http://timms-ui.turbointernational.com/rest/entity/all?pageSize=25&fromIndx=0&role=part_list&sortOrder=asc&sortColumn=Type&filter=";
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://timms-ui.turbointernational.com/login');
    await page.waitForSelector('#username');
    await page.type('#username', "pims");
    await page.waitForSelector('#password');
    await page.type('#password', "test");
    await page.screenshot({path: 'login.png'});
    await page.waitForSelector('#bttn-login');
    await page.click('#bttn-login');
    await page.waitForSelector('#fltrState_Type_');
    const type = await  page.$('#fltrState_Type_');
    const options = await page.evaluate(s => Object.values(s.options).map(v => v.innerText), type);
    //assert.equal(options.length,41);
    for (const opt of options.slice(1)) {
        await page.waitForSelector('#fltrState_Type_');
        console.log(opt);

        await page.select('select#fltrState_Type_', opt);
        let typeUrl = adoptUrl(opt);
        console.log(typeUrl);
        let response = await page.waitForResponse(typeUrl);
        let body = await response.json();
        //assert.ok(body.totalSize == 356, "Inactive parts qty too big")
        console.log(body.totalSize);
        await page.waitForSelector('#fltrState_Type_keyword');
        await page.select('select#fltrState_Type_keyword', "");
        response = await page.waitForResponse(all_url);
        console.log("Unselected")

    }


    console.log(options);

    //wait until part details shows up

    await browser.close();
})();

