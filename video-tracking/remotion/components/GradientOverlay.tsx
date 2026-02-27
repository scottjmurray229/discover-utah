import React from 'react';
import { AbsoluteFill } from 'remotion';
import { getGradient } from '../lib/gradients';

export const GradientOverlay: React.FC<{ slug: string; opacity?: number }> = ({
  slug,
  opacity = 0.7,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: getGradient(slug),
        opacity,
      }}
    />
  );
};
