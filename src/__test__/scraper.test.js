/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, 'template.html'));
const { getPageData, getList } = require('../scraper');

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
