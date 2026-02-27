import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../lib/fonts';
import { colors } from '../lib/colors';

interface HighlightsListProps {
  highlights: Array<{ title: string; icon?: string }>;
}

export const HighlightsList: React.FC<HighlightsListProps> = ({ highlights }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each highlight gets ~4 seconds (120 frames) of screen time
  const framesPerHighlight = 120;
  const totalHighlights = Math.min(highlights.length, 3);

  // Header animation
  const headerOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 48px',
      }}
    >
      <h2
        style={{
          fontFamily: fontFamily.display,
          fontSize: 46,
          color: colors.white,
          marginBottom: 48,
          textShadow: '0 2px 12px rgba(0,0,0,0.3)',
          opacity: headerOpacity,
        }}
      >
        Top Highlights
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', maxWidth: 900 }}>
        {highlights.slice(0, totalHighlights).map((highlight, i) => {
          const itemStart = i * framesPerHighlight;
          const itemEnd = itemStart + framesPerHighlight;

          // Slide in
          const slideIn = spring({
            frame: Math.max(0, frame - itemStart),
            fps,
            from: 60,
            to: 0,
            durationInFrames: 20,
          });

          // Fade in and out
          const opacity = interpolate(
            frame,
            [itemStart, itemStart + 15, itemEnd - 15, itemEnd],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          // Scale for emphasis
          const scale = interpolate(
            frame,
            [itemStart, itemStart + 20, itemStart + 30],
            [0.95, 1.02, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <div
              key={highlight.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                borderRadius: 20,
                padding: '28px 36px',
                opacity,
                transform: `translateX(${slideIn}px) scale(${scale})`,
                backdropFilter: 'blur(8px)',
                borderLeft: `4px solid ${colors.warmCoral}`,
              }}
            >
              <span style={{ fontSize: 40 }}>{highlight.icon || '✨'}</span>
              <span
                style={{
                  fontFamily: fontFamily.body,
                  fontSize: 32,
                  fontWeight: 700,
                  color: colors.white,
                }}
              >
                {highlight.title}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
