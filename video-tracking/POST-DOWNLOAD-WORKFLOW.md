# Post-Download Workflow — Shutterstock Video Sprint

Step-by-step instructions for after you download each video clip from Shutterstock.

---

## Before You Start

**Folder structure to create on your computer:**

```
C:\Users\scott\Documents\discover-philippines\
├── raw-downloads/          ← Shutterstock downloads land here
│   ├── heroes/             ← Hero clips (P0)
│   ├── breaks/             ← Immersive break clips (P1)
│   └── thumbnails/         ← Preview/card clips (P2)
├── public/
│   └── videos/
│       └── destinations/   ← Final web-ready clips go here
└── youtube/
    ├── raw/                ← Full-length clips for YT editing
    ├── edited/             ← Finished YT videos
    └── thumbnails/         ← YT thumbnail images
```

Create these folders before starting:
```
mkdir raw-downloads raw-downloads/heroes raw-downloads/breaks raw-downloads/thumbnails
mkdir youtube youtube/raw youtube/edited youtube/thumbnails
```

---

## Step 1: Download from Shutterstock

1. Open `video-tracking/generate-shopping-list.sh` output (or run `bash video-tracking/generate-shopping-list.sh`)
2. Work through clips **by priority**: P0 heroes first, then P1 breaks, then P2
3. For each clip:
   - Search Shutterstock using the **search_terms** provided
   - If no good results, try the **alt_search** terms
   - Download in **4K** for heroes, **1080p** for breaks
   - Save to `raw-downloads/heroes/` or `raw-downloads/breaks/`

**Shutterstock download tips:**
- Filter by: Video > HD/4K > Duration 10-30s
- Prefer aerial/drone shots for heroes — they compress better and look more cinematic
- Avoid clips with visible text, watermarks, or identifiable people's faces
- Looping clips work best — look for smooth starts/ends
- Download the highest resolution available — you can always scale down

---

## Step 2: Rename Downloaded Files

Shutterstock downloads have random names like `shutterstock_1234567.mp4`. Rename immediately.

**Naming convention:**
```
{destination}-{section}.mp4
```

**Examples:**
```
Shutterstock download:              Rename to:
shutterstock_9876543.mp4     →     boracay-hero.mp4
shutterstock_1234567.mp4     →     boracay-break-arrival.mp4
shutterstock_2345678.mp4     →     boracay-break-beaches.mp4
shutterstock_3456789.mp4     →     mt-pulag-hero.mp4
shutterstock_4567890.mp4     →     mt-pulag-break-sea-of-clouds.mp4
```

The `section` part matches the `id` attribute from the immersive break div in the destination page. Check the shopping list or `video-inventory.yaml` for exact section names.

---

## Step 3: Process for Web (Heroes)

Hero videos need to be optimized for web — small file size, fast loading, no audio.

**Using HandBrake (free):**
1. Open the raw hero clip
2. Settings:
   - Format: MP4
   - Video codec: H.264
   - Resolution: 1920x1080 (scale down from 4K)
   - Frame rate: 24fps
   - Quality: RF 23-26 (lower = better quality, bigger file)
   - Audio: None (remove audio track entirely)
3. Trim to 15-20 seconds if clip is longer
4. Export to: `public/videos/destinations/{destination}-hero.mp4`

**Target file sizes:**
- Hero clips: 3-8 MB (15-20 seconds at 1080p)
- Break clips: 2-5 MB (10-15 seconds at 1080p)
- Preview/thumbnail clips: 1-3 MB (8-12 seconds at 720p)

**Using FFmpeg (command line, faster):**
```bash
# Hero clip — 1080p, no audio, 15 seconds, web optimized
ffmpeg -i raw-downloads/heroes/boracay-hero.mp4 \
  -t 15 -vf scale=1920:1080 -c:v libx264 -crf 24 \
  -an -movflags +faststart \
  public/videos/destinations/boracay-hero.mp4

# Break clip — 1080p, no audio, 12 seconds
ffmpeg -i raw-downloads/breaks/boracay-break-arrival.mp4 \
  -t 12 -vf scale=1920:1080 -c:v libx264 -crf 25 \
  -an -movflags +faststart \
  public/videos/destinations/boracay-break-arrival.mp4

# Preview clip — 720p, no audio, 8 seconds (for destination cards)
ffmpeg -i raw-downloads/heroes/boracay-hero.mp4 \
  -t 8 -vf scale=1280:720 -c:v libx264 -crf 26 \
  -an -movflags +faststart \
  public/videos/destinations/boracay-preview.mp4
```

---

## Step 4: Add to Project

After processing each clip:

### For hero videos:
1. Place file at `public/videos/destinations/{destination}-hero.mp4`
2. Update frontmatter in `src/content/destinations/{destination}.md`:
   ```yaml
   heroVideo: "/videos/destinations/{destination}-hero.mp4"
   ```

### For immersive break videos:
1. Place file at `public/videos/destinations/{destination}-break-{section}.mp4`
2. The destination layout/template needs to support video in immersive breaks
   (Currently breaks use gradient-only — video support may need a template update)

### For preview/card videos:
1. Place file at `public/videos/destinations/{destination}-preview.mp4`
2. Add entry to `videoMap` in `src/pages/destinations/index.astro`:
   ```javascript
   const videoMap: Record<string, string> = {
     // ... existing entries ...
     boracay: '/videos/destinations/boracay-preview.mp4',
   };
   ```

---

## Step 5: Update the Inventory

After placing each clip, update `video-tracking/video-inventory.yaml`:

```yaml
# Before:
stock_status: needs_download
shutterstock_url: ""
file_path: ""

# After:
stock_status: downloaded
shutterstock_url: "https://www.shutterstock.com/video/clip-XXXXXXX"
file_path: "/videos/destinations/boracay-hero.mp4"
```

Or tell Claude Code to update it — just say "mark boracay hero as downloaded, Shutterstock URL is [url]"

---

## Step 6: Build and Deploy

After adding a batch of videos:
```bash
npx astro build
npx wrangler pages deploy dist --project-name=discover-philippines --commit-dirty=true
```

**Important:** Video files go in `public/` (not `src/`), so they're served as static assets. Cloudflare Pages has a 25MB per-file limit — hero clips should be well under this after processing.

---

## Step 7: Save Raw Files for YouTube

Before processing for web, copy the full Shutterstock clips to `youtube/raw/`:
```
youtube/raw/boracay-hero-full.mp4
youtube/raw/boracay-arrival-full.mp4
youtube/raw/mt-pulag-sea-of-clouds-full.mp4
```

These full-resolution clips will be used to edit YouTube destination videos (see YOUTUBE-STRATEGY.md).

---

## Daily Download Routine

With 194 clips over 30 days = ~7 clips/day:

1. Pick a destination (start with P0 heroes)
2. Search Shutterstock, download 5-7 clips
3. Rename immediately (Step 2)
4. Copy full versions to `youtube/raw/`
5. Process for web (Step 3)
6. Place in `public/videos/destinations/`
7. Update frontmatter if it's a hero
8. Update inventory YAML
9. Batch commit and deploy every few days

---

## Checklist Per Clip

- [ ] Downloaded from Shutterstock
- [ ] Renamed to convention: `{destination}-{section}.mp4`
- [ ] Full version saved to `youtube/raw/`
- [ ] Processed for web (compressed, no audio, correct resolution)
- [ ] Placed in `public/videos/destinations/`
- [ ] Frontmatter updated (heroes only)
- [ ] videoMap updated (preview clips only)
- [ ] Inventory YAML updated with URL and file path
