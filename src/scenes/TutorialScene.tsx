import React from 'react';

export const TutorialScene: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
	const isMobile = window.innerWidth <= 768;
	
	return (
		<div
			aria-label="Tutorial"
			style={{ 
				position: 'absolute', 
				inset: 0, 
				display: 'grid', 
				placeItems: 'center', 
				background: 'rgba(0,0,0,0.6)', 
				color: '#fff',
				padding: isMobile ? 16 : 24
			}}
		>
			<div style={{ 
				maxWidth: isMobile ? '100%' : 520, 
				textAlign: 'center',
				background: '#111827',
				padding: isMobile ? 20 : 24,
				borderRadius: 12,
				width: '100%'
			}}>
				<h2 style={{ fontSize: isMobile ? '24px' : '28px', marginTop: 0 }}>🌍 Welcome to Ozone City Express</h2>
				<div style={{ display: 'grid', gap: isMobile ? 16 : 20, marginBottom: 24 }}>
					<div style={{ 
						background: '#0b1020', 
						padding: isMobile ? 16 : 20, 
						borderRadius: 8,
						border: '2px solid #22c55e'
					}}>
						<div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold', marginBottom: 8 }}>📦 Step 1: Pack Parcels</div>
						<p style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', opacity: 0.9 }}>
							Drag parcels into vehicles at the depot. Each parcel serves schools, hospitals, or homes with different priorities.
						</p>
					</div>
					<div style={{ 
						background: '#0b1020', 
						padding: isMobile ? 16 : 20, 
						borderRadius: 8,
						border: '2px solid #3b82f6'
					}}>
						<div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold', marginBottom: 8 }}>🗺️ Step 2: Draw Routes</div>
						<p style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', opacity: 0.9 }}>
							Tap adjacent cells to draw paths connecting depot to all destinations. Avoid obstacles and stay within segment limits.
						</p>
					</div>
					<div style={{ 
						background: '#0b1020', 
						padding: isMobile ? 16 : 20, 
						borderRadius: 8,
						border: '2px solid #fbbf24'
					}}>
						<div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 'bold', marginBottom: 8 }}>🎯 Goal: Climate Action</div>
						<p style={{ margin: 0, fontSize: isMobile ? '14px' : '16px', opacity: 0.9 }}>
							Optimize delivery routes to reduce emissions and time while serving the community efficiently. Learn about SDG Climate Action!
						</p>
					</div>
				</div>
				<button onClick={onFinish} style={{ 
					padding: isMobile ? '16px 24px' : '12px 20px', 
					borderRadius: 10, 
					border: 'none', 
					background: '#22c55e', 
					color: '#0b1020', 
					fontWeight: 700,
					fontSize: isMobile ? '16px' : '14px',
					minHeight: isMobile ? '56px' : 'auto',
					width: '100%'
				}}>🚀 Start Playing</button>
			</div>
		</div>
	);
};
