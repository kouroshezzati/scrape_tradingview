const { Cluster } = require('puppeteer-cluster');
const ExcelJS = require('exceljs');
const fs = require('fs');

async function getPageData(links) {
  return new Promise(async (resolve, reject) => {
    try {
      const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 200,
        monitor: true,
      });
      let allData = [];
      await cluster.task(async function getData({ page, data: url }) {
        await page.goto(url, {
          waitUntil: 'networkidle2',
        });
        const data = await page.evaluate(getList);
        const [oscillators, summary, movingAverage] = data;
        allData.push({ oscillators, summary, movingAverage });
      });
      links.map(async function addQueue(link) {
        cluster.queue(link);
      });

      await cluster.idle();
      await cluster.close();
      resolve(allData);
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

async function writeToFile(rows) {
  try {
    if (!rows || !Array.isArray(rows) || rows.length == 0) {
      throw new Error('the rows of data is not valid');
    }
    const date = new Date();
    const time = date.toLocaleTimeString('en-US', { hour12: false });
    const fileName = date.toLocaleDateString().replace(/\//g, '-') + '.xlsx';
    filePath = './data/' + fileName;
    const workbook = new ExcelJS.Workbook();
    let worksheet;
    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
    }
    rows.forEach(function createExcelRow(row) {
      const sheetName = row.symbol;
      worksheet = workbook.getWorksheet(sheetName);
      if (!worksheet) {
        worksheet = workbook.addWorksheet(sheetName);
      }
      worksheet.columns = [
        { header: 'Time', key: 'time' },
        { header: 'Number', key: 'number' },
      ];
      worksheet.addRow({
        time,
        number: getOscillatorsData(
          row.oscillators,
          row.movingAverage,
          row.summary
        ),
      });
    });
    await workbook.xlsx.writeFile(filePath);
    return true;
  } catch (e) {
    console.log('Error in writeToFile() is', e);
    return false;
  }
}

exports.getList = getList;
exports.getOscillatorsData = getOscillatorsData;
exports.getPageData = getPageData;
exports.writeToFile = writeToFile;
