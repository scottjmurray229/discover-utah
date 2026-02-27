/** Video timing constants — 30fps, ~30s YouTube Shorts */

export const FPS = 30;

/** Section definitions with start frame and duration in frames */
export const sections = {
  title:      { start: 0,    duration: 4 * FPS },   // 0:00 - 0:04
  quickFacts: { start: 4 * FPS, duration: 5 * FPS }, // 0:04 - 0:09
  highlights: { start: 9 * FPS, duration: 12 * FPS }, // 0:09 - 0:21
  proTip:     { start: 21 * FPS, duration: 4 * FPS },  // 0:21 - 0:25
  cta:        { start: 25 * FPS, duration: 5 * FPS },  // 0:25 - 0:30
} as const;

export const DEFAULT_DURATION_FRAMES = 30 * FPS; // 900 frames = 30s
