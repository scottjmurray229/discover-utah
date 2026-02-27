# Tomorrow's Setup Guide — Step by Step

Everything you need to do in one session. Work through it top to bottom.

---

## Part 1: YouTube Channel Setup (YouTube Studio)

Go to **https://studio.youtube.com** and sign in with **info@discoverphilippines.info**.

**IMPORTANT:** Click your profile icon (top right) → "Switch account" → make sure you're on **Discover Philippines**, NOT "Scott Murray".

### Step 1: Profile Picture
1. Customization → Branding → Profile picture
2. Upload site logo or a Scott & Jenice photo
3. Minimum 800x800 pixels

### Step 2: Banner Image
1. Customization → Branding → Banner image
2. Upload a Philippines aerial panorama (2560x1440 px)
3. Add text overlay: **"Honest Travel Guides — Real Prices, Local Perspective"**
4. Add **discoverphilippines.com** in the banner
5. Keep text in the center safe zone (1546x423 px) so it shows on all devices
6. Tools: Canva free tier works great for this

### Step 3: Video Watermark
1. Customization → Branding → Video watermark
2. Upload small site logo (150x150 px, PNG with transparency)
3. Set display to **"Entire video"**
4. This becomes a clickable subscribe button on every video

### Step 4: Channel Description
1. Customization → Basic info → Description
2. Paste this exactly:

```
Real Philippines travel guides from a couple who've been going back for 20+ years.

Scott handles logistics. Jenice is Filipina — raised in Pampanga, born in Bulacan. We've made 20+ trips together since 2003. No sponsored content, no influencer vibes — just honest recommendations with real prices and a local perspective no foreign travel writer can share.

42 destination guides covering Visayas, Luzon, and Mindanao. Each one includes where to eat, where to stay, how to get there, current prices, and what most tourists miss.

🌐 Website: https://discoverphilippines.com
📱 Trip Companion (works offline): https://discoverphilippines.com/companion/
🆓 Free Beta Access: https://discoverphilippines.com/founding-explorer/
📧 Contact: info@discoverphilippines.info
```

### Step 5: Channel Links
1. Still in Customization → Basic info → scroll to **Links**
2. Add these three:

| Link Name | URL |
|-----------|-----|
| Website | https://discoverphilippines.com |
| Trip Companion | https://discoverphilippines.com/companion/ |
| Founding Explorer Beta | https://discoverphilippines.com/founding-explorer/ |

### Step 6: Channel Keywords
1. Settings (gear icon, bottom left) → Channel → Basic info → Keywords
2. Paste this:

```
Philippines travel, Philippines travel guide, Philippines destinations, Filipino food, Philippines snorkeling, Philippines festivals, Philippines budget travel, Visayas travel, Luzon travel, Mindanao travel, balikbayan travel, Philippines tips, Philippines 2026
```

### Step 7: Default Upload Settings
1. Settings → Upload defaults
2. Leave Title blank
3. Paste this into Description:

```
📖 Full written guide with prices and directions: https://discoverphilippines.com
📱 Trip Companion (works offline): https://discoverphilippines.com/companion/

We've been traveling to the Philippines for 20+ years. Jenice is Filipina, Scott handles logistics. No sponsored content — just honest recommendations.

#Philippines #PhilippinesTravel #TravelGuide
```

4. Set these defaults:
   - **Visibility:** Private
   - **Tags:** `Philippines travel, Philippines guide, Philippines 2026, travel tips`
   - **Category:** Travel & Events
   - **Language:** English
   - **License:** Standard YouTube License
   - **Comments:** Hold potentially inappropriate comments for review

### Step 8: Create 9 Playlists
1. Go to Playlists (left sidebar) → New playlist
2. Create each one, set visibility to **Public**:

