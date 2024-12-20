import express from 'express';
import path from 'path';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import { fileURLToPath, URL } from 'url';
import puppeteer from 'puppeteer';

const app = express();
const PORT = 3000;
app.use(cors());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// app.use(express.json());
app.use(
  '/lighthouse-reports',
  express.static(path.join(__dirname, 'lighthouse-reports'))
);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Function to generate Lighthouse report
async function generateLighthouseReport(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const { lhr, report } = await lighthouse(url, {
    port: new URL(browser.wsEndpoint()).port,
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });

  await browser.close();

  // Save report to file
  const reportPath = path.join(
    __dirname,
    'reports',
    encodeURIComponent(url) + '.html'
  );
  try {
    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log('Report successfully saved:', reportPath);
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }

  return reportPath;
}

// Endpoint to handle Lighthouse report generation
app.get('/lighthouse', async (req, res) => {
  const { url: targetUrl } = req.query;
  try {
    const reportPath = await generateLighthouseReport(targetUrl);
    res.sendFile(reportPath);
  } catch (error) {
    console.error('Error generating Lighthouse report:', error);
    res.status(500).send('Error generating Lighthouse report');
  }
});

// Serve reports statically
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// app.get('/lighthouse', async (req, res) => {
//   const { url } = req.query;

//   if (!url) {
//     return res.status(400).send('URL parameter is required');
//   }

//   try {
//     const executablePath = puppeteer.executablePath();
//     console.log('Using Chrome at path:', executablePath);
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-dev-shm-usage',
//         '--disable-accelerated-2d-canvas',
//         '--no-first-run',
//         '--no-zygote',
//         // '--single-process', // Required for Docker environments
//         '--disable-gpu',
//       ],
//     });

//     const browserWSEndpoint = browser.wsEndpoint();

//     // const chrome = await launch({ chromeFlags: ['--headless'] });
//     const options = {
//       logLevel: 'info',
//       output: 'html',
//       port: new URL(browserWSEndpoint).port,
//     };

//     const runnerResult = await lighthouse(url, options);

//     // Save the report to an HTML file
//     const reportHtml = runnerResult.report;
//     const filePath = path.join(__dirname, `lighthouse.html`);

//     // Ensure 'reports' directory exists
//     fs.mkdirSync(path.join(__dirname), { recursive: true });
//     fs.writeFileSync(filePath, reportHtml);

//     // await chrome.kill();
//     await browser.close();

//     // Serve the generated HTML file
//     res.sendFile(filePath);
//   } catch (error) {
//     console.error('Error running Lighthouse audit:', error);
//     res.status(500).send('Error running Lighthouse audit');
//   }
// });
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
