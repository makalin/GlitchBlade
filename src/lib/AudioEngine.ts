export class AudioEngine {
    private context: AudioContext;
    private buffer: AudioBuffer | null = null;
    private activeSources: AudioBufferSourceNode[] = [];
    private masterCompressor: DynamicsCompressorNode;

    constructor() {
        this.context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

        // Master Compressor to prevent clipping
        this.masterCompressor = this.context.createDynamicsCompressor();
        this.masterCompressor.threshold.value = -10;
        this.masterCompressor.knee.value = 40;
        this.masterCompressor.ratio.value = 12;
        this.masterCompressor.attack.value = 0;
        this.masterCompressor.release.value = 0.25;

        this.masterCompressor.connect(this.context.destination);
    }

    async loadAudio(file: File): Promise<AudioBuffer> {
        const arrayBuffer = await file.arrayBuffer();
        this.buffer = await this.context.decodeAudioData(arrayBuffer);
        return this.buffer;
    }

    getBuffer(): AudioBuffer | null {
        return this.buffer;
    }

    // Effects State
    public bitCrusherEnabled: boolean = false;
    public bitDepth: number = 8; // 1-16
    public filterEnabled: boolean = false;
    public filterFreq: number = 2000;
    public filterRes: number = 0;
    public delayEnabled: boolean = false;
    public delayTime: number = 0.3;
    public delayFeedback: number = 0.4;

    public pitch: number = 1.0;
    public reverse: boolean = false;

    playSlice(start: number, end: number, onEnded?: () => void) {
        if (!this.buffer) return;

        const source = this.context.createBufferSource();
        source.buffer = this.buffer;

        // Pitch
        source.playbackRate.value = this.pitch;

        // Reverse Logic (Basic: if reverse, play from end to start? No, WebAudio doesn't support negative rate easily.
        // We must reverse the buffer. Doing this real-time is expensive. 
        // Optimization: If reverse is on, we use a reversed version of the buffer? 
        // Or just reverse the specific slice? 
        // Let's try to reverse the buffer on the fly if needed, or just warn it's expensive.
        // Better: Create a reversed buffer once when loading? No, memory.
        // Let's just reverse the playback by creating a small buffer for the slice and reversing it.
        let offset = start;
        const duration = end - start;

        if (this.reverse) {
            // Create a slice buffer
            const channels = this.buffer.numberOfChannels;
            const frameCount = Math.ceil(duration * this.buffer.sampleRate);
            const sliceBuffer = this.context.createBuffer(channels, frameCount, this.buffer.sampleRate);

            for (let i = 0; i < channels; i++) {
                const channelData = this.buffer.getChannelData(i);
                const sliceData = sliceBuffer.getChannelData(i);
                const startSample = Math.floor(start * this.buffer.sampleRate);
                for (let j = 0; j < frameCount; j++) {
                    sliceData[j] = channelData[startSample + (frameCount - 1 - j)];
                }
            }
            source.buffer = sliceBuffer;
            offset = 0; // Play from start of new buffer
        }

        // Effects Chain
        let lastNode: AudioNode = source;

        // BitCrusher (ScriptProcessor or AudioWorklet - using ScriptProcessor for simplicity/compatibility for now, though deprecated)
        if (this.bitCrusherEnabled) {
            const bufferSize = 4096;
            const crusher = this.context.createScriptProcessor(bufferSize, 1, 1);
            crusher.onaudioprocess = (e) => {
                const input = e.inputBuffer.getChannelData(0);
                const output = e.outputBuffer.getChannelData(0);
                const step = Math.pow(0.5, this.bitDepth);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.round(input[i] / step) * step;
                }
            };
            lastNode.connect(crusher);
            lastNode = crusher;
        }

        // Filter
        if (this.filterEnabled) {
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = this.filterFreq;
            filter.Q.value = this.filterRes;
            lastNode.connect(filter);
            lastNode = filter;
        }

        // Delay
        if (this.delayEnabled) {
            const delay = this.context.createDelay();
            delay.delayTime.value = this.delayTime;

            const feedback = this.context.createGain();
            feedback.gain.value = this.delayFeedback;

            const delayGain = this.context.createGain();
            delayGain.gain.value = 0.5; // Wet mix

            // Dry signal path
            // We need to split the signal. 
            // Source -> [Split] -> Dry -> Destination
            //                   -> Delay -> Feedback -> Delay -> DelayGain -> Destination

            // Complex routing. Let's simplify: 
            // Source -> Filter -> [Split] -> Master
            //                             -> Delay -> Feedback -> Delay -> Master

            // We need a master gain for this voice
            const voiceMaster = this.context.createGain();
            lastNode.connect(voiceMaster);

            lastNode.connect(delay);
            delay.connect(feedback);
            feedback.connect(delay);
            delay.connect(voiceMaster); // Add delayed signal to voice master

            lastNode = voiceMaster;
        }

        // Ensure context is running (fixes "not working fast" if suspended)
        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        const gainNode = this.context.createGain();
        // Lower individual voice gain to prevent summation clipping
        gainNode.gain.value = 0.6;

        lastNode.connect(gainNode);

        // Connect to master compressor instead of direct destination
        gainNode.connect(this.masterCompressor);

        // Micro-fades to prevent clicks
        const now = this.context.currentTime;
        const attack = 0.005;
        const release = 0.005;

        // Ensure gain is 0 initially
        gainNode.gain.setValueAtTime(0, now);
        // Ramp up
        gainNode.gain.linearRampToValueAtTime(1, now + attack);
        // Ramp down at end
        // Note: duration is based on playback rate if we were using it for pitch, but here we set playbackRate on source.
        // The source.start duration argument is in "buffer time", but audio scheduling is in "context time".
        // If pitch != 1, the actual duration changes.
        const actualDuration = duration / this.pitch;

        gainNode.gain.setValueAtTime(1, now + actualDuration - release);
        gainNode.gain.linearRampToValueAtTime(0, now + actualDuration);

        // Start
        source.start(0, offset, duration);

        source.onended = () => {
            const index = this.activeSources.indexOf(source);
            if (index > -1) {
                this.activeSources.splice(index, 1);
            }
            if (onEnded) onEnded();
        };

        this.activeSources.push(source);
    }

    stopAll() {
        this.activeSources.forEach(source => {
            try {
                source.stop();
            } catch {
                // Ignore errors if already stopped
            }
        });
        this.activeSources = [];
    }

    // Simple transient detection based on amplitude threshold
    detectTransients(threshold: number = 0.1, minSliceDuration: number = 0.1): number[] {
        if (!this.buffer) return [];

        const rawData = this.buffer.getChannelData(0); // Use first channel
        const sampleRate = this.buffer.sampleRate;
        const slices: number[] = [0]; // Always start at 0

        let lastSliceTime = 0;
        // Window size for RMS calculation (e.g., 5ms)
        const windowSize = Math.floor(sampleRate * 0.005);

        for (let i = 0; i < rawData.length; i += windowSize) {
            // Calculate RMS of the window
            let sum = 0;
            for (let j = 0; j < windowSize && i + j < rawData.length; j++) {
                sum += rawData[i + j] * rawData[i + j];
            }
            const rms = Math.sqrt(sum / windowSize);

            if (rms > threshold) {
                const currentTime = i / sampleRate;
                if (currentTime - lastSliceTime > minSliceDuration) {
                    slices.push(currentTime);
                    lastSliceTime = currentTime;
                }
            }
        }

        // Ensure the last slice goes to the end if not already covered
        // Actually, slices are just start points. The last slice ends at buffer.duration.

        return slices;
    }
}

export const audioEngine = new AudioEngine();
