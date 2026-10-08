#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = BASE_DIR / "assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

# 1. Scene 1 SVG (Intro & Hook)
s1_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
  <defs>
    <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070c18" />
      <stop offset="50%" stop-color="#0a1226" />
      <stop offset="100%" stop-color="#050812" />
    </linearGradient>
    <radialGradient id="glow1" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#f6ad55" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#f6ad55" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f6ad55" />
      <stop offset="100%" stop-color="#ed8936" />
    </linearGradient>
  </defs>

  <rect width="720" height="1280" fill="url(#bg1)" />
  <circle cx="360" cy="380" r="320" fill="url(#glow1)" />

  <!-- Top Badge -->
  <rect x="180" y="80" width="360" height="42" rx="21" fill="#131c31" stroke="#f6ad55" stroke-width="1.5" />
  <text x="360" y="107" fill="#f6ad55" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="700" letter-spacing="1" text-anchor="middle">⚡ PROJECT HER v2.0</text>

  <!-- Title Card -->
  <text x="360" y="185" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="38" font-weight="800" text-anchor="middle">Autonomous AI</text>
  <text x="360" y="235" fill="url(#gold)" font-family="-apple-system, system-ui, sans-serif" font-size="38" font-weight="800" text-anchor="middle">Video Studio</text>
  
  <text x="360" y="285" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="18" text-anchor="middle">From Raw Idea to Viral Vertical Short in &lt;60s</text>

  <!-- Showcase Box -->
  <rect x="50" y="340" width="620" height="580" rx="24" fill="#0c1322" stroke="#1f2d4a" stroke-width="2" />
  
  <!-- Glowing Play Orb -->
  <circle cx="360" cy="500" r="75" fill="url(#gold)" />
  <polygon points="348,470 348,530 388,500" fill="#070c18" />

  <!-- Dynamic Hook Pill -->
  <rect x="90" y="620" width="540" height="60" rx="14" fill="#141e34" stroke="#2b3b5e" stroke-width="1.2" />
  <text x="360" y="656" fill="#f7fafc" font-family="-apple-system, system-ui, sans-serif" font-size="19" font-weight="600" text-anchor="middle">"The Autonomous Developer in 2026"</text>

  <!-- Feature List -->
  <rect x="90" y="710" width="540" height="44" rx="10" fill="#0e172a" />
  <text x="120" y="738" fill="#48bb78" font-family="-apple-system, system-ui, sans-serif" font-size="16" font-weight="bold">✓</text>
  <text x="150" y="738" fill="#e2e8f0" font-family="-apple-system, system-ui, sans-serif" font-size="16">Remotion 4.0 React Compositor Engine</text>

  <rect x="90" y="765" width="540" height="44" rx="10" fill="#0e172a" />
  <text x="120" y="793" fill="#48bb78" font-family="-apple-system, system-ui, sans-serif" font-size="16" font-weight="bold">✓</text>
  <text x="150" y="793" fill="#e2e8f0" font-family="-apple-system, system-ui, sans-serif" font-size="16">Word-Aligned Neural Voice Narration</text>

  <rect x="90" y="820" width="540" height="44" rx="10" fill="#0e172a" />
  <text x="120" y="848" fill="#48bb78" font-family="-apple-system, system-ui, sans-serif" font-size="16" font-weight="bold">✓</text>
  <text x="150" y="848" fill="#e2e8f0" font-family="-apple-system, system-ui, sans-serif" font-size="16">High-Retention Dynamic Motion Transitions</text>

  <!-- Bottom Spec Bar -->
  <rect x="50" y="960" width="620" height="90" rx="18" fill="#11192c" stroke="#1f2d4a" stroke-width="1" />
  <text x="205" y="1000" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="14" text-anchor="middle">ASPECT RATIO</text>
  <text x="205" y="1028" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="18" font-weight="700" text-anchor="middle">9:16 Vertical</text>

  <line x1="360" y1="975" x2="360" y2="1035" stroke="#253554" stroke-width="1.5" />

  <text x="515" y="1000" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="14" text-anchor="middle">FRAME RESOLUTION</text>
  <text x="515" y="1028" fill="#f6ad55" font-family="-apple-system, system-ui, sans-serif" font-size="18" font-weight="700" text-anchor="middle">1080 x 1920</text>
