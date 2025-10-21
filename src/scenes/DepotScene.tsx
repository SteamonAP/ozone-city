import React, { useMemo, useState } from 'react';
import { useGameState } from '../game/gameState';
import type { Parcel, Vehicle } from '../game/models';
import parcelGreen from '../assets/sprites/parcel_green.svg';
import parcelBlue from '../assets/sprites/parcel_blue.svg';
import parcelRed from '../assets/sprites/parcel_red.svg';
import cycleSvg from '../assets/sprites/vehicle_cycle.svg';
import autoSvg from '../assets/sprites/vehicle_auto.svg';
import vanSvg from '../assets/sprites/vehicle_van.svg';
import schoolIcon from '../assets/sprites/school.svg';
import hospitalIcon from '../assets/sprites/hospital.svg';
import homeIcon from '../assets/sprites/home.svg';
import { suggestOptimalPack } from '../game/solver';

function parcelIcon(p: Parcel) {
	if (p.color === 'green') return parcelGreen;
	if (p.color === 'blue') return parcelBlue;
	return parcelRed;
}

function vehicleIcon(v: Vehicle) {
	if (v.type === 'cycle') return cycleSvg;
	if (v.type === 'auto') return autoSvg;
	return vanSvg;
}

function destinationIcon(type: string) {
	switch (type) {
		case 'school': return schoolIcon;
		case 'hospital': return hospitalIcon;
		case 'home': return homeIcon;
		default: return homeIcon;
	}
}

function getSDGMessage(type: string, urgency: string) {
	switch (type) {
		case 'school':
			return `📚 Quality Education (SDG 4): ${urgency === 'urgent' ? 'Urgent school supplies needed!' : 'Educational materials delivery'}`;
		case 'hospital':
			return `🏥 Good Health (SDG 3): ${urgency === 'urgent' ? 'Critical medical supplies!' : 'Healthcare delivery'}`;
		case 'home':
			return `🏠 Sustainable Communities (SDG 11): ${urgency === 'urgent' ? 'Emergency household delivery!' : 'Community supply delivery'}`;
		default:
			return 'Community delivery';
	}
}

