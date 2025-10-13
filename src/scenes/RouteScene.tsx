import React, { useMemo } from 'react';
import { PathGrid } from '../ui/components/PathGrid';
import { computeTripCost } from '../game/costs';
import { useGameState } from '../game/gameState';
import { DAILY_GOALS } from '../game/constants';

export const RouteScene: React.FC<{ vehicleId: string; destinations: { x: number; y: number }[]; onSubmit: (pathLength: number) => void; }> = ({ vehicleId, destinations, onSubmit }) => {
	const { vehicles, totals, currentPath } = useGameState();
	const vehicleType = vehicles.find(v => v.id === vehicleId)?.type ?? 'auto';

	const pathLength = currentPath.segments.length;
	const preview = useMemo(() => computeTripCost(vehicleType as any, pathLength), [vehicleType, pathLength]);

	const timePct = Math.min(100, Math.round(((totals.time + preview.time) / DAILY_GOALS.timeLimitMin) * 100));
	const emissionPct = Math.min(100, Math.round(((totals.emissions + preview.emissions) / DAILY_GOALS.emissionLimit) * 100));

	const isMobile = window.innerWidth <= 768;
	
	return (
		<div aria-label="Route Builder" style={{ 
			position: 'absolute', 
			inset: 0, 
			color: '#fff', 
			padding: isMobile ? 12 : 16, 
			display: 'grid', 
			gridTemplateRows: isMobile ? 'auto auto 1fr' : 'auto 1fr', 
			gap: isMobile ? 12 : 16, 
			background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
			overflow: 'auto'
		}}>
			<div style={{ 
				display: 'flex', 
				alignItems: 'center', 
				justifyContent: isMobile ? 'center' : 'space-between',
				flexDirection: isMobile ? 'column' : 'row',
				gap: isMobile ? 12 : 0
			}}>
				<div style={{ textAlign: isMobile ? 'center' : 'left' }}>
					<h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px' }}>🗺️ Draw Your Route</h2>
					<p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: isMobile ? '14px' : '16px' }}>Tap cells to draw paths connecting depot to all destinations</p>
				</div>
			</div>
			
			<div style={{ 
				background: '#0b1020', 
				padding: isMobile ? 12 : 14, 
				borderRadius: 12, 
				boxShadow: '0 6px 20px rgba(0,0,0,0.25)', 
				minWidth: isMobile ? 'auto' : 280,
				display: 'grid',
				gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr',
				gap: isMobile ? 12 : 0
			}}>
				<div>
					<div style={{ fontSize: isMobile ? '14px' : '16px' }}>🚛 Vehicle: <strong>{vehicleId}</strong></div>
					<div style={{ fontSize: isMobile ? '12px' : '14px', opacity: 0.8 }}>({vehicleType})</div>
					<div style={{ marginTop: 8, fontSize: isMobile ? '14px' : '16px' }}>📏 Path: {pathLength} segments</div>
				</div>
				<div style={{ marginTop: isMobile ? 0 : 12 }}>
					<div style={{ fontSize: isMobile ? '12px' : '14px' }}>⏱️ Time: <strong>{preview.time}</strong> min</div>
					<div style={{ height: 6, background: '#1f2937', borderRadius: 6, overflow: 'hidden', marginTop: 4 }}>
						<div style={{ width: `${timePct}%`, height: '100%', background: timePct > 100 ? '#ef4444' : '#22c55e' }} />
					</div>
					<div style={{ fontSize: isMobile ? '12px' : '14px', marginTop: 8 }}>🌱 Emissions: <strong>{preview.emissions}</strong></div>
					<div style={{ height: 6, background: '#1f2937', borderRadius: 6, overflow: 'hidden', marginTop: 4 }}>
						<div style={{ width: `${emissionPct}%`, height: '100%', background: emissionPct > 100 ? '#ef4444' : '#22c55e' }} />
					</div>
				</div>
			</div>
			
			<div style={{ minHeight: 0, overflow: 'auto' }}>
				<PathGrid destinations={destinations} onPathComplete={onSubmit} />
			</div>
		</div>
	);
};
