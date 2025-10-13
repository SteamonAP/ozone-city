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
	const { parcels, vehicles, assignParcelToVehicle, removeParcelFromVehicle } = useGameState();
	const [hint, setHint] = useState<Record<string, string[]> | null>(null);

	const parcelById = useMemo(() => new Map(parcels.map(p => [p.id, p])), [parcels]);
	const assignedSet = useMemo(() => new Set(vehicles.flatMap(v => v.loadedParcelIds)), [vehicles]);
	const unassignedParcels = useMemo(() => parcels.filter(p => !assignedSet.has(p.id)), [parcels, assignedSet]);

	function vehicleLoadUsed(v: Vehicle) {
		return v.loadedParcelIds.reduce((sum, id) => sum + (parcelById.get(id)?.sizeUnits ?? 0), 0);
	}

	function canDrop(v: Vehicle, parcelId: string) {
		const p = parcelById.get(parcelId);
		if (!p) return false;
		return vehicleLoadUsed(v) + p.sizeUnits <= v.capacity;
	}

	function suggest() {
		const s = suggestOptimalPack(parcels, vehicles);
		setHint(s.assignment);
	}

	function applySuggestion() {
		if (!hint) return;
		// clear existing loads
		for (const v of vehicles) {
			for (const pid of [...v.loadedParcelIds]) {
				removeParcelFromVehicle(pid, v.id);
			}
		}
		// apply hint
		for (const vid of Object.keys(hint)) {
			for (const pid of hint[vid]) assignParcelToVehicle(pid, vid);
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
				</div>
				
				<h4 style={{ marginBottom: 12, fontSize: window.innerWidth <= 768 ? '16px' : '18px' }}>📦 Available Deliveries</h4>
				<div style={{ display: 'grid', gap: 12, maxHeight: window.innerWidth <= 768 ? '300px' : 'none', overflowY: 'auto' }}>
					{unassignedParcels.map((p) => (
						<div key={p.id}
							draggable
							onDragStart={(e) => e.dataTransfer?.setData('text/plain', p.id)}
							style={{ 
								display: 'flex', 
								alignItems: 'center', 
								gap: 12, 
								background: '#111827', 
								padding: window.innerWidth <= 768 ? '16px' : '12px', 
								borderRadius: 10, 
								border: `2px solid ${p.urgency === 'urgent' ? '#ef4444' : p.urgency === 'normal' ? '#fbbf24' : '#22c55e'}`,
								minHeight: window.innerWidth <= 768 ? '80px' : 'auto'
							}}>
							<img src={parcelIcon(p)} alt={`Parcel ${p.id}`} width={window.innerWidth <= 768 ? 48 : 36} height={window.innerWidth <= 768 ? 48 : 36} />
							<img src={destinationIcon(p.destinationType)} alt={p.destinationType} width={window.innerWidth <= 768 ? 32 : 24} height={window.innerWidth <= 768 ? 32 : 24} />
							<div style={{ flex: 1 }}>
								<div style={{ fontSize: window.innerWidth <= 768 ? '16px' : '14px' }}><strong>Parcel {p.id}</strong> — {p.destinationType}</div>
								<div style={{ fontSize: window.innerWidth <= 768 ? '12px' : '11px', opacity: 0.8, marginTop: 2 }}>{getSDGMessage(p.destinationType, p.urgency)}</div>
								<div style={{ fontSize: window.innerWidth <= 768 ? '11px' : '10px', opacity: 0.6, marginTop: 2 }}>Priority: {p.urgency} • Size: {p.sizeUnits}</div>
							</div>
						</div>
					))}
					{unassignedParcels.length === 0 && <div style={{ opacity: 0.8, textAlign: 'center', padding: 20 }}>✅ All parcels assigned!</div>}
				</div>
			</div>
			<div>
				<h3 style={{ marginTop: 0 }}>Vehicles</h3>
				<div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
					{vehicles.map((v) => {
						const used = v.loadedParcelIds.reduce((sum, id) => sum + (parcelById.get(id)?.sizeUnits ?? 0), 0);
						const pct = Math.min(100, Math.round((used / v.capacity) * 100));
						const hintList = hint?.[v.id] ?? [];
						return (
							<div key={v.id}
								onDragOver={(e) => e.preventDefault()}
								onDrop={(e) => {
									const pid = e.dataTransfer?.getData('text/plain');
									if (!pid) return;
									if (canDrop(v, pid)) assignParcelToVehicle(pid, v.id);
									else {
										const p = parcelById.get(pid);
										if (p) alert(`Cannot load parcel ${p.id}: over capacity`);
									}
								}}
								style={{ background: '#0b1020', color: '#fff', borderRadius: 12, padding: 12, minWidth: 300 }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
									<img src={vehicleIcon(v)} alt={v.type} width={64} height={32} />
									<div style={{ flex: 1 }}>
										<strong>{v.type.toUpperCase()}</strong>
										<div style={{ fontSize: 12, opacity: 0.9 }}>Capacity {used}/{v.capacity}</div>
										<div style={{ marginTop: 6, height: 8, background: '#1f2937', borderRadius: 6, overflow: 'hidden' }}>
											<div style={{ width: `${pct}%`, height: '100%', background: '#22c55e' }} />
										</div>
									</div>
								</div>
								{hintList.length > 0 && (
									<div style={{ marginTop: 8, padding: 8, border: '1px dashed #22c55e', borderRadius: 8 }}>
										<div style={{ marginBottom: 6, color: '#22c55e' }}>Suggested: {hintList.join(', ')}</div>
									</div>
								)}
								<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
									{v.loadedParcelIds.map((pid) => {
										const p = parcelById.get(pid)!;
										return (
											<button key={pid} onClick={() => removeParcelFromVehicle(pid, v.id)} title="Remove from vehicle" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111827', padding: '6px 8px', borderRadius: 8, border: '1px solid #1f2937', color: '#fff' }}>
												<img src={parcelIcon(p)} alt="parcel" width={20} height={20} /> {p.id}
											</button>
										);
									})}
								</div>
								<div style={{ marginTop: 12 }}>
									<button onClick={() => onDispatch(v.id)} disabled={v.loadedParcelIds.length === 0} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: v.loadedParcelIds.length ? '#22c55e' : '#6b7280', color: '#0b1020', fontWeight: 700 }}>Dispatch</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

