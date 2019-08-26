const axios = require('axios');
const axe = require('axe-core');

const webpage = async (browser, {
  url,
  useJs = false,
  tags = ['wcag2a', 'best-practice'],
}) => {
  if (useJs) {
    // use puppeteer
    try {
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: 'networkidle2' });

      const html = await page.evaluate(() => document.documentElement.innerHTML);

      await page.exposeFunction('axe', axe);

      const report = await page.evaluate(async (tags) => await axe.run({
        runOnly: {
          type: 'tag',
          values: tags,
        },
        resultTypes: ['violations', 'incomplete', 'inapplicable', 'passes']
      }), tags);

      await page.close();

      return { url, report, html };
    } catch (error) {
      throw error;
    }
  }

  // [TODO]: need to find a way to make this solution work with js disabled
  try {
    const remoteResponse = await axios.get(url, { responseType: 'text' });
    return remoteResponse.data;
  } catch (error) {
    throw error;
  }
}

module.exports = webpage;
