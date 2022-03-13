const puppeteer = require('puppeteer');

function mapToKeyValues(item){
  const [sell, , neutral, , buy] = item;
  return {sell, neutral, buy};
}

var getPage = async function (pairSimbols = 'EURUSD') {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(`https://www.tradingview.com/symbols/EURUSD/technicals/`, {
      waitUntil: 'networkidle2',
    });
    const containers = await page.evaluate(function getList() {
      let list = Array.from(
        document.querySelectorAll('.countersWrapper-DPgs-R4s')
      );
      let data = list.map(function convertTo2DArray(item) {
        return item.innerText.split('\n');
      });
      return data;
    });
    const oscillators = mapToKeyValues(containers[0]);
    const summary = mapToKeyValues(containers[1]);
    const movingAverage = mapToKeyValues(containers[2]);
    await browser.close();
  } catch (e) {
    console.log(e);
  }
};
getPage();
