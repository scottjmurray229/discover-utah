import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../lib/fonts';
import { colors } from '../lib/colors';

interface ProTipCardProps {
  tip: string;
}

export const ProTipCard: React.FC<ProTipCardProps> = ({ tip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, from: 0.9, to: 1, durationInFrames: 20 });
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const tipOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' });

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
          backgroundColor: 'rgba(232, 101, 74, 0.2)',
          border: `2px solid ${colors.warmCoral}`,
          borderRadius: 24,
          padding: '48px 40px',
          maxWidth: 900,
          width: '100%',
          opacity,
          transform: `scale(${scale})`,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 36 }}>🎒</span>
          <span
            style={{
              fontFamily: fontFamily.body,
              fontSize: 22,
              fontWeight: 600,
              color: colors.warmCoral,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            Scott&apos;s Pro Tip
          </span>
        </div>

        {/* Tip text */}
        <p
          style={{
            fontFamily: fontFamily.body,
            fontSize: 28,
            fontWeight: 400,
            color: colors.white,
            lineHeight: 1.5,
            opacity: tipOpacity,
            margin: 0,
            textAlign: 'center',
          }}
        >
          {tip}
        </p>
      </div>
    </AbsoluteFill>
  );
};
