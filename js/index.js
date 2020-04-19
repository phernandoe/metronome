console.log('Starting...');

class Metronome {

  constructor(oscType, freq) {

    this.freq = freq;
    this.on = false;
    this.volumeLevel = 0;

    this.audioCtx = new AudioContext();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.value = 0;
    this.gainNode.connect(this.audioCtx.destination);

    this.oscillator = this.audioCtx.createOscillator();
    this.oscillator.type = oscType;
    this.oscillator.frequency.value = this.freq; // value in hertz
    this.oscillator.connect(this.gainNode);

    this.oscillator.start();
    this.audioCtx.resume();
  }

  toggleSound() {
    this.audioCtx.resume();
    this.on = !this.on;
    this.on ? this.volumeLevel = 10 : this.volumeLevel = 0;
    this.gainNode.gain.value = this.volumeLevel;
  }

}

const m = new Metronome('sine', 880);

let on = false;
let intervalID;

function toggleSound() {
  on = !on;
  // console.log(on);

  if (on) {
    intervalID = setInterval("m.toggleSound()", 250);
    console.log(`Opening ${intervalID}`);
  } else {
    console.log(`Closing ${intervalID}`);
    clearInterval(intervalID);
  }

}

function increaseFreq() {
  m.oscillator.frequency.value++;
}

function decreaseFreq() {
  m.oscillator.frequency.value--;
}