| # | Playlist Name | Description |
|---|--------------|-------------|
| 1 | Visayas Destinations | Island guides for the Visayas region — Cebu, Bohol, Siquijor, Boracay, Dumaguete, and more. |
| 2 | Luzon Destinations | Travel guides for Luzon — Manila, Baguio, El Nido, Coron, Batanes, Vigan, and more. |
| 3 | Mindanao Destinations | Guides to Mindanao — Siargao, Davao, Camiguin. |
| 4 | Philippines Travel Tips | Practical guides — flights, SIM cards, money, safety, packing, getting around. |
| 5 | Filipino Food Guide | What to eat in the Philippines — by destination and by dish. |
| 6 | Snorkeling & Diving | Best underwater spots in the Philippines — gear, conditions, and what you'll see. |
| 7 | Philippine Festivals | Sinulog, Ati-Atihan, Panagbenga, Masskara, and more — when to go and what to expect. |
| 8 | WWII Heritage | Historical sites — Bataan, Corregidor, Manila, Tacloban. |
| 9 | Trip Companion | Demos, tutorials, and behind-the-scenes of the Discover Philippines Trip Companion app. |

### Step 9: Channel Layout
1. Customization → Layout
2. Set **Featured video for returning subscribers:** Latest upload
3. Add **Featured sections** in this order:
   - Popular uploads
   - Visayas Destinations (playlist)
   - Luzon Destinations (playlist)
   - Mindanao Destinations (playlist)
   - Philippines Travel Tips (playlist)
   - Shorts

(Channel trailer can be set later when you publish your first video)

**YouTube Studio setup is done. Publish/save all changes.**

---

## Part 2: YouTube API Setup (for automated uploads)

This enables the pipeline to upload videos to YouTube automatically.

1. Go to **https://console.cloud.google.com**
2. Sign in with **info@discoverphilippines.info**
3. Click "Select a project" (top bar) → "New Project"
4. Name it **Discover Philippines** → Create
5. Make sure the new project is selected
6. Go to **APIs & Services → Library**
7. Search for **YouTube Data API v3** → Click it → **Enable**
8. Go to **APIs & Services → Credentials**
9. Click **+ Create Credentials → OAuth client ID**
10. If prompted to configure consent screen:
    - Choose **External** → Create
    - App name: Discover Philippines
    - User support email: info@discoverphilippines.info
    - Developer contact: info@discoverphilippines.info
    - Save and continue through scopes (no changes needed)
    - Add test user: info@discoverphilippines.info
    - Save
11. Back to Credentials → **+ Create Credentials → OAuth client ID**
12. Application type: **Desktop app**
13. Name: Video Pipeline
14. Click Create
15. Click **Download JSON** (the download icon)
16. Save/move the file to:
    ```
    C:\Users\scott\Documents\discover-philippines\video-tracking\pipeline\client_secret.json
    ```

**YouTube API setup is done.**

---

## Part 3: Shutterstock API Setup

1. Go to **https://www.shutterstock.com/account/developers/apps**
2. Sign in with your Shutterstock account
3. Create a new app (or use existing one)
4. Copy your **API Token**
5. Open this file in any text editor:
   ```
   C:\Users\scott\Documents\discover-philippines\video-tracking\pipeline\config.env
   ```
6. Replace `your_api_token_here` with your actual token:
   ```
   SHUTTERSTOCK_API_TOKEN=paste_your_real_token_here
   ```
7. If you completed Part 2, also fill in:
   ```
   YOUTUBE_CLIENT_ID=paste_from_google_cloud
   YOUTUBE_CLIENT_SECRET=paste_from_google_cloud
   ```
   (You can find these in Google Cloud Console → Credentials → click your OAuth client)
8. Save the file

---

## Part 4: Restart Terminal

Close your terminal completely and open a new one. This ensures FFmpeg is on your PATH.

Quick test — run this in the new terminal:
```bash
ffmpeg -version
```
If it prints version info, you're good. If not, the pipeline will still find it automatically — no worries.

---

## Part 5: Download Hero Videos (Pipeline Step 1)

Open your terminal in the project folder:
```bash
cd C:\Users\scott\Documents\discover-philippines
```

