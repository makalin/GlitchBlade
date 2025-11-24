import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Music } from 'lucide-react';
import { audioEngine } from './lib/AudioEngine';
import { WaveformDisplay } from './components/WaveformDisplay';
import { PadGrid } from './components/PadGrid';
import { Controls } from './components/Controls';
import { EffectControls } from './components/EffectControls';

function App() {
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [slices, setSlices] = useState<number[]>([]);
  const [activeSlice, setActiveSlice] = useState<number | null>(null);
  const [threshold, setThreshold] = useState(0.1);
  const [bpm, setBpm] = useState(120);
  const [chaosMode, setChaosMode] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isDragging, setIsDragging] = useState(false);
  const [, setForceUpdate] = useState(0); // For triggering re-renders from effects

  const chaosIntervalRef = useRef<number | null>(null);

  // Handle File Upload
  const handleFile = async (file: File) => {
    try {
      const buf = await audioEngine.loadAudio(file);
      setBuffer(buf);
      detectSlices(threshold);
    } catch (e) {
      console.error("Error loading file:", e);
      alert("Failed to load audio file.");
    }
  };

  const detectSlices = useCallback((thresh: number) => {
    const newSlices = audioEngine.detectTransients(thresh);
    setSlices(newSlices);
  }, []);

  // Re-detect slices when threshold changes
  useEffect(() => {
    if (buffer) {
      detectSlices(threshold);
    }
  }, [threshold, buffer, detectSlices]);

  // Trigger Slice
  const triggerSlice = useCallback((index: number) => {
    if (!buffer || index >= slices.length) return;

    const start = slices[index];
    const end = slices[index + 1] || buffer.duration;

    audioEngine.playSlice(start, end, () => {
      // Optional: clear active slice after playback?
      // For visual feedback, we might want to keep it lit for a bit or clear it.
      // Here we clear it immediately on end, but for rapid fire it might flicker.
      // Let's rely on the setTimeouts or just let it be.
    });

    setActiveSlice(index);
    setTimeout(() => setActiveSlice(null), 100); // Visual feedback duration
  }, [buffer, slices]);

  // Keyboard Mapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const keyMap: { [key: string]: number } = {
        'q': 0, 'w': 1, 'e': 2, 'r': 3,
        'a': 4, 's': 5, 'd': 6, 'f': 7,
        'z': 8, 'x': 9, 'c': 10, 'v': 11
      };
      const index = keyMap[e.key.toLowerCase()];
      if (index !== undefined) {
        triggerSlice(index);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerSlice]);

  // MIDI Support
  useEffect(() => {
    const onMIDIMessage = (message: MIDIMessageEvent) => {
      const [command, note, velocity] = message.data || [];

      // Note On (usually 144-159)
      if (command >= 144 && command <= 159 && velocity > 0) {
        // C2 is MIDI note 36. Map 36 -> Slice 0, 37 -> Slice 1, etc.
        const sliceIndex = note - 36;
        if (sliceIndex >= 0) {
          triggerSlice(sliceIndex);
        }
      }
    };

    const onMIDISuccess = (midiAccess: MIDIAccess) => {
      console.log("MIDI Ready!");
      for (const input of midiAccess.inputs.values()) {
        input.onmidimessage = onMIDIMessage;
      }

      midiAccess.onstatechange = (e: Event) => {
        // Refresh inputs if devices change
        if (e instanceof MIDIConnectionEvent && e.port && e.port.type === 'input') {
          // Re-attach listeners just in case, or just let the loop handle it
          // Actually, inputs.values() is live or we can just re-iterate
          for (const input of midiAccess.inputs.values()) {
            input.onmidimessage = onMIDIMessage;
          }
        }
      };
    };

    const onMIDIFailure = () => {
      console.warn("Could not access MIDI devices.");
    };

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    }

    return () => {
      // Cleanup not strictly necessary for simple app, but good practice
    };
  }, [triggerSlice]);

  // Chaos Mode
  useEffect(() => {
    if (chaosMode && slices.length > 0) {
      const intervalTime = (60 / bpm) * 1000; // Quarter notes
      // Or maybe faster for chaos? Let's stick to BPM.

      chaosIntervalRef.current = window.setInterval(() => {
        const randomIndex = Math.floor(Math.random() * slices.length);
        triggerSlice(randomIndex);
      }, intervalTime);
    } else {
      if (chaosIntervalRef.current) {
        clearInterval(chaosIntervalRef.current);
        chaosIntervalRef.current = null;
      }
    }

    return () => {
      if (chaosIntervalRef.current) {
        clearInterval(chaosIntervalRef.current);
      }
    };
  }, [chaosMode, bpm, slices, triggerSlice]);

  // Drag & Drop
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Update Slice Position
  const updateSlice = (index: number, newTime: number) => {
    setSlices(prev => {
      const newSlices = [...prev];
      newSlices[index] = newTime;
      // Sort slices to keep them in order? 
      // If we sort, the index might change, confusing the drag.
      // For now, let's just update. If user drags slice 2 past slice 1, it becomes unordered.
      // Ideally we should sort on drag end, or prevent crossing.
      // Let's sort them to be safe, but this might cause "jumping" if indices swap.
      // Actually, for a sampler, indices are usually fixed to pads. 
      // If I drag slice 2, it should stay slice 2.
      // So no sorting.
      return newSlices;
    });
  };

  return (
    <div
      className={`min-h-screen bg-cyber-dark text-white p-8 font-mono transition-colors duration-300 relative overflow-hidden ${isDragging ? 'bg-cyber-panel ring-4 ring-cyber-primary' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* CRT Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 crt"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <Music className="text-cyber-primary animate-pulse" size={32} />
            <h1 className="text-4xl font-retro tracking-tighter neon-text">
              GLITCH<span className="text-cyber-primary">BLADE</span>
            </h1>
          </div>
          <div className="text-xs text-gray-500 font-retro">
            v2.0.0 // SYSTEM OVERRIDE
          </div>
        </header>

        {/* Main Interface */}
        <main>
          <div className="bg-black/40 p-4 rounded-xl border border-gray-800 backdrop-blur-sm">
            <WaveformDisplay
              buffer={buffer}
              slices={slices}
              activeSliceIndex={activeSlice}
              onSliceClick={triggerSlice}
              onSliceUpdate={updateSlice}
            />
          </div>

          <Controls
            threshold={threshold} setThreshold={setThreshold}
            bpm={bpm} setBpm={setBpm}
            chaosMode={chaosMode} setChaosMode={setChaosMode}
            volume={volume} setVolume={setVolume}
          />

          <EffectControls forceUpdate={() => setForceUpdate(n => n + 1)} />

          <PadGrid
            slices={slices}
            activeSliceIndex={activeSlice}
            onPadTrigger={triggerSlice}
          />
        </main>

        {/* Footer / Instructions */}
        <footer className="mt-12 text-center text-gray-600 text-sm">
          <p className="mb-2">DRAG & DROP AUDIO FILE TO LOAD</p>
          <p>KEYS: Q-R / A-F / Z-V TO TRIGGER SLICES</p>
        </footer>
      </div>

      {/* Upload Overlay (if no file) */}
      {!buffer && !isDragging && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none z-[60]">
          <div className="bg-cyber-panel p-8 rounded-xl border border-cyber-primary/50 flex flex-col items-center gap-4 animate-bounce">
            <Upload size={48} className="text-cyber-primary" />
            <p className="text-xl font-bold">DROP AUDIO FILE</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
