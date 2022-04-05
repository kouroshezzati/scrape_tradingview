var CronJob = require('cron').CronJob;
const { writeToFile, getPageData, TIMEZONE } = require('./utils');

async function scrape() {
  try {
    const data = await getPageData(Object.values(pairSymbols));
    if (!data || !Array.isArray(data) || data.length == 0) {
      throw new Error('The page data is not valid');
    }
    const symbols = Object.keys(pairSymbols);
    const rows = data.map(function mapDataToRow(row, index) {
      return {
        ...row,
        symbol: symbols[index],
      };
    });
    return writeToFile(rows);
  } catch (e) {
    console.log('Error in scrape() is', e);
    return false;
  }
}

var pairSymbols = {
  EURUSD: 'https://www.tradingview.com/symbols/EURUSD/technicals/',
  GBPUSD: 'https://www.tradingview.com/symbols/GBPUSD/technicals/',
  // USDCHF: 'https://www.tradingview.com/symbols/USDCHF/technicals/',
  // USDJPY: 'https://www.tradingview.com/symbols/USDJPY/technicals/',
  // USDCAD: 'https://www.tradingview.com/symbols/USDCAD/technicals/',
  // AUDUSD: 'https://www.tradingview.com/symbols/AUDUSD/technicals/',
  // NZDUSD: 'https://www.tradingview.com/symbols/NZDUSD/technicals/',
  // EURJPY: 'https://www.tradingview.com/symbols/EURJPY/technicals/',
  // EURGBP: 'https://www.tradingview.com/symbols/EURGBP/technicals/',
  // GBPJPY: 'https://www.tradingview.com/symbols/GBPJPY/technicals/',
  // EURCAD: 'https://www.tradingview.com/symbols/EURCAD/technicals/',
  // EURAUD: 'https://www.tradingview.com/symbols/EURAUD/technicals/',
  // AUDJPY: 'https://www.tradingview.com/symbols/AUDJPY/technicals/',
  // GBPAUD: 'https://www.tradingview.com/symbols/GBPAUD/technicals/',
  // GBPCAD: 'https://www.tradingview.com/symbols/GBPCAD/technicals/',
  // GBPCHF: 'https://www.tradingview.com/symbols/GBPCHF/technicals/',
  // NZDJPY: 'https://www.tradingview.com/symbols/NZDJPY/technicals/',
  // CADCHF: 'https://www.tradingview.com/symbols/CADCHF/technicals/',
  // NZDCAD: 'https://www.tradingview.com/symbols/NZDCAD/technicals/',
  // BTCUSD: 'https://www.tradingview.com/symbols/BTCUSD/technicals/',
};

exports.scrape = scrape;
exports.pairSymbols = pairSymbols;

// var job = new CronJob(
//   '*/1 2-22 * * 1-5',
//   function () {
//     console.log('ran at ' + new Date());
//     scrape();
//   },
//   null,
//   true,
//   TIMEZONE
// );
// job.start();
scrape();
