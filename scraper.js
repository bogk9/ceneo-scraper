const puppeteer = require('puppeteer');
var userAgent = require('user-agents');

//const StealthPlugin = require('puppeteer-extra-plugin-stealth')
//puppeteer.use(StealthPlugin())

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

async function getProductList(req, res){
    const query = req.query.name;
	const browser = await puppeteer.launch({
	                  headless: true,
	                  args: ['--no-sandbox','--disable-setuid-sandbox']
	                });
    const page = await browser.newPage();
	await page.setUserAgent(userAgent.toString());
	await page.setRequestInterception(true);
	page.on('request', (request) => {
	    if (request.resourceType() === 'image') request.abort();
	    else request.continue();
	  });

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
    console.log(`getProductStoreEntries called for item id: ${itemId.toString()} ...`);
	const browser = await puppeteer.launch({
	                  headless: true,
	                  args: ['--no-sandbox','--disable-setuid-sandbox']
	                });
    const page = await browser.newPage();
	await page.setUserAgent(userAgent.toString());
	
	const blockedDomains = [
	    'https://googleads.g.doubleclick.net',
	    'https://www.youtube.com', 
		'https://fonts.gstatic.com',
		'https://image.ceneostatic.pl'];
		
	await page.setRequestInterception(true);
	  page.on('request', (request) => {
	    const url = request.url();
	    if (blockedDomains.some((d) => url.startsWith(d))) {
	      request.abort();
	    } else {
	      request.continue();
	    }
	  });

    let source = await page.goto(`https://www.ceneo.pl/${itemId.toString()}`, {'waitUntil' : 'domcontentloaded'});

    const buttons = await page.$x("//span[@class='show-remaining-offers__icon']");
    buttons[0] && await buttons[0].click();
    await delay(350);

    let hrefs = await page.$x("//*[@data-shopurl and not(@data-promo-name)]");
    let results = [];

    for(let href of hrefs){
        const hrefValue = await page.evaluate(name => {
            let shopurl = name.getAttribute('data-shopurl');
            let price = name.getAttribute('data-price');
            return {url: shopurl, price: parseFloat(price)};
        }, href);

        if(!results.some(item => item.url === hrefValue.url))
            results.push(hrefValue);
    }

    console.log(results);
    browser.close();
    return results;
}

async function getMatchingStore(req, res){
    console.log('getMatchingStores called!');
    const item1Id = req.query.id1; const item2Id = req.query.id2;
    const item3Id = req.query.id3; const item4Id = req.query.id4;

    let item1Entries, item2Entries, item3Entries, item4Entries;

    if(!(item1Id && item2Id)){
        res.json({error: 1, message: "Too few arguments."});
        return;
    }

    if(req.query.id5){
        res.json({error: 2, message: "Too many arguments."});
        return;
    }

    item1Entries = await getProductStoreEntries(item1Id);
    item2Entries = await getProductStoreEntries(item2Id);

    if(item3Id)
        item3Entries = await getProductStoreEntries(item3Id);

    if(item4Id)
        item4Entries = await getProductStoreEntries(item4Id);

    let results = [];

    results = item1Entries.filter(object => item2Entries.some(({url}) => object.url === url ));

    results = item1Entries.map(item => {
        for(let items2 of item2Entries)
            if(items2.url === item.url)
                return {url: item.url, price: items2.price+item.price}
    })


    if(item3Entries)
    results = results.map(item => {
        for(let items2 of item3Entries)
            if(item && (items2.url === item.url))
                return {url: item.url, price: (items2.price || 0) + (item.price || 0)}
    })

    if(item4Entries)
    results = results.map(item => {
        for(let items2 of item4Entries)
            if(item && (items2.url === item.url))
                return {url: item.url, price: (items2.price || 0) + (item.price || 0)}
    })

    results = results.filter(item => item);
    
    res.json(results);
}


exports.getProductList = getProductList;
exports.getMatchingStore = getMatchingStore;