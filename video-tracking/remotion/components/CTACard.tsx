import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../lib/fonts';
import { colors } from '../lib/colors';

interface CTACardProps {
  title: string;
  slug: string;
}

export const CTACard: React.FC<CTACardProps> = ({ title, slug }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, from: 0.85, to: 1, durationInFrames: 25 });
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const urlOpacity = interpolate(frame, [15, 30], [0, 1], { extrapolateRight: 'clamp' });
  const subscribeOpacity = interpolate(frame, [30, 45], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 48px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          opacity,
          transform: `scale(${scale})`,
          width: '100%',
        }}
      >
        {/* Heading */}
        <h2
          style={{
            fontFamily: fontFamily.display,
            fontSize: 46,
            color: colors.white,
            marginBottom: 20,
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}
        >
          Plan Your {title} Trip
        </h2>

        <p
          style={{
            fontFamily: fontFamily.body,
            fontSize: 24,
            color: colors.sand,
            marginBottom: 40,
          }}
        >
          Full guide with prices, tips & itineraries
        </p>

        {/* URL box */}
        <div
          style={{
            backgroundColor: colors.warmCoral,
            borderRadius: 16,
            padding: '20px 48px',
            opacity: urlOpacity,
          }}
        >
          <span
            style={{
              fontFamily: fontFamily.body,
              fontSize: 28,
              fontWeight: 600,
              color: colors.white,
            }}
          >
            discoverphilippines.info/{slug}
          </span>
        </div>

        {/* Subscribe prompt */}
        <p
          style={{
            fontFamily: fontFamily.body,
            fontSize: 26,
            fontWeight: 500,
            color: colors.sky,
            marginTop: 40,
            opacity: subscribeOpacity,
          }}
        >
          Subscribe for more travel guides! 🇵🇭
        </p>
      </div>
    </AbsoluteFill>
  );
};
