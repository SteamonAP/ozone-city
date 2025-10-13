import React from 'react';
import type { Vehicle } from '../../game/models';

export const VehicleCard: React.FC<{ vehicle: Vehicle; onDispatch?: () => void }> = ({ vehicle, onDispatch }) => {
	return (
		<div style={{ background: '#111827', color: '#fff', borderRadius: 10, padding: 12, minWidth: 180 }}>
			<strong>{vehicle.type.toUpperCase()}</strong>
			<div>Capacity: {vehicle.capacity}</div>
			<div>Loaded: {vehicle.loadedParcelIds.length}</div>
			{onDispatch && <button onClick={onDispatch} style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#22c55e', color: '#0b1020', fontWeight: 700 }}>Dispatch</button>}
		</div>
	);
};
