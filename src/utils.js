const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const fs = require('fs');

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

function writeToFile(pairSimbols, number) {
  return new Promise(async (resolve, reject) => {
    try {
      const date = new Date();
      const time = date.toLocaleTimeString('en-US', { hour12: false });
      const fileName = date.toLocaleDateString().replace(/\//g, '-') + '.xlsx';
      filePath = './data/' + fileName;
      const workbook = new ExcelJS.Workbook();
      let worksheet;
      if (fs.existsSync(filePath)) {
        await workbook.xlsx.readFile(filePath);
        worksheet = workbook.getWorksheet(pairSimbols);
        if (!worksheet) {
          worksheet = workbook.addWorksheet(pairSimbols);
        }
      } else {
        worksheet = workbook.addWorksheet(pairSimbols);
      }
      worksheet.columns = [
        { header: 'Time', key: 'time' },
        { header: 'Number', key: 'number' },
      ];
      worksheet.addRow({ time, number });
      await workbook.xlsx.writeFile(filePath);
      resolve(true);
    } catch (e) {
      console.log('Error in writeToFile() is', e);
      reject(false);
    }
  });
}

exports.getList = getList;
exports.getOscillatorsData = getOscillatorsData;
exports.getPageData = getPageData;
exports.writeToFile = writeToFile;
