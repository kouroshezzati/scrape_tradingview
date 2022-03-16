const puppeteer = require('puppeteer');

exports.getPageData = async function (pairSimbols = 'EURUSD') {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto(
        `https://www.tradingview.com/symbols/${pairSimbols}/technicals/`,
        {
          waitUntil: 'networkidle2',
        }
      );
      const containers = await page.evaluate(getList);
      const [oscillators, summary, movingAverage] = containers;
      await browser.close();
      resolve({ oscillators, summary, movingAverage });
    } catch (e) {
      reject(e);
    }
  });
};

function getList() {
  let list = Array.from(document.querySelectorAll('.countersWrapper-DPgs-R4s'));
  let data = list.map(function convertTo2DArray(item) {
    return {
      sell: +item.querySelector('.sellColor-DPgs-R4s').innerHTML,
      neutral: +item.querySelector('.neutralColor-DPgs-R4s').innerHTML,
      buy: +item.querySelector('.buyColor-DPgs-R4s').innerHTML,
    };
  });
  return data;
}

exports.getList = getList;
