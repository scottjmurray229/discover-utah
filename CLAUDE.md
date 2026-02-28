# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Discover Utah -- a travel guide website built with Astro 5, Tailwind CSS 4, and deployed to Cloudflare Pages. Content is markdown-based using Astro's content collections with Zod schemas.

## Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Production build to ./dist/
npm run preview   # Preview production build locally
```

No test runner is configured. No linter is configured.

## Branding

- Colors: Ocean Teal #0D7377 (primary), Warm Coral #E8654A (accent)
- Deep Night #1A2332 (headings/dark backgrounds)
- Sand #F5F0E8 (light background), Sky #E8F4F5 (alt background)
- Warm Gold #D4A574
- Fonts: Outfit (sans), DM Serif Display (serif)

## Regions

- wasatch-front
- southern-utah
- moab-region
- ski-country
- lakes-wilderness
- southwest-corner

## Architecture

### Content Collections (`src/content/`)

Two collections defined in `src/content/config.ts`:
- **destinations** -- Travel destination pages with typed schema (region enum: wasatch-front/southern-utah/moab-region/ski-country/lakes-wilderness/southwest-corner, budgetPerDay in USD, highlights array, contentStatus workflow, gradientColors for per-destination theming)
- **blog** -- Articles with categories (destination, food, festival, practical, budget, culture)

Both collections use a `draft: true` default. Content status tracks: draft -> review -> published -> needs-update.

### Routing (`src/pages/`)

- `index.astro` -- Home page
- `destinations/[...slug].astro` -- Dynamic catch-all route
- `blog/[...slug].astro` -- Blog post pages
- `404.astro` -- Custom error page

### Layouts

- `BaseLayout.astro` -- Root layout with SEO meta, imports FloatingNav + Footer + global styles
- `DestinationLayout.astro` -- Wraps BaseLayout, adds hero with per-destination gradient

### Deployment

- Domain: discoverutah.info
- D1 database: trip-planner-cache-utah (ID: 5a51152c-bb32-486c-b5c9-8064f61e8481)
- Cloudflare Pages via `@astrojs/cloudflare` adapter

## Destinations (20)

Alta, Antelope Island, Arches, Bear Lake, Bryce Canyon, Canyonlands, Capitol Reef, Dead Horse Point, Goblin Valley, Great Salt Lake, Moab, Monument Valley, Ogden, Park City, Provo, Salt Lake City, Snowbird, St. George, Sundance, Zion

## Content Voice

- First-person singular -- Scott's perspective as a visitor
- Prices in USD only
- Honest, opinionated, insider perspective
- **Names rule:** Only use "Scott" and "I" in content. Never include names of family members, children, or other companions.
- Cross-link every page to at least 2 other content pillars
- Question-based H2/H3 headings for GEO
- Answer-first paragraphs: lead with the answer, then supporting detail

### Required Pro Tips (Every Destination Page)

1. **Getting There** -- SLC airport, driving, shuttle services
2. **Best Time to Visit** -- Seasons, holidays, tourist peaks, best months
3. **Getting Around** -- Rental car, UTA transit, rideshare, shuttles
4. **Budget Tips** -- National park passes, free hikes, off-peak travel, camping
5. **Safety** -- Trail awareness, altitude sickness, desert heat, wildlife
6. **Packing** -- Layers, hiking boots, sun protection, water bottles

Use `<div class="scott-tips">` block format.

## Affiliate Links

- Booking.com: aid=2778866, label=discoverutah
- GetYourGuide: partner_id=IVN6IQ3
- Viator: pid=P00290009
- SafetyWing: referenceID=24858745

## Master Plan Updates

After completing significant work, update the **central master plan** at `C:\Users\scott\documents\discover-more\docs\master-plan.md`:
- Update the **Current Status table** row for this site
- Add a session log entry to `C:\Users\scott\documents\discover-more\docs\session-log.md` with date and summary
