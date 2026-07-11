const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} };
global.performance = { now: () => 0 };

try {
  require('./script.js');
  console.log('Script loaded successfully!');
} catch (e) {
  console.error(e);
}
