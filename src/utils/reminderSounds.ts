// Web Audio API Synthesizer for 10 Pediatric Reminder Sounds
// Works reliably across mobile and desktop without external assets or network lag.

export type ReminderSoundId =
  | 'gentle_bell'
  | 'harp'
  | 'marimba'
  | 'lullaby'
  | 'chime'
  | 'xylophone'
  | 'flute'
  | 'pulse'
  | 'echo_drop'
  | 'celeste';

export interface ReminderSoundOption {
  id: ReminderSoundId;
  name: string;
  category: string;
  description: string;
  badge: string;
}

export const REMINDER_SOUND_OPTIONS: ReminderSoundOption[] = [
  {
    id: 'gentle_bell',
    name: 'Sininho Suave (Padrão)',
    category: 'Sinos',
    description: 'Toque delicado com dois sinos harmônicos e eco suave',
    badge: 'Padrão',
  },
  {
    id: 'harp',
    name: 'Harpa Pediátrica',
    category: 'Melódico',
    description: 'Arpejo ascendente e calmo em tom maior',
    badge: 'Acolhedor',
  },
  {
    id: 'marimba',
    name: 'Marimba Calma',
    category: 'Percussão',
    description: 'Notas de madeira aveludadas e alegres',
    badge: 'Suave',
  },
  {
    id: 'lullaby',
    name: 'Canção de Ninar (Bebê)',
    category: 'Infantil',
    description: 'Melodia relaxante inspirada em caixinha de música',
    badge: 'Bebê',
  },
  {
    id: 'chime',
    name: 'Carrilhão Elegante',
    category: 'Sinos',
    description: 'Tríade brilhante e cristalina de alta definição',
    badge: 'Clássico',
  },
  {
    id: 'xylophone',
    name: 'Xilofone Infantil',
    category: 'Infantil',
    description: 'Batidas vibrantes e divertidas de xilofone',
    badge: 'Divertido',
  },
  {
    id: 'flute',
    name: 'Flauta Serena',
    category: 'Sopro',
    description: 'Onda sinusoidal pura com vibrato suave',
    badge: 'Sereno',
  },
  {
    id: 'pulse',
    name: 'Alerta Pediátrico',
    category: 'Alerta',
    description: 'Bip duplo moderno, nítido e profissional',
    badge: 'Destaque',
  },
  {
    id: 'echo_drop',
    name: 'Gota Cristalina',
    category: 'Natureza',
    description: 'Som límpido de gota d’água com reverberação cristalina',
    badge: 'Relaxante',
  },
  {
    id: 'celeste',
    name: 'Caixa de Música Encantada',
    category: 'Melódico',
    description: 'Brilho celestial com harmônicos infantis cintilantes',
    badge: 'Brilhante',
  },
];

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

