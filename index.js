import express from 'express';
import cors from 'cors';
import lighthouse from 'lighthouse';
import fs from 'fs';
import { launch } from 'chrome-launcher';
import puppeteer from 'puppeteer';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/lighthouse', async (req, res) => {
  const { url } = req.query; // Pass the target URL as a query parameter

  if (!url) {
    return res.status(400).send('Please provide a URL as a query parameter');
  }

  try {
    // Launch Chrome to run Lighthouse
    const chromePath = puppeteer.executablePath();

    // Launch Chrome to run Lighthouse
    const chrome = await launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
      chromePath: chromePath, // Provide the path to the executable
    });

    const options = { logLevel: 'info', output: 'html', port: chrome.port };
    const runnerResult = await lighthouse(url, options);

    // Get the report HTML
    const reportHtml = runnerResult.report;

    // Optional: Save the report to a file
    fs.writeFileSync('report.html', reportHtml);

    // Send the HTML response
    res.send(reportHtml);

    await chrome.kill();
  } catch (error) {
    res
      .status(500)
      .send('Error generating Lighthouse report: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
