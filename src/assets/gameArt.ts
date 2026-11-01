/**
 * All twelve supplied/generated image references are represented in a lightweight
 * 4 × 3 pixel-art atlas. The source artwork remains available in the project bundle.
 * Tiles are 96×54 for intentionally crisp 16-bit pixel-art rendering.
 */
import { GAME_ART_ATLAS } from './packedAtlas';
export { GAME_ART_ATLAS };
export type ArtKey =
  | 'crew' | 'character' | 'storyboard' | 'truckLot'
  | 'shadowMap' | 'threeLeaders' | 'bunnyCafe' | 'hongKong'
  | 'hongKongRpg' | 'worldHub' | 'gorilla' | 'polishTrucker';

export const GAME_ART: Record<ArtKey, { tile: number; label: string; source: string }> = {
  crew: { tile: 0, label: 'Four crew portraits', source: '4 heros.jpg' },
  character: { tile: 1, label: 'Green-hair rival portrait', source: 'AI influencer PIXEL blackhujus.jpg' },
  storyboard: { tile: 2, label: 'Green Powder Trail chapter board', source: 'game image.jpg' },
  truckLot: { tile: 3, label: 'Trucker gathering at the parking lot', source: 'Gemini_Generated_Image_qo5ugvqo5ugvqo5u.jpg' },
  shadowMap: { tile: 4, label: 'Shadow Routes world map', source: 'openart-gpt-image-2-edit-1_1791711838239_89c55d8c.png' },
  threeLeaders: { tile: 5, label: 'Crew dialogue: sign, verify, refuse', source: 'openart-gpt-image-2-edit-1_1791712125939_39c14b0a.png' },
  bunnyCafe: { tile: 6, label: 'Mr Bunny at the SEO café', source: 'openart-gpt-image-2-edit-1_1791712303966_7430063b.png' },
  hongKong: { tile: 7, label: 'USA and India trucks at Hong Kong port', source: 'hong_kong_pixel_truck_parade.png' },
  hongKongRpg: { tile: 8, label: 'Hong Kong RPG trade scene', source: 'blackhujus_shadow_routes_in_hong_kong.png' },
  worldHub: { tile: 9, label: 'Neon world-map RPG hub', source: 'neon_cyberpunk_route_map_hub.png' },
  gorilla: { tile: 10, label: 'The original Blackhujus hero', source: 'pixel_blackhujus.png' },
  polishTrucker: { tile: 11, label: 'European truck-driver photo', source: 'merhujus.png' },
};

export function tileStyle(key: ArtKey): { backgroundImage: string; backgroundSize: string; backgroundPosition: string; imageRendering: 'pixelated' } {
  const { tile } = GAME_ART[key];
  return {
    backgroundImage: `url("${GAME_ART_ATLAS}")`,
    backgroundSize: '400% 300%',
    backgroundPosition: `${(tile % 4) * (100 / 3)}% ${Math.floor(tile / 4) * 50}%`,
    imageRendering: 'pixelated',
  };
}

export const STAGE_ART: ArtKey[] = [
  'hongKong', 'hongKong', 'truckLot', 'shadowMap', 'bunnyCafe', 'character',
  'storyboard', 'threeLeaders', 'worldHub', 'shadowMap', 'worldHub'
];
