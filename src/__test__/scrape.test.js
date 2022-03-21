const { scrape } = require('../scrape');
const { mockData } = require('./data');
const mockWriteToFile = jest.fn().mockReturnValue(true),
  mockGetPageData = jest.fn().mockReturnValue(mockData);

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  getPageData: () => mockGetPageData(),
  writeToFile: () => mockWriteToFile(),
}));

describe('Test scrape()', () => {
  test('should call writeToFile()', async () => {
    const result = await scrape();
    expect(result).toBeTruthy();
    expect(mockWriteToFile).toHaveBeenCalledTimes(1);
  });
});
