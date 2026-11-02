const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/daffa', { waitUntil: 'networkidle' });
  
  await page.waitForSelector('.pm-role-cutout');
  
  const cutoutStyles = await page.evaluate(() => {
    const cutout = document.querySelector('.pm-role-cutout');
    const roleInCutout = document.querySelector('.pm-role-cutout .pm-role');
    const roleBase = document.querySelector('.pm-portrait-wrap > .pm-role');
    
    return {
      cutoutZIndex: window.getComputedStyle(cutout).zIndex,
      cutoutMask: window.getComputedStyle(cutout).maskImage,
      roleInCutout: roleInCutout ? {
        position: window.getComputedStyle(roleInCutout).position,
        zIndex: window.getComputedStyle(roleInCutout).zIndex,
        color: window.getComputedStyle(roleInCutout).color,
        right: window.getComputedStyle(roleInCutout).right,
        bottom: window.getComputedStyle(roleInCutout).bottom,
      } : null,
      roleBase: roleBase ? {
        position: window.getComputedStyle(roleBase).position,
        zIndex: window.getComputedStyle(roleBase).zIndex,
        color: window.getComputedStyle(roleBase).color,
        right: window.getComputedStyle(roleBase).right,
        bottom: window.getComputedStyle(roleBase).bottom,
      } : null,
    };
  });
  
  console.log(JSON.stringify(cutoutStyles, null, 2));
  
  await browser.close();
})();
