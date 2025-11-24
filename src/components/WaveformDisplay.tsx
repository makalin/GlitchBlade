import React, { useEffect, useRef, useState } from 'react';

interface WaveformDisplayProps {
    buffer: AudioBuffer | null;
    slices: number[];
    activeSliceIndex: number | null;
    onSliceClick: (index: number) => void;
    onSliceUpdate: (index: number, newTime: number) => void;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ buffer, slices, activeSliceIndex, onSliceClick, onSliceUpdate }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [draggingSlice, setDraggingSlice] = useState<number | null>(null);
    const [hoverSlice, setHoverSlice] = useState<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !buffer) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const data = buffer.getChannelData(0);
        const step = Math.ceil(data.length / width);
        const amp = height / 2;

        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Draw waveform
        ctx.beginPath();
        ctx.strokeStyle = '#00ff9d';
        ctx.lineWidth = 1;

        for (let i = 0; i < width; i++) {
            let min = 1.0;
            let max = -1.0;
            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }
            ctx.moveTo(i, (1 + min) * amp);
            ctx.lineTo(i, (1 + max) * amp);
        }
        ctx.stroke();

        // Draw slices
        slices.forEach((time, index) => {
            const x = (time / buffer.duration) * width;

            // Highlight active slice region
            if (index === activeSliceIndex) {
                const nextTime = slices[index + 1] || buffer.duration;
                const nextX = (nextTime / buffer.duration) * width;
                ctx.fillStyle = 'rgba(0, 255, 157, 0.2)';
                ctx.fillRect(x, 0, nextX - x, height);
            }

            // Draw slice line
            ctx.beginPath();
            ctx.strokeStyle = (index === hoverSlice || index === draggingSlice) ? '#ffffff' : '#bd00ff';
            ctx.lineWidth = (index === hoverSlice || index === draggingSlice) ? 3 : 2;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();

            // Handle
            if (index === hoverSlice || index === draggingSlice) {
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(x, 10, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw slice number
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.fillText(index.toString(), x + 5, 25);
        });

    }, [buffer, slices, activeSliceIndex, hoverSlice, draggingSlice]);

    const getMouseInfo = (e: React.MouseEvent) => {
        if (!buffer || !canvasRef.current) return null;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / rect.width) * buffer.duration;
        return { x, time, width: rect.width };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (hoverSlice !== null) {
            setDraggingSlice(hoverSlice);
        } else {
            // If not clicking a slice, trigger playback
            const info = getMouseInfo(e);
            if (info) {
                for (let i = slices.length - 1; i >= 0; i--) {
                    if (slices[i] <= info.time) {
                        onSliceClick(i);
                        break;
                    }
                }
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const info = getMouseInfo(e);
        if (!info || !buffer) return;

        if (draggingSlice !== null) {
            // Update slice position
            // Clamp between prev and next slice? Or just free?
            // Let's allow free movement but maybe not past 0 or duration
            const newTime = Math.max(0, Math.min(buffer.duration, info.time));
            onSliceUpdate(draggingSlice, newTime);
            return;
        }

        // Check hover
        let foundHover = null;
        const thresholdPixels = 10;
        const thresholdTime = (thresholdPixels / info.width) * buffer.duration;

        for (let i = 0; i < slices.length; i++) {
            if (Math.abs(slices[i] - info.time) < thresholdTime) {
                foundHover = i;
                break;
            }
        }
        setHoverSlice(foundHover);
    };

    const handleMouseUp = () => {
        setDraggingSlice(null);
    };

    return (
        <div className="w-full h-48 bg-cyber-panel border border-cyber-primary/30 rounded-lg overflow-hidden relative">
            {!buffer && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Drop Audio File Here
                </div>
            )}
            <canvas
                ref={canvasRef}
                width={1000}
                height={200}
                className={`w-full h-full ${hoverSlice !== null ? 'cursor-ew-resize' : 'cursor-pointer'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />
        </div>
    );
};
