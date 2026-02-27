#!/usr/bin/env node
/**
 * Generate Shutterstock Image Catalog
 *
 * Scans shutterstock-downloads/general/ for downloaded images,
 * generates 400px-wide thumbnails, and creates an interactive HTML
 * catalog for visual identification and destination assignment.
 *
 * Usage:
 *   node video-tracking/pipeline/generate-image-catalog.cjs              # Generate thumbs + HTML
 *   node video-tracking/pipeline/generate-image-catalog.cjs --skip-thumbs # HTML only (thumbs already exist)
 *   node video-tracking/pipeline/generate-image-catalog.cjs --force       # Regenerate all thumbs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'shutterstock-downloads', 'general');
const THUMBS_DIR = path.join(PROJECT_ROOT, 'shutterstock-downloads', 'thumbs');
const CATALOG_PATH = path.join(PROJECT_ROOT, 'shutterstock-downloads', 'image-catalog.html');
const ASSIGNMENTS_PATH = path.join(PROJECT_ROOT, 'shutterstock-downloads', 'assignments.json');

const args = process.argv.slice(2);
const skipThumbs = args.includes('--skip-thumbs');
const force = args.includes('--force');

// Load already-assigned IDs to exclude from catalog
function loadAssignedIds() {
  if (fs.existsSync(ASSIGNMENTS_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(ASSIGNMENTS_PATH, 'utf8'));
      return new Set(Object.keys(data));
    } catch { return new Set(); }
  }
  return new Set();
}

// Find FFmpeg
let FFMPEG = 'ffmpeg';
try {
  execSync('ffmpeg -version', { stdio: 'pipe' });
} catch {
  const wingetBase = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(wingetBase)) {
    const pkg = fs.readdirSync(wingetBase).find(d => d.startsWith('Gyan.FFmpeg'));
    if (pkg) {
      const pkgDir = path.join(wingetBase, pkg);
      const builds = fs.readdirSync(pkgDir).filter(d => d.includes('full_build'));
      if (builds.length > 0) {
        const candidate = path.join(pkgDir, builds[0], 'bin', 'ffmpeg.exe');
        if (fs.existsSync(candidate)) FFMPEG = candidate;
      }
    }
  }
  if (FFMPEG === 'ffmpeg') {
    console.error('Error: FFmpeg not found');
    process.exit(1);
  }
}

// All destinations — general first, then 43 destination slugs
const DESTINATIONS = [
  'general',
  'bacolod','baguio','baler','banaue','bataan','batanes','batangas','biliran',
  'bohol','boracay','camiguin','caramoan','cebu','clark','coron','cuyo','davao',
  'donsol','dumaguete','el-nido','guimaras','iloilo','laguna','laoag','la-union',
  'legazpi','malapascua','manila','marinduque','mt-pulag','pagudpud','puerto-galera',
  'puerto-princesa','sagada','samar','siargao','sipalay','siquijor','subic',
  'tacloban','tagaytay','vigan','zambales'
];

const CATEGORIES = [
  'practical','snorkeling','cuisine','festivals','history',
  'food','festival','scenery','beach','underwater','aerial','culture','city',
  'nature','transport','people','sunset','market','resort','adventure','island-hopping','surfing','diving'
];

function formatSize(bytes) {
  if (bytes > 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   SHUTTERSTOCK IMAGE CATALOG GENERATOR                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  // Scan images
  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'))
    .sort();

  console.log(`Found ${files.length} images in ${IMAGES_DIR}\n`);

  // Generate thumbnails
  if (!skipThumbs) {
    if (!fs.existsSync(THUMBS_DIR)) fs.mkdirSync(THUMBS_DIR, { recursive: true });

    let generated = 0, skipped = 0, errors = 0;
    const startTime = Date.now();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const srcPath = path.join(IMAGES_DIR, file);
      const thumbName = file.replace(/^general-/, 'thumb-');
      const thumbPath = path.join(THUMBS_DIR, thumbName);

      const progress = `[${i + 1}/${files.length}]`;

      if (!force && fs.existsSync(thumbPath)) {
        skipped++;
        continue;
      }

      try {
        execSync(
          `"${FFMPEG}" -y -i "${srcPath}" -vf "scale=400:-1" -q:v 4 "${thumbPath}"`,
          { stdio: 'pipe', timeout: 30000 }
        );
        generated++;
        if (generated % 20 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
          const rate = (generated / (Date.now() - startTime) * 1000).toFixed(1);
          console.log(`  ${progress} Generated ${generated} thumbs (${rate}/sec, ${elapsed}s elapsed)`);
        }
      } catch (err) {
        console.error(`  ${progress} ERROR: ${file} — ${err.message.slice(0, 100)}`);
        errors++;
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nThumbnails: ${generated} generated, ${skipped} skipped, ${errors} errors (${elapsed}s)\n`);
  }

  // Exclude already-assigned images
  const assignedIds = loadAssignedIds();
  const remaining = files.filter(f => {
    const id = f.replace(/^general-/, '').replace(/\.\w+$/, '');
    return !assignedIds.has(id);
  });

  if (assignedIds.size > 0) {
    console.log(`Excluding ${assignedIds.size} already-assigned images (from assignments.json)`);
    console.log(`Remaining: ${remaining.length} images\n`);
  }

  // Build image data for HTML
  const imageData = remaining.map((file, idx) => {
    const id = file.replace(/^general-/, '').replace(/\.\w+$/, '');
    const srcPath = path.join(IMAGES_DIR, file);
    const stat = fs.statSync(srcPath);
    const thumbName = file.replace(/^general-/, 'thumb-');
    return {
      num: idx + 1,
      id,
      file,
      thumbFile: thumbName,
      size: stat.size,
      sizeStr: formatSize(stat.size),
    };
  });

  // Generate HTML
  const html = generateHTML(imageData, assignedIds);
  fs.writeFileSync(CATALOG_PATH, html);
  console.log(`Catalog written to: ${CATALOG_PATH}`);
  console.log(`Open in browser: file:///${CATALOG_PATH.replace(/\\/g, '/')}`);
}

function generateHTML(images, assignedIds) {
  const destOptions = DESTINATIONS.map(d => `<option value="${d}">${d}</option>`).join('\n');
  const catOptions = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('\n');

  const cards = images.map(img => {
    const ssUrl = `https://www.shutterstock.com/image-photo/${img.id}`;
    const fullPath = `general/${img.file}`;
    const thumbPath = `thumbs/${img.thumbFile}`;
    return `<div class="card" data-num="${img.num}" data-id="${img.id}">
  <div class="num">#${img.num}</div>
  <input type="checkbox" class="sel" title="Select for bulk assign">
  <a href="${fullPath}" target="_blank"><img loading="lazy" src="${thumbPath}" alt="#${img.num} SS-${img.id}"></a>
  <div class="info">
    <div class="id">#${img.num} — <a href="${ssUrl}" target="_blank">SS-${img.id}</a></div>
    <div class="meta">${img.sizeStr}</div>
    <div class="tags" data-id="${img.id}"></div>
    <div class="assign">
      <select class="dest-sel" data-id="${img.id}">
        <option value="">+ Destination</option>
        ${destOptions}
      </select>
      <select class="cat-sel" data-id="${img.id}">
        <option value="">+ Category</option>
        ${catOptions}
      </select>
    </div>
    <input type="text" class="desc-input" data-id="${img.id}" placeholder="Description..." spellcheck="false">
  </div>
</div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Shutterstock Image Catalog — ${images.length} Images</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; background: #1a1a2e; color: #eee; margin: 0; padding: 20px; }
  h1 { color: #0D7377; margin-bottom: 4px; }
  .subtitle { color: #999; margin-bottom: 16px; }

  /* Toolbar */
  .toolbar { background: #2a2a3e; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;
    display: flex; flex-wrap: wrap; gap: 8px; align-items: center; position: sticky; top: 0; z-index: 100; }
  .toolbar label { color: #aaa; font-size: 13px; }
  .toolbar select, .toolbar input, .toolbar button {
    font-size: 13px; padding: 6px 10px; border-radius: 4px; border: 1px solid #444;
    background: #333; color: #eee; }
  .toolbar button { cursor: pointer; font-weight: bold; }
  .toolbar button:hover { background: #0D7377; }
  .toolbar button.danger { background: #8B0000; }
  .toolbar button.danger:hover { background: #B22222; }
  .toolbar .sep { width: 1px; height: 24px; background: #444; margin: 0 4px; }
  .toolbar .count { color: #0D7377; font-weight: bold; font-size: 14px; margin-left: auto; }

  /* Bulk bar */
  .bulk-bar { background: #1a3a2e; padding: 10px 16px; border-radius: 8px; margin-bottom: 16px;
    display: none; align-items: center; gap: 8px; }
  .bulk-bar.active { display: flex; }
  .bulk-bar .bulk-count { color: #38A169; font-weight: bold; }
  .bulk-bar select { font-size: 13px; padding: 6px 10px; border-radius: 4px; border: 1px solid #444;
    background: #333; color: #eee; }
  .bulk-bar button { font-size: 13px; padding: 6px 12px; border-radius: 4px; border: 1px solid #444;
    background: #38A169; color: white; cursor: pointer; font-weight: bold; }
  .bulk-bar button:hover { background: #2F855A; }

  /* Grid */
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
  .card { background: #222; border-radius: 8px; overflow: hidden; border: 1px solid #333;
    position: relative; transition: border-color 0.2s; }
  .card.selected { border-color: #38A169; box-shadow: 0 0 8px rgba(56,161,105,0.3); }
  .card.hidden { display: none; }
  .card img { width: 100%; display: block; cursor: pointer; min-height: 120px; background: #1a1a1a; }
  .card .num { position: absolute; top: 8px; left: 8px; background: #E8654A; color: white;
    font-weight: bold; font-size: 14px; padding: 3px 8px; border-radius: 4px; z-index: 2; }
  .card .sel { position: absolute; top: 8px; right: 8px; width: 20px; height: 20px;
    z-index: 2; cursor: pointer; accent-color: #38A169; }
  .card .info { padding: 8px 10px; font-size: 12px; }
  .card .id { font-weight: bold; color: #0D7377; }
  .card .id a { color: #0D7377; text-decoration: none; }
  .card .id a:hover { text-decoration: underline; color: #14B8A6; }
  .card .meta { color: #666; font-size: 11px; margin-top: 2px; }
  .card .tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; min-height: 0; }
  .card .tags .tag { display: inline-flex; align-items: center; gap: 2px; padding: 2px 6px;
    border-radius: 3px; font-size: 11px; font-weight: bold; cursor: default; }
  .card .tags .tag.dest { background: #0D7377; color: white; }
  .card .tags .tag.cat { background: #7C3AED; color: white; }
  .card .tags .tag .x { cursor: pointer; margin-left: 2px; opacity: 0.6; }
  .card .tags .tag .x:hover { opacity: 1; }
  .card .assign { display: flex; gap: 4px; margin-top: 4px; }
  .card .assign select { flex: 1; font-size: 11px; padding: 3px 4px; border-radius: 3px;
    border: 1px solid #444; background: #2a2a2e; color: #ccc; }
  .card .desc-input { width: 100%; font-size: 12px; padding: 5px 6px; border-radius: 4px;
    border: 1px solid #444; background: #2a2a2e; color: #eee; margin-top: 4px;
    transition: border-color 0.2s; }
  .card .desc-input:focus { border-color: #0D7377; outline: none; }
  .card .desc-input.has-value { border-color: #38A169; }

  /* Export modal */
  .modal-bg { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.7); z-index: 200; justify-content: center; align-items: center; }
  .modal-bg.active { display: flex; }
  .modal { background: #2a2a3e; border-radius: 12px; padding: 24px; max-width: 700px; width: 90%;
    max-height: 80vh; overflow: auto; }
  .modal h2 { color: #0D7377; margin-top: 0; }
  .modal textarea { width: 100%; height: 300px; background: #1a1a2e; color: #eee; border: 1px solid #444;
    border-radius: 8px; padding: 12px; font-family: monospace; font-size: 12px; }
  .modal button { margin-top: 12px; padding: 8px 16px; background: #0D7377; color: white;
    border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
  .modal button:hover { background: #095456; }
</style>
</head>
<body>

<h1>Shutterstock Image Catalog</h1>
<p class="subtitle">${images.length} downloaded images — assign each to a destination and/or category, then export</p>

<div class="toolbar">
  <label>Filter:</label>
  <select id="filterDest">
    <option value="all">All Destinations</option>
    <option value="unassigned">Unassigned</option>
    <option value="assigned">Assigned (any)</option>
    ${destOptions}
  </select>
  <select id="filterCat">
    <option value="all">All Categories</option>
    <option value="unassigned">No Category</option>
    ${catOptions}
  </select>
  <div class="sep"></div>
  <button id="selectAll" title="Select all visible">Select All Visible</button>
  <button id="deselectAll" title="Deselect all">Deselect All</button>
  <div class="sep"></div>
  <button id="exportBtn">Export JSON</button>
  <button id="exportClaudeBtn">Export for Claude</button>
  <div class="sep"></div>
  <button id="clearBtn" class="danger" title="Clear all assignments">Reset All</button>
  <div class="count"><span id="visibleCount">${images.length}</span> / ${images.length} shown</div>
</div>

<div class="bulk-bar" id="bulkBar">
  <span class="bulk-count"><span id="bulkCount">0</span> selected</span>
  <label>Assign to:</label>
  <select id="bulkDest">
    <option value="">Destination...</option>
    ${destOptions}
  </select>
  <select id="bulkCat">
    <option value="">Category...</option>
    ${catOptions}
  </select>
  <button id="bulkApply">Apply</button>
  <button id="bulkClear" style="background:#8B0000;">Clear Tags</button>
</div>

<div class="grid" id="grid">
${cards}
</div>

<div class="modal-bg" id="modalBg">
  <div class="modal">
    <h2 id="modalTitle">Export</h2>
    <textarea id="modalText" readonly></textarea>
    <button onclick="navigator.clipboard.writeText(document.getElementById('modalText').value); this.textContent='Copied!'">Copy to Clipboard</button>
    <button onclick="document.getElementById('modalBg').classList.remove('active')">Close</button>
  </div>
</div>

<script>
// IDs already saved to assignments.json — purge from localStorage
const EXCLUDED_IDS = new Set(\${JSON.stringify([...assignedIds])});

// State: { [ssId]: { destinations: [], categories: [], description: "" } }
const STORAGE_KEY = 'ss-image-catalog-assignments';

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let descSaveTimer = null;

// Purge excluded IDs from localStorage on load
let purged = 0;
EXCLUDED_IDS.forEach(id => { if (state[id]) { delete state[id]; purged++; } });
if (purged > 0) saveState(state);

function getEntry(id) {
  if (!state[id]) state[id] = { destinations: [], categories: [], description: '' };
  // migrate old entries missing description
  if (state[id].description === undefined) state[id].description = '';
  return state[id];
}

function renderTags(id) {
  const entry = getEntry(id);
  const container = document.querySelector(\`.tags[data-id="\${id}"]\`);
  if (!container) return;
  let html = '';
  entry.destinations.forEach(d => {
    html += \`<span class="tag dest">\${d}<span class="x" onclick="removeTag('\${id}','dest','\${d}')">&times;</span></span>\`;
  });
  entry.categories.forEach(c => {
    html += \`<span class="tag cat">\${c}<span class="x" onclick="removeTag('\${id}','cat','\${c}')">&times;</span></span>\`;
  });
  container.innerHTML = html;
}

function addTag(id, type, value) {
  if (!value) return;
  const entry = getEntry(id);
  const arr = type === 'dest' ? entry.destinations : entry.categories;
  if (!arr.includes(value)) {
    arr.push(value);
    saveState(state);
    renderTags(id);
  }
}

function removeTag(id, type, value) {
  const entry = getEntry(id);
  const key = type === 'dest' ? 'destinations' : 'categories';
  entry[key] = entry[key].filter(v => v !== value);
  if (entry.destinations.length === 0 && entry.categories.length === 0 && !entry.description) delete state[id];
  saveState(state);
  renderTags(id);
}

// Init tags and dropdowns
document.querySelectorAll('.dest-sel').forEach(sel => {
  sel.addEventListener('change', function() {
    addTag(this.dataset.id, 'dest', this.value);
    this.value = '';
  });
});
document.querySelectorAll('.cat-sel').forEach(sel => {
  sel.addEventListener('change', function() {
    addTag(this.dataset.id, 'cat', this.value);
    this.value = '';
  });
});

// Init description inputs
document.querySelectorAll('.desc-input').forEach(input => {
  const id = input.dataset.id;
  const entry = getEntry(id);
  if (entry.description) {
    input.value = entry.description;
    input.classList.add('has-value');
  }
  input.addEventListener('input', function() {
    this.classList.toggle('has-value', this.value.trim().length > 0);
    // Debounce save — write to state after 500ms of no typing
    clearTimeout(descSaveTimer);
    descSaveTimer = setTimeout(() => {
      const entry = getEntry(this.dataset.id);
      entry.description = this.value.trim();
      if (!entry.description && entry.destinations.length === 0 && entry.categories.length === 0) {
        delete state[this.dataset.id];
      }
      saveState(state);
    }, 500);
  });
  // Also save on blur immediately
  input.addEventListener('blur', function() {
    clearTimeout(descSaveTimer);
    const entry = getEntry(this.dataset.id);
    entry.description = this.value.trim();
    if (!entry.description && entry.destinations.length === 0 && entry.categories.length === 0) {
      delete state[this.dataset.id];
    }
    saveState(state);
  });
});

// Render existing tags
Object.keys(state).forEach(id => renderTags(id));

// Selection
function updateBulkBar() {
  const checked = document.querySelectorAll('.sel:checked');
  const bar = document.getElementById('bulkBar');
  document.getElementById('bulkCount').textContent = checked.length;
  bar.classList.toggle('active', checked.length > 0);
}
document.querySelectorAll('.sel').forEach(cb => {
  cb.addEventListener('change', function() {
    this.closest('.card').classList.toggle('selected', this.checked);
    updateBulkBar();
  });
});

document.getElementById('selectAll').addEventListener('click', () => {
  document.querySelectorAll('.card:not(.hidden) .sel').forEach(cb => { cb.checked = true; cb.closest('.card').classList.add('selected'); });
  updateBulkBar();
});
document.getElementById('deselectAll').addEventListener('click', () => {
  document.querySelectorAll('.sel').forEach(cb => { cb.checked = false; cb.closest('.card').classList.remove('selected'); });
  updateBulkBar();
});

// Bulk apply
document.getElementById('bulkApply').addEventListener('click', () => {
  const destVal = document.getElementById('bulkDest').value;
  const catVal = document.getElementById('bulkCat').value;
  document.querySelectorAll('.sel:checked').forEach(cb => {
    const id = cb.closest('.card').dataset.id;
    if (destVal) addTag(id, 'dest', destVal);
    if (catVal) addTag(id, 'cat', catVal);
  });
  document.getElementById('bulkDest').value = '';
  document.getElementById('bulkCat').value = '';
});

document.getElementById('bulkClear').addEventListener('click', () => {
  document.querySelectorAll('.sel:checked').forEach(cb => {
    const card = cb.closest('.card');
    const id = card.dataset.id;
    delete state[id];
    saveState(state);
    renderTags(id);
    const descInput = card.querySelector('.desc-input');
    if (descInput) { descInput.value = ''; descInput.classList.remove('has-value'); }
  });
});

// Filtering
function applyFilters() {
  const destFilter = document.getElementById('filterDest').value;
  const catFilter = document.getElementById('filterCat').value;
  let visible = 0;

  document.querySelectorAll('.card').forEach(card => {
    const id = card.dataset.id;
    const entry = state[id] || { destinations: [], categories: [] };
    let show = true;

    if (destFilter === 'unassigned') {
      if (entry.destinations.length > 0) show = false;
    } else if (destFilter === 'assigned') {
      if (entry.destinations.length === 0) show = false;
    } else if (destFilter !== 'all') {
      if (!entry.destinations.includes(destFilter)) show = false;
    }

    if (catFilter === 'unassigned') {
      if (entry.categories.length > 0) show = false;
    } else if (catFilter !== 'all') {
      if (!entry.categories.includes(catFilter)) show = false;
    }

    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });

  document.getElementById('visibleCount').textContent = visible;
}

document.getElementById('filterDest').addEventListener('change', applyFilters);
document.getElementById('filterCat').addEventListener('change', applyFilters);

// Export JSON
document.getElementById('exportBtn').addEventListener('click', () => {
  const output = {};
  Object.entries(state).forEach(([id, entry]) => {
    if (entry.destinations.length > 0 || entry.categories.length > 0 || entry.description) {
      output[id] = entry;
    }
  });
  document.getElementById('modalTitle').textContent = 'Export — JSON';
  document.getElementById('modalText').value = JSON.stringify(output, null, 2);
  document.getElementById('modalBg').classList.add('active');
});

// Export for Claude (grouped by destination)
document.getElementById('exportClaudeBtn').addEventListener('click', () => {
  const byDest = {};
  const unassigned = [];
  Object.entries(state).forEach(([id, entry]) => {
    if (entry.destinations.length > 0) {
      entry.destinations.forEach(d => {
        if (!byDest[d]) byDest[d] = [];
        byDest[d].push({ id, categories: entry.categories, description: entry.description || '' });
      });
    }
  });

  // Count unassigned
  document.querySelectorAll('.card').forEach(card => {
    const id = card.dataset.id;
    if (!state[id] || state[id].destinations.length === 0) {
      unassigned.push(id);
    }
  });

  let text = 'SHUTTERSTOCK IMAGE ASSIGNMENTS\\n';
  text += '================================\\n\\n';

  const sortedDests = Object.keys(byDest).sort();
  sortedDests.forEach(dest => {
    text += \`## \${dest} (\${byDest[dest].length} images)\\n\`;
    byDest[dest].forEach(img => {
      const cats = img.categories.length > 0 ? \` [\${img.categories.join(', ')}]\` : '';
      const desc = img.description ? \` — \${img.description}\` : '';
      text += \`  - SS-\${img.id}\${cats}\${desc}\\n\`;
    });
    text += '\\n';
  });

  text += \`## Unassigned (\${unassigned.length} images)\\n\`;
  text += \`  (Use the catalog to assign these)\\n\`;

  const assigned = Object.keys(state).filter(id => state[id]?.destinations?.length > 0).length;
  text += \`\\n--- Summary: \${assigned} assigned, \${unassigned.length} unassigned, ${images.length} total ---\\n\`;

  document.getElementById('modalTitle').textContent = 'Export — For Claude';
  document.getElementById('modalText').value = text;
  document.getElementById('modalBg').classList.add('active');
});

// Reset
document.getElementById('clearBtn').addEventListener('click', () => {
  if (!confirm('Clear ALL assignments? This cannot be undone.')) return;
  state = {};
  saveState(state);
  document.querySelectorAll('.tags').forEach(t => t.innerHTML = '');
  document.querySelectorAll('.desc-input').forEach(i => { i.value = ''; i.classList.remove('has-value'); });
});

// Close modal on bg click
document.getElementById('modalBg').addEventListener('click', function(e) {
  if (e.target === this) this.classList.remove('active');
});
</script>

</body>
</html>`;
}

main();
