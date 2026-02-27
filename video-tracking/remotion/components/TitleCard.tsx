import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../lib/fonts';
import { colors } from '../lib/colors';

interface TitleCardProps {
  title: string;
  tagline: string;
  region: string;
}

export const TitleCard: React.FC<TitleCardProps> = ({ title, tagline, region }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ frame, fps, from: 40, to: 0, durationInFrames: 30 });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const taglineOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: 'clamp' });
  const regionOpacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '120px 48px',
      }}
    >
      {/* Region badge */}
      <div
        style={{
          opacity: regionOpacity,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 20,
          padding: '10px 28px',
          marginBottom: 24,
          backdropFilter: 'blur(8px)',
        }}
      >
        <span
          style={{
            fontFamily: fontFamily.body,
            fontSize: 22,
            fontWeight: 500,
            color: colors.white,
            textTransform: 'uppercase',
            letterSpacing: 4,
          }}
        >
          {region}
        </span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontFamily: fontFamily.display,
          fontSize: 64,
          fontWeight: 400,
          color: colors.white,
          textAlign: 'center',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textShadow: '0 4px 20px rgba(0,0,0,0.4)',
          margin: 0,
          lineHeight: 1.15,
        }}
      >
        {title}
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontFamily: fontFamily.body,
          fontSize: 30,
          fontWeight: 300,
          color: colors.sand,
          textAlign: 'center',
          opacity: taglineOpacity,
          marginTop: 20,
          letterSpacing: 1,
        }}
      >
        {tagline}
      </p>
    </AbsoluteFill>
  );
};
