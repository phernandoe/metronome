class Metronome {

  constructor() {
    this.audioContext = new AudioContext();
    this.unlocked = false;
    this.isPlaying = false;
    this.startTime;
    this.current16thNote;
    this.tempo = 120.0;
    this.lookahead = 25.0;
    this.scheduleAheadTime = 0.1;
    this.nextNoteTime = 0.0;
    this.noteResolution = 0;
    this.noteLength = 0.05;    
    this.notesInQueue = [];
    this.timerWorker = new Worker('js/metronomeWorker.js');
  }

  nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat;
    this.current16thNote++;
    if (this.current16thNote === 16) this.current16thNote = 0;
  }

  scheduleNote( beatNumber, time) {
    this.notesInQueue.push( { note: beatNumber, time: time});

    if ( (this.noteResolution === 1) && (beatNumber%2)) return;
    if ( (this.noteResolution === 2) && (beatNumber%4)) return;

    const osc = this.audioContext.createOscillator();
    osc.connect( this.audioContext.destination );

    console.log(beatNumber);

    if (beatNumber % 16 === 0) osc.frequency.value = 880.0;
    else if (beatNumber % 4 === 0) osc.frequency.value = 440.0;
    else osc.frequency.value = 0.0;

    osc.start( time );
    osc.stop( time + this.noteLength );
  }

  scheduler() {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime ) {
      this.scheduleNote( this.current16thNote, this.nextNoteTime );
      this.nextNote();
    }
  }

  play() {
    if (!this.unlocked) {
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const node = this.audioContext.createBufferSource();
      node.buffer = buffer;
      node.start(0);
      this.unlocked = true;
    }

    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      document.getElementById('toggle').innerText = 'Playing';
      this.current16thNote = 0;
      this.nextNoteTime = this.audioContext.currentTime;
      this.timerWorker.postMessage('start');
      return "stop";
    } else {
      document.getElementById('toggle').innerText = 'Paused';
      this.timerWorker.postMessage('stop');
      return "play";
    }

  }

}

const m = new Metronome();
const tempoDisplay = document.getElementById('tempo-display');

window.addEventListener('load', init);

document.getElementById('tempo-header').innerText = m.tempo;

document.addEventListener('keydown', (e) => {
  console.log(e.keyCode);
  if (e.keyCode === 32) toggleSound(); // Space to toggle sound
  else if (e.keyCode === 39) changeTempo(m.tempo += 5); // Right arrow key to increase tempo
  else if (e.keyCode === 37) changeTempo(m.tempo -= 5); // Left arrow key to decrease tempo
});

function init() {
  m.timerWorker.onmessage = e => {
    if ((e.data) === 'tick') m.scheduler();
    else console.log(`Message: ${e.data}`);
  }
}

function changeTempo(tempo) {

  if (tempo > 160) tempo = 160;
  if (tempo < 30) tempo = 30;

  m.tempo = tempo;
  document.getElementById('tempo-header').innerText = tempo;
}

function toggleSound() {
  m.play();
}