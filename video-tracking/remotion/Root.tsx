import React from 'react';
import { Composition } from 'remotion';
import { DestinationVideo, DestinationVideoProps } from './DestinationVideo';
import { FPS, DEFAULT_DURATION_FRAMES } from './lib/timing';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DestinationVideo"
        component={DestinationVideo as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={DEFAULT_DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          slug: 'boracay',
          title: 'Boracay',
          tagline: 'Where It All Began',
          region: 'Visayas',
          bestMonths: ['November', 'December', 'January', 'February', 'March'],
          budgetPerDay: { backpacker: 50, midRange: 120, luxury: 250 },
          highlights: [
            { title: 'White Beach', icon: '🏖️' },
            { title: 'Island Hopping', icon: '🚤' },
            { title: 'Sunset Sailing', icon: '⛵' },
          ],
          proTip: 'Book your Caticlan flight early — MPH is a tiny airport and seats fill up fast during peak season.',
          videoSrc: '',
          audioSrc: undefined,
        } satisfies DestinationVideoProps}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: DEFAULT_DURATION_FRAMES,
          };
        }}
      />
    </>
  );
};
