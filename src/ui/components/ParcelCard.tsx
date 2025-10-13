import React from 'react';
import type { Parcel } from '../../game/models';

export const ParcelCard: React.FC<{ parcel: Parcel }> = ({ parcel }) => {
	const bg = parcel.color === 'green' ? '#22c55e' : parcel.color === 'blue' ? '#3b82f6' : '#ef4444';
	return (
		<div style={{ background: bg, color: '#0b1020', borderRadius: 8, padding: 8, minWidth: 120 }}>
			<div><strong>Parcel {parcel.id}</strong></div>
			<div>Size: {parcel.sizeUnits}</div>
			<div>Dest: ({parcel.destination.x},{parcel.destination.y})</div>
		</div>
	);
};
