#!/usr/bin/env node
/**
 * Shutterstock Video Metadata Lookup
 *
 * Looks up video metadata by Shutterstock ID to identify unknown clips.
 * Scans Downloads folder for shutterstock_XXXXXXX files and fetches
 * title, description, keywords, and categories from the Shutterstock API.
 *
 * Usage:
 *   node video-tracking/pipeline/shutterstock-lookup.cjs                    # Scan Downloads for unidentified clips
 *   node video-tracking/pipeline/shutterstock-lookup.cjs --id 1077632657    # Look up single ID
 *   node video-tracking/pipeline/shutterstock-lookup.cjs --suggest          # Suggest destination + rename
 *   node video-tracking/pipeline/shutterstock-lookup.cjs --move             # Move & rename to youtube/raw/ (interactive)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { loadConfig } = require('./config-loader.cjs');

const config = loadConfig();
const SHUTTERSTOCK_TOKEN = config.SHUTTERSTOCK_API_TOKEN;
const DOWNLOADS_DIR = 'C:/Users/scott/Downloads';

const args = process.argv.slice(2);
const singleId = args.includes('--id') ? args[args.indexOf('--id') + 1] : null;
const suggestMode = args.includes('--suggest');
const moveMode = args.includes('--move');

// Philippines destination keywords for auto-matching
const DEST_KEYWORDS = {
  'boracay': ['boracay', 'white beach', 'aklan'],
  'cebu': ['cebu', 'mactan', 'oslob', 'kawasan', 'moalboal'],
  'el-nido': ['el nido', 'elnido', 'bacuit', 'miniloc'],
  'coron': ['coron', 'kayangan', 'barracuda lake', 'busuanga'],
  'bohol': ['bohol', 'chocolate hills', 'panglao', 'tarsier', 'loboc', 'balicasag'],
  'siargao': ['siargao', 'cloud 9', 'daku island'],
  'siquijor': ['siquijor', 'cambugahay', 'salagdoong', 'paliton'],
  'dumaguete': ['dumaguete', 'apo island', 'buglasan', 'negros oriental'],
  'palawan': ['palawan', 'puerto princesa', 'underground river'],
  'manila': ['manila', 'intramuros', 'makati', 'bgc', 'taguig', 'naia'],
  'davao': ['davao', 'samal', 'aliwagwag', 'mt apo', 'mount apo'],
  'clark': ['clark', 'angeles', 'pampanga', 'mt pinatubo', 'freeport'],
  'sagada': ['sagada', 'hanging coffins', 'sumaguing', 'cordillera', 'mountain province'],
  'banaue': ['banaue', 'batad', 'rice terraces', 'ifugao'],
  'vigan': ['vigan', 'calle crisologo', 'ilocos sur'],
  'laoag': ['laoag', 'paoay', 'ilocos norte', 'sand dunes'],
  'batanes': ['batanes', 'batan', 'ivatan', 'sabtang'],
  'camiguin': ['camiguin', 'sunken cemetery', 'white island'],
  'legazpi': ['legazpi', 'legaspi', 'mayon', 'albay'],
  'donsol': ['donsol', 'whale shark', 'butanding', 'sorsogon'],
  'malapascua': ['malapascua', 'thresher shark'],
  'caramoan': ['caramoan', 'camarines sur'],
  'iloilo': ['iloilo', 'panay', 'gigantes'],
  'guimaras': ['guimaras', 'mango'],
  'bacolod': ['bacolod', 'negros occidental', 'ruins', 'masskara'],
  'la-union': ['la union', 'san juan', 'surfing'],
  'tagaytay': ['tagaytay', 'taal volcano', 'taal lake'],
  'batangas': ['batangas', 'anilao', 'laiya'],
  'puerto-princesa': ['puerto princesa', 'subterranean'],
  'subic': ['subic', 'zambales', 'olongapo'],
  'baler': ['baler', 'aurora', 'sabang'],
  'sipalay': ['sipalay', 'sugar beach'],
  'pagudpud': ['pagudpud', 'saud beach', 'bangui windmills'],
  'puerto-galera': ['puerto galera', 'mindoro'],
  'biliran': ['biliran'],
  'samar': ['samar', 'sohoton'],
  'tacloban': ['tacloban', 'leyte', 'san juanico'],
  'marinduque': ['marinduque', 'moriones'],
  'laguna': ['laguna', 'pagsanjan', 'makiling'],
  'mt-pulag': ['mt pulag', 'mount pulag', 'sea of clouds'],
  'bataan': ['bataan', 'corregidor', 'death march'],
  'baguio': ['baguio', 'burnham', 'session road'],
  'cuyo': ['cuyo', 'palawan'],
  // Generic categories
  'snorkeling': ['snorkeling', 'snorkel', 'coral reef', 'underwater', 'diving', 'marine'],
  'food': ['adobo', 'sinigang', 'lechon', 'lumpia', 'pancit', 'filipino food', 'cuisine'],
};

function fetchVideoMetadata(videoId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.shutterstock.com',
      path: `/v2/videos/${videoId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SHUTTERSTOCK_TOKEN}`,
        'Accept': 'application/json',
        'User-Agent': 'DiscoverPhilippines/1.0',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else if (res.statusCode === 404) {
          resolve(null);
        } else {
          reject(new Error(`API ${res.statusCode}: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function suggestDestination(metadata) {
  if (!metadata) return { dest: 'unknown', confidence: 0 };

  const searchText = [
    metadata.description || '',
    ...(metadata.keywords || []),
    ...(metadata.categories || []).map(c => c.name || ''),
  ].join(' ').toLowerCase();

  let bestMatch = { dest: 'unknown', confidence: 0, matchedKeywords: [] };

  for (const [dest, keywords] of Object.entries(DEST_KEYWORDS)) {
    const matched = keywords.filter(kw => searchText.includes(kw.toLowerCase()));
    if (matched.length > bestMatch.confidence) {
      bestMatch = { dest, confidence: matched.length, matchedKeywords: matched };
    }
  }

  return bestMatch;
}

function suggestFilename(metadata, dest) {
  if (!metadata || !metadata.description) return `${dest}-shutterstock-unknown`;

  // Extract a short descriptor from the description
  const desc = metadata.description.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'from', 'aerial', 'view'].includes(w))
    .slice(0, 4)
    .join('-');

  return `${dest}-${desc || 'clip'}`;
}

function findUnidentifiedFiles() {
  const files = fs.readdirSync(DOWNLOADS_DIR)
    .filter(f => /^shutterstock_\d+\.(mp4|mov)$/i.test(f));

  // Check which are already in youtube/raw/
  const rawDir = config.YOUTUBE_RAW;
  const rawFiles = fs.existsSync(rawDir) ? fs.readdirSync(rawDir) : [];

  return files.filter(f => {
    const id = f.match(/shutterstock_(\d+)/)[1];
    // Check if this ID appears in any youtube/raw/ filename
    return !rawFiles.some(rf => rf.includes(id));
  }).map(f => ({
    filename: f,
    id: f.match(/shutterstock_(\d+)/)[1],
    filepath: path.join(DOWNLOADS_DIR, f),
    size: fs.statSync(path.join(DOWNLOADS_DIR, f)).size,
  }));
}

function formatSize(bytes) {
  if (bytes > 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes > 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

async function main() {
  if (!SHUTTERSTOCK_TOKEN || SHUTTERSTOCK_TOKEN === 'your_api_token_here') {
    console.error('Error: SHUTTERSTOCK_API_TOKEN not set in config.env');
    process.exit(1);
  }

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   SHUTTERSTOCK VIDEO METADATA LOOKUP                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  let ids = [];

  if (singleId) {
    ids = [{ id: singleId, filename: `shutterstock_${singleId}`, size: 0 }];
  } else {
    const files = findUnidentifiedFiles();
    if (files.length === 0) {
      console.log('  No unidentified shutterstock_* files found in Downloads.');
      console.log('  All files are either already in youtube/raw/ or not present.');
      return;
    }
    console.log(`  Found ${files.length} unidentified Shutterstock files in Downloads:\n`);
    ids = files;
  }

  const results = [];

  for (const item of ids) {
    process.stdout.write(`  Looking up ${item.id}...`);

    try {
      const metadata = await fetchVideoMetadata(item.id);

      if (!metadata) {
        console.log(' NOT FOUND (invalid ID or removed)');
        results.push({ ...item, status: 'not_found' });
        continue;
      }

      const match = suggestDestination(metadata);
      const suggestedName = suggestFilename(metadata, match.dest);

      console.log(' OK');
      console.log(`    Description: ${(metadata.description || 'N/A').slice(0, 120)}`);
      console.log(`    Keywords:    ${(metadata.keywords || []).slice(0, 8).join(', ')}`);
      console.log(`    Duration:    ${metadata.duration || 'N/A'}s`);
      console.log(`    Resolution:  ${metadata.assets?.['4k']?.width || metadata.assets?.hd?.width || '?'}px`);
      if (item.size) console.log(`    File size:   ${formatSize(item.size)}`);
      console.log(`    Destination: ${match.dest} (confidence: ${match.confidence}, matched: ${match.matchedKeywords.join(', ') || 'none'})`);
      if (suggestMode || moveMode) {
        console.log(`    Suggested:   youtube/raw/${suggestedName}.mp4`);
      }
      console.log();

      results.push({
        ...item,
        status: 'found',
        metadata,
        match,
        suggestedName,
      });
    } catch (err) {
      console.log(` ERROR: ${err.message.slice(0, 100)}`);
      results.push({ ...item, status: 'error', error: err.message });
    }

    // Rate limit: 1 request per 200ms
    await new Promise(r => setTimeout(r, 200));
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('  SUMMARY\n');

  const found = results.filter(r => r.status === 'found');
  const byDest = {};
  for (const r of found) {
    const d = r.match.dest;
    if (!byDest[d]) byDest[d] = [];
    byDest[d].push(r);
  }

  for (const [dest, clips] of Object.entries(byDest).sort()) {
    console.log(`  ${dest} (${clips.length} clips):`);
    for (const c of clips) {
      console.log(`    ${c.id} - ${(c.metadata.description || '').slice(0, 80)} [${formatSize(c.size)}]`);
      if (suggestMode || moveMode) {
        console.log(`      → youtube/raw/${c.suggestedName}.mp4`);
      }
    }
    console.log();
  }

  const notFound = results.filter(r => r.status === 'not_found');
  if (notFound.length > 0) {
    console.log(`  Not found: ${notFound.map(r => r.id).join(', ')}`);
  }

  // Move mode
  if (moveMode) {
    console.log('\n  MOVE MODE: Moving identified files to youtube/raw/\n');
    for (const r of found) {
      if (r.match.dest === 'unknown') {
        console.log(`    SKIP ${r.id} — no destination match`);
        continue;
      }
      const ext = path.extname(r.filename);
      const destPath = path.join(config.YOUTUBE_RAW, `${r.suggestedName}${ext}`);
      if (fs.existsSync(destPath)) {
        console.log(`    SKIP ${r.suggestedName}${ext} — already exists`);
        continue;
      }
      try {
        fs.copyFileSync(r.filepath, destPath);
        console.log(`    MOVED ${r.id} → ${r.suggestedName}${ext}`);
      } catch (err) {
        console.log(`    ERROR ${r.id}: ${err.message.slice(0, 80)}`);
      }
    }
  }

  console.log('═'.repeat(60));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
