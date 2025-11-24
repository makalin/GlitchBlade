import React from 'react';
import { Zap, Repeat, Activity, Gauge } from 'lucide-react';
import { audioEngine } from '../lib/AudioEngine';

interface EffectControlsProps {
    forceUpdate: () => void;
}

export const EffectControls: React.FC<EffectControlsProps> = ({ forceUpdate }) => {

    const updateEngine = () => {
        forceUpdate(); // Re-render parent to show state changes if needed, mostly for visual feedback
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

            {/* BitCrusher */}
            <div className="bg-cyber-panel border border-cyber-primary/30 p-4 rounded-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-cyber-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-cyber-primary font-bold flex items-center gap-2">
                        <Zap size={16} /> BITCRUSHER
                    </h3>
                    <input
                        type="checkbox"
                        checked={audioEngine.bitCrusherEnabled}
                        onChange={(e) => {
                            audioEngine.bitCrusherEnabled = e.target.checked;
                            updateEngine();
                        }}
                        className="toggle-checkbox"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-400">BIT DEPTH: {audioEngine.bitDepth}</label>
                    <input
                        type="range"
                        min="1"
                        max="16"
                        step="1"
                        value={audioEngine.bitDepth}
                        onChange={(e) => {
                            audioEngine.bitDepth = parseInt(e.target.value);
                            updateEngine();
                        }}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyber-primary"
                    />
                </div>
            </div>

            {/* Filter */}
            <div className="bg-cyber-panel border border-cyber-secondary/30 p-4 rounded-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-cyber-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-cyber-secondary font-bold flex items-center gap-2">
                        <Activity size={16} /> FILTER
                    </h3>
                    <input
                        type="checkbox"
                        checked={audioEngine.filterEnabled}
                        onChange={(e) => {
                            audioEngine.filterEnabled = e.target.checked;
                            updateEngine();
                        }}
                        className="toggle-checkbox"
                    />
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">CUTOFF: {audioEngine.filterFreq}Hz</label>
                        <input
                            type="range"
                            min="20"
                            max="20000"
                            step="100"
                            value={audioEngine.filterFreq}
                            onChange={(e) => {
                                audioEngine.filterFreq = parseInt(e.target.value);
                                updateEngine();
                            }}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyber-secondary"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">RES: {audioEngine.filterRes}</label>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="0.1"
                            value={audioEngine.filterRes}
                            onChange={(e) => {
                                audioEngine.filterRes = parseFloat(e.target.value);
                                updateEngine();
                            }}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyber-secondary"
                        />
                    </div>
                </div>
            </div>

            {/* Delay */}
            <div className="bg-cyber-panel border border-cyber-accent/30 p-4 rounded-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-cyber-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-cyber-accent font-bold flex items-center gap-2">
                        <Repeat size={16} /> DELAY
                    </h3>
                    <input
                        type="checkbox"
                        checked={audioEngine.delayEnabled}
                        onChange={(e) => {
                            audioEngine.delayEnabled = e.target.checked;
                            updateEngine();
                        }}
                        className="toggle-checkbox"
                    />
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">TIME: {audioEngine.delayTime}s</label>
                        <input
                            type="range"
                            min="0.01"
                            max="1.0"
                            step="0.01"
                            value={audioEngine.delayTime}
                            onChange={(e) => {
                                audioEngine.delayTime = parseFloat(e.target.value);
                                updateEngine();
                            }}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyber-accent"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">FEEDBACK: {audioEngine.delayFeedback}</label>
                        <input
                            type="range"
                            min="0"
                            max="0.9"
                            step="0.01"
                            value={audioEngine.delayFeedback}
                            onChange={(e) => {
                                audioEngine.delayFeedback = parseFloat(e.target.value);
                                updateEngine();
                            }}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyber-accent"
                        />
                    </div>
                </div>
            </div>

            {/* Master / Tools */}
            <div className="bg-cyber-panel border border-white/20 p-4 rounded-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Gauge size={16} /> TOOLS
                    </h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">PITCH: {audioEngine.pitch.toFixed(2)}x</label>
                        <input
                            type="range"
                            min="0.1"
                            max="2.0"
                            step="0.05"
                            value={audioEngine.pitch}
                            onChange={(e) => {
                                audioEngine.pitch = parseFloat(e.target.value);
                                updateEngine();
                            }}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                    <button
                        onClick={() => {
                            audioEngine.reverse = !audioEngine.reverse;
                            updateEngine();
                        }}
                        className={`w-full py-2 rounded font-bold transition-all ${audioEngine.reverse
                            ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        {audioEngine.reverse ? '◀ REVERSE ACTIVE' : '▶ FORWARD'}
                    </button>
                </div>
            </div>

        </div>
    );
};
