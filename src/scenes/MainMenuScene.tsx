import React from 'react';

interface MainMenuProps {
	onStart: () => void;
	onTutorial: () => void;
	onQuit: () => void;
}

export const MainMenuScene: React.FC<MainMenuProps> = ({ onStart, onTutorial, onQuit }) => {
	return (
		<div
			aria-label="Main Menu"
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(120deg, #0ea5e9, #22c55e, #3b82f6)',
				backgroundSize: '300% 300%',
				animation: 'bgShift 12s ease infinite',
				color: '#fff',
				fontFamily: 'system-ui, sans-serif',
				padding: '16px'
			}}
		>
			<style>
				{`@keyframes bgShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} } 
				.menu-btn{transition: transform .12s ease, box-shadow .12s ease, background .2s ease, min-height: 48px} 
				.menu-btn:hover{transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,.25)} 
				.menu-btn:active{transform: translateY(0);} 
				@media (max-width: 768px) {
					.menu-btn { min-height: 56px; font-size: 18px; }
					.menu-container { max-width: 90vw; padding: 20px; }
					.menu-title { font-size: 28px; }
				}`}
			</style>
			<div className="menu-container" style={{ textAlign: 'center', padding: 24, background: 'rgba(11,16,32,0.5)', borderRadius: 16, backdropFilter: 'blur(6px)', maxWidth: 400, width: '100%' }}>
				<h1 className="menu-title" style={{ marginBottom: 16, fontSize: 32 }}>🌍 Ozone City Express</h1>
				<p style={{ marginTop: 0, marginBottom: 20, opacity: 0.95, fontSize: 16 }}>Climate Action Game: Plan efficient delivery routes to reduce emissions!</p>
				<div style={{ display: 'grid', gap: 16 }}>
					<button aria-label="Start Game" onClick={onStart} className="menu-btn" style={btn}>🚀 START GAME</button>
					<button aria-label="Tutorial" onClick={onTutorial} className="menu-btn" style={btnAlt}>📚 TUTORIAL</button>
					<button aria-label="Quit" onClick={onQuit} className="menu-btn" style={btnAlt}>👋 QUIT</button>
				</div>
			</div>
		</div>
	);
};

const btn: React.CSSProperties = {
	padding: '12px 20px',
	borderRadius: 12,
	border: 'none',
	background: '#22c55e',
	color: '#0b1020',
	fontWeight: 700,
	fontSize: 16,
	cursor: 'pointer'
};

const btnAlt: React.CSSProperties = { ...btn, background: '#e5e7eb', color: '#0b1020' };
