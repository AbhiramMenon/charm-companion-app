import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch();

const mobile = await browser.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto('http://localhost:5173', { waitUntil: 'load', timeout: 20000 });
await mobile.waitForTimeout(3000);
const mobileShot = await mobile.screenshot({ fullPage: false });
writeFileSync('C:\\Users\\abhir\\AppData\\Local\\Temp\\mobile-app.png', mobileShot);
console.log('Mobile screenshot saved');

const admin = await browser.newPage();
await admin.setViewportSize({ width: 1400, height: 900 });
await admin.goto('http://localhost:5174', { waitUntil: 'load', timeout: 20000 });
await admin.waitForTimeout(3000);
const adminShot = await admin.screenshot({ fullPage: false });
writeFileSync('C:\\Users\\abhir\\AppData\\Local\\Temp\\admin-app.png', adminShot);
console.log('Admin screenshot saved');

await browser.close();
