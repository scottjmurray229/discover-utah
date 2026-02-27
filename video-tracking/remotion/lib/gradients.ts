/** Per-destination gradients — mirrors --gradient-* vars in global.css */

export const gradients: Record<string, string> = {
  siquijor: 'linear-gradient(160deg, #1a1035 0%, #2d1b69 30%, #4C1D95 55%, #3730A3 80%, #1e1145 100%)',
  cebu: 'linear-gradient(135deg, #0E4D5C, #0D7377, #14B8A6)',
  bohol: 'linear-gradient(135deg, #065F46, #059669, #34D399)',
  dumaguete: 'linear-gradient(135deg, #92400E, #D97706, #FBBF24)',
  palawan: 'linear-gradient(135deg, #064E3B, #0D7377, #06B6D4)',
  boracay: 'linear-gradient(135deg, #9D174D, #E8654A, #FB923C)',
  siargao: 'linear-gradient(135deg, #0E7490, #14B8A6, #5EEAD4)',
  clark: 'linear-gradient(160deg, #451a03 0%, #78350F 30%, #B45309 55%, #D97706 80%, #92400E 100%)',
};

/** Default gradient for destinations without a defined one */
export const defaultGradient = 'linear-gradient(135deg, #0D7377, #095456, #0D7377)';

/** Get gradient for a destination slug, falling back to default */
export function getGradient(slug: string): string {
  // Try exact match first, then check if slug contains a known key
  if (gradients[slug]) return gradients[slug];
  for (const [key, value] of Object.entries(gradients)) {
    if (slug.includes(key)) return value;
  }
  return defaultGradient;
}
