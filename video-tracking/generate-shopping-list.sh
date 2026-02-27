#!/bin/bash
# ============================================================
# GENERATE SHUTTERSTOCK SHOPPING LIST
# Reads video-inventory.yaml → outputs only clips needing download
# Run BEFORE activating Shutterstock Unlimited subscription
# Usage: bash video-tracking/generate-shopping-list.sh
# ============================================================

node << 'NODEEOF'
const fs = require("fs");
const yaml = require("js-yaml");

const paths = ["video-tracking/video-inventory.yaml", "video-inventory.yaml"];
let data;
for (const p of paths) {
  if (fs.existsSync(p)) {
    data = yaml.load(fs.readFileSync(p, "utf8"));
    break;
  }
}
if (!data) {
  console.error("Error: video-inventory.yaml not found");
  console.error("Run from project root or video-tracking/ directory");
  process.exit(1);
}

const entries = data.entries || [];

const now = new Date();
const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

const totalEntries = entries.length;
const needs = entries.filter(e => e.stock_status === "needs_download");
const tbd = entries.filter(e => e.source === "tbd");

console.log();
console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║     SHUTTERSTOCK SHOPPING LIST — DISCOVER PHILIPPINES    ║");
console.log("╚══════════════════════════════════════════════════════════╝");
console.log();
console.log(`Generated: ${dateStr}`);
console.log(`Total inventory entries: ${totalEntries}`);
console.log(`Clips needing download: ${needs.length}`);
console.log(`Source TBD (decide first): ${tbd.length}`);
console.log();

if (tbd.length > 0) {
  console.log(`⚠️  WARNING: ${tbd.length} entries have source: tbd`);
  console.log("   Resolve these before subscribing. They may or may not need stock.");
  console.log();
}

if (needs.length === 0 && tbd.length === 0) {
  console.log("✅ No downloads needed. All video slots are sourced.");
  process.exit(0);
}

if (!entries.length) {
  console.log("📭 Inventory is empty — build pages first.");
  process.exit(0);
}

// Download pace
console.log("📅 DOWNLOAD PACE");
console.log(`   At 30 days: ${Math.ceil(needs.length / 30)} clips/day`);
console.log(`   At 20 days: ${Math.ceil(needs.length / 20)} clips/day`);
console.log();

function pad(s, n) { return (s + " ".repeat(n)).slice(0, n); }

// Group by priority
const priorities = [
  { key: "p0", label: "P0 — LAUNCH BLOCKERS (download these first)", icon: "🔴" },
  { key: "p1", label: "P1 — IMPORTANT", icon: "🟡" },
  { key: "p2", label: "P2 — NICE TO HAVE", icon: "🟢" },
];

for (const { key, label, icon } of priorities) {
  const group = needs.filter(e => e.priority === key);

  console.log("━".repeat(56));
  console.log(`${icon} ${label}`);
  console.log("━".repeat(56));

  if (!group.length) {
    if (key === "p0") console.log("  ✅ No P0 blockers — nice!");
    else console.log("  (none)");
    console.log();
    continue;
  }

  // Sub-group by page
  const pages = {};
  for (const e of group) {
    const p = e.page || "unknown";
    if (!pages[p]) pages[p] = [];
    pages[p].push(e);
  }

  for (const page of Object.keys(pages).sort()) {
    console.log(`\n  📍 ${page.toUpperCase().replace(/[-_]/g, " ")}`);
    for (const c of pages[page]) {
      const desc = (c.description || "").slice(0, 60);
      const search = c.search_terms || "";
      const slot = c.slot || "";
      console.log(`     [${pad(slot, 16)}] ${desc}`);
      console.log(`     🔍 Search: ${search}`);
      if (c.alt_search) {
        console.log(`     🔍 Alt:    ${c.alt_search}`);
      }
      console.log();
    }
  }
}

// TBD entries
if (tbd.length) {
  console.log();
  console.log("━".repeat(56));
  console.log("⚠️  SOURCE TBD — Decide before subscribing");
  console.log("━".repeat(56));
  for (const e of tbd) {
    console.log(`  ${pad(e.id || "???", 40)} [${e.page || "?"}]`);
    console.log(`     ${(e.description || "").slice(0, 60)}`);
    console.log();
  }
}

console.log();
console.log(`TOTAL CLIPS TO DOWNLOAD: ${needs.length}`);
console.log("ESTIMATED COST: $199 (one month Shutterstock Unlimited)");
console.log(`PACE: ${Math.max(1, Math.ceil(needs.length / 30))} clips/day over 30 days`);
console.log();
NODEEOF
