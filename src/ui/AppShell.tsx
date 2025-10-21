import React, { useEffect, useMemo, useState } from 'react';
import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { MainMenuScene as MenuOverlay } from '../scenes/MainMenuScene';
import { TutorialScene as TutorialOverlay } from '../scenes/TutorialScene';
import { DepotScene as DepotOverlay } from '../scenes/DepotScene';
import { RouteScene as RouteOverlay } from '../scenes/RouteScene';
import { SummaryScene as SummaryOverlay } from '../scenes/SummaryScene';
import { useGameState } from '../game/gameState';

export const AppShell: React.FC = () => {
	const { startNewDay, tutorialDone, setTutorialDone, parcels, vehicles, recordTrip, dispatchVehicle, isDayComplete, getUndispatchedVehicles } = useGameState();
	const [stage, setStage] = useState<'menu'|'tutorial'|'depot'|'route'|'summary'>('menu');
	const [currentVehicleId, setCurrentVehicleId] = useState<string | null>(null);

	useEffect(() => {
		// Initialize Phaser canvas (placeholder Boot -> MainMenu text) under overlays
		const parent = document.getElementById('phaser-root');
		if (!parent) return;
		const game = new Phaser.Game({ type: Phaser.AUTO, width: parent.clientWidth, height: parent.clientHeight, parent: 'phaser-root', backgroundColor: '#0ea5e9', scene: [BootScene] });
		const handle = () => {
			game.scale.resize(parent.clientWidth, parent.clientHeight);
		};
		window.addEventListener('resize', handle);
		return () => { window.removeEventListener('resize', handle); game.destroy(true); };
	}, []);

	useEffect(() => {
		startNewDay();
	}, [startNewDay]);

	const activeDestinations = useMemo(() => {
		if (!currentVehicleId) return [] as { x: number; y: number }[];
		const v = vehicles.find(v => v.id === currentVehicleId);
		if (!v) return [];
		const set = new Set(v.loadedParcelIds);
		return parcels.filter(p => set.has(p.id)).map(p => p.destination);
	}, [parcels, vehicles, currentVehicleId]);

	return (
		<div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: 'linear-gradient(180deg,#0ea5e9 0%,#111827 100%)' }}>
			<div id="phaser-root" style={{ width: '100%', height: '100%' }} />

			{stage === 'menu' && (
				<MenuOverlay
					onStart={() => setStage(tutorialDone ? 'depot' : 'tutorial')}
					onTutorial={() => setStage('tutorial')}
					onQuit={() => {
						// Web quit -> thanks overlay
						alert('Thanks for playing Ozone City Express!');
					}}
				/>
			)}

			{stage === 'tutorial' && (
				<TutorialOverlay onFinish={() => { setTutorialDone(); setStage('depot'); }} />
			)}

			{stage === 'depot' && (
				<DepotOverlay onDispatch={(vehId) => { 
					dispatchVehicle(vehId);
					setCurrentVehicleId(vehId); 
					setStage('route'); 
				}} />
			)}

			{stage === 'route' && currentVehicleId && (
				<RouteOverlay
					vehicleId={currentVehicleId}
					destinations={activeDestinations}
					onSubmit={(pathLength) => {
						recordTrip(currentVehicleId, pathLength);
						
						// Check if day is complete or if there are more vehicles to dispatch
						if (isDayComplete()) {
							setStage('summary');
						} else {
							// Return to depot to dispatch next vehicle
							setCurrentVehicleId(null);
							setStage('depot');
						}
					}}
				/>
			)}

			{stage === 'summary' && (
				<SummaryOverlay onPlayAgain={() => { startNewDay(); setStage('depot'); }} />
			)}
		</div>
	);
};
