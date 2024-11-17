import express from 'express';
import path from 'path';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const app = express();
const PORT = 3000;

app.use(express.static('public')); // Serve static files (e.g., Lighthouse reports)
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/lighthouse', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const browserWSEndpoint = browser.wsEndpoint();

    // const chrome = await launch({ chromeFlags: ['--headless'] });
    const options = {
      logLevel: 'info',
      output: 'html',
      port: new URL(browserWSEndpoint).port,
    };

    const runnerResult = await lighthouse(url, options);

    // Save the report to an HTML file
    const reportHtml = runnerResult.report;
    const filePath = path.join(__dirname, `lighthouse.html`);

    // Ensure 'reports' directory exists
    fs.mkdirSync(path.join(__dirname), { recursive: true });
    fs.writeFileSync(filePath, reportHtml);

    // await chrome.kill();
    await browser.close();

    // Serve the generated HTML file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error running Lighthouse audit:', error);
    res.status(500).send('Error running Lighthouse audit');
  }
});
//   const { url } = req.query; // Pass the target URL as a query parameter

//   if (!url) {
//     return res.status(400).send('Please provide a URL as a query parameter');
//   }

//   try {
//     // Launch Chrome to run Lighthouse
//     const chromePath = '/usr/bin/google-chrome-stable';

//     // Launch Chrome to run Lighthouse
//     const chrome = await launch({
//       chromeFlags: [
//         '--headless',
//         '--no-sandbox',
//         '--disable-gpu',
//         '--remote-debugging-port=9222',
//       ],
//       chromePath, // Specify the Chrome path directly
//     });

//     // Run Lighthouse with the launched Chrome instance
//     const options = { logLevel: 'info', output: 'html', port: chrome.port };
//     const runnerResult = await lighthouse(url, options);

//     // Get the report HTML
//     const reportHtml = runnerResult.report;

//     // Optional: Save the report to a file
//     // fs.writeFileSync('report.html', reportHtml);

//     // Send the HTML response
//     res.send(reportHtml);

//     await chrome.kill();
//   } catch (error) {
//     res
//       .status(500)
//       .send('Error generating Lighthouse report: ' + error.message);
//   }
// });

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
