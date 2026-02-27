#!/usr/bin/env node
// Check rate limit headers from Shutterstock API
const https = require('https');
const { loadConfig } = require('./config-loader.cjs');
const config = loadConfig();
const TOKEN = config.SHUTTERSTOCK_API_TOKEN;

const options = {
  hostname: 'api.shutterstock.com',
  path: '/v2/images/licenses?per_page=1&page=1',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + TOKEN,
    'Accept': 'application/json',
    'User-Agent': 'DiscoverPhilippines/1.0',
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('\nAll headers:');
    for (var key in res.headers) {
      console.log('  ' + key + ': ' + res.headers[key]);
    }
    console.log('\nBody preview:', data.slice(0, 300));
  });
});
req.on('error', e => console.error('Error:', e.message));
req.end();
