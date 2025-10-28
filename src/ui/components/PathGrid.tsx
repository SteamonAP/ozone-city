import React, { useState, useCallback } from 'react';
import { useGameState } from '../../game/gameState';
import { PathNetwork, addPathSegment, removePathSegment, pointKey } from '../../game/pathBuilder';
import type { Point } from '../../game/pathChecker';
import { TILE_METERS } from '../../game/tileset';
import { isObstacle, getObstacleAt } from '../../game/obstacles';
import depotIcon from '../../assets/sprites/depot.svg';
import buildingIcon from '../../assets/sprites/building.svg';
import schoolIcon from '../../assets/sprites/school.svg';
import hospitalIcon from '../../assets/sprites/hospital.svg';
import homeIcon from '../../assets/sprites/home.svg';

interface PathGridProps {
  destinations: Point[];
  onPathComplete: (pathLength: number, deliveredDestinations: Point[]) => void;
}

export const PathGrid: React.FC<PathGridProps> = ({ destinations, onPathComplete }) => {
  const { currentPath, setCurrentPath, depot, checkConnectivity, obstacles, maxPathSegments, parcels, vehicles } = useGameState();
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastCell, setLastCell] = useState<Point | null>(null);

  const gridSize = 9;
  const isMobile = window.innerWidth <= 768;
  const cellSize = isMobile ? Math.min(48, (window.innerWidth - 32) / gridSize) : 64;

  const handleCellClick = useCallback((x: number, y: number) => {
    const clickedPoint = { x, y };
    
    // Can't click on obstacles
    if (isObstacle(obstacles, x, y)) return;
    
    // Add haptic feedback on mobile
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    if (!isDrawing) {
      // Start drawing from this cell
      setIsDrawing(true);
      setLastCell(clickedPoint);
      return;
    }

    if (!lastCell) return;

    // Check if we're clicking the same cell (stop drawing)
    if (lastCell.x === x && lastCell.y === y) {
      setIsDrawing(false);
      setLastCell(null);
      return;
    }

    // Check if cells are adjacent
    const dx = Math.abs(lastCell.x - x);
    const dy = Math.abs(lastCell.y - y);
    const adjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

    if (adjacent) {
      // Check if this segment already exists (if so, remove it)
      const segmentExists = currentPath.segments.some(s => 
        (pointKey(s.from) === pointKey(lastCell) && pointKey(s.to) === pointKey(clickedPoint)) ||
        (pointKey(s.from) === pointKey(clickedPoint) && pointKey(s.to) === pointKey(lastCell))
      );

      let newPath: PathNetwork;
      if (segmentExists) {
        newPath = removePathSegment(currentPath, lastCell, clickedPoint);
      } else {
        // Check path limit
        if (currentPath.segments.length >= maxPathSegments) {
          alert(`Path limit reached! Maximum ${maxPathSegments} segments allowed.`);
          return;
        }
        newPath = addPathSegment(currentPath, lastCell, clickedPoint);
      }
      
      setCurrentPath(newPath);
      setLastCell(clickedPoint);
    }
  }, [isDrawing, lastCell, currentPath, setCurrentPath, obstacles, maxPathSegments]);

  const connectivity = checkConnectivity(destinations);
  const pathLength = currentPath.segments.length;
  const distance = pathLength * TILE_METERS;

  // Check which cells are part of the path
  const isInPath = (x: number, y: number) => currentPath.cells.has(pointKey({ x, y }));
  
  // Check which destinations are connected
  const connectedDests = destinations.filter(dest => {
    const result = checkConnectivity([dest]);
    return result.connected > 0;
  });

  // Get parcel info for destination
  const getParcelForDestination = (dest: Point) => {
    return parcels.find(p => p.destination.x === dest.x && p.destination.y === dest.y);
  };

  // Get icon for destination type
  const getDestinationIcon = (parcel: any) => {
    if (!parcel) return buildingIcon;
    switch (parcel.destinationType) {
      case 'school': return schoolIcon;
      case 'hospital': return hospitalIcon;
      case 'home': return homeIcon;
      default: return buildingIcon;
    }
  };

  // Check if destination cells have paths leading to them
  const hasPathToDestination = (dest: Point) => {
    const destKey = pointKey(dest);
    return currentPath.cells.has(destKey) || currentPath.segments.some(s => 
      pointKey(s.from) === destKey || pointKey(s.to) === destKey
    );
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', gap: isMobile ? 12 : 16, padding: isMobile ? '0 8px' : '0' }}>
      <div style={{ 
        background: '#0b1020', 
        padding: isMobile ? 12 : 16, 
        borderRadius: 16, 
        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
        maxWidth: '100%',
        overflow: 'auto'
      }}>
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`, 
            gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`, 
            gap: 2,
            border: '2px solid #1f2937',
            borderRadius: 8,
            padding: isMobile ? 6 : 8,
            background: '#111827',
            maxWidth: '100%'
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, index) => {
            const x = index % gridSize;
            const y = Math.floor(index / gridSize);
            const isDepot = x === depot.x && y === depot.y;
            const isDest = destinations.some(d => d.x === x && d.y === y);
            const inPath = isInPath(x, y);
            const currentDest = destinations.find(d => d.x === x && d.y === y);
            const parcelAtDest = currentDest ? getParcelForDestination(currentDest) : null;
            const isConnectedDest = currentDest ? hasPathToDestination(currentDest) : false;
            const isSelected = lastCell?.x === x && lastCell?.y === y;
            const obstacle = getObstacleAt(obstacles, x, y);
            const isBlocked = !!obstacle;

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleCellClick(x, y);
                }}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: isDepot ? '#fbbf24' : isDest ? '#3b82f6' : isBlocked ? '#7f1d1d' : inPath ? '#22c55e' : '#374151',
                  border: isSelected ? '3px solid #fbbf24' : '1px solid #6b7280',
                  borderRadius: 6,
                  cursor: isBlocked ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  transform: inPath ? 'scale(1.05)' : 'scale(1)',
                  opacity: isBlocked ? 0.7 : 1,
                  minHeight: isMobile ? '44px' : 'auto',
                  minWidth: isMobile ? '44px' : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isDepot && (
                  <img 
                    src={depotIcon} 
                    alt="Depot" 
                    style={{ 
                      position: 'absolute', 
                      inset: 8, 
                      borderRadius: 4,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }} 
                  />
                )}
                {isDest && parcelAtDest && (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img 
                      src={getDestinationIcon(parcelAtDest)} 
                      alt={`${parcelAtDest.destinationType} - ${isConnectedDest ? 'Connected' : 'Not Connected'}`} 
                      title={`${parcelAtDest.destinationType.toUpperCase()}: ${parcelAtDest.urgency} priority parcel`}
                      style={{ 
                        position: 'absolute', 
                        inset: 8, 
                        borderRadius: 4,
                        filter: isConnectedDest 
                          ? 'drop-shadow(0 0 8px #22c55e)' 
                          : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                        opacity: isConnectedDest ? 1 : 0.7
                      }} 
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: parcelAtDest.urgency === 'urgent' ? '#ef4444' : parcelAtDest.urgency === 'normal' ? '#fbbf24' : '#22c55e',
                      border: '1px solid #fff'
                    }} />
                  </div>
                )}
                {obstacle && (
                  <div style={{ 
                    position: 'absolute', 
                    inset: 8, 
                    background: obstacle.type === 'water' ? '#1e40af' : obstacle.type === 'construction' ? '#f59e0b' : '#374151',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24
                  }}>
                    {obstacle.type === 'water' ? '🌊' : obstacle.type === 'construction' ? '🚧' : '🏢'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div style={{ marginTop: 16, color: '#fff', textAlign: 'center' }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Connected: {connectivity.connected}/{connectivity.total}</strong>
            {connectivity.solved && <span style={{ color: '#22c55e', marginLeft: 8 }}>✓ Complete!</span>}
          </div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>
            Path Length: {pathLength}/{maxPathSegments} segments • Distance: {distance}m
          </div>
          {isDrawing && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#fbbf24' }}>
              Click adjacent cells to draw path, click same cell to stop
            </div>
          )}
          {pathLength >= maxPathSegments && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444' }}>
              Path limit reached! Remove segments or find a shorter route.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => onPathComplete(pathLength, connectedDests)}
          disabled={connectedDests.length === 0}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            background: connectedDests.length > 0 ? '#22c55e' : '#6b7280',
            color: '#0b1020',
            fontWeight: 700,
            cursor: connectedDests.length > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          Submit Route
        </button>
        <button
          onClick={() => {
            setCurrentPath({ segments: [], cells: new Set() });
            setIsDrawing(false);
            setLastCell(null);
          }}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            background: '#e5e7eb',
            color: '#0b1020',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Clear Path
        </button>
      </div>
    </div>
  );
};
