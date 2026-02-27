#!/usr/bin/env node
// Quick debug: dump license record structure + test bulk image lookup
const https = require('https');
const { loadConfig } = require('./config-loader.cjs');
const config = loadConfig();
const TOKEN = config.SHUTTERSTOCK_API_TOKEN;

function apiGet(apiPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.shutterstock.com',
      path: apiPath,
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
        console.log('Status: ' + res.statusCode);
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data.slice(0, 1000) });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  // 1. Get first page of licenses and dump first 2 records
  console.log('=== LICENSE RECORD STRUCTURE ===\n');
  var licResult = await apiGet('/v2/images/licenses?per_page=3&page=1');
  console.log('License endpoint status:', licResult.status);
  if (licResult.data && licResult.data.data) {
    licResult.data.data.forEach(function(lic, i) {
      console.log('\n--- License #' + (i + 1) + ' ---');
      console.log(JSON.stringify(lic, null, 2));
    });
  }

  await new Promise(function(r) { setTimeout(r, 1000); });

  // 2. Try bulk image lookup with first 3 IDs
  var ids = [];
  if (licResult.data && licResult.data.data) {
    ids = licResult.data.data.map(function(lic) {
      return (lic.image && lic.image.id) || '';
    }).filter(Boolean);
  }

  if (ids.length > 0) {
    console.log('\n\n=== BULK IMAGE LOOKUP (/v2/images?id=...) ===\n');
    var bulkResult = await apiGet('/v2/images?id=' + ids.join(',') + '&view=full');
    console.log('Bulk endpoint status:', bulkResult.status);
    if (bulkResult.data && bulkResult.data.data) {
      bulkResult.data.data.forEach(function(img, i) {
        console.log('\n--- Image #' + (i + 1) + ' ---');
        console.log('ID:', img.id);
        console.log('Description:', (img.description || 'none').slice(0, 200));
        console.log('Keywords:', (img.keywords || []).slice(0, 10).join(', '));
        console.log('Media type:', img.media_type);
        console.log('Assets:', Object.keys(img.assets || {}));
      });
    } else {
      console.log('Response:', JSON.stringify(bulkResult.data).slice(0, 1000));
    }
  }

  // 3. Try the download/redownload endpoint for the first license
  if (licResult.data && licResult.data.data && licResult.data.data[0]) {
    var firstLic = licResult.data.data[0];
    var licId = firstLic.id;
    console.log('\n\n=== DOWNLOAD URL TEST (license ' + licId + ') ===\n');

    // Check if download info is already in the license record
    if (firstLic.download) {
      console.log('Download in license record:', JSON.stringify(firstLic.download));
    }

    // Try the redownload endpoint
    await new Promise(function(r) { setTimeout(r, 1000); });
    try {
      var dlResult = await apiGet('/v2/images/licenses/' + licId + '/downloads');
      console.log('Redownload endpoint status:', dlResult.status);
      console.log('Response:', JSON.stringify(dlResult.data).slice(0, 500));
    } catch (err) {
      console.log('Redownload error:', err.message.slice(0, 200));
    }
  }
}

main().catch(function(err) { console.error('Fatal:', err); });
