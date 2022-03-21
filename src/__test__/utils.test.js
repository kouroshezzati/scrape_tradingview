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
const { mockData } = require('./data');
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

const mockTask = jest.fn();
const mockIdle = jest.fn();
const mockClose = jest.fn();

jest.mock('puppeteer-cluster', () => ({
  ...jest.requireActual('puppeteer-cluster'),
  Cluster: {
    launch: () => ({ task: mockTask, idle: mockIdle, close: mockClose }),
  },
}));

describe('Test getPageData', () => {
  beforeEach(() => {
    document.body.innerHTML = html.toString();
  });
  test('should return data from the page', async () => {
    await getPageData(['link1', 'link2']);
    expect(mockTask).toHaveBeenCalledTimes(1);
    expect(mockIdle).toHaveBeenCalledTimes(1);
    expect(mockClose).toHaveBeenCalledTimes(1);
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
    await writeToFile(mockData.slice(0, 2));
    expect(mockExistsSync).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    expect(mockGetWorksheet).toHaveBeenCalledTimes(2);
    expect(mockAddWorksheet).toHaveBeenCalledTimes(0);
    expect(mockAddRow).toHaveBeenCalledTimes(2);
  });

  test('should read from an excel file and create two worksheets', async () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFile.mockReturnValue(true);
    mockGetWorksheet.mockReturnValue(undefined);
    const mockAddRow = jest.fn();
    mockAddWorksheet = jest.fn(() => ({ addRow: mockAddRow }));
    await writeToFile(mockData.slice(0, 2));
    expect(mockExistsSync).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
    expect(mockGetWorksheet).toHaveBeenCalledTimes(2);
    expect(mockAddWorksheet).toHaveBeenCalledTimes(2);
    expect(mockAddRow).toHaveBeenCalledTimes(2);
  });

  test('should write an excel file', async () => {
    mockExistsSync.mockReturnValue(false);
    mockGetWorksheet.mockReturnValue(undefined);
    const mockAddRow = jest.fn();
    mockAddWorksheet = jest.fn(() => ({ addRow: mockAddRow }));
    await writeToFile(mockData.slice(0, 2));
    expect(mockExistsSync).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledTimes(0);
    expect(mockGetWorksheet).toHaveBeenCalledTimes(2);
    expect(mockAddWorksheet).toHaveBeenCalledTimes(2);
    expect(mockAddRow).toHaveBeenCalledTimes(2);
  });
});
