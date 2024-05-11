import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import esMain from 'es-main';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readJSONFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

async function login(page, origin) {
  await page.goto(origin);
  await page.type('input[name="username"]', '13753212768');
  await page.type('input[name="password"]', '123456');
  await page.click('button.el-button--primary');
  await page.waitForNavigation({ waitUntil: 'load' });
}

async function runLighthouse(url, page) {
  const lhOptions = {
    logLevel: 'debug',
    output: 'html',
    locale: 'zh',
  }
  const lhConfig = {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance','best-practices'],//'performance', 'accessibility', 'best-practices', 'seo'
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0,
        cpuSlowdownMultiplier: 1,
      },
      screenEmulation: {
        mobile: false,
        width: 1920,
        height: 1000,
        deviceScaleFactor: 1,
        disabled: false,
      },
      emulatedUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.202 Safari/537.36',
    },
  }
  const result = await lighthouse(url, lhOptions, lhConfig, page);
  return result.report;
}

async function main() {
  const browser = await puppeteer.launch({
                                        headless: true,
                                        ignoreHTTPSErrors: true,
                                        slowMo: 0.2,
                                        defaultViewport: null,
                                        args: [
                                        '--start-maximized',
                                        '--disable-gpu',
                                        '--no-sandbox',
                                        '--disable-dev-shm-usage',
                                        '--disable-setuid-sandbox',
                                        '--no-first-run',
                                        '--no-zygote',
                                        '--disable-extensions',
                                        ],
                                      });
  const pages = await browser.pages();
  const page = pages[0];
  const jsonFilePath = path.join(__dirname, 'url.json');
  const jsonData = await readJSONFile(jsonFilePath);
  let loginUrl = jsonData.login_url;
  let combinedReport = '<html><head><title>Lighthouse Reports</title></head><body>';
  combinedReport += await runLighthouse(loginUrl, page);
  await login(page, loginUrl);
  const urls = jsonData.test_urls;
  for (const url of urls) {
    const reportHtml = await runLighthouse(url, page);
    combinedReport += reportHtml;
  }
  combinedReport += '</body></html>';
  const now = new Date();
  const filename = `lhreport_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}T${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.html`;
  fs.writeFileSync(filename, combinedReport);
  await browser.close();
}

if (esMain(import.meta)) {
  await main();
}

export {
  login,
};