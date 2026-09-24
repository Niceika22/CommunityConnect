const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
  });
  page.on('response', response => {
    console.log('RESPONSE:', response.url(), response.status());
  });

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'admin@communityconnect.com');
  await page.type('input[type="password"]', 'Admin@12345');
  
  await Promise.all([
    page.click('button[type="submit"]')
  ]);
  
  await new Promise(r => setTimeout(r, 2000));
  
  const errorText = await page.evaluate(() => {
    const el = document.querySelector('.bg-red-100');
    return el ? el.innerText : 'NO ERROR';
  });
  console.log('UI ERROR:', errorText);
  
  await browser.close();
})();
