const puppeteer = require("puppeteer");
const userAgent = require("user-agents");
const config = require("config");
const { delay } = require("./utils");

const REQUEST_DELAY = config.get("scraper.request_delay");
const BUTTON_DELAY = config.get("scraper.button_delay");
const BLOCKED_DOMAINS = config.get("scraper.blocked_domains");
const PAGE_URL = config.get("scraper.page_url");
const ITEM_HREF_XPATH = config.get("scraper.item_href_xpath");
const OFFER_HREF_URL_ATTR = config.get("scraper.offer_href_url_attr");
const OFFER_HREF_PRICE_ATTR = config.get("scraper.offer_href_price_attr");
const OFFER_HREF_XPATH = config.get("scraper.offer_href_xpath");
const REMAINING_OFFERS_BUTTON_XPATH = config.get(
  "scraper.remaining_offers_button_xpath"
);
let timer = 0;

async function getProductList(req, res) {
  const query = req.query.name;
  const browser = await initBrowser();
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString());
  await page.setRequestInterception(true);
  page.on("request", filterRequests);
  await navigateToSearch(page, query);
  const hrefs = (await page.$x(ITEM_HREF_XPATH)).slice(1, 8);
  const results = await extractAvailableProducts(page, hrefs);
  res.json(results);
  browser.close();
}

async function getProductStoreEntries(itemId) {
  const browser = await initBrowser();
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString());
  await page.setRequestInterception(true);
  page.on("request", filterRequests);
  await delay((timer += REQUEST_DELAY));
  await navigateToProductPage(page, itemId);
  const buttons = await page.$x(REMAINING_OFFERS_BUTTON_XPATH);
  await clickRemainingOffersButton(buttons);
  const hrefs = await page.$x(OFFER_HREF_XPATH);
  const results = await extractOfferInformation(page, hrefs);
  return results;
}

async function getMatchingStore(req, res) {
  let items = [req.query.id1, req.query.id2, req.query.id3, req.query.id4];
  let itemEntries = [];
  itemEntries = items.filter((item) => item);
  itemEntries = itemEntries.map(
    async (item) => await getProductStoreEntries(item)
  );
  itemEntries = await Promise.all(itemEntries);
  let results = await matchStoresWithTotalPrice(itemEntries);
  res.json(results);
}

// Helper functions

function filterRequests(request) {
  const url = request.url();
  if (
    request.resourceType() === "image" ||
    BLOCKED_DOMAINS.some((d) => url.startsWith(d))
  )
    request.abort();
  else request.continue();
}

async function navigateToSearch(page, query) {
  await page.goto(`${PAGE_URL}/;szukaj-${query}`, {
    waitUntil: "load",
  });
}

async function navigateToProductPage(page, itemId) {
  return await page.goto(`${PAGE_URL}/${itemId.toString()}`, {
    waitUntil: "domcontentloaded",
  });
}

async function clickRemainingOffersButton(buttons) {
  if (buttons[0]) {
    await delay(BUTTON_DELAY);
    return await buttons[0].click();
  }
}

async function extractAvailableProducts(page, hrefs) {
  let results = [];
  for (let href of hrefs) {
    const itemId = await page.evaluate(
      (href) => href.getAttribute("href"),
      href
    );
    const itemName = await page.evaluate(
      (href) => href.children[0].innerHTML,
      href
    );
    results.push({
      id: itemId.match(/[0-9]{4,}/g)?.[0] || itemId.match(/[0-9]{4,}/g),
      name: itemName,
    });
  }
  return results;
}

async function extractOfferInformation(page, hrefs) {
  let results = [];
  for (let href of hrefs) {
    const hrefValue = await page.evaluate(
      (href, urlAttr, priceAttr) => {
        return {
          url: href.getAttribute(urlAttr),
          price: parseFloat(href.getAttribute(priceAttr)),
        };
      },
      href,
      OFFER_HREF_URL_ATTR,
      OFFER_HREF_PRICE_ATTR
    );

    if (!results.some((item) => item.url === hrefValue.url))
      results.push(hrefValue);
  }
  return results;
}

async function matchStoresWithTotalPrice(itemEntries) {
  let results = [];
  results = itemEntries[0];
  for (let i = 0; i < itemEntries.length - 1; i++) {
    results = results.map((item) => {
      let foundItem = itemEntries[i + 1].find(
        (item2) => item2.url == item?.url
      );
      if (foundItem)
        return {
          url: foundItem.url,
          price: foundItem.price + item.price,
        };
    });
  }
  results = results.filter((item) => item);
  return results;
}

async function initBrowser() {
  return await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

exports.getProductList = getProductList;
exports.getMatchingStore = getMatchingStore;
