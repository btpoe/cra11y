const puppeteer = require('puppeteer');
const axios = require('axios');

const webpage = async (options) => {
  const { url, useJs = false } = options;
  let html = '';

  if (useJs) {
    // use puppeteer
    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    });

    try {
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: 'networkidle2' });

      html = await page.evaluate(() => document.documentElement.innerHTML);

    } catch (error) {
      return error;
    }

    await browser.close();

    return html;
  }

  const opts = {
    responseType: 'text',
  };

  try {
    const remoteResponse = await axios.get(url, opts);
    return remoteResponse.data;
  } catch (error) {
    return error;
  }
}

module.exports = webpage;
