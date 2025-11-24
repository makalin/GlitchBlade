import React from 'react';

interface PadGridProps {
    slices: number[];
    activeSliceIndex: number | null;
    onPadTrigger: (index: number) => void;
}

const KEY_MAPPING = [
    { key: 'Q', label: 'Q' }, { key: 'W', label: 'W' }, { key: 'E', label: 'E' }, { key: 'R', label: 'R' },
    { key: 'A', label: 'A' }, { key: 'S', label: 'S' }, { key: 'D', label: 'D' }, { key: 'F', label: 'F' },
    { key: 'Z', label: 'Z' }, { key: 'X', label: 'X' }, { key: 'C', label: 'C' }, { key: 'V', label: 'V' },
];

export const PadGrid: React.FC<PadGridProps> = ({ slices, activeSliceIndex, onPadTrigger }) => {
    return (
        <div className="grid grid-cols-4 gap-4 mt-6">
            {KEY_MAPPING.map((map, index) => {
                const hasSlice = index < slices.length;
                const isActive = activeSliceIndex === index;

                return (
                    <button
                        key={map.key}
                        className={`
              h-24 rounded-lg border-2 transition-all duration-100 flex flex-col items-center justify-center relative
              ${isActive
                                ? 'bg-cyber-primary border-cyber-primary text-cyber-dark shadow-[0_0_15px_rgba(0,255,157,0.5)] scale-95'
                                : hasSlice
                                    ? 'bg-cyber-panel border-cyber-primary/50 text-cyber-primary hover:border-cyber-primary hover:shadow-[0_0_10px_rgba(0,255,157,0.2)]'
                                    : 'bg-cyber-dark border-gray-800 text-gray-700 cursor-not-allowed'
                            }
            `}
                        onClick={() => hasSlice && onPadTrigger(index)}
                        disabled={!hasSlice}
                    >
                        <span className="text-2xl font-bold">{index + 1}</span>
                        <span className="text-xs absolute bottom-2 right-2 opacity-50">{map.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
