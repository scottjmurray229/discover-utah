# Video Pipeline

Automated video download, processing, deployment, and YouTube upload.

## Setup (one time)

### 1. Install FFmpeg
```bash
winget install ffmpeg
```
Then restart your terminal.

### 2. Shutterstock API Token
1. Go to https://www.shutterstock.com/account/developers/apps
2. Create an app, get your API token
3. Copy `config.env.example` to `config.env`
4. Paste your token

### 3. YouTube API (optional, for Step 4)
1. Go to https://console.cloud.google.com
2. Create project "Discover Philippines"
3. Enable **YouTube Data API v3**
4. Create **OAuth 2.0 credentials** (Desktop app type)
5. Download the JSON → save as `video-tracking/pipeline/client_secret.json`

## Usage

### Full pipeline (search → process → deploy)
```bash
node video-tracking/pipeline/run-pipeline.cjs
```

### Single destination
```bash
node video-tracking/pipeline/run-pipeline.cjs --dest boracay
```

### Individual steps
```bash
# Step 1: Search Shutterstock, pick clips, download
node video-tracking/pipeline/1-search-download.cjs --priority p0

# Step 2: FFmpeg compress for web
node video-tracking/pipeline/2-batch-process.cjs

# Step 3: Update frontmatter + deploy
node video-tracking/pipeline/3-deploy-videos.cjs

# Step 4: Upload to YouTube
node video-tracking/pipeline/4-youtube-upload.cjs
```

### Useful flags
```bash
--dest boracay    # Filter to one destination
--priority p0     # Heroes only (Step 1)
--heroes-only     # Heroes only (Step 2)
--limit 10        # First N clips (Step 1)
--no-deploy       # Skip build/deploy (Step 3)
--dry-run         # Preview without changes (all steps)
--all             # Include YouTube upload (orchestrator)
--from 2          # Start from step N (orchestrator)
--step 3          # Run single step (orchestrator)
```

## What each step does

| Step | Script | Interactive? | What it does |
|------|--------|-------------|-------------|
| 1 | `1-search-download.cjs` | Yes | Searches Shutterstock, shows top 5 results, you pick, it downloads + renames + saves to youtube/raw |
| 2 | `2-batch-process.cjs` | No | FFmpeg compresses all raw downloads for web (1080p heroes, 720p previews), strips audio |
| 3 | `3-deploy-videos.cjs` | No | Updates heroVideo frontmatter, videoMap, inventory YAML, builds Astro, deploys to Cloudflare |
| 4 | `4-youtube-upload.cjs` | First run | Uploads videos from youtube/edited/ to YouTube as private, with SEO metadata |

## File flow

```
Shutterstock → raw-downloads/heroes/boracay-hero.mp4
                              ↓ (Step 2: FFmpeg)
               public/videos/destinations/boracay-hero.mp4      (web, 1080p)
               public/videos/destinations/boracay-preview.mp4   (card, 720p)
                              ↓ (Step 3: Deploy)
               Live on Cloudflare Pages

               youtube/raw/boracay-hero-full.mp4                (original quality)
                              ↓ (you edit in DaVinci/CapCut)
               youtube/edited/dest-boracay-guide-2026.mp4
                              ↓ (Step 4: Upload)
               YouTube (private → review → publish)
```

## Files in this folder

| File | Purpose |
|------|---------|
| `config.env.example` | Template for API keys |
| `config.env` | Your API keys (gitignored) |
| `config-loader.cjs` | Shared config loader |
| `1-search-download.cjs` | Shutterstock search + download |
| `2-batch-process.cjs` | FFmpeg batch compression |
| `3-deploy-videos.cjs` | Frontmatter + deploy |
| `4-youtube-upload.cjs` | YouTube upload |
| `run-pipeline.cjs` | Orchestrator |
| `client_secret.json` | YouTube OAuth credentials (gitignored) |
| `youtube-token.json` | Saved YouTube auth token (gitignored) |
