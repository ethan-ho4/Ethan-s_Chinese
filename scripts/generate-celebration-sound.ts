import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_RATE = 44100;
const OUTPUT_PATH = path.join(__dirname, '../assets/sounds/celebration.wav');

const NOTES = [
  { freq: 523.25, start: 0, duration: 0.22 },
  { freq: 659.25, start: 0.16, duration: 0.22 },
  { freq: 783.99, start: 0.32, duration: 0.34 },
];

function writeWav(filePath: string, samples: Float32Array) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = samples.length * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}

function renderCelebrationSound() {
  const totalDuration = 0.72;
  const sampleCount = Math.floor(SAMPLE_RATE * totalDuration);
  const samples = new Float32Array(sampleCount);

  for (const note of NOTES) {
    const startIndex = Math.floor(note.start * SAMPLE_RATE);
    const endIndex = Math.min(sampleCount, startIndex + Math.floor(note.duration * SAMPLE_RATE));

    for (let i = startIndex; i < endIndex; i += 1) {
      const t = (i - startIndex) / SAMPLE_RATE;
      const envelope = Math.exp(-t * 7.5) * (1 - Math.exp(-t * 120));
      const fundamental = Math.sin(2 * Math.PI * note.freq * t);
      const harmonic = 0.22 * Math.sin(2 * Math.PI * note.freq * 2 * t);
      const sample = (fundamental + harmonic) * envelope * 0.35;
      samples[i] += sample;
    }
  }

  return samples;
}

writeWav(OUTPUT_PATH, renderCelebrationSound());
console.log(`Wrote ${OUTPUT_PATH}`);
