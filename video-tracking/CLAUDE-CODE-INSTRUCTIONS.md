# Video Tracking — Claude Code Instructions

## Overview

This system tracks every video slot across the Discover Philippines site. The inventory starts empty and grows as pages are built. **Never pre-populate entries for pages that don't exist yet.**

The file `video-inventory.yaml` is the single source of truth.

---

## When to Add Entries

**Add video entries to `video-inventory.yaml` every time you:**

1. Build a new page that has video sections (hero backgrounds, ImmersiveBreaks, section backgrounds, inline video, thumbnails)
2. Add a new section to an existing page that needs video
3. Redesign a page in a way that changes its video needs

**Do NOT add entries:**
- For pages that haven't been built yet
- Based on assumptions about future page designs
- For sections that use static images only

---

## How to Add Entries

After building or updating a page, scan every section that uses or needs video. For each one, append an entry to the `entries` array in `video-inventory.yaml`.

### ID Convention

Format: `{page_slug}-{section_slug}-{descriptor}`

Examples:
- `siquijor-hero-ferry-approach`
- `homepage-cta-sunset`
- `snorkeling-pillar-hero-underwater`
- `cebu-kawasan-falls-break`

Use slugified, lowercase, hyphenated names. IDs are permanent.

### Determining Source

When adding an entry, set the `source` field based on what footage exists:

| Situation | source | own_footage_status | stock_status |
|-----------|--------|--------------------|--------------|
| Scott has Insta360 footage for this | `own_footage` | `has_clip` or `needs_edit` | `n/a` |
| No own footage, need stock | `stock` | `n/a` | `needs_download` |
| Have footage but quality uncertain | `both` | `needs_edit` | `needs_download` |
| Don't know yet | `tbd` | `n/a` | `n/a` |

**Stock sources:** Clips are manually downloaded from **Shutterstock** and **Storyblocks** websites (no API). The user browses the sites, downloads clips to `~/Downloads/`, then Claude Code sweeps and processes them.

**Own footage destinations** (Scott filmed these with Insta360):
- Cebu (Dec 29-31, 2024)
- Bohol (Jan 1-3, 2025)
- Siquijor (Jan 4-5, 2025)
- Dumaguete (Jan 6-7, 2025)
- Clark/Angeles (various)

**All other destinations** → `source: shutterstock` or `source: tbd`

### Priority Rules

- `p0` — Page cannot launch without this video (heroes, primary section backgrounds)
- `p1` — Important for full experience but page works without it (secondary breaks, supplemental)
- `p2` — Nice to have, batch later (thumbnails, blog inline, generic B-roll)

---

## Step-by-Step: Building a Destination Page

When you build a destination page (e.g., `src/content/destinations/siargao.md` or `src/pages/destinations/siargao.astro`), do this AFTER the page structure is finalized:

1. **List every section that needs video.** Scan the template/layout and the page content to identify:
   - Hero section (usually has a video background)
   - ImmersiveBreak components (video + gradient overlay sections)
   - Section backgrounds (any full-bleed section with video)
   - Thumbnail/card videos (hover previews, related destination cards)
   - Inline video embeds (YouTube player sections)

2. **For each video section, create an entry** with all fields filled in.

3. **Set search_terms** as if you're typing into Shutterstock's search bar. Keep it 4-8 words, specific to the exact visual needed. Add `alt_search` as a backup query with different wording.

4. **Append entries** to the `entries` array in `video-inventory.yaml`. Do NOT overwrite existing entries.

### Example: After Building Siargao Page

If the built page has: hero, 3 ImmersiveBreaks (surfing, palm road, island hopping), and a thumbnail slot:

