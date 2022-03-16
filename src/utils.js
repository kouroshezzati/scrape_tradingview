const puppeteer = require('puppeteer');
var xl = require('excel4node');

async function getPageData(pairSimbols = 'EURUSD') {
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
}

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

function getOscillatorsData(oscillators, movingAverage, summary) {
  if (
    movingAverage?.buy > movingAverage?.sell &&
    summary?.buy > summary?.sell
  ) {
    return `${oscillators.neutral}${oscillators.buy}`;
  } else if (
    movingAverage?.buy < movingAverage?.sell &&
    summary?.buy < summary?.sell
  ) {
    return `${oscillators.neutral}${oscillators.sell}`;
  }
  return false;
}

async function writeToFile(pairSimbols, number, col) {
  var wb = new xl.Workbook();
  addHeadToExcelFile(ws, col);
  ws.cell(2, 3).string(String(pairSimbols).toUpperCase());
  ws.cell(3, 2).string(
    new Date().toLocaleTimeString('en-US', { hour12: false })
  );
  ws.cell(3, 4).number(number);
  wb.write('data.xlsx');
}

function addHeadToExcelFile(ws, col = 1) {
  var style = wb.createStyle({
    font: {
      color: '#FF0800',
      size: 12,
    },
  });
  ws.cell(col, 1).style(style).string('DATE');
  ws.cell(col, 2).style(style).string('TIME');
  ws.cell(col, 3).string('NAME');
  ws.cell(col, 4).string('NUMBER');
}

exports.getList = getList;
exports.getOscillatorsData = getOscillatorsData;
exports.getPageData = getPageData;
exports.writeToFile = writeToFile;