### Start with P0 heroes (most important — one per destination):
```bash
node video-tracking/pipeline/1-search-download.cjs --priority p0
```

**What happens:**
- The script searches Shutterstock for each destination
- Shows you the top 5 results with preview links
- You pick the best clip (type 1-5)
- It downloads, renames, and saves to the right folder automatically
- Also copies the original to `youtube/raw/` for later YouTube editing

### If you want just one destination at a time:
```bash
node video-tracking/pipeline/1-search-download.cjs --priority p0 --dest boracay
```

### Recommended download order (best stock footage availability):
1. boracay
2. el-nido
3. cebu
4. siargao
5. manila

### After heroes, start on immersive breaks:
```bash
node video-tracking/pipeline/1-search-download.cjs --priority p1
```

---

## Part 6: Process & Deploy Videos (Pipeline Steps 2-3)

After downloading some clips, compress and deploy them to the live site:

### Process all downloaded clips:
```bash
node video-tracking/pipeline/run-pipeline.cjs --from 2
```

This runs Step 2 (FFmpeg compress) then Step 3 (update site + deploy to Cloudflare).

### Or run steps individually:
```bash
# Just compress (no deploy)
node video-tracking/pipeline/2-batch-process.cjs

# Just deploy
node video-tracking/pipeline/3-deploy-videos.cjs
```

### Preview what would happen without doing anything:
```bash
node video-tracking/pipeline/run-pipeline.cjs --from 2 --dry-run
```

---

## Part 7: YouTube Upload (Pipeline Step 4) — Do This Later

Only after you've edited videos in DaVinci Resolve or CapCut:

1. Save edited videos to `youtube/edited/` with naming convention:
   - `dest-boracay-guide-2026.mp4` (destination overview)
   - `short-boracay-aerial.mp4` (YouTube Short)
2. Save thumbnails to `youtube/thumbnails/` (same name, .jpg)
3. Run the upload:
   ```bash
   node video-tracking/pipeline/4-youtube-upload.cjs
   ```
4. First run will open a browser for Google OAuth — sign in with **info@discoverphilippines.info** and select the **Discover Philippines** brand channel (NOT Scott Murray)
5. Videos upload as **Private** — review in YouTube Studio, then switch to Public when ready

---

## Quick Reference — Pipeline Commands

| What | Command |
|------|---------|
| Full pipeline (search → process → deploy) | `node video-tracking/pipeline/run-pipeline.cjs` |
| Full pipeline + YouTube upload | `node video-tracking/pipeline/run-pipeline.cjs --all` |
| Single destination | `node video-tracking/pipeline/run-pipeline.cjs --dest boracay` |
| Just download heroes | `node video-tracking/pipeline/1-search-download.cjs --priority p0` |
| Just compress videos | `node video-tracking/pipeline/2-batch-process.cjs` |
| Just deploy to site | `node video-tracking/pipeline/3-deploy-videos.cjs` |
| Just upload to YouTube | `node video-tracking/pipeline/4-youtube-upload.cjs` |
| Preview any command | Add `--dry-run` to any command above |

---

## Checklist

- [ ] YouTube Studio: profile picture uploaded
- [ ] YouTube Studio: banner image uploaded
- [ ] YouTube Studio: video watermark set
- [ ] YouTube Studio: channel description pasted
- [ ] YouTube Studio: 3 links added
- [ ] YouTube Studio: channel keywords set
- [ ] YouTube Studio: default upload settings configured
- [ ] YouTube Studio: 9 playlists created
- [ ] YouTube Studio: channel layout configured
- [ ] Google Cloud: project created, YouTube API enabled
- [ ] Google Cloud: OAuth credentials created, JSON downloaded
- [ ] client_secret.json saved to `video-tracking/pipeline/`
- [ ] Shutterstock API token pasted into config.env
- [ ] YouTube client ID/secret pasted into config.env
- [ ] Terminal restarted
- [ ] FFmpeg working (test with `ffmpeg -version`)
- [ ] First hero video downloaded with pipeline
- [ ] First video processed and deployed to site
