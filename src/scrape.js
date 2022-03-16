const { writeToFile, getPageData } = require('./utils');

async function scrape() {
  try {
    const { movingAverage, summary } = await getPageData();
    if (isWritable(movingAverage, summary)) {
      return writeToFile(movingAverage, summary);
    }
    return writeToFile();
  } catch (e) {
    console.log('Erorr in scrape() is', e);
    return false;
  }
}
exports.scrape = scrape;
