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
const REMAINING_OFFERS_BUTTON_XPATH = config.get("scraper.remaining_offers_button_xpath");
let timer = 0;

function filterRequests(request) {
  const url = request.url();
  if (
    request.resourceType() === "image" ||
    BLOCKED_DOMAINS.some((d) => url.startsWith(d))
  )
    request.abort();
  else request.continue();
}

async function getProductList(req, res) {
  const query = req.query.name;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString());
  await page.setRequestInterception(true);
  page.on("request", filterRequests);
  await page.goto(`${PAGE_URL}/;szukaj-${query}`, {
    waitUntil: "load",
  });
  let hrefs = (await page.$x(ITEM_HREF_XPATH)).slice(1, 8);
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
  res.json(results);
  browser.close();
}

async function getProductStoreEntries(itemId) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.toString());
  await page.setRequestInterception(true);
  page.on("request", filterRequests);
  await delay((timer += REQUEST_DELAY));
  let source = await page.goto(`${PAGE_URL}/${itemId.toString()}`, {
    waitUntil: "domcontentloaded",
  });
  const buttons = await page.$x(REMAINING_OFFERS_BUTTON_XPATH);
  buttons[0] && (await buttons[0].click());
  await delay(BUTTON_DELAY);
  let hrefs = await page.$x(OFFER_HREF_XPATH);
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
  browser.close();
  return results;
}

async function getMatchingStore(req, res) {
  let items = [req.query.id1, req.query.id2, req.query.id3, req.query.id4];
  let itemEntries = [];
  let results = [];
  items = items.filter((item) => item);
  itemEntries = items.filter((item) => item);
  itemEntries = itemEntries.map(
    async (item) => await getProductStoreEntries(item)
  );
  itemEntries = await Promise.all(itemEntries);
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
  res.json(results);
}

exports.getProductList = getProductList;
exports.getMatchingStore = getMatchingStore;