```yaml
entries:
  # ... existing entries above ...

  # ── Siargao (added when page built) ──
  - id: siargao-hero-cloud9-aerial
    page: siargao
    page_type: destination
    section: hero
    slot: hero
    description: "Cloud 9 surfing area aerial or Siargao palm-covered island overview"
    search_terms: "Siargao Cloud 9 surfing aerial drone"
    alt_search: "Siargao island aerial palm trees Philippines"
    duration_sec: "15-20"
    resolution: 4K
    looping: true
    audio: false
    source: shutterstock
    own_footage_status: n/a
    stock_status: needs_download
    priority: p0
    shutterstock_url: ""
    file_path: ""
    notes: ""

  - id: siargao-break1-surfing
    page: siargao
    page_type: destination
    section: surfing-culture
    slot: immersive_break
    description: "Surfers riding waves at Cloud 9 barrel"
    search_terms: "Siargao surfing Cloud 9 barrel wave"
    alt_search: "Philippines surfing barrel wave tropical"
    duration_sec: "15-20"
    resolution: 1080p
    looping: true
    audio: false
    source: shutterstock
    own_footage_status: n/a
    stock_status: needs_download
    priority: p1
    shutterstock_url: ""
    file_path: ""
    notes: ""

  # ... more entries for remaining sections ...
```

---

## Step-by-Step: Building a Pillar Page

Same process. Scan the built page for video sections, add entries. Pillar pages may have fewer video slots than destination pages.

---

## Updating Entries

### When a clip is sourced (downloaded or edited from Insta360):

```yaml
# Before:
stock_status: needs_download

# After:
stock_status: downloaded
shutterstock_url: "https://www.shutterstock.com/video/clip-XXXXXXX"
file_path: "heroes/siargao-cloud9.mp4"
```

### When a section is removed from a page:

Do NOT delete the entry. Set status:
```yaml
stock_status: removed
notes: "Section removed in page redesign 2026-03-15"
```

### When own footage is tested and works:

```yaml
source: own_footage
own_footage_status: has_clip
stock_status: n/a
file_path: "heroes/siquijor-ferry.mp4"
```

---

## Generating the Download Shopping List

To see which clips still need to be downloaded from Shutterstock/Storyblocks, run:

```bash
bash video-tracking/generate-shopping-list.sh
```

This reads `video-inventory.yaml` and outputs ONLY the entries where `stock_status: needs_download`, grouped by priority. Use the `search_terms` and `alt_search` fields to manually search on the stock library websites. That's your exact download list — nothing more, nothing less.

---

## Running the Full Status Report

```bash
bash video-tracking/video-report.sh
```

Outputs: total entries, sourced vs. unsourced, by page, by priority, by source type, and launch blockers (p0 items still needing video).

---

## Full Pipeline Checklist (Per Destination)

**TRIGGER:** When the user says "done" (or similar) after downloading clips for a destination, run this ENTIRE pipeline immediately. Do NOT ask "want me to process?" — just do it.

### Step 0: Identify new clips
```bash
ls -lt ~/Downloads/*.mp4 ~/Downloads/*.mov | head -30
```
Figure out which destination and which clips are new from the filenames.

### Step 1: Move & rename downloads
- Move ALL clips to `youtube/raw/{dest}-{descriptor}.mp4` (descriptive names, original quality)
- Copy break-designated clips to `raw-downloads/breaks/{dest}-break-{descriptor}.mp4`
- Copy hero clips to `raw-downloads/heroes/{dest}-hero.mp4` (if new hero)
- The youtube/raw/ copy is SOURCE MATERIAL for full YouTube destination guide videos (3-8 min, edited later)

### Step 2: Compress for web (with watermark)
FFmpeg each break clip for the website — **watermark is applied automatically by `2-batch-process.cjs`**:
```bash
ffmpeg -i "youtube/raw/{dest}-break-{name}.mp4" -vf "scale=1920:-2,drawtext=text='discoverphilippines.info':fontsize=32:fontcolor=white@0.8:shadowcolor=black@0.6:shadowx=2:shadowy=2:x=w-tw-20:y=h-th-20:fontfile='/Windows/Fonts/arialbd.ttf'" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart "public/videos/destinations/{dest}-break-N.mp4"
```
- Heroes: 1080p, CRF 26-28, no audio, watermark fontsize=32
- Breaks: 1080p, CRF 28-30, no audio, watermark fontsize=32
- Previews: 720p, CRF 30, no audio, 5-8 sec, watermark fontsize=22

