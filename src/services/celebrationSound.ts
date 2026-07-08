import { AudioPlayer, createAudioPlayer } from 'expo-audio';

const celebrationSource = require('../../assets/sounds/celebration.wav');

let player: AudioPlayer | null = null;

function getPlayer() {
  if (!player) {
    player = createAudioPlayer(celebrationSource);
  }
  return player;
}

export function playCelebrationSound() {
  try {
    const audioPlayer = getPlayer();
    audioPlayer.seekTo(0);
    audioPlayer.play();
  } catch {
    // Ignore playback failures so success UI never breaks.
  }
}
