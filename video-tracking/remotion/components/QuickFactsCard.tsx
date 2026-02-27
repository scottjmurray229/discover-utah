import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { fontFamily } from '../lib/fonts';
import { colors } from '../lib/colors';

interface QuickFactsProps {
  budgetPerDay: { backpacker: number; midRange: number; luxury: number };
  bestMonths: string[];
}

export const QuickFactsCard: React.FC<QuickFactsProps> = ({
  budgetPerDay,
  bestMonths,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const facts = [
    { icon: '💰', label: 'Daily Budget', value: `$${budgetPerDay.backpacker}–$${budgetPerDay.luxury}` },
    { icon: '📅', label: 'Best Time', value: bestMonths.slice(0, 3).join(', ') },
  ];

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
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        Quick Facts
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%', maxWidth: 900 }}>
        {facts.map((fact, i) => {
          const delay = i * 12;
          const y = spring({ frame: Math.max(0, frame - delay), fps, from: 30, to: 0, durationInFrames: 20 });
          const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: 'clamp' });

          return (
            <div
              key={fact.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                backgroundColor: 'rgba(232, 244, 245, 0.15)',
                borderRadius: 20,
                padding: '28px 36px',
                opacity,
                transform: `translateY(${y}px)`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <span style={{ fontSize: 44 }}>{fact.icon}</span>
              <div
                style={{
                  fontFamily: fontFamily.body,
                  fontSize: 16,
                  fontWeight: 600,
                  color: colors.sky,
                  textTransform: 'uppercase',
                  letterSpacing: 3,
                  textAlign: 'center',
                }}
              >
                {fact.label}
              </div>
              <div
                style={{
                  fontFamily: fontFamily.body,
                  fontSize: 32,
                  fontWeight: 800,
                  color: colors.white,
                  textAlign: 'center',
                }}
              >
                {fact.value}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
