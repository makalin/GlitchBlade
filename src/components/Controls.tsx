import React from 'react';
import { Settings, Zap, Activity, Volume2 } from 'lucide-react';

interface ControlsProps {
    threshold: number;
    setThreshold: (val: number) => void;
    bpm: number;
    setBpm: (val: number) => void;
    chaosMode: boolean;
    setChaosMode: (val: boolean) => void;
    volume: number;
    setVolume: (val: number) => void;
}

export const Controls: React.FC<ControlsProps> = ({
    threshold, setThreshold,
    bpm, setBpm,
    chaosMode, setChaosMode,
    volume, setVolume
}) => {
    return (
        <div className="flex flex-wrap gap-6 p-4 bg-cyber-panel border border-gray-800 rounded-lg mt-6 items-center">

            {/* Threshold */}
            <div className="flex flex-col gap-2 min-w-[150px]">
                <div className="flex items-center gap-2 text-cyber-primary text-sm">
                    <Activity size={16} />
                    <span>THRESHOLD</span>
                </div>
                <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="accent-cyber-primary h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* BPM */}
            <div className="flex flex-col gap-2 min-w-[150px]">
                <div className="flex items-center gap-2 text-cyber-secondary text-sm">
                    <Settings size={16} />
                    <span>CHAOS BPM: {bpm}</span>
                </div>
                <input
                    type="range"
                    min="60"
                    max="200"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    className="accent-cyber-secondary h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Volume */}
            <div className="flex flex-col gap-2 min-w-[150px]">
                <div className="flex items-center gap-2 text-cyber-accent text-sm">
                    <Volume2 size={16} />
                    <span>VOLUME</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="accent-cyber-accent h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            {/* Chaos Toggle */}
            <button
                onClick={() => setChaosMode(!chaosMode)}
                className={`
          ml-auto px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all
          ${chaosMode
                        ? 'bg-cyber-accent text-white shadow-[0_0_15px_rgba(255,0,85,0.5)] animate-pulse'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }
        `}
            >
                <Zap size={20} />
                {chaosMode ? 'CHAOS ACTIVE' : 'ACTIVATE CHAOS'}
            </button>
        </div>
    );
};
