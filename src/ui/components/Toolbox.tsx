import React from 'react';

type TileType = 'straight' | 'curve' | 't' | 'cross';

export interface ToolboxCounts { straight: number; curve: number; t: number; cross: number }

export const Toolbox: React.FC<{
	counts: ToolboxCounts;
	selected: TileType | null;
	onSelect: (t: TileType | null) => void;
	onRotate: () => void;
}> = ({ counts, selected, onSelect, onRotate }) => {
	const tiles: TileType[] = ['straight','curve','t','cross'];
	return (
		<div aria-label="Toolbox" style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#0b1020', color: '#fff', padding: 8, borderRadius: 10 }}>
			{tiles.map((t) => (
				<button key={t} disabled={counts[t] <= 0}
					onClick={() => onSelect(selected === t ? null : t)}
					style={{ padding: '8px 10px', borderRadius: 8, border: selected === t ? '2px solid #22c55e' : '1px solid #1f2937', background: counts[t] > 0 ? '#111827' : '#374151', color: '#fff' }}>
					{t.toUpperCase()} ({counts[t]})
				</button>
			))}
			<button onClick={onRotate} style={{ marginLeft: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid #1f2937', background: '#111827', color: '#fff' }}>Rotate</button>
		</div>
	);
};
