import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

const errors = [];
const networkFails = [];

page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('requestfailed', req => {
  networkFails.push(req.url() + ' - ' + req.failure()?.errorText);
});

await page.goto('http://localhost:5173', { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(6000);

console.log('=== CONSOLE ERRORS ===');
errors.forEach(e => console.log(e));
console.log('=== NETWORK FAILS ===');
networkFails.forEach(e => console.log(e));

await browser.close();
