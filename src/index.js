const express = require('express');
const { getPage } = require('./scraper');


const app = express();
const PORT = 8000;

app.get('/', (req, res) => {
  getPage();
  res.send('Okay');
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
