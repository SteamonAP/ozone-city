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
	const isMobile = window.innerWidth <= 768;

	const parcelById = useMemo(() => new Map(parcels.map(p => [p.id, p])), [parcels]);
	const assignedSet = useMemo(() => new Set(vehicles.flatMap(v => v.loadedParcelIds)), [vehicles]);
	const unassignedParcels = useMemo(() => parcels.filter(p => !assignedSet.has(p.id)), [parcels, assignedSet]);

	const handleParcelTap = (parcelId: string) => {
		setSelectedParcelId(selectedParcelId === parcelId ? null : parcelId);
	};

	const handleVehicleTap = (vehicleId: string) => {
		if (!selectedParcelId) return;
		const vehicle = vehicles.find(v => v.id === vehicleId);
		if (!vehicle) return;

		const used = vehicle.loadedParcelIds.reduce((sum, id) => sum + (parcelById.get(id)?.sizeUnits ?? 0), 0);
		const parcel = parcelById.get(selectedParcelId);
		if (!parcel) return;

		if (used + parcel.sizeUnits <= vehicle.capacity) {
			assignParcelToVehicle(selectedParcelId, vehicleId);
			setSelectedParcelId(null);
		}
	};

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
			gridTemplateColumns: isMobile ? '1fr' : 'minmax(340px, 420px) 1fr',
			gap: '16px',
			background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
			overflow: 'auto'
		}}>
			{/* LEFT COLUMN: Intro + Actions + Parcels */}
			<div style={{ minHeight: 0 }}>
				<h2 style={{ marginTop: 0, fontSize: isMobile ? '20px' : '24px' }}>🌍 Climate Action Depot</h2>
				<p style={{ marginBottom: 16, opacity: 0.9, fontSize: isMobile ? '14px' : '16px' }}>
					Choose efficient vehicles to minimize emissions and deliver essential supplies to the community.
				</p>

				<div style={{ background: '#0b1020', padding: isMobile ? 10 : 12, borderRadius: 10, marginBottom: 12 }}>
					<h4 style={{ margin: '0 0 6px 0', color: '#22c55e', fontSize: isMobile ? '13px' : '16px' }}>🎯 SDG Climate Action</h4>
					<p style={{ margin: 0, fontSize: isMobile ? '11px' : '12px', opacity: 0.8, lineHeight: '1.4' }}>
						Optimize delivery routes to reduce carbon emissions while serving schools, hospitals, and homes efficiently.
					</p>
				</div>

				{/* ACTIONS ROW (kept compact; no overlap) */}
				<div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
					<button onClick={suggest} style={{
						padding: isMobile ? '10px 14px' : '8px 12px',
						borderRadius: 8,
						border: 'none',
						background: '#3b82f6',
						color: '#fff',
						minHeight: isMobile ? '44px' : 'auto',
						fontSize: isMobile ? '13px' : '12px',
						fontWeight: 600,
						cursor: 'pointer',
						touchAction: 'manipulation'
					}}>🧠 AI Optimize</button>
					<button onClick={applySuggestion} disabled={!hint} style={{
						padding: isMobile ? '10px 14px' : '8px 12px',
						borderRadius: 8,
						border: 'none',
						background: hint ? '#22c55e' : '#6b7280',
						color: hint ? '#0b1020' : '#fff',
						fontWeight: 700,
						minHeight: isMobile ? '44px' : 'auto',
						fontSize: isMobile ? '13px' : '12px',
						cursor: hint ? 'pointer' : 'not-allowed',
						touchAction: 'manipulation'
					}}>✓ Apply</button>
					<button onClick={() => startNewDay()} style={{
						padding: isMobile ? '10px 14px' : '8px 12px',
						borderRadius: 8,
						border: 'none',
						background: '#ef4444',
						color: '#fff',
						fontWeight: 700,
						minHeight: isMobile ? '44px' : 'auto',
						fontSize: isMobile ? '13px' : '12px',
						cursor: 'pointer',
						touchAction: 'manipulation'
					}}>🔄 Reset</button>
				</div>

				<h4 style={{ marginBottom: 10, marginTop: 0, fontSize: isMobile ? '15px' : '18px' }}>📦 Available Deliveries</h4>
				{/* Scroll-limited on mobile to prevent overlap */}
				<div style={{
					display: 'grid',
					gap: 10,
					maxHeight: isMobile ? '48vh' : 'none',
					overflowY: isMobile ? 'auto' : 'visible',
					paddingRight: 4
				}}>
					{unassignedParcels.map((p) => (
						<div key={p.id}
							onClick={() => handleParcelTap(p.id)}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 10,
								background: selectedParcelId === p.id ? '#1f2937' : '#111827',
								padding: '12px',
								borderRadius: 10,
								border: `2px solid ${selectedParcelId === p.id ? '#3b82f6' : p.urgency === 'urgent' ? '#ef4444' : p.urgency === 'normal' ? '#fbbf24' : '#22c55e'}`,
								minHeight: isMobile ? '72px' : 'auto',
								cursor: 'pointer',
								transform: selectedParcelId === p.id ? 'scale(1.02)' : 'scale(1)',
								transition: 'all 0.2s ease',
								touchAction: 'manipulation',
								position: 'relative',
								zIndex: 1
							}}>
							<img src={parcelIcon(p)} alt={`Parcel ${p.id}`} width={isMobile ? 40 : 36} height={isMobile ? 40 : 36} style={{ flexShrink: 0 }} />
							<img src={destinationIcon(p.destinationType)} alt={p.destinationType} width={isMobile ? 28 : 24} height={isMobile ? 28 : 24} style={{ flexShrink: 0 }} />
							<div style={{ flex: 1, minWidth: 0 }}>
								<div style={{ fontSize: 14 }}><strong>Parcel {p.id}</strong> — {p.destinationType}</div>
								<div style={{ fontSize: 11, opacity: 0.8, marginTop: 2, lineHeight: '1.3' }}>{getSDGMessage(p.destinationType, p.urgency)}</div>
								<div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>Priority: {p.urgency} • Size: {p.sizeUnits}</div>
								{selectedParcelId === p.id && (
									<div style={{ fontSize: 11, color: '#3b82f6', marginTop: 4, fontWeight: 600 }}>
										👆 Tap a vehicle below to assign
									</div>
								)}
							</div>
						</div>
					))}
					{unassignedParcels.length === 0 && (
						<div style={{ opacity: 0.8, textAlign: 'center', padding: isMobile ? 16 : 20, fontSize: isMobile ? '14px' : '16px' }}>
							✅ All parcels assigned!
						</div>
					)}
				</div>
			</div>

			{/* RIGHT COLUMN: Vehicles */}
			<div>
				<h3 style={{ marginTop: 0 }}>{isMobile ? '🚛 Dispatch Vehicles' : '🚛 Vehicles'}</h3>
				<div style={{
					display: 'grid',
					gap: 12,
					gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))'
				}}>
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
									padding: isMobile ? 14 : 16,
									borderRadius: 12,
									cursor: selectedParcelId ? 'pointer' : 'default',
									border: selectedParcelId && !isDispatched ? '2px solid #3b82f6' : '2px solid transparent',
									opacity: isDispatched ? 0.6 : 1,
									transition: 'all 0.2s ease'
								}}>
								<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
									<img src={vehicleIcon(v)} alt={v.id} width={isMobile ? 44 : 48} height={isMobile ? 44 : 48} />
									<div style={{ flex: 1 }}>
										<div style={{ fontSize: isMobile ? 15 : 16 }}><strong>{v.id.toUpperCase()}</strong></div>
										<div style={{ opacity: 0.8, fontSize: isMobile ? 12 : 13 }}>Capacity {used}/{v.capacity}</div>
										{isDispatched && <div style={{ fontSize: isMobile ? 11 : 12, color: '#22c55e', marginTop: 2 }}>✅ Dispatched</div>}
									</div>
                                </div>

								<div style={{ height: 8, background: '#1f2937', borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
									<div style={{ width: `${(used / v.capacity) * 100}%`, height: '100%', background: used >= v.capacity ? '#ef4444' : '#22c55e', transition: 'width 0.3s ease' }} />
								</div>

								<div style={{ marginBottom: 10, minHeight: isMobile ? 40 : 'auto' }}>
									{v.loadedParcelIds.map((pid) => {
										const p = parcelById.get(pid);
										return p ? (
											<div key={pid} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
												<img src={parcelIcon(p)} alt={pid} width={20} height={20} />
												<span style={{ fontSize: isMobile ? 11 : 12, flex: 1 }}>{pid} ({p.sizeUnits})</span>
												{!isDispatched && (
													<button
														onClick={(e) => { e.stopPropagation(); removeParcelFromVehicle(pid, v.id); }}
														style={{
															background: 'none',
															border: 'none',
															color: '#ef4444',
															cursor: 'pointer',
															fontSize: '18px',
															padding: '0 4px',
															touchAction: 'manipulation',
															minWidth: '24px',
															minHeight: '24px'
														}}
													>×</button>
												)}
											</div>
										) : null;
									})}
								</div>

								{hintForVehicle.length > 0 && !isDispatched && (
									<div style={{ marginBottom: 10, padding: 8, background: '#0b1020', borderRadius: 6 }}>
										<div style={{ fontSize: isMobile ? 11 : 12, color: '#22c55e', marginBottom: 4 }}>💡 Suggested:</div>
										{hintForVehicle.map((pid) => {
											const p = parcelById.get(pid);
											return p ? (
												<div key={pid} style={{ fontSize: isMobile ? 10 : 11, opacity: 0.8 }}>{pid} ({p.sizeUnits})</div>
											) : null;
										})}
									</div>
								)}

								{selectedParcelId && !isDispatched && (
									<div style={{ marginBottom: 10, fontSize: isMobile ? 11 : 12, color: '#3b82f6', textAlign: 'center', fontWeight: 600, padding: '6px 0' }}>
										👆 Tap to assign parcel
									</div>
								)}

								<button
									onClick={(e) => { e.stopPropagation(); canDispatch && onDispatch(v.id); }}
									disabled={!canDispatch}
									style={{
										padding: isMobile ? '10px 16px' : '8px 16px',
										borderRadius: 8,
										border: 'none',
										background: canDispatch ? '#22c55e' : '#6b7280',
										color: canDispatch ? '#0b1020' : '#fff',
										fontWeight: 700,
										cursor: canDispatch ? 'pointer' : 'not-allowed',
										width: '100%',
										fontSize: isMobile ? '13px' : '14px',
										minHeight: isMobile ? '44px' : 'auto',
										touchAction: 'manipulation'
									}}
								>
									{isDispatched ? '✓ Dispatched' : 'Dispatch Vehicle'}
								</button>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};