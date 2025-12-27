/**
 * Test system initialization
 * Enable this file in index.html to activate test recording/playback
 */

import TestRecorder from './test-recorder.js';
import TestPlayer from './test-player.js';
import Start from './start.js';

console.log('🧪 Test system initialized');

// Initialize test player (for error tracking)
TestPlayer.init();

// Wrap Start.handleClick for recording
Start.handleClick = TestRecorder.wrapEventHandler(
  'Start',
  'handleClick',
  Start.handleClick.bind(Start)
);

// Expose test controls globally for console access
window.TestRecorder = TestRecorder;
window.TestPlayer = TestPlayer;

console.log('Available commands:');
console.log('  TestRecorder.startRecording() - Start recording interactions');
console.log('  TestRecorder.stopRecording()  - Stop and save to localStorage');
console.log('  TestPlayer.startPlayback(0)   - Playback at normal speed');
console.log('  TestPlayer.startPlayback(10)  - Playback with +10 tick delay per command');
console.log('  TestPlayer.stopPlayback()     - Stop playback');
