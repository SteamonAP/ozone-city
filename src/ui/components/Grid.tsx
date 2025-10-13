import React, { useEffect, useMemo, useState } from 'react';
import type { Tile } from '../../game/models';
import { isSolved, type Point, OPPOSITE, tileConnectors } from '../../game/pathChecker';
import tileStraight from '../../assets/sprites/tile_straight.svg';
import tileCurve from '../../assets/sprites/tile_curve.svg';
import tileT from '../../assets/sprites/tile_tjunction.svg';
import tileCross from '../../assets/sprites/tile_cross.svg';
import { TILESET_IMAGES, type TileKey, TILE_METERS } from '../../game/tileset';
import depotIcon from '../../assets/sprites/depot.svg';
import buildingIcon from '../../assets/sprites/building.svg';

export type TileType = 'straight' | 'curve' | 't' | 'cross';

function spriteFor(type: TileType) {
  const key = type as TileKey;
  const png = TILESET_IMAGES[key];
  if (png) return png;
  switch (type) {
    case 'straight': return tileStraight;
    case 'curve': return tileCurve;
    case 't': return tileT;
    case 'cross': return tileCross;
  }
}

export const Grid: React.FC<{
  cols: number;
  rows: number;
  depot: Point;
  destinations: Point[];
  tiles: (Tile | null)[][];
  selectedType: TileType | null;
  selectedRotation: Tile['rotation'];
  onPlace: (x: number, y: number, type: TileType, rotation: Tile['rotation']) => void;
  onRotate: (x: number, y: number) => void;
  onRemove: (x: number, y: number) => void;
}> = ({ cols, rows, depot, destinations, tiles, selectedType, selectedRotation, onPlace, onRotate, onRemove }) => {
  const cellSize = 64;
  const res = useMemo(() => isSolved(tiles, depot, destinations), [tiles, depot, destinations]);
  const [sel, setSel] = useState<Point>({ x: depot.x, y: depot.y });
  const connectedCount = useMemo(() => destinations.filter(d => res.visited.has(`${d.x},${d.y}`)).length, [destinations, res.visited]);
  const distanceMeters = useMemo(() => res.tilesUsed * TILE_METERS, [res.tilesUsed]);

  function autoRotationForPlacement(x: number, y: number, type: TileType, fallback: Tile['rotation']): Tile['rotation'] {
    // If exactly one neighbor has an open connector into (x,y), rotate to match it
    const neighbors: Array<{ dir: 'N'|'E'|'S'|'W'; nx: number; ny: number; con: boolean }> = [
      { dir: 'N', nx: x, ny: y - 1, con: false },
      { dir: 'E', nx: x + 1, ny: y, con: false },
      { dir: 'S', nx: x, ny: y + 1, con: false },
      { dir: 'W', nx: x - 1, ny: y, con: false }
    ];
    const inBounds = (nx: number, ny: number) => ny >= 0 && ny < rows && nx >= 0 && nx < cols;
    const candidates: Array<'N'|'E'|'S'|'W'> = [];
    for (const n of neighbors) {
      if (!inBounds(n.nx, n.ny)) continue;
      const t = tiles[n.ny][n.nx];
      const cons = tileConnectors(t);
      if (cons[OPPOSITE[n.dir]]) candidates.push(n.dir);
    }
    if (candidates.length !== 1) return fallback;
    const desired = candidates[0];
    const rotations: Tile['rotation'][] = [0,90,180,270];
    for (const rot of rotations) {
      const cons = (spriteFor(type), (tileConnectors({ id: '', type, rotation: rot, x, y } as unknown as Tile)));
      if (cons[desired]) return rot as Tile['rotation'];
    }
    return fallback;
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowUp') { setSel((p) => ({ x: p.x, y: Math.max(0, p.y - 1) })); e.preventDefault(); }
      else if (e.key === 'ArrowDown') { setSel((p) => ({ x: p.x, y: Math.min(rows - 1, p.y + 1) })); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { setSel((p) => ({ x: Math.max(0, p.x - 1), y: p.y })); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { setSel((p) => ({ x: Math.min(cols - 1, p.x + 1), y: p.y })); e.preventDefault(); }
      else if (e.key === ' ') { const t = tiles[sel.y][sel.x]; if (t) onRotate(sel.x, sel.y); else if (selectedType) onPlace(sel.x, sel.y, selectedType, autoRotationForPlacement(sel.x, sel.y, selectedType, selectedRotation)); e.preventDefault(); }
      else if (e.key.toLowerCase() === 'r') { const t = tiles[sel.y][sel.x]; if (t) onRotate(sel.x, sel.y); }
      else if (e.key.toLowerCase() === 'x' || e.key === 'Backspace' || e.key === 'Delete') { const t = tiles[sel.y][sel.x]; if (t) onRemove(sel.x, sel.y); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cols, rows, tiles, sel, selectedType, selectedRotation, onPlace, onRotate, onRemove]);

  return (
    <div style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'inline-block', background: '#0b1020', padding: 12, borderRadius: 16, boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gridTemplateRows: `repeat(${rows}, ${cellSize}px)`, gap: 0 }}>
          {Array.from({ length: rows }).map((_, y) => (
            Array.from({ length: cols }).map((__, x) => {
              const t = tiles[y][x];
              const isDepot = x === depot.x && y === depot.y;
              const isDest = destinations.some(d => d.x === x && d.y === y);
              const visited = res.visited.has(`${x},${y}`);
              const isSel = sel.x === x && sel.y === y;
              const destConnected = isDest && visited;
              return (
                <div key={`${x},${y}`} style={{ width: cellSize, height: cellSize, background: '#111827', position: 'relative', border: '1px solid #0b0f18', boxShadow: `${visited ? 'inset 0 0 0 2px #22c55e' : 'inset 0 0 0 1px #222834'}${isSel ? ',0 0 0 2px #93c5fd' : ''}`, cursor: t ? 'pointer' : (selectedType ? 'crosshair' : 'default') }}
                  onClick={() => {
                    setSel({ x, y });
                    if (t) onRotate(x, y); else if (selectedType) onPlace(x, y, selectedType, autoRotationForPlacement(x, y, selectedType, selectedRotation));
                  }}
                  onContextMenu={(e) => { e.preventDefault(); if (t) onRemove(x, y); }}
                >
                  {t && t.type !== 'empty' && (
                    <img src={spriteFor(t.type)} alt={t.type} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `rotate(${t.rotation}deg) scale(1)`, transition: 'transform 120ms ease, opacity 120ms ease', opacity: 1 }} onLoad={(ev) => {
                      const el = ev.currentTarget as HTMLImageElement; el.style.transform = `rotate(${t.rotation}deg) scale(0.9)`; requestAnimationFrame(() => { el.style.transform = `rotate(${t.rotation}deg) scale(1)`; });
                    }} onError={(ev) => {
                      const el = ev.currentTarget as HTMLImageElement;
                      const fallback = t.type === 'straight' ? tileStraight : t.type === 'curve' ? tileCurve : t.type === 't' ? tileT : tileCross;
                      el.src = fallback as unknown as string;
                    }}/>
                  )}
                  {isDepot && (
                    <img src={depotIcon} alt="Depot" style={{ position: 'absolute', inset: 8, borderRadius: 8 }} />
                  )}
                  {isDest && (
                    <img src={buildingIcon} alt={destConnected ? 'Destination (connected)' : 'Destination'} style={{ position: 'absolute', inset: 12, borderRadius: 8, filter: destConnected ? 'drop-shadow(0 0 6px #22c55e)' : 'none', opacity: destConnected ? 1 : 0.9 }} />
                  )}
                </div>
              );
            })
          ))}
        </div>
        <div style={{ color: '#fff', marginTop: 10, fontSize: 14, textAlign: 'center' }}>Tiles used: {res.tilesUsed} — Connected {connectedCount}/{destinations.length} {res.solved ? '✓' : ''} — Distance: {distanceMeters} m</div>
      </div>
    </div>
  );
};
