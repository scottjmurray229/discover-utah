#!/usr/bin/env node
/**
 * Shutterstock Licensed Images Downloader
 *
 * Lists all licensed images from Shutterstock account, identifies them
 * by destination using metadata, and downloads with descriptive filenames.
 *
 * Handles rate limiting (100 req/hr) with automatic wait + retry.
 * Saves progress to JSON state file for resume support.
 *
 * Usage:
 *   node video-tracking/pipeline/shutterstock-images.cjs                # Full pipeline: list + download
 *   node video-tracking/pipeline/shutterstock-images.cjs --list-only    # Just list, don't download
 *   node video-tracking/pipeline/shutterstock-images.cjs --resume       # Resume interrupted download
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { loadConfig } = require('./config-loader.cjs');

const config = loadConfig();
const TOKEN = config.SHUTTERSTOCK_API_TOKEN;
const DOWNLOAD_DIR = path.join(config.PROJECT_ROOT, 'shutterstock-downloads');
const STATE_FILE = path.join(config.PROJECT_ROOT, 'video-tracking', 'shutterstock-images-state.json');

const args = process.argv.slice(2);
const listOnly = args.includes('--list-only');
const resumeMode = args.includes('--resume');

// --- API Helpers with rate limit handling ---

var requestCount = 0;

function apiRequest(method, apiPath, body) {
  return new Promise(function(resolve, reject) {
    var bodyStr = body ? JSON.stringify(body) : null;
    var headers = {
      'Authorization': 'Bearer ' + TOKEN,
      'Accept': 'application/json',
      'User-Agent': 'DiscoverPhilippines/1.0',
    };
    if (bodyStr) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    var options = {
      hostname: 'api.shutterstock.com',
      path: apiPath,
      method: method,
      headers: headers,
    };

    var req = https.request(options, function(res) {
      var data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        requestCount++;
        var remaining = res.headers['ratelimit-remaining'];
        var resetTs = res.headers['ratelimit-reset'];

        if (res.statusCode === 429) {
          // Rate limited — calculate wait time
          var resetMs = parseInt(resetTs) || (Date.now() + 3600000);
          var waitMs = resetMs - Date.now() + 2000; // +2s buffer
          if (waitMs < 5000) waitMs = 5000;
          var waitMin = Math.ceil(waitMs / 60000);
          resolve({
            status: 429,
            rateLimited: true,
            waitMs: waitMs,
            waitMin: waitMin,
            remaining: 0,
            resetTs: resetMs,
          });
          return;
        }

        var parsed = null;
        try { parsed = JSON.parse(data); } catch(e) { parsed = data; }

        resolve({
          status: res.statusCode,
          data: parsed,
          remaining: remaining ? parseInt(remaining) : null,
          resetTs: resetTs ? parseInt(resetTs) : null,
        });
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function apiGetWithRetry(apiPath) {
  while (true) {
    var result = await apiRequest('GET', apiPath);
    if (result.rateLimited) {
      console.log('\n  [Rate limited] Waiting ' + result.waitMin + ' minutes until reset...');
      await sleep(result.waitMs);
      console.log('  [Resumed] Continuing...\n');
      continue;
    }
    return result;
  }
}

async function apiPostWithRetry(apiPath, body) {
  while (true) {
    var result = await apiRequest('POST', apiPath, body);
    if (result.rateLimited) {
      console.log('\n  [Rate limited] Waiting ' + result.waitMin + ' minutes until reset...');
      await sleep(result.waitMs);
      console.log('  [Resumed] Continuing...\n');
      continue;
    }
    return result;
  }
}

function sleep(ms) {
  return new Promise(function(r) { setTimeout(r, ms); });
}

function downloadFile(url, destPath) {
  return new Promise(function(resolve, reject) {
    var makeReq = function(reqUrl, redirectCount) {
      if (redirectCount > 5) { reject(new Error('Too many redirects')); return; }
      var urlObj = new URL(reqUrl);
      var proto = urlObj.protocol === 'https:' ? https : http;
      var options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: { 'User-Agent': 'DiscoverPhilippines/1.0' },
      };
      var req = proto.request(options, function(res) {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
          makeReq(res.headers.location, redirectCount + 1);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error('Download HTTP ' + res.statusCode));
          return;
        }
        var file = fs.createWriteStream(destPath);
        res.pipe(file);
        file.on('finish', function() { file.close(); resolve(destPath); });
        file.on('error', reject);
      });
      req.on('error', reject);
      req.end();
    };
    makeReq(url, 0);
  });
}

// --- Destination keyword matching ---

var DEST_KEYWORDS = {
  'boracay': ['boracay', 'white beach boracay', 'aklan', "d'mall"],
  'cebu': ['cebu', 'mactan', 'oslob', 'kawasan falls', 'moalboal', 'cebu city'],
  'el-nido': ['el nido', 'elnido', 'bacuit', 'miniloc', 'big lagoon', 'small lagoon'],
  'coron': ['coron', 'kayangan', 'barracuda lake', 'busuanga', 'twin lagoon'],
  'bohol': ['bohol', 'chocolate hills', 'panglao', 'tarsier', 'loboc river', 'balicasag'],
  'siargao': ['siargao', 'cloud 9', 'daku island', 'sugba lagoon'],
  'siquijor': ['siquijor', 'cambugahay', 'salagdoong', 'paliton beach'],
  'dumaguete': ['dumaguete', 'apo island', 'buglasan', 'negros oriental', 'rizal boulevard'],
  'palawan': ['palawan'],
  'manila': ['manila', 'intramuros', 'makati', 'bgc', 'taguig', 'rizal park', 'fort santiago'],
  'davao': ['davao', 'samal island', 'aliwagwag', 'mt apo', 'mount apo', 'philippine eagle'],
  'clark': ['clark', 'angeles city', 'pampanga', 'mt pinatubo', 'freeport'],
  'sagada': ['sagada', 'hanging coffins', 'sumaguing cave', 'cordillera', 'mountain province'],
  'banaue': ['banaue', 'batad', 'rice terraces', 'ifugao'],
  'vigan': ['vigan', 'calle crisologo', 'ilocos sur'],
  'laoag': ['laoag', 'paoay church', 'ilocos norte', 'sand dunes'],
  'batanes': ['batanes', 'batan island', 'ivatan', 'sabtang'],
  'camiguin': ['camiguin', 'sunken cemetery', 'white island camiguin'],
  'legazpi': ['legazpi', 'legaspi', 'mayon volcano', 'albay'],
  'donsol': ['donsol', 'whale shark', 'butanding', 'sorsogon'],
  'malapascua': ['malapascua', 'thresher shark'],
  'caramoan': ['caramoan', 'camarines sur'],
  'iloilo': ['iloilo', 'panay island', 'gigantes islands'],
  'guimaras': ['guimaras', 'guimaras mango'],
  'bacolod': ['bacolod', 'negros occidental', 'the ruins', 'masskara'],
  'la-union': ['la union', 'san juan surfing'],
  'tagaytay': ['tagaytay', 'taal volcano', 'taal lake'],
  'batangas': ['batangas', 'anilao', 'laiya'],
  'puerto-princesa': ['puerto princesa', 'subterranean river', 'underground river'],
  'subic': ['subic bay', 'zambales', 'olongapo'],
  'baler': ['baler', 'aurora province', 'sabang beach baler'],
  'sipalay': ['sipalay', 'sugar beach'],
  'pagudpud': ['pagudpud', 'saud beach', 'bangui windmills'],
  'puerto-galera': ['puerto galera', 'mindoro'],
  'biliran': ['biliran'],
  'samar': ['samar', 'sohoton'],
  'tacloban': ['tacloban', 'leyte', 'san juanico bridge'],
  'marinduque': ['marinduque', 'moriones festival'],
  'laguna': ['laguna', 'pagsanjan falls', 'mount makiling'],
  'mt-pulag': ['mt pulag', 'mount pulag', 'sea of clouds'],
  'bataan': ['bataan', 'corregidor island', 'death march', 'mount samat'],
  'baguio': ['baguio', 'burnham park', 'session road', 'mines view'],
  'cuyo': ['cuyo island'],
  // Generic categories
  'food': ['adobo', 'sinigang', 'lechon', 'lumpia', 'pancit', 'halo-halo', 'kare-kare', 'sisig', 'filipino food', 'filipino cuisine', 'philippine food', 'balut'],
  'festival': ['sinulog', 'ati-atihan', 'dinagyang', 'pahiyas', 'maskara', 'kadayawan', 'panagbenga', 'moriones'],
  'snorkeling': ['snorkeling philippines', 'coral reef philippines', 'underwater philippines'],
  'wwii': ['corregidor', 'bataan death march', 'manila liberation', 'world war ii philippines'],
};

function suggestDestination(description, keywords) {
  var searchText = ((description || '') + ' ' + (keywords || []).join(' ')).toLowerCase();

  var bestMatch = { dest: 'general', confidence: 0, matched: [] };

  for (var dest in DEST_KEYWORDS) {
    var kws = DEST_KEYWORDS[dest];
    var matched = kws.filter(function(kw) { return searchText.includes(kw.toLowerCase()); });
    if (matched.length > bestMatch.confidence) {
      bestMatch = { dest: dest, confidence: matched.length, matched: matched };
    }
  }

  // Also try matching "philippines" in general for unmatched items
  if (bestMatch.dest === 'general' && searchText.includes('philippines')) {
    bestMatch.dest = 'philippines-general';
  }

  return bestMatch;
}

function makeFilename(imageId, description, dest) {
  if (!description) return dest + '-' + imageId;
  var slug = description.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(function(w) {
      return w.length > 2 && !['the', 'and', 'for', 'with', 'from', 'aerial', 'view', 'stock', 'photo', 'image', 'beautiful', 'amazing', 'stunning', 'scenic'].includes(w);
    })
    .slice(0, 5)
    .join('-');
  return dest + '-' + (slug || imageId);
}

function formatSize(bytes) {
  if (bytes > 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
  if (bytes > 1e3) return (bytes / 1e3).toFixed(0) + ' KB';
  return bytes + ' B';
}

// --- State management ---

function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return { licenses: [], images: [], downloaded: [] };
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// --- Main Pipeline ---

async function fetchAllLicenses() {
  var allLicenses = [];
  var page = 1;

  while (true) {
    console.log('  Fetching licenses page ' + page + '...');
    var result = await apiGetWithRetry('/v2/images/licenses?per_page=100&page=' + page);

    if (result.status !== 200) {
      console.log('  Error fetching licenses: HTTP ' + result.status);
      break;
    }

    var data = result.data;
    if (!data.data || data.data.length === 0) break;

    allLicenses = allLicenses.concat(data.data);
    console.log('  Got ' + data.data.length + ' (total: ' + allLicenses.length + ', remaining API calls: ' + (result.remaining || '?') + ')');

    if (allLicenses.length >= (data.total_count || 0)) break;
    page++;
    await sleep(500);
  }

  return allLicenses;
}

async function fetchBulkMetadata(imageIds) {
  // Shutterstock /v2/images endpoint accepts up to 500 IDs
  // But let's do batches of 50 to be safe
  var BATCH = 50;
  var allImages = {};

  for (var i = 0; i < imageIds.length; i += BATCH) {
    var batch = imageIds.slice(i, i + BATCH);
    var batchNum = Math.floor(i / BATCH) + 1;
    var totalBatches = Math.ceil(imageIds.length / BATCH);
    process.stdout.write('  Fetching metadata batch ' + batchNum + '/' + totalBatches + ' (' + batch.length + ' images)...');

    var result = await apiGetWithRetry('/v2/images?id=' + batch.join(',') + '&view=full');

    if (result.status === 200 && result.data && result.data.data) {
      result.data.data.forEach(function(img) {
        allImages[img.id] = {
          id: img.id,
          description: img.description || '',
          keywords: (img.keywords || []).map(function(k) { return typeof k === 'string' ? k : (k.name || ''); }),
          media_type: img.media_type,
          aspect: img.aspect,
          image_type: img.image_type,
          categories: (img.categories || []).map(function(c) { return c.name || ''; }),
        };
      });
      console.log(' OK (' + result.data.data.length + ' found, remaining: ' + (result.remaining || '?') + ')');
    } else if (result.status === 403) {
      // Try individual lookups as fallback? No — too many requests
      console.log(' 403 Forbidden (subscription images — using license data only)');
    } else {
      console.log(' HTTP ' + result.status);
    }

    await sleep(800);
  }

  return allImages;
}

async function main() {
  if (!TOKEN || TOKEN === 'your_api_token_here') {
    console.error('Error: SHUTTERSTOCK_API_TOKEN not set in config.env');
    process.exit(1);
  }

  console.log('');
  console.log('='.repeat(62));
  console.log('  SHUTTERSTOCK LICENSED IMAGES — DOWNLOAD & RENAME');
  console.log('='.repeat(62));
  console.log('');

  var state = loadState();

  // === PHASE 1: Get all licenses ===
  if (!resumeMode || state.licenses.length === 0) {
    console.log('--- Phase 1: Fetching all image licenses ---\n');
    state.licenses = await fetchAllLicenses();
    saveState(state);
    console.log('\n  Total licensed images: ' + state.licenses.length + '\n');
  } else {
    console.log('  Resuming with ' + state.licenses.length + ' licenses from state file.\n');
  }

  if (state.licenses.length === 0) {
    console.log('  No licensed images found.');
    return;
  }

  // Extract image IDs
  var imageIds = state.licenses.map(function(lic) {
    return (lic.image && lic.image.id) || null;
  }).filter(Boolean);

  // Deduplicate
  imageIds = Array.from(new Set(imageIds));
  console.log('  Unique image IDs: ' + imageIds.length + '\n');

  // === PHASE 2: Get metadata for all images ===
  if (!resumeMode || !state.images || state.images.length === 0) {
    console.log('--- Phase 2: Fetching image metadata (bulk) ---\n');
    var metadataMap = await fetchBulkMetadata(imageIds);

    // Build enriched items list
    state.images = [];
    var licenseMap = {}; // imageId -> license record

    state.licenses.forEach(function(lic) {
      var imgId = (lic.image && lic.image.id) || 'unknown';
      if (!licenseMap[imgId]) licenseMap[imgId] = lic;
    });

    imageIds.forEach(function(imgId) {
      var meta = metadataMap[imgId] || {};
      var lic = licenseMap[imgId] || {};
      var desc = meta.description || '';
      var keywords = meta.keywords || [];
      var match = suggestDestination(desc, keywords);
      var filename = makeFilename(imgId, desc, match.dest);

      state.images.push({
        imageId: imgId,
        licenseId: lic.id || null,
        description: desc,
        keywords: keywords.slice(0, 15),
        destination: match.dest,
        confidence: match.confidence,
        matchedKeywords: match.matched,
        filename: filename,
        downloaded: false,
      });
    });

    saveState(state);
    console.log('\n  Enriched ' + state.images.length + ' images with metadata.\n');
  } else {
    console.log('  Resuming with ' + state.images.length + ' enriched images from state file.\n');
  }

  // === PHASE 3: Print summary ===
  console.log('='.repeat(62));
  console.log('  SUMMARY BY DESTINATION');
  console.log('='.repeat(62) + '\n');

  var byDest = {};
  state.images.forEach(function(item) {
    if (!byDest[item.destination]) byDest[item.destination] = [];
    byDest[item.destination].push(item);
  });

  var destKeys = Object.keys(byDest).sort();
  var totalMatched = 0;

  destKeys.forEach(function(dest) {
    var imgs = byDest[dest];
    console.log('  ' + dest + ' (' + imgs.length + ' images):');
    imgs.forEach(function(img) {
      var dl = img.downloaded ? ' [downloaded]' : '';
      console.log('    ' + img.imageId + ' - ' + (img.description || 'no metadata').slice(0, 70) + dl);
    });
    console.log('');
    if (dest !== 'general' && dest !== 'philippines-general') totalMatched += imgs.length;
  });

  var generalCount = (byDest['general'] || []).length + (byDest['philippines-general'] || []).length;
  console.log('  Matched to destinations: ' + totalMatched);
  console.log('  Unmatched (general):     ' + generalCount);
  console.log('  Total:                   ' + state.images.length + '\n');

  if (listOnly) {
    console.log('  --list-only mode. Skipping downloads.');
    console.log('  State saved to: ' + STATE_FILE);
    console.log('\n' + '='.repeat(62));
    return;
  }

  // === PHASE 4: Download all images ===
  console.log('='.repeat(62));
  console.log('  DOWNLOADING IMAGES');
  console.log('='.repeat(62) + '\n');

  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  }

  // Create destination subdirectories
  destKeys.forEach(function(dest) {
    var dir = path.join(DOWNLOAD_DIR, dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Build license ID lookup
  var licIdMap = {};
  state.licenses.forEach(function(lic) {
    var imgId = (lic.image && lic.image.id) || '';
    if (imgId && !licIdMap[imgId]) licIdMap[imgId] = lic.id;
  });

  var downloadCount = 0;
  var skipCount = 0;
  var errorCount = 0;

  for (var j = 0; j < state.images.length; j++) {
    var item = state.images[j];

    // Skip already downloaded
    if (item.downloaded) {
      skipCount++;
      continue;
    }

    var destDir = path.join(DOWNLOAD_DIR, item.destination);
    var destFile = path.join(destDir, item.filename + '.jpg');

    // Handle filename collisions
    var suffix = 0;
    while (fs.existsSync(destFile)) {
      suffix++;
      destFile = path.join(destDir, item.filename + '-' + suffix + '.jpg');
    }

    process.stdout.write('  [' + (j + 1) + '/' + state.images.length + '] ' + item.imageId + '...');

    var licId = licIdMap[item.imageId];
    if (!licId) {
      console.log(' NO LICENSE ID — skipped');
      errorCount++;
      continue;
    }

    try {
      // Get download URL via redownload endpoint
      var dlResult = await apiPostWithRetry('/v2/images/licenses/' + licId + '/downloads', {
        size: 'huge'
      });

      if (dlResult.status >= 200 && dlResult.status < 300 && dlResult.data && dlResult.data.url) {
        await downloadFile(dlResult.data.url, destFile);
        var size = fs.statSync(destFile).size;
        console.log(' OK (' + formatSize(size) + ') -> ' + item.destination + '/' + path.basename(destFile));
        item.downloaded = true;
        item.localPath = destFile;
        downloadCount++;
      } else {
        console.log(' No URL (HTTP ' + dlResult.status + ')');
        errorCount++;
      }
    } catch (err) {
      console.log(' ERROR: ' + err.message.slice(0, 100));
      errorCount++;
    }

    // Save state every 10 downloads
    if (downloadCount % 10 === 0) saveState(state);
    await sleep(500);
  }

  saveState(state);

  console.log('\n' + '='.repeat(62));
  console.log('  COMPLETE');
  console.log('  Downloaded: ' + downloadCount);
  console.log('  Skipped (already done): ' + skipCount);
  console.log('  Errors: ' + errorCount);
  console.log('  Total API requests: ' + requestCount);
  console.log('  Saved to: ' + DOWNLOAD_DIR);
  console.log('  State file: ' + STATE_FILE);
  console.log('='.repeat(62) + '\n');
}

main().catch(function(err) {
  console.error('Fatal error:', err);
  process.exit(1);
});
