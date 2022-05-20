const puppeteer = require('puppeteer');
var userAgent = require('user-agents');


function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

async function getProductList(req, res){
    const query = req.query.name;
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();
    await page.setUserAgent(userAgent.toString());

    console.log(`getProductList called for: ${query} ...`)
    await page.goto('https://www.ceneo.pl');
    await page.type('#form-head-search-q', query);
    await delay(500);

    const buttons = await page.$x("//button[@type='submit' and contains(., 'Szukaj')]");
    await buttons[0].click();

    await page.waitForNavigation();

    let results = [];
    let hrefs = await page.$x("//*[@data-source-tag]");

    for(let href of hrefs){
        const itemId = await page.evaluate(name => name.getAttribute('href'), href);
        const itemName = await page.evaluate(name => name.children[0].innerHTML, href);
        results.push({
            id: Array.isArray(itemId.match(/[0-9]{4,}/g)) ? itemId.match(/[0-9]{4,}/g)[0] : itemId.match(/[0-9]{4,}/g), 
            name: itemName 
        })
    }

    res.json(results);
    browser.close()
}

async function getProductStoreEntries(itemId){
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();
    await page.setUserAgent(userAgent.toString());

    await page.goto(`https://www.ceneo.pl/${itemId.toString()}`);
    console.log(`getProductStoreEntries called for item id: ${itemId.toString()} ...`);

    let hrefs = await page.$x("//*[@data-shopurl and not(@data-promo-name)]");
    let results = [];

    for(let href of hrefs){
        const hrefValue = await page.evaluate(name => {
            let shopurl = name.getAttribute('data-shopurl');
            let price = name.getAttribute('data-price');

            return {url: shopurl, price: price};

        }, href);
        if(!results.some(item => item.url === hrefValue.url)){
            results.push(hrefValue);
        }
    }

    console.log(results);
    browser.close();
    return results;
}

async function getMatchingStore(req, res){
    console.log('getMatchingStores called!');
    const item1Id = req.query.id1; const item2Id = req.query.id2;
    let item1Entries = await getProductStoreEntries(item1Id);
    await delay(500);
    let item2Entries = await getProductStoreEntries(item2Id);

    let results = [];
    for(let i=0; i<item1Entries.length; i++){
        for(let j=0; j<item2Entries.length; j++){
            if(item1Entries[i].url === item2Entries[j].url){
                results.push({url: item1Entries[i].url, price: parseFloat(item1Entries[j].price) + parseFloat(item2Entries[j].price)})
                console.log("match!")
            }
        }
    }
    res.json(results);
}


exports.getProductList = getProductList;
exports.getMatchingStore = getMatchingStore;


