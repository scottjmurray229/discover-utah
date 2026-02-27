#!/bin/bash
# ============================================================
# VIDEO INVENTORY STATUS REPORT
# Run: bash video-tracking/video-report.sh
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
  process.exit(1);
}

const entries = data.entries || [];

console.log();
console.log("╔══════════════════════════════════════════════════════════╗");
console.log("║        VIDEO INVENTORY STATUS — DISCOVER PHILIPPINES     ║");
console.log("╚══════════════════════════════════════════════════════════╝");
console.log();
console.log(`Report date: ${new Date().toISOString().split("T")[0]}`);
console.log(`Total entries: ${entries.length}`);
console.log();

if (!entries.length) {
  console.log("📭 Inventory is empty — no pages have been built yet.");
  console.log("   Entries are added automatically as Claude Code builds pages.");
  process.exit(0);
}

// ── Helpers ──
function count(arr, fn) {
  const map = {};
  for (const e of arr) {
    const k = fn(e);
    map[k] = (map[k] || 0) + 1;
  }
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function pad(s, n) { return (s + " ".repeat(n)).slice(0, n); }

// ── Source breakdown ──
const srcIcons = { own_footage: "🎥", shutterstock: "📦", both: "🔄", tbd: "❓" };
console.log("SOURCE BREAKDOWN");
for (const [src, c] of count(entries, e => e.source || "unknown")) {
  console.log(`  ${srcIcons[src] || "?"} ${pad(src, 20)} ${String(c).padStart(3)}`);
}
console.log();

// ── Stock status ──
const stockIcons = { downloaded: "✅", needs_download: "⬇️", "n/a": "➖", skipped: "⏭️", not_found: "❌", removed: "🗑️" };
console.log("STOCK STATUS");
for (const [st, c] of count(entries, e => e.stock_status || "n/a")) {
  console.log(`  ${stockIcons[st] || "?"} ${pad(st, 20)} ${String(c).padStart(3)}`);
}
console.log();

// ── Own footage status ──
const ownIcons = { has_clip: "✅", needs_edit: "✂️", unusable: "❌", "n/a": "➖" };
console.log("OWN FOOTAGE STATUS");
for (const [st, c] of count(entries, e => e.own_footage_status || "n/a")) {
  console.log(`  ${ownIcons[st] || "?"} ${pad(st, 20)} ${String(c).padStart(3)}`);
}
console.log();

// ── Priority breakdown ──
console.log("PRIORITY");
const prioIcons = { p0: "🔴", p1: "🟡", p2: "🟢" };
for (const p of ["p0", "p1", "p2"]) {
  const group = entries.filter(e => e.priority === p);
  const sourced = group.filter(e =>
    e.stock_status === "downloaded" ||
    e.own_footage_status === "has_clip" ||
    (e.stock_status === "n/a" && ["has_clip", "needs_edit"].includes(e.own_footage_status))
  ).length;
  console.log(`  ${prioIcons[p]} ${p}: ${group.length} total, ${sourced} sourced, ${group.length - sourced} remaining`);
}
console.log();

// ── Per page breakdown ──
console.log("BY PAGE");
const pages = {};
for (const e of entries) {
  const p = e.page || "unknown";
  if (!pages[p]) pages[p] = { total: 0, sourced: 0, needs_stock: 0, tbd: 0 };
  pages[p].total++;
  if (e.stock_status === "downloaded" || e.own_footage_status === "has_clip") pages[p].sourced++;
  if (e.stock_status === "needs_download") pages[p].needs_stock++;
  if (e.source === "tbd") pages[p].tbd++;
}
console.log(`  ${pad("PAGE", 25)} ${" TOTAL".slice(-5)} ${"  DONE".slice(-5)} ${" STOCK".slice(-5)} ${"   TBD".slice(-5)}`);
console.log(`  ${"─".repeat(25)} ${"─".repeat(5)} ${"─".repeat(5)} ${"─".repeat(5)} ${"─".repeat(5)}`);
for (const page of Object.keys(pages).sort()) {
  const s = pages[page];
  console.log(`  ${pad(page, 25)} ${String(s.total).padStart(5)} ${String(s.sourced).padStart(5)} ${String(s.needs_stock).padStart(5)} ${String(s.tbd).padStart(5)}`);
}
console.log();

// ── Launch blockers ──
const blockers = entries.filter(e =>
  e.priority === "p0" &&
  !["downloaded", "n/a", "skipped", "removed"].includes(e.stock_status) &&
  e.own_footage_status !== "has_clip"
);
if (blockers.length) {
  console.log(`🚨 LAUNCH BLOCKERS: ${blockers.length} P0 items still need video`);
  for (const b of blockers) {
    console.log(`   - ${b.id}: ${(b.description || "").slice(0, 50)}`);
  }
} else {
  console.log("✅ No P0 launch blockers");
}

// ── Shutterstock readiness ──
const needsDl = entries.filter(e => e.stock_status === "needs_download").length;
const tbdCount = entries.filter(e => e.source === "tbd").length;
console.log();
if (needsDl > 0 || tbdCount > 0) {
  console.log("📦 SHUTTERSTOCK READINESS");
  console.log(`   Clips to download:  ${needsDl}`);
  console.log(`   Source undecided:   ${tbdCount}`);
  const ready = tbdCount === 0 && needsDl > 0 ? "Yes ✅" : tbdCount > 0 ? "No — resolve TBDs first" : "No downloads needed";
  console.log(`   Ready to subscribe: ${ready}`);
  if (needsDl > 0) {
    console.log("   Run: bash video-tracking/generate-shopping-list.sh");
  }
} else {
  console.log("📦 No Shutterstock downloads needed");
}
console.log();
NODEEOF