</svg>"""

# 2. Scene 2 SVG (Architecture Pipeline)
s2_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070c18" />
      <stop offset="50%" stop-color="#0d162d" />
      <stop offset="100%" stop-color="#050812" />
    </linearGradient>
    <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#63b3ed" />
      <stop offset="100%" stop-color="#3182ce" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f6ad55" />
      <stop offset="100%" stop-color="#ed8936" />
    </linearGradient>
  </defs>

  <rect width="720" height="1280" fill="url(#bg2)" />

  <!-- Header -->
  <rect x="180" y="80" width="360" height="42" rx="21" fill="#131c31" stroke="#63b3ed" stroke-width="1.5" />
  <text x="360" y="107" fill="#63b3ed" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="700" letter-spacing="1" text-anchor="middle">⚙ MULTI-AGENT PIPELINE</text>

  <text x="360" y="185" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="34" font-weight="800" text-anchor="middle">Four-Stage Autonomous</text>
  <text x="360" y="230" fill="url(#blueGlow)" font-family="-apple-system, system-ui, sans-serif" font-size="34" font-weight="800" text-anchor="middle">Orchestration Flow</text>

  <!-- Step 1 -->
  <rect x="50" y="290" width="620" height="110" rx="18" fill="#0d1527" stroke="#243452" stroke-width="1.5" />
  <circle cx="110" cy="345" r="30" fill="#1a2744" stroke="#63b3ed" stroke-width="2" />
  <text x="110" y="352" fill="#63b3ed" font-family="-apple-system, system-ui, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">01</text>
  <text x="165" y="335" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="20" font-weight="700">Script &amp; Storyboard Agent</text>
  <text x="165" y="365" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="15">LLM deconstructs input into timed narrative beats</text>

  <!-- Step 2 -->
  <rect x="50" y="420" width="620" height="110" rx="18" fill="#0d1527" stroke="#243452" stroke-width="1.5" />
  <circle cx="110" cy="475" r="30" fill="#1a2744" stroke="#f6ad55" stroke-width="2" />
  <text x="110" y="482" fill="#f6ad55" font-family="-apple-system, system-ui, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">02</text>
  <text x="165" y="465" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="20" font-weight="700">Neural Voice &amp; Word-Sync</text>
  <text x="165" y="495" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="15">Generates voiceover and millisecond SRT timestamps</text>

  <!-- Step 3 -->
  <rect x="50" y="550" width="620" height="110" rx="18" fill="#0d1527" stroke="#243452" stroke-width="1.5" />
  <circle cx="110" cy="605" r="30" fill="#1a2744" stroke="#9f7aea" stroke-width="2" />
  <text x="110" y="612" fill="#9f7aea" font-family="-apple-system, system-ui, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">03</text>
  <text x="165" y="595" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="20" font-weight="700">Visual Asset Synthesis</text>
  <text x="165" y="625" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="15">Automated image generation matching visual themes</text>

  <!-- Step 4 -->
  <rect x="50" y="680" width="620" height="110" rx="18" fill="#0d1527" stroke="#319795" stroke-width="1.5" />
  <circle cx="110" cy="735" r="30" fill="#1a2744" stroke="#38b2ac" stroke-width="2" />
  <text x="110" y="742" fill="#38b2ac" font-family="-apple-system, system-ui, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">04</text>
  <text x="165" y="725" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="20" font-weight="700">Remotion React Compositor</text>
  <text x="165" y="755" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="15">60 FPS programmatic canvas stitching &amp; MP4 render</text>

  <!-- Live Pulse Stats Card -->
  <rect x="50" y="830" width="620" height="230" rx="22" fill="#10192e" stroke="#f6ad55" stroke-width="1.5" />
  <text x="360" y="875" fill="#f6ad55" font-family="-apple-system, system-ui, sans-serif" font-size="18" font-weight="700" letter-spacing="1" text-anchor="middle">PRODUCTION LATENCY TARGET</text>
  <text x="360" y="945" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="52" font-weight="800" text-anchor="middle">&lt; 60 SECONDS</text>
  <text x="360" y="995" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="16" text-anchor="middle">Complete end-to-end rendering on cloud GPU / CPU</text>
  <text x="360" y="1035" fill="#48bb78" font-family="monospace" font-size="15" text-anchor="middle">● PIPELINE MONITOR: 100% HEALTHY</text>
</svg>"""

