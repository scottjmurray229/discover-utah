/**
 * Scans all destination .md files and generates video-inventory YAML entries
 * for any destinations/sections not already tracked.
 *
 * Usage: node video-tracking/generate-inventory-entries.js >> video-tracking/video-inventory.yaml
 * Or:    node video-tracking/generate-inventory-entries.js --preview  (stdout only)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DEST_DIR = path.join(__dirname, '..', 'src', 'content', 'destinations');
const INVENTORY_PATH = path.join(__dirname, 'video-inventory.yaml');

// Own footage destinations (Scott filmed these)
const OWN_FOOTAGE = new Set(['cebu', 'bohol', 'siquijor', 'dumaguete', 'clark']);

// Load existing inventory to avoid duplicates
let existingIds = new Set();
try {
  const inv = yaml.load(fs.readFileSync(INVENTORY_PATH, 'utf8'));
  if (inv && inv.entries) {
    inv.entries.forEach(e => existingIds.add(e.id));
  }
} catch (e) {
  console.error('Warning: Could not read existing inventory:', e.message);
}

// Search term mappings for destinations
const SEARCH_HINTS = {
  bacolod: { hero: 'Bacolod City Philippines aerial Masskara', alt: 'Negros Occidental Philippines city aerial' },
  baguio: { hero: 'Baguio City Philippines pine trees aerial', alt: 'Philippines mountain city cool climate pine forest' },
  baler: { hero: 'Baler Aurora Philippines surfing aerial', alt: 'Philippines surf town Pacific coast waves' },
  banaue: { hero: 'Banaue rice terraces Philippines aerial drone', alt: 'Ifugao rice terraces Philippines mountain' },
  bataan: { hero: 'Bataan Philippines Mount Samat memorial aerial', alt: 'Bataan Death March memorial Philippines' },
  batanes: { hero: 'Batanes Philippines rolling hills lighthouse aerial', alt: 'Batanes Ivatan stone houses Philippines' },
  batangas: { hero: 'Taal Volcano Philippines aerial lake crater', alt: 'Batangas Philippines coastline diving aerial' },
  biliran: { hero: 'Biliran Philippines waterfalls tropical island', alt: 'Biliran island Philippines green mountains' },
  camiguin: { hero: 'Camiguin island Philippines volcanic aerial', alt: 'Camiguin Philippines tropical island aerial ocean' },
  caramoan: { hero: 'Caramoan Philippines limestone islands aerial', alt: 'Caramoan Camarines Sur Philippines beach lagoon' },
  coron: { hero: 'Coron Palawan Philippines aerial lagoon', alt: 'Coron island Philippines kayangan lake aerial' },
  cuyo: { hero: 'Cuyo island Palawan Philippines aerial', alt: 'Philippines remote island fort Spanish colonial' },
  davao: { hero: 'Davao City Philippines aerial Mount Apo', alt: 'Davao Philippines cityscape modern tropical' },
  'el-nido': { hero: 'El Nido Palawan Philippines aerial lagoon', alt: 'El Nido limestone cliffs Philippines turquoise water' },
  guimaras: { hero: 'Guimaras island Philippines mango aerial', alt: 'Guimaras Philippines beach island crossing' },
  iloilo: { hero: 'Iloilo City Philippines aerial heritage', alt: 'Iloilo Philippines Esplanade river city' },
  laguna: { hero: 'Laguna Philippines hot springs waterfall', alt: 'Laguna Pagsanjan Falls Philippines aerial' },
  'la-union': { hero: 'La Union Philippines San Juan surfing beach', alt: 'La Union surf beach Philippines sunset' },
  laoag: { hero: 'Laoag Ilocos Norte Philippines Paoay Church aerial', alt: 'Laoag Philippines sand dunes heritage' },
  legazpi: { hero: 'Mayon Volcano Legazpi Philippines aerial perfect cone', alt: 'Legazpi Albay Philippines volcano aerial' },
  malapascua: { hero: 'Malapascua island Philippines aerial beach', alt: 'Malapascua Philippines diving thresher shark' },
  manila: { hero: 'Manila Philippines skyline aerial Intramuros', alt: 'Manila Bay sunset Philippines cityscape' },
  'mt-pulag': { hero: 'Mount Pulag Philippines sea of clouds sunrise', alt: 'Mt Pulag summit grasslands Philippines hiking' },
  pagudpud: { hero: 'Pagudpud Philippines Saud Beach aerial', alt: 'Pagudpud Bangui windmills Philippines coast' },
  'puerto-galera': { hero: 'Puerto Galera Philippines White Beach aerial', alt: 'Puerto Galera Mindoro Philippines diving beach' },
  'puerto-princesa': { hero: 'Puerto Princesa underground river Philippines', alt: 'Puerto Princesa Palawan Philippines aerial' },
  sagada: { hero: 'Sagada Philippines hanging coffins mountain', alt: 'Sagada Mountain Province Philippines pine forest' },
  samar: { hero: 'Samar Philippines Sohoton natural bridge cave', alt: 'Samar island Philippines river cave adventure' },
  siargao: { hero: 'Siargao Cloud 9 surfing aerial Philippines', alt: 'Siargao island Philippines palm trees aerial' },
  sipalay: { hero: 'Sipalay Sugar Beach Philippines aerial', alt: 'Sipalay Negros Occidental Philippines beach' },
  subic: { hero: 'Subic Bay Philippines freeport aerial', alt: 'Subic Zambales Philippines bay aerial' },
  tacloban: { hero: 'Tacloban Leyte Philippines MacArthur Landing', alt: 'Tacloban Philippines aerial San Juanico Bridge' },
  tagaytay: { hero: 'Tagaytay Taal Volcano view Philippines', alt: 'Tagaytay ridge Philippines Taal Lake aerial' },
  vigan: { hero: 'Vigan Calle Crisologo Philippines colonial street', alt: 'Vigan Heritage City Philippines cobblestone horse carriage' },
  zambales: { hero: 'Zambales Philippines Anawangin Cove aerial', alt: 'Zambales cove volcanic ash Philippines beach' },
};

// Immersive break search term generation
function breakSearchTerms(dest, breakId, breakTitle) {
  const destName = dest.replace(/-/g, ' ');
  const clean = breakTitle.toLowerCase();

  // Generic patterns based on break content
  const terms = `${destName} Philippines ${breakTitle}`;
  const alt = `Philippines ${clean} tropical`;
  return { search: terms.slice(0, 60), alt: alt.slice(0, 60) };
}

// Read all destination files
const files = fs.readdirSync(DEST_DIR).filter(f => f.endsWith('.md'));
const newEntries = [];

for (const file of files) {
  const slug = file.replace('.md', '');
  const content = fs.readFileSync(path.join(DEST_DIR, file), 'utf8');

  // Extract frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) continue;

  let fm;
  try {
    fm = yaml.load(fmMatch[1]);
  } catch (e) {
    console.error(`Warning: Could not parse frontmatter for ${file}`);
    continue;
  }

  const title = fm.title || slug;
  const heroVideo = fm.heroVideo || '';
  const source = OWN_FOOTAGE.has(slug) ? 'both' : 'shutterstock';
  const ownStatus = OWN_FOOTAGE.has(slug) ? 'needs_edit' : 'n/a';

  // Hero entry
  const heroId = `${slug}-hero-aerial`;
  if (!existingIds.has(heroId) && !existingIds.has(`${slug}-hero-${slug.split('-')[0]}`)) {
    // Check if ANY hero entry exists for this destination
    const hasHero = [...existingIds].some(id => id.startsWith(`${slug}-hero`));
    if (!hasHero) {
      const hints = SEARCH_HINTS[slug] || { hero: `${title} Philippines aerial drone`, alt: `${title} Philippines landscape aerial` };
      newEntries.push({
        id: `${slug}-hero`,
        page: slug,
        page_type: 'destination',
        section: 'hero',
        slot: 'hero',
        description: `${title} hero — aerial or signature landscape`,
        search_terms: hints.hero,
        alt_search: hints.alt,
        duration_sec: '15-20',
        resolution: '4K',
        looping: true,
        audio: false,
        source,
        own_footage_status: ownStatus,
        stock_status: 'needs_download',
        priority: 'p0',
        shutterstock_url: '',
        file_path: heroVideo || `/videos/destinations/${slug}-hero.mp4`,
        notes: heroVideo ? 'Defined in frontmatter heroVideo.' : 'heroVideo empty in frontmatter — set after download.',
      });
    }
  }

  // Extract immersive breaks
  const breakRegex = /<div class="immersive-break-inline" id="([^"]+)"[\s\S]*?<h2 class="ib-title">([^<]+)<\/h2>/g;
  let match;
  while ((match = breakRegex.exec(content)) !== null) {
    const breakId = match[1];
    const breakTitle = match[2];
    const entryId = `${slug}-break-${breakId}`;

    if (!existingIds.has(entryId)) {
      const terms = breakSearchTerms(slug, breakId, breakTitle);
      newEntries.push({
        id: entryId,
        page: slug,
        page_type: 'destination',
        section: breakId,
        slot: 'immersive_break',
        description: `${title} — ${breakTitle}`,
        search_terms: terms.search,
        alt_search: terms.alt,
        duration_sec: '10-15',
        resolution: '1080p',
        looping: true,
        audio: false,
        source,
        own_footage_status: ownStatus,
        stock_status: 'needs_download',
        priority: breakId === 'farewell' ? 'p1' : 'p1',
        shutterstock_url: '',
        file_path: '',
        notes: 'Gradient-only fallback currently.',
      });
    }
  }
}

// Generate YAML output
if (newEntries.length === 0) {
  console.log('# No new entries needed — all destinations are tracked.');
  process.exit(0);
}

// Group by region for readability
const regionOrder = { visayas: 1, luzon: 2, mindanao: 3 };
const pageGroups = {};
for (const entry of newEntries) {
  if (!pageGroups[entry.page]) pageGroups[entry.page] = [];
  pageGroups[entry.page].push(entry);
}

const preview = process.argv.includes('--preview');
if (preview) {
  console.log(`\n# Would add ${newEntries.length} new entries for ${Object.keys(pageGroups).length} destinations\n`);
  for (const [page, entries] of Object.entries(pageGroups).sort()) {
    console.log(`  ${page}: ${entries.length} entries (${entries.filter(e => e.slot === 'hero').length} hero, ${entries.filter(e => e.slot === 'immersive_break').length} breaks)`);
  }
  process.exit(0);
}

// Output YAML to append
let output = '\n';
let currentPage = '';

for (const entry of newEntries) {
  if (entry.page !== currentPage) {
    currentPage = entry.page;
    const titleCase = currentPage.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    output += `\n  # ════════════════════════════════════════════════════════════\n`;
    output += `  # ${titleCase.toUpperCase()}\n`;
    output += `  # ════════════════════════════════════════════════════════════\n\n`;
  }

  output += `  - id: ${entry.id}\n`;
  output += `    page: ${entry.page}\n`;
  output += `    page_type: ${entry.page_type}\n`;
  output += `    section: ${entry.section}\n`;
  output += `    slot: ${entry.slot}\n`;
  output += `    description: "${entry.description}"\n`;
  output += `    search_terms: "${entry.search_terms}"\n`;
  output += `    alt_search: "${entry.alt_search}"\n`;
  output += `    duration_sec: "${entry.duration_sec}"\n`;
  output += `    resolution: ${entry.resolution}\n`;
  output += `    looping: ${entry.looping}\n`;
  output += `    audio: ${entry.audio}\n`;
  output += `    source: ${entry.source}\n`;
  output += `    own_footage_status: ${entry.own_footage_status}\n`;
  output += `    stock_status: ${entry.stock_status}\n`;
  output += `    priority: ${entry.priority}\n`;
  output += `    shutterstock_url: ""\n`;
  output += `    file_path: "${entry.file_path}"\n`;
  output += `    notes: "${entry.notes}"\n\n`;
}

process.stdout.write(output);
