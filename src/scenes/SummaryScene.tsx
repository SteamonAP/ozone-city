import React from 'react';
import { useGameState } from '../game/gameState';
import { DAILY_GOALS } from '../game/constants';

function rank(totalTime: number, totalEmissions: number) {
  if (totalTime <= DAILY_GOALS.timeLimitMin && totalEmissions <= DAILY_GOALS.emissionLimit) return 'A';
  if (totalTime <= DAILY_GOALS.timeLimitMin * 1.10 || totalEmissions <= DAILY_GOALS.emissionLimit * 1.10) return 'B';
  if (totalTime <= DAILY_GOALS.timeLimitMin * 1.25 || totalEmissions <= DAILY_GOALS.emissionLimit * 1.25) return 'C';
  return 'Fail';
}

export const SummaryScene: React.FC<{ onPlayAgain: () => void }> = ({ onPlayAgain }) => {
	const { totals } = useGameState();
	const r = rank(totals.time, totals.emissions);
	const isMobile = window.innerWidth <= 768;
	
	return (
		<div aria-label="Summary" style={{ 
			position: 'absolute', 
			inset: 0, 
			color: '#fff', 
			display: 'grid', 
			placeItems: 'center', 
			background: 'rgba(0,0,0,0.6)',
			padding: isMobile ? 16 : 24
		}}>
			<div style={{ 
				background: '#111827', 
				padding: isMobile ? 20 : 24, 
				borderRadius: 12, 
				minWidth: isMobile ? 'auto' : 320, 
				maxWidth: isMobile ? '100%' : 400,
				textAlign: 'center',
				width: '100%'
			}}>
				<h2 style={{ fontSize: isMobile ? '24px' : '28px', marginTop: 0 }}>🏁 End of Day</h2>
				<div style={{ display: 'grid', gap: isMobile ? 12 : 16, marginBottom: 20 }}>
					<div style={{ 
						background: '#0b1020', 
						padding: isMobile ? 12 : 16, 
						borderRadius: 8,
						border: `2px solid ${totals.time <= DAILY_GOALS.timeLimitMin ? '#22c55e' : '#ef4444'}`
					}}>
						<div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold' }}>⏱️ Time Used</div>
						<div style={{ fontSize: isMobile ? '20px' : '24px', marginTop: 4 }}>
							{totals.time} / {DAILY_GOALS.timeLimitMin} min
						</div>
					</div>
					<div style={{ 
						background: '#0b1020', 
						padding: isMobile ? 12 : 16, 
						borderRadius: 8,
						border: `2px solid ${totals.emissions <= DAILY_GOALS.emissionLimit ? '#22c55e' : '#ef4444'}`
					}}>
						<div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold' }}>🌱 Emissions</div>
						<div style={{ fontSize: isMobile ? '20px' : '24px', marginTop: 4 }}>
							{totals.emissions} / {DAILY_GOALS.emissionLimit}
						</div>
					</div>
				</div>
				<div style={{ 
					fontSize: isMobile ? '24px' : '28px', 
					fontWeight: 'bold',
					color: r === 'A' ? '#22c55e' : r === 'B' ? '#fbbf24' : r === 'C' ? '#f59e0b' : '#ef4444',
					marginBottom: 16
				}}>
					Rank: {r}
				</div>
				<p style={{ opacity: 0.8, fontSize: isMobile ? '14px' : '16px', marginBottom: 20 }}>
					{r === 'A' ? '🎉 Excellent! You optimized routes perfectly for climate action!' : 
					 r === 'B' ? '👍 Good job! Minor improvements could reduce emissions further.' :
					 r === 'C' ? '⚠️ Room for improvement. Try shorter routes next time.' :
					 '❌ Failed. Focus on efficiency and shorter paths.'}
				</p>
				<button onClick={onPlayAgain} style={{ 
					padding: isMobile ? '16px 24px' : '12px 20px', 
					borderRadius: 10, 
					border: 'none', 
					background: '#22c55e', 
					color: '#0b1020', 
					fontWeight: 700,
					fontSize: isMobile ? '16px' : '14px',
					minHeight: isMobile ? '56px' : 'auto',
					width: '100%'
				}}>🔄 PLAY AGAIN</button>
			</div>
		</div>
	);
};
