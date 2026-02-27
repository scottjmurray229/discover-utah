#!/usr/bin/env node
/**
 * STEP 1: Search Shutterstock + Interactive Selection + Download + Rename
 *
 * Usage:
 *   node video-tracking/pipeline/1-search-download.cjs                  # Process all needs_download
 *   node video-tracking/pipeline/1-search-download.cjs --dest boracay   # Single destination
 *   node video-tracking/pipeline/1-search-download.cjs --priority p0    # Heroes only
 *   node video-tracking/pipeline/1-search-download.cjs --limit 10       # First 10 clips
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const yaml = require('js-yaml');
const { loadConfig } = require('./config-loader.cjs');

const config = loadConfig();

if (!config.SHUTTERSTOCK_API_TOKEN || config.SHUTTERSTOCK_API_TOKEN === 'your_api_token_here') {
  console.error('Error: SHUTTERSTOCK_API_TOKEN not set in config.env');
  process.exit(1);
}

// Parse CLI args
const args = process.argv.slice(2);
const destFilter = args.includes('--dest') ? args[args.indexOf('--dest') + 1] : null;
const prioFilter = args.includes('--priority') ? args[args.indexOf('--priority') + 1] : null;
const limitArg = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : Infinity;
const dryRun = args.includes('--dry-run');

// Load inventory
const inventory = yaml.load(fs.readFileSync(config.INVENTORY_PATH, 'utf8'));
let entries = inventory.entries.filter(e => e.stock_status === 'needs_download');

if (destFilter) entries = entries.filter(e => e.page === destFilter);
if (prioFilter) entries = entries.filter(e => e.priority === prioFilter);
entries = entries.slice(0, limitArg);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

// Shutterstock API helpers
const SS_BASE = 'https://api.shutterstock.com/v2';
const headers = {
  'Authorization': `Bearer ${config.SHUTTERSTOCK_API_TOKEN}`,
  'Content-Type': 'application/json',
};

async function searchVideos(query, perPage = 5) {
  const params = new URLSearchParams({
    query,
    per_page: perPage,
    sort: 'relevance',
    orientation: 'horizontal',
    duration_from: 8,
    duration_to: 60,
  });

  const res = await fetch(`${SS_BASE}/videos/search?${params}`, { headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shutterstock search failed (${res.status}): ${err}`);
  }
  return res.json();
}

async function licenseVideo(videoId) {
  const body = {
    videos: [{ video_id: videoId, size: 'hd' }],
  };

  const res = await fetch(`${SS_BASE}/videos/licenses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`License failed (${res.status}): ${err}`);
  }
  return res.json();
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

function formatDuration(sec) {
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
}

function getDownloadDir(entry) {
  if (entry.slot === 'hero') return path.join(config.RAW_DOWNLOADS, 'heroes');
  if (entry.slot === 'thumbnail') return path.join(config.RAW_DOWNLOADS, 'thumbnails');
  return path.join(config.RAW_DOWNLOADS, 'breaks');
}

function getFilename(entry) {
  if (entry.slot === 'hero') return `${entry.page}-hero.mp4`;
  if (entry.slot === 'thumbnail') return `${entry.page}-preview.mp4`;
  return `${entry.page}-break-${entry.section}.mp4`;
}

// Main process
async function processEntry(entry, index, total) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  [${index + 1}/${total}] ${entry.id}`);
  console.log(`  ${entry.description}`);
  console.log(`  Priority: ${entry.priority} | Slot: ${entry.slot}`);
  console.log(`${'═'.repeat(60)}`);

  // Search with primary terms
  console.log(`\n  Searching: "${entry.search_terms}"...`);
  let results;
  try {
    results = await searchVideos(entry.search_terms);
  } catch (err) {
    console.error(`  Search error: ${err.message}`);
    const retry = await ask('  Try alt_search? (y/n/skip): ');
    if (retry === 'skip' || retry === 's') return 'skipped';
    if (retry === 'y' && entry.alt_search) {
      console.log(`  Searching alt: "${entry.alt_search}"...`);
      results = await searchVideos(entry.alt_search);
    } else {
      return 'skipped';
    }
  }

  if (!results.data || results.data.length === 0) {
    console.log('  No results found. Trying alt search...');
    if (entry.alt_search) {
      results = await searchVideos(entry.alt_search);
    }
    if (!results.data || results.data.length === 0) {
      console.log('  Still no results. Skipping.');
      return 'not_found';
    }
  }

  // Display results
  console.log(`\n  Found ${results.total_count} results. Top ${results.data.length}:\n`);
  results.data.forEach((v, i) => {
    const dur = formatDuration(v.duration || 0);
    const res = v.assets?.hd?.width ? `${v.assets.hd.width}x${v.assets.hd.height}` : '?';
    const desc = (v.description || '').slice(0, 70);
    console.log(`    [${i + 1}] ${dur} | ${res} | ${desc}`);
    console.log(`        Preview: ${v.assets?.preview?.url || 'N/A'}`);
    console.log(`        URL: https://www.shutterstock.com/video/clip-${v.id}`);
    console.log();
  });

  // User picks
  const choice = await ask('  Pick a clip (1-5), "alt" for alt search, "custom" for custom search, or "skip": ');

  if (choice === 'skip' || choice === 's') return 'skipped';

  if (choice === 'alt' && entry.alt_search) {
    console.log(`  Searching: "${entry.alt_search}"...`);
    const altResults = await searchVideos(entry.alt_search);
    if (altResults.data && altResults.data.length > 0) {
      console.log(`\n  Alt results:\n`);
      altResults.data.forEach((v, i) => {
        const dur = formatDuration(v.duration || 0);
        const desc = (v.description || '').slice(0, 70);
        console.log(`    [${i + 1}] ${dur} | ${desc}`);
        console.log(`        Preview: ${v.assets?.preview?.url || 'N/A'}`);
        console.log();
      });
      const altChoice = await ask('  Pick from alt results (1-5) or "skip": ');
      if (altChoice === 'skip') return 'skipped';
      const altIdx = parseInt(altChoice) - 1;
      if (altIdx >= 0 && altIdx < altResults.data.length) {
        results.data = altResults.data;
        return await downloadSelected(entry, altResults.data[altIdx]);
      }
    }
    return 'skipped';
  }

  if (choice === 'custom') {
    const customQuery = await ask('  Enter custom search: ');
    const customResults = await searchVideos(customQuery);
    if (customResults.data && customResults.data.length > 0) {
      console.log(`\n  Custom results:\n`);
      customResults.data.forEach((v, i) => {
        const dur = formatDuration(v.duration || 0);
        const desc = (v.description || '').slice(0, 70);
        console.log(`    [${i + 1}] ${dur} | ${desc}`);
        console.log(`        Preview: ${v.assets?.preview?.url || 'N/A'}`);
        console.log();
      });
      const customChoice = await ask('  Pick (1-5) or "skip": ');
      if (customChoice === 'skip') return 'skipped';
      const cIdx = parseInt(customChoice) - 1;
      if (cIdx >= 0 && cIdx < customResults.data.length) {
        return await downloadSelected(entry, customResults.data[cIdx]);
      }
    }
    return 'skipped';
  }

  const idx = parseInt(choice) - 1;
  if (idx < 0 || idx >= results.data.length) {
    console.log('  Invalid choice. Skipping.');
    return 'skipped';
  }

  return await downloadSelected(entry, results.data[idx]);
}

async function downloadSelected(entry, video) {
  if (dryRun) {
    console.log(`  [DRY RUN] Would download clip-${video.id} as ${getFilename(entry)}`);
    return 'dry_run';
  }

  console.log(`\n  Licensing clip-${video.id}...`);
  let licenseData;
  try {
    licenseData = await licenseVideo(video.id);
  } catch (err) {
    console.error(`  License error: ${err.message}`);
    return 'error';
  }

  const downloadUrl = licenseData.data?.[0]?.download?.url;
  if (!downloadUrl) {
    console.error('  No download URL in license response.');
    return 'error';
  }

  const dir = getDownloadDir(entry);
  fs.mkdirSync(dir, { recursive: true });
  const filename = getFilename(entry);
  const destPath = path.join(dir, filename);

  console.log(`  Downloading to ${filename}...`);
  const size = await downloadFile(downloadUrl, destPath);
  console.log(`  Downloaded: ${(size / 1024 / 1024).toFixed(1)} MB`);

  // Also copy to youtube/raw
  const ytDir = config.YOUTUBE_RAW;
  fs.mkdirSync(ytDir, { recursive: true });
  const ytFilename = filename.replace('.mp4', '-full.mp4');
  fs.copyFileSync(destPath, path.join(ytDir, ytFilename));
  console.log(`  Copied to youtube/raw/${ytFilename}`);

  // Update inventory
  const ssUrl = `https://www.shutterstock.com/video/clip-${video.id}`;
  const invEntry = inventory.entries.find(e => e.id === entry.id);
  if (invEntry) {
    invEntry.stock_status = 'downloaded';
    invEntry.shutterstock_url = ssUrl;
    invEntry.file_path = destPath;
    invEntry.notes = `Downloaded ${new Date().toISOString().split('T')[0]}. ${invEntry.notes || ''}`.trim();
  }

  console.log(`  ✅ Done: ${entry.id}`);
  return 'downloaded';
}

// Run
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   SHUTTERSTOCK SEARCH & DOWNLOAD — DISCOVER PHILIPPINES  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`Clips to process: ${entries.length}`);
  if (destFilter) console.log(`Filtering: destination = ${destFilter}`);
  if (prioFilter) console.log(`Filtering: priority = ${prioFilter}`);
  if (dryRun) console.log('DRY RUN — no actual downloads');
  console.log();

  if (entries.length === 0) {
    console.log('No clips need downloading. Run video-report.sh to check status.');
    rl.close();
    return;
  }

  const stats = { downloaded: 0, skipped: 0, not_found: 0, error: 0 };

  for (let i = 0; i < entries.length; i++) {
    const result = await processEntry(entries[i], i, entries.length);
    if (result) stats[result] = (stats[result] || 0) + 1;

    // Save inventory after each download
    if (result === 'downloaded') {
      fs.writeFileSync(config.INVENTORY_PATH, yaml.dump(inventory, {
        lineWidth: -1,
        quotingType: '"',
        forceQuotes: false,
      }));
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('  SESSION COMPLETE');
  console.log(`  Downloaded: ${stats.downloaded}`);
  console.log(`  Skipped: ${stats.skipped}`);
  console.log(`  Not found: ${stats.not_found}`);
  console.log(`  Errors: ${stats.error}`);
  console.log(`${'═'.repeat(60)}\n`);

  rl.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  rl.close();
  process.exit(1);
});
