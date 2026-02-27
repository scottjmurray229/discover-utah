import React from 'react';
import {
  AbsoluteFill,
  Audio,
  OffthreadVideo,
  Sequence,
  useVideoConfig,
} from 'remotion';
import { GradientOverlay } from './components/GradientOverlay';
import { TitleCard } from './components/TitleCard';
import { QuickFactsCard } from './components/QuickFactsCard';
import { HighlightsList } from './components/HighlightsList';
import { ProTipCard } from './components/ProTipCard';
import { CTACard } from './components/CTACard';

export interface DestinationVideoProps {
  slug: string;
  title: string;
  tagline: string;
  region: string;
  bestMonths: string[];
  budgetPerDay: { backpacker: number; midRange: number; luxury: number };
  highlights: Array<{ title: string; icon?: string }>;
  proTip: string;
  /** Absolute path to background video file */
  videoSrc: string;
  /** Absolute path to narration audio file (optional) */
  audioSrc?: string;
}

export const DestinationVideo: React.FC<DestinationVideoProps> = (props) => {
  const { durationInFrames } = useVideoConfig();

  // Calculate section durations proportionally (30s total)
  const totalFrames = durationInFrames;
  const titleEnd = Math.round(totalFrames * (4 / 30));
  const factsEnd = Math.round(totalFrames * (9 / 30));
  const highlightsEnd = Math.round(totalFrames * (21 / 30));
  const proTipEnd = Math.round(totalFrames * (25 / 30));

  return (
    <AbsoluteFill style={{ backgroundColor: '#1A2332' }}>
      {/* Background video — loops to fill duration */}
      {props.videoSrc && (
        <AbsoluteFill>
          <OffthreadVideo
            src={props.videoSrc}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
          />
        </AbsoluteFill>
      )}

      {/* Gradient overlay */}
      <GradientOverlay slug={props.slug} opacity={0.55} />

      {/* Narration audio */}
      {props.audioSrc && <Audio src={props.audioSrc} volume={1} />}

      {/* Title: 0:00 - 0:04 */}
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleCard title={props.title} tagline={props.tagline} region={props.region} />
      </Sequence>

      {/* Quick Facts: 0:04 - 0:09 */}
      <Sequence from={titleEnd} durationInFrames={factsEnd - titleEnd}>
        <QuickFactsCard
          budgetPerDay={props.budgetPerDay}
          bestMonths={props.bestMonths}
        />
      </Sequence>

      {/* Highlights: 0:09 - 0:21 */}
      <Sequence from={factsEnd} durationInFrames={highlightsEnd - factsEnd}>
        <HighlightsList highlights={props.highlights} />
      </Sequence>

      {/* Pro Tip: 0:21 - 0:25 */}
      <Sequence from={highlightsEnd} durationInFrames={proTipEnd - highlightsEnd}>
        <ProTipCard tip={props.proTip} />
      </Sequence>

      {/* CTA: 0:25 - 0:30 */}
      <Sequence from={proTipEnd} durationInFrames={totalFrames - proTipEnd}>
        <CTACard title={props.title} slug={props.slug} />
      </Sequence>
    </AbsoluteFill>
  );
};
