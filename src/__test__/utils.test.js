/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, 'template.html'));
const {
  getPageData,
  getList,
  getOscillatorsData,
  writeToFile,
} = require('../utils');

let mockReadFile = jest.fn(),
  mockWriteFile = jest.fn(),
  mockGetWorksheet = jest.fn(),
  mockAddWorksheet = jest.fn();
jest.mock('exceljs', () => ({
  ...jest.requireActual('exceljs'),
  Workbook: jest.fn().mockImplementation(() => ({
    xlsx: { readFile: mockReadFile, writeFile: mockWriteFile },
    getWorksheet: mockGetWorksheet,
    addWorksheet: mockAddWorksheet,
  })),
}));

let mockExistsSync = jest.fn();

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: () => mockExistsSync(),
}));

const mockGoTo = jest.fn();
const mockEvaluate = jest.fn(getList);

jest.mock('puppeteer', () => ({
  ...jest.requireActual('puppeteer'),
  launch: () => ({
    newPage: () => ({ goto: mockGoTo, evaluate: mockEvaluate }),
    close: jest.fn(),
  }),
}));

describe('Test scraper', () => {
  beforeEach(() => {
    document.body.innerHTML = html.toString();
  });
  test('should return data from the page', async () => {
    const { oscillators, summary, movingAverage } = await getPageData();
    expect(oscillators).toEqual({ sell: 1, neutral: 9, buy: 1 });
    expect(summary).toEqual({ sell: 12, neutral: 10, buy: 3 });
    expect(movingAverage).toEqual({ sell: 11, neutral: 1, buy: 2 });
  });
});

describe('Test conditions', () => {
  test('if one of buy or sell in either moving average or summary is less than or grater than', () => {
    expect(
      getOscillatorsData(
        { buy: 1, neutral: 2, sell: 3 },
        { buy: 1, sell: 2 },
        { buy: 0, sell: 3 }
      )
    ).toBe('23');
    expect(
      getOscillatorsData(
        { buy: 1, neutral: 2, sell: 3 },
        { buy: 2, sell: 1 },
        { buy: 2, sell: 0 }
      )
    ).toBe('21');
    expect(getOscillatorsData()).toBeFalsy();
  });
});

describe('Test write to file', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should read from an excel file', async () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFile.mockReturnValue(true);
    const mockAddRow = jest.fn();
    mockGetWorksheet = jest.fn(() => ({ addRow: mockAddRow }));
    await writeToFile('EURUSD', 40);
    expect(mockExistsSync).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    expect(mockGetWorksheet).toHaveBeenCalledTimes(1);
    expect(mockAddWorksheet).toHaveBeenCalledTimes(0);
    expect(mockAddRow).toHaveBeenCalledTimes(1);
  });

  test('should read from an excel file and create a worksheet', async () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFile.mockReturnValue(true);
    mockGetWorksheet.mockReturnValue(undefined);
    const mockAddRow = jest.fn();
    mockAddWorksheet = jest.fn(() => ({ addRow: mockAddRow }));
    await writeToFile('EURUSD', 40);
    expect(mockExistsSync).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    expect(mockGetWorksheet).toHaveBeenCalledTimes(1);
    expect(mockAddWorksheet).toHaveBeenCalledTimes(1);
    expect(mockAddRow).toHaveBeenCalledTimes(1);
  });

  test('should read from excel file', async () => {
    mockExistsSync.mockReturnValue(false);
    const mockAddRow = jest.fn();
    mockAddWorksheet = jest.fn(() => ({ addRow: mockAddRow }));
    await writeToFile('EURUSD', 40);
    expect(mockExistsSync).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledTimes(0);
    expect(mockGetWorksheet).toHaveBeenCalledTimes(0);
    expect(mockAddWorksheet).toHaveBeenCalledTimes(1);
    expect(mockAddRow).toHaveBeenCalledTimes(1);
  });
});
