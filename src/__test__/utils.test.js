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
  test('should write data to a file', () => {
    writeToFile(null, null, 'hi');
  });
});
