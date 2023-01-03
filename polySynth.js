import {el} from '@elemaudio/core';
import {default as core} from '@elemaudio/node-renderer';

let voices = [
  {gate: 0.0, freq: 440, key: "v1"},
  {gate: 0.0, freq: 440, key: "v2"},
  {gate: 0.0, freq: 440, key: "v3"},
  {gate: 0.0, freq: 440, key: "v4"},
  {gate: 0.0, freq: 440, key: "v5"},
  {gate: 0.0, freq: 440, key: "v6"},
  {gate: 0.0, freq: 440, key: "v7"},
  {gate: 0.0, freq: 440, key: "v8"},
]

let nextVoice = 0; 

const updateVoiceState = e => {
  if (e.hasOwnProperty("type") ) {
    console.log(e);

    if (e.type === 'noteOn') {
      voices[nextVoice].gate = 1;
      voices[nextVoice].freq = e.noteFrequency;
  
      if (++nextVoice >= voices.length) {
        nextVoice -= voices.length;
      }
    }

    if (e.type === 'noteOff') {
      voices.forEach((voice) => {
        if (voice.freq === e.noteFrequency) {
          voice.gate = 0.0;
        }
      })
    }
  }
}

const synthVoice = voice => {
  const { gate, freq, key } = voice

  const _gate = el.const({key: `${key}:gate`, value: 0.2 * gate})
  let env = el.adsr(4.0, 1.0, 0.4, 2.0, _gate)

  return el.mul(
    env,
    el.blepsaw(
      el.const({key: `${key}:freq`, value: freq}),
    )
  )
}

const modulate = (x, rate, amount) => {
  return el.add(x, el.mul(amount, el.cycle(rate)))
}

core.on('load', () => {

  core.on('midi', e => {
    updateVoiceState(e)

    let out = el.add(...voices.map(synthVoice));
    let filtered = el.lowpass(modulate(800, 3, 400), 1.4, out)
    let delayed = el.delay({size: 44100}, el.ms2samps(500), 0.6, filtered)
    let wetdry = el.add(filtered, delayed)
    core.render(wetdry, wetdry);
  });
});

core.initialize();