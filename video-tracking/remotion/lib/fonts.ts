import { loadFont as loadDMSerifDisplay } from '@remotion/google-fonts/DMSerifDisplay';
import { loadFont as loadOutfit } from '@remotion/google-fonts/Outfit';

const dmSerif = loadDMSerifDisplay();
const outfit = loadOutfit();

export const fontFamily = {
  display: dmSerif.fontFamily,
  body: outfit.fontFamily,
} as const;