export function playReminderSound(soundId: ReminderSoundId = 'gentle_bell'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime + 0.03;

    switch (soundId) {
      case 'gentle_bell': {
        // Double gentle bell chime (C6 and G6)
        playBellTone(ctx, 1046.5, now, 0.9, 0.4);
        playBellTone(ctx, 1567.98, now + 0.22, 1.1, 0.45);
        break;
      }
      case 'harp': {
        // Ascending harp arpeggio: C5, E5, G5, C6
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          playWarmPluck(ctx, freq, now + idx * 0.14, 0.8, 0.35);
        });
        break;
      }
      case 'marimba': {
        // Warm marimba notes: F4, A4, C5, F5
        const notes = [349.23, 440.0, 523.25, 698.46];
        notes.forEach((freq, idx) => {
          playMarimbaTone(ctx, freq, now + idx * 0.12, 0.5, 0.4);
        });
        break;
      }
      case 'lullaby': {
        // Baby lullaby music box: G5, E5, G5, C6
        const notes = [783.99, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          playMusicBoxNote(ctx, freq, now + idx * 0.22, 0.9, 0.38);
        });
        break;
      }
      case 'chime': {
        // Resonant wind chime triad
        playBellTone(ctx, 1174.66, now, 1.2, 0.35); // D6
        playBellTone(ctx, 1479.98, now + 0.12, 1.2, 0.35); // F#6
        playBellTone(ctx, 1760.0, now + 0.25, 1.5, 0.4); // A6
        break;
      }
      case 'xylophone': {
        // Cheerful bright xylophone: C5, G5, E5, C6
        const freqs = [523.25, 783.99, 659.25, 1046.5];
        freqs.forEach((freq, idx) => {
          playXylophoneHit(ctx, freq, now + idx * 0.13, 0.4, 0.4);
        });
        break;
      }
      case 'flute': {
        // Sweet flute phrase with gentle vibrato
        playFluteTone(ctx, 587.33, now, 0.4, 0.35); // D5
        playFluteTone(ctx, 783.99, now + 0.3, 0.8, 0.38); // G5
        break;
      }
      case 'pulse': {
        // Dual medical pediatric pulse alert
        playPulseTone(ctx, 880, now, 0.15, 0.4);
        playPulseTone(ctx, 1174.66, now + 0.18, 0.25, 0.45);
        break;
      }
      case 'echo_drop': {
        // Water drop pitch drop + shimmer
        playWaterDrop(ctx, now, 0.35);
        playBellTone(ctx, 1318.51, now + 0.2, 0.9, 0.3);
        break;
      }
      case 'celeste': {
        // Music box celestial triad with high sparkle
        playMusicBoxNote(ctx, 1046.5, now, 1.0, 0.35); // C6
        playMusicBoxNote(ctx, 1318.51, now + 0.14, 1.0, 0.35); // E6
        playMusicBoxNote(ctx, 1567.98, now + 0.28, 1.2, 0.38); // G6
        playMusicBoxNote(ctx, 2093.0, now + 0.42, 1.4, 0.4); // C7
        break;
      }
      default: {
        playBellTone(ctx, 1046.5, now, 0.9, 0.4);
        playBellTone(ctx, 1567.98, now + 0.22, 1.1, 0.45);
      }
    }
  } catch (err) {
    console.warn('Não foi possível reproduzir o som do lembrete:', err);
  }
}

// Tone generator helpers

function playBellTone(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const oscHarmonic = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  oscHarmonic.type = 'sine';
  oscHarmonic.frequency.setValueAtTime(freq * 2.02, startTime); // subtle metallic detune

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  oscHarmonic.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  oscHarmonic.start(startTime);
  osc.stop(startTime + duration + 0.05);
  oscHarmonic.stop(startTime + duration + 0.05);
}

function playWarmPluck(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function playMarimbaTone(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(freq * 3, startTime);
  filter.frequency.exponentialRampToValueAtTime(freq, startTime + duration);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function playMusicBoxNote(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, startTime);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 3, startTime); // 3rd harmonic creates music box tinkle

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + duration + 0.05);
  osc2.stop(startTime + duration + 0.05);
}

function playXylophoneHit(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const click = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, startTime);

  click.type = 'sine';
  click.frequency.setValueAtTime(freq * 4, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  click.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  click.start(startTime);
  osc.stop(startTime + duration + 0.05);
  click.stop(startTime + 0.04);
}

function playFluteTone(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const vibrato = ctx.createOscillator();
  const vibratoGain = ctx.createGain();
  const gain = ctx.createGain();

  vibrato.frequency.setValueAtTime(5, startTime); // 5Hz vibrato
  vibratoGain.gain.setValueAtTime(6, startTime);

  vibrato.connect(vibratoGain);
  vibratoGain.connect(osc.frequency);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.08);
  gain.gain.linearRampToValueAtTime(volume * 0.7, startTime + duration * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  vibrato.start(startTime);
  osc.start(startTime);
  vibrato.stop(startTime + duration + 0.05);
  osc.stop(startTime + duration + 0.05);
}

function playPulseTone(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function playWaterDrop(ctx: AudioContext, startTime: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1400, startTime);
  osc.frequency.exponentialRampToValueAtTime(500, startTime + 0.12);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + 0.25);
}