export const DepotScene: React.FC<{ onDispatch: (vehicleId: string) => void }> = ({ onDispatch }) => {
	const { parcels, vehicles, assignParcelToVehicle, removeParcelFromVehicle, dispatchedVehicles, startNewDay } = useGameState();
	const [hint, setHint] = useState<Record<string, string[]> | null>(null);
	const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

	const parcelById = useMemo(() => new Map(parcels.map(p => [p.id, p])), [parcels]);
	const assignedSet = useMemo(() => new Set(vehicles.flatMap(v => v.loadedParcelIds)), [vehicles]);
	const unassignedParcels = useMemo(() => parcels.filter(p => !assignedSet.has(p.id)), [parcels, assignedSet]);

	// Mobile-friendly tap handlers
	const handleParcelTap = (parcelId: string) => {
		setSelectedParcelId(selectedParcelId === parcelId ? null : parcelId);
	};

	const handleVehicleTap = (vehicleId: string) => {
		if (!selectedParcelId) return;
		
		const vehicle = vehicles.find(v => v.id === vehicleId);
		if (!vehicle) return;
		
		// Check capacity
		const used = vehicle.loadedParcelIds.reduce((sum, id) => sum + (parcelById.get(id)?.sizeUnits ?? 0), 0);
		const parcel = parcelById.get(selectedParcelId);
		if (!parcel) return;
		
		if (used + parcel.sizeUnits <= vehicle.capacity) {
			assignParcelToVehicle(selectedParcelId, vehicleId);
			setSelectedParcelId(null);
		}
	};

	function vehicleLoadUsed(v: Vehicle) {
		return v.loadedParcelIds.reduce((sum, id) => sum + (parcelById.get(id)?.sizeUnits ?? 0), 0);
	}

	function suggest() {
    const suggestion = suggestOptimalPack(parcels, vehicles);
    setHint(suggestion.assignment);
	}

	function applySuggestion() {
		if (!hint) return;
		for (const [vid, pids] of Object.entries(hint)) {
			for (const pid of pids) assignParcelToVehicle(pid, vid);
		}
		setHint(null);
	}

	return (
		<div aria-label="Depot Planning" style={{ 
			position: 'absolute', 
			inset: 0, 
			padding: '12px', 
			color: '#fff', 
			display: 'grid', 
			gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'minmax(320px, 400px) 1fr', 
			gap: '16px', 
			background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
			overflow: 'auto'
		}}>
			<div style={{ minHeight: 0 }}>
				<h2 style={{ marginTop: 0, fontSize: window.innerWidth <= 768 ? '20px' : '24px' }}>🌍 Climate Action Depot</h2>
				<p style={{ marginBottom: 16, opacity: 0.9, fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}>Choose efficient vehicles to minimize emissions and deliver essential supplies to the community.</p>
				
				<div style={{ background: '#0b1020', padding: 12, borderRadius: 10, marginBottom: 16 }}>
					<h4 style={{ margin: '0 0 8px 0', color: '#22c55e', fontSize: window.innerWidth <= 768 ? '14px' : '16px' }}>🎯 SDG Climate Action</h4>
					<p style={{ margin: 0, fontSize: window.innerWidth <= 768 ? '11px' : '12px', opacity: 0.8 }}>Optimize delivery routes to reduce carbon emissions while serving schools, hospitals, and homes efficiently.</p>
				</div>

				<div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
					<button onClick={suggest} style={{ 
						padding: window.innerWidth <= 768 ? '12px 16px' : '8px 12px', 
						borderRadius: 8, 
						border: 'none', 
						background: '#111827', 
						color: '#fff',
						minHeight: window.innerWidth <= 768 ? '48px' : 'auto',
						fontSize: window.innerWidth <= 768 ? '14px' : '12px'
					}}>🧠 AI Optimize</button>
					<button onClick={applySuggestion} disabled={!hint} style={{ 
						padding: window.innerWidth <= 768 ? '12px 16px' : '8px 12px', 
						borderRadius: 8, 
						border: 'none', 
						background: hint ? '#22c55e' : '#6b7280', 
						color: '#0b1020', 
						fontWeight: 700,
						minHeight: window.innerWidth <= 768 ? '48px' : 'auto',
						fontSize: window.innerWidth <= 768 ? '14px' : '12px'
					}}>Apply</button>
					<button onClick={() => startNewDay()} style={{ 
						padding: window.innerWidth <= 768 ? '12px 16px' : '8px 12px', 
						borderRadius: 8, 
						border: 'none', 
						background: '#ef4444', 
						color: '#fff', 
						fontWeight: 700,
						minHeight: window.innerWidth <= 768 ? '48px' : 'auto',
						fontSize: window.innerWidth <= 768 ? '14px' : '12px'
					}}>🔄 Reset Day</button>
				</div>
				
				<h4 style={{ marginBottom: 12, fontSize: window.innerWidth <= 768 ? '16px' : '18px' }}>📦 Available Deliveries</h4>
				<div style={{ display: 'grid', gap: 12, maxHeight: window.innerWidth <= 768 ? '300px' : 'none', overflowY: 'auto' }}>
					{unassignedParcels.map((p) => (
						<div key={p.id}
							onClick={() => handleParcelTap(p.id)}
							style={{ 
								display: 'flex', 
								alignItems: 'center', 
								gap: 12, 
								background: selectedParcelId === p.id ? '#1f2937' : '#111827', 
								padding: window.innerWidth <= 768 ? '16px' : '12px', 
								borderRadius: 10, 
								border: `2px solid ${selectedParcelId === p.id ? '#3b82f6' : p.urgency === 'urgent' ? '#ef4444' : p.urgency === 'normal' ? '#fbbf24' : '#22c55e'}`,
								minHeight: window.innerWidth <= 768 ? '80px' : 'auto',
								cursor: 'pointer',
								transform: selectedParcelId === p.id ? 'scale(1.02)' : 'scale(1)',
								transition: 'all 0.2s ease'
							}}>
							<img src={parcelIcon(p)} alt={`Parcel ${p.id}`} width={window.innerWidth <= 768 ? 48 : 36} height={window.innerWidth <= 768 ? 48 : 36} />
							<img src={destinationIcon(p.destinationType)} alt={p.destinationType} width={window.innerWidth <= 768 ? 32 : 24} height={window.innerWidth <= 768 ? 32 : 24} />
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: window.innerWidth <= 768 ? '16px' : '14px' }}><strong>Parcel {p.id}</strong> — {p.destinationType}</div>
								<div style={{ fontSize: window.innerWidth <= 768 ? '12px' : '11px', opacity: 0.8, marginTop: 2 }}>{getSDGMessage(p.destinationType, p.urgency)}</div>
								<div style={{ fontSize: window.innerWidth <= 768 ? '11px' : '10px', opacity: 0.6, marginTop: 2 }}>Priority: {p.urgency} • Size: {p.sizeUnits}</div>
								{selectedParcelId === p.id && (
									<div style={{ fontSize: window.innerWidth <= 768 ? '12px' : '10px', color: '#3b82f6', marginTop: 4 }}>
										👆 Tap a vehicle to assign
									</div>
								)}
							</div>
						</div>
					))}
					{unassignedParcels.length === 0 && <div style={{ opacity: 0.8, textAlign: 'center', padding: 20 }}>✅ All parcels assigned!</div>}
				</div>
			</div>
			<div>
				<h3 style={{ marginTop: 0 }}>🚛 Vehicles</h3>
				<div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
					{vehicles.map((v) => {
						const used = v.loadedParcelIds.reduce((sum, id) => sum + (parcelById.get(id)?.sizeUnits ?? 0), 0);
						const canDispatch = used > 0 && !dispatchedVehicles.has(v.id);
						const isDispatched = dispatchedVehicles.has(v.id);
						const hintForVehicle = hint?.[v.id] || [];
						return (
							<div key={v.id} 
								onClick={() => handleVehicleTap(v.id)}
								style={{ 
									background: isDispatched ? '#374151' : selectedParcelId ? '#1f2937' : '#111827', 
									padding: 16, 
									borderRadius: 12, 
									minWidth: 200,
									cursor: selectedParcelId ? 'pointer' : 'default',
									border: selectedParcelId ? '2px solid #3b82f6' : '2px solid transparent',
									opacity: isDispatched ? 0.6 : 1,
									transition: 'all 0.2s ease'
								}}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
									<img src={vehicleIcon(v)} alt={v.id} width={48} height={48} />
									<div>
										<div><strong>{v.id.toUpperCase()}</strong></div>
										<div style={{ opacity: 0.8 }}>Capacity {used}/{v.capacity}</div>
										{isDispatched && <div style={{ fontSize: 12, color: '#22c55e' }}>✅ Dispatched</div>}
									</div>
								</div>
								<div style={{ height: 8, background: '#1f2937', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
									<div style={{ width: `${(used / v.capacity) * 100}%`, height: '100%', background: used >= v.capacity ? '#ef4444' : '#22c55e' }} />
								</div>
								<div style={{ marginBottom: 12 }}>
									{v.loadedParcelIds.map((pid) => {
										const p = parcelById.get(pid);
										return p ? (
											<div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
												<img src={parcelIcon(p)} alt={pid} width={24} height={24} />
												<span style={{ fontSize: 12 }}>{pid} ({p.sizeUnits})</span>
												{!isDispatched && (
													<button onClick={(e) => { e.stopPropagation(); removeParcelFromVehicle(pid, v.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
												)}
											</div>
										) : null;
									})}
								</div>
								{hintForVehicle.length > 0 && !isDispatched && (
									<div style={{ marginBottom: 12, padding: 8, background: '#0b1020', borderRadius: 6 }}>
										<div style={{ fontSize: 12, color: '#22c55e', marginBottom: 4 }}>Suggested:</div>
										{hintForVehicle.map((pid) => {
											const p = parcelById.get(pid);
											return p ? (
												<div key={pid} style={{ fontSize: 11, opacity: 0.8 }}>{pid} ({p.sizeUnits})</div>
											) : null;
										})}
									</div>
								)}
								{selectedParcelId && !isDispatched && (
									<div style={{ marginBottom: 12, fontSize: 12, color: '#3b82f6', textAlign: 'center' }}>
										👆 Tap to assign selected parcel
									</div>
								)}
								<button 
									onClick={(e) => { e.stopPropagation(); canDispatch && onDispatch(v.id); }} 
									disabled={!canDispatch} 
									style={{ 
										padding: '8px 16px', 
										borderRadius: 8, 
										border: 'none', 
										background: canDispatch ? '#22c55e' : '#6b7280', 
										color: '#0b1020', 
										fontWeight: 700, 
										cursor: canDispatch ? 'pointer' : 'not-allowed', 
										width: '100%' 
									}}>
									{isDispatched ? 'Dispatched' : 'Dispatch'}
								</button>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};