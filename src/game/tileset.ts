export type TileKey = 'straight' | 'curve' | 't' | 'cross';

// Attempt to auto-detect user-provided images placed in src/assets/tiles
// Supported filenames (case-insensitive) should contain these hints:
// - straight: "straight"
// - curve: "curve"
// - t: "tjunction", "t-junction", "t_junction", or "tj"
// - cross: "cross", "intersection"
const discovered: Record<string, string> = (() => {
  // Vite will include any matching files that exist; missing ones are just absent
  const files = import.meta.glob('../assets/tiles/*.{png,svg,jpg,jpeg}', { eager: true, as: 'url' }) as Record<string, string>;
  const entries = Object.entries(files).map(([path, url]) => ({ path: path.toLowerCase(), url }));
  const find = (...hints: string[]) => entries.find(e => hints.every(h => e.path.includes(h)))?.url;
  return {
    straight: find('straight') || '',
    curve: find('curve') || '',
    t: find('tjunction') || find('t-junction') || find('t_junction') || find('tj') || '',
    cross: find('cross') || find('intersection') || ''
  };
})();

// Built-in fallbacks (vector) if no user image is discovered
import straightSvg from '../assets/sprites/tile_straight.svg';
import curveSvg from '../assets/sprites/tile_curve.svg';
import tSvg from '../assets/sprites/tile_tjunction.svg';
import crossSvg from '../assets/sprites/tile_cross.svg';

export const TILESET_IMAGES: Record<TileKey, string> = {
  straight: discovered.straight || (straightSvg as unknown as string),
  curve: discovered.curve || (curveSvg as unknown as string),
  t: discovered.t || (tSvg as unknown as string),
  cross: discovered.cross || (crossSvg as unknown as string)
};

// Distance represented by each placed tile in meters (for display only)
export const TILE_METERS = 20;
