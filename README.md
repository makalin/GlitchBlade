# **GlitchBlade 🎹**

**A cyberpunk-inspired browser-based audio sampler, auto-chopper, and generative sequencer.**  
GlitchBlade allows creators to load audio or video files, automatically slice them based on algorithmic transient detection, and perform them live via Keyboard or MIDI. It features a unique **Chaos Mode** for generative sound design.

## **✨ Key Features**

* **Universal Import**: Drag & drop .wav, .mp3, or .mp4 video files (audio is extracted automatically).  
* **Auto-Cue Slicing**: Smart transient detection algorithm chops samples instantly.  
* **Visual Interface**: Real-time canvas rendering of waveforms and slice regions.  
* **Performance Ready**:  
  * **Keyboard**: Map ASDF / WERY rows to slices.  
  * **MIDI Support**: Plug & Play with any MIDI controller (maps chromatically from C2).  
* **Chaos Mode**: A generative sequencer that triggers random slices at variable tempos to create unique textures.

## **🚀 Quick Start**

1. **Clone the repository**  
   git clone \[https://github.com/frangedev/glitch-blade.git\](https://github.com/frangedev/glitch-blade.git)

2. **Install dependencies**  
   cd glitch-blade  
   npm install

3. **Run the app**  
   npm run dev

## **🎮 Controls**

| Action | Control |
| :---- | :---- |
| **Load File** | Click the upload box or drag & drop a file. |
| **Trigger Slice** | Click Pads / Keys A, W, S, E, D... / MIDI Keys. |
| **Adjust Sensitivity** | Use the "Threshold" slider to detect more/fewer cuts. |
| **Chaos Mode** | Click "Start Chaos Seq" for random looping. |
| **Tempo** | Adjust BPM slider to change the Chaos sequence speed. |

## **🛠 Technology Stack**

* **Frontend**: React 18, TypeScript  
* **Audio Engine**: Native Web Audio API (AudioBuffer, AnalyserNode)  
* **Styling**: Tailwind CSS  
* **Icons**: Lucide React

*Created by Mehmet T. AKALIN. Licensed under MIT.*