# 3. Scene 3 SVG (Render Showcase & Download)
s3_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">
  <defs>
    <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070c18" />
      <stop offset="50%" stop-color="#0a152d" />
      <stop offset="100%" stop-color="#050812" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f6ad55" />
      <stop offset="100%" stop-color="#ed8936" />
    </linearGradient>
  </defs>

  <rect width="720" height="1280" fill="url(#bg3)" />

  <!-- Success Badge -->
  <rect x="180" y="80" width="360" height="42" rx="21" fill="#132a22" stroke="#48bb78" stroke-width="1.5" />
  <text x="360" y="107" fill="#48bb78" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="700" letter-spacing="1" text-anchor="middle">✔ COMPOSITION COMPLETE</text>

  <text x="360" y="185" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="36" font-weight="800" text-anchor="middle">Production-Ready</text>
  <text x="360" y="235" fill="url(#gold)" font-family="-apple-system, system-ui, sans-serif" font-size="36" font-weight="800" text-anchor="middle">MP4 Video Output</text>

  <!-- Video Preview Window Simulation -->
  <rect x="60" y="290" width="600" height="660" rx="24" fill="#0d1424" stroke="#253554" stroke-width="2" />
  
  <rect x="90" y="320" width="540" height="360" rx="16" fill="#050811" />
  <!-- Waveform simulation inside video frame -->
  <rect x="120" y="480" width="12" height="40" rx="6" fill="#f6ad55" />
  <rect x="145" y="460" width="12" height="80" rx="6" fill="#f6ad55" />
  <rect x="170" y="440" width="12" height="120" rx="6" fill="#f6ad55" />
  <rect x="195" y="430" width="12" height="140" rx="6" fill="#63b3ed" />
  <rect x="220" y="450" width="12" height="100" rx="6" fill="#63b3ed" />
  <rect x="245" y="470" width="12" height="60" rx="6" fill="#63b3ed" />
  <rect x="270" y="420" width="12" height="160" rx="6" fill="#f6ad55" />
  <rect x="295" y="410" width="12" height="180" rx="6" fill="#f6ad55" />
  <rect x="320" y="440" width="12" height="120" rx="6" fill="#f6ad55" />
  <rect x="345" y="460" width="12" height="80" rx="6" fill="#63b3ed" />
  <rect x="370" y="430" width="12" height="140" rx="6" fill="#63b3ed" />
  <rect x="395" y="420" width="12" height="160" rx="6" fill="#63b3ed" />
  <rect x="420" y="450" width="12" height="100" rx="6" fill="#f6ad55" />
  <rect x="445" y="470" width="12" height="60" rx="6" fill="#f6ad55" />
  <rect x="470" y="440" width="12" height="120" rx="6" fill="#f6ad55" />
  <rect x="495" y="460" width="12" height="80" rx="6" fill="#63b3ed" />
  <rect x="520" y="480" width="12" height="40" rx="6" fill="#63b3ed" />
  <rect x="545" y="470" width="12" height="60" rx="6" fill="#63b3ed" />
  <rect x="570" y="485" width="12" height="30" rx="6" fill="#f6ad55" />

  <text x="360" y="380" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="22" font-weight="700" text-anchor="middle">Remotion React Player</text>
  <text x="360" y="640" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="15" text-anchor="middle">Synced Subtitles: "Rest your sleepy head..."</text>

  <!-- Result Details -->
  <text x="360" y="730" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="24" font-weight="700" text-anchor="middle">Project HER: Native Studio Integration</text>
  <text x="360" y="765" fill="#cbd5e0" font-family="-apple-system, system-ui, sans-serif" font-size="16" text-anchor="middle">Embedded directly inside portfolio with interactive controls</text>

  <!-- Download Button Simulation -->
  <rect x="160" y="820" width="400" height="64" rx="32" fill="url(#gold)" />
  <text x="360" y="860" fill="#070c18" font-family="-apple-system, system-ui, sans-serif" font-size="20" font-weight="800" text-anchor="middle">⬇ Download MP4 Video</text>

  <!-- Spec Footer -->
  <rect x="60" y="990" width="600" height="90" rx="18" fill="#0f182c" stroke="#253554" stroke-width="1" />
  <text x="180" y="1030" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="14" text-anchor="middle">BITRATE</text>
  <text x="180" y="1058" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="17" font-weight="700" text-anchor="middle">H.264 High</text>

  <line x1="300" y1="1005" x2="300" y2="1065" stroke="#22324e" stroke-width="1.5" />

  <text x="420" y="1030" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="14" text-anchor="middle">AUDIO</text>
  <text x="420" y="1058" fill="#ffffff" font-family="-apple-system, system-ui, sans-serif" font-size="17" font-weight="700" text-anchor="middle">44.1kHz AAC</text>

  <line x1="540" y1="1005" x2="540" y2="1065" stroke="#22324e" stroke-width="1.5" />

  <text x="600" y="1030" fill="#a0aec0" font-family="-apple-system, system-ui, sans-serif" font-size="14" text-anchor="middle">STATUS</text>
  <text x="600" y="1058" fill="#48bb78" font-family="-apple-system, system-ui, sans-serif" font-size="17" font-weight="700" text-anchor="middle">Ready</text>
</svg>"""

with open(ASSETS_DIR / "scene1.svg", "w") as f:
    f.write(s1_svg)
with open(ASSETS_DIR / "scene2.svg", "w") as f:
    f.write(s2_svg)
with open(ASSETS_DIR / "scene3.svg", "w") as f:
    f.write(s3_svg)

print("SVGs written successfully.")