### Step 3: Wire into page
Update `<source src="...">` tags in `src/content/destinations/{dest}.md` immersive-break-inline sections to point to the new break clips.

### Step 4: Update inventory
In `video-tracking/video-inventory.yaml`: set `stock_status: downloaded`, `file_path`, and `notes` for each entry.

### Step 5: Build
```bash
npm run build
```
Must pass with no errors.

### Step 6: Deploy
```bash
npx wrangler pages deploy dist --project-name=discover-philippines --branch=master
```

---

## Two Video Products Being Built

1. **Website break clips** — 10-15 sec compressed clips for `immersive-break-inline` sections. Deployed to `public/videos/destinations/`.
2. **Full YouTube destination guide videos** — 3-8 min videos assembled from ALL raw clips (4-15 per destination). Raw clips accumulate in `youtube/raw/` for editing in DaVinci/CapCut or automated via step 2.5. YouTube Shorts (30-sec from hero) are a separate, already-produced product.

The user downloads 4-15 clips per destination from Storyblocks. Some become website breaks, ALL go to youtube/raw/ as source material for the full YouTube guide.

### Inventory Sync (Run Periodically)

The inventory can drift from reality when videos are batch-processed. After any batch session, verify:

1. Every file in `public/videos/destinations/` and `public/videos/pillar/` has a matching inventory entry
2. Every inventory entry with `stock_status: downloaded` has its file on disk
3. Every deployed video file is referenced in a page (frontmatter `heroVideo` or inline `<source>` tag)
4. No `needs_download` entries exist for videos that are already deployed and wired

Fix any mismatches immediately. Stale `needs_download` entries create confusion about what actually needs sourcing.

---

## Watermark Requirement

**ALL videos and images deployed to the site MUST include the "discoverphilippines.info" watermark.**

### Watermark Spec
- **Text:** `discoverphilippines.info`
- **Style:** White bold @ 80% opacity, dark drop shadow (black@0.6, offset 2,2)
- **Position:** Bottom-right, 20px padding from edges
- **Font size:** 32px for 1080p, 22px for 720p, ~3% of height for images
- **Font:** Arial Bold (`/Windows/Fonts/arialbd.ttf`)

### FFmpeg drawtext filter:
```
drawtext=text='discoverphilippines.info':fontsize=32:fontcolor=white@0.8:shadowcolor=black@0.6:shadowx=2:shadowy=2:x=w-tw-20:y=h-th-20:fontfile='/Windows/Fonts/arialbd.ttf'
```

### How it's applied:
- **New videos (pipeline):** `2-batch-process.cjs` automatically includes the watermark drawtext filter in its FFmpeg commands. No extra step needed.
- **Existing videos:** Run `node video-tracking/pipeline/watermark-videos.cjs` to batch-watermark all deployed videos. Tracks state to avoid re-processing.
- **Images:** Run `node video-tracking/pipeline/watermark-images.cjs` to batch-watermark all images in `public/images/`. Skips logo.png, favicon, og-default.jpg.
- **Manual FFmpeg commands:** Always append the drawtext filter to the `-vf` chain when encoding videos outside the pipeline.

### After adding new images:
Any new image added to `public/images/` must be watermarked before commit:
```bash
node video-tracking/pipeline/watermark-images.cjs
```

---

## Important Reminders

- **The inventory reflects BUILT pages only.** If a page hasn't been created yet, it has no entries.
- **Search terms are for Shutterstock's search bar.** Write them like a human would search: specific, 4-8 words, no operators.
- **Always include alt_search.** Shutterstock coverage varies — some Philippines locations have sparse results.
- **Own footage destinations:** Cebu, Bohol, Siquijor, Dumaguete, Clark. Default these to `source: own_footage` or `source: both` unless Scott says otherwise.
- **All other destinations** default to `source: stock` (Shutterstock or Storyblocks, manually downloaded).
- **Thumbnails are always p2.** Don't let thumbnail downloads delay the Shutterstock sprint.
