import {el} from '@elemaudio/core';
import {default as core} from '@elemaudio/node-renderer';

const kick = './samples/Kick.wav';
const snare = './samples/Snare.wav';
const hat = './samples/Hat.wav';
const rim = './samples/Rim.wav';
const clap = './samples/Clap.wav';
const crash = './samples/Crash.wav';
const tamb = './samples/Tamb.wav';
const tom = './samples/Tom.wav';

let voices = {
    '60': {gate: 0.0, path: kick, key: "v1"},
    '61': {gate: 0.0, path: snare, key: "v2"},
    '62': {gate: 0.0, path: hat, key: "v3"},
    '63': {gate: 0.0, path: rim, key: "v4"},
    '64': {gate: 0.0, path: clap, key: "v5"},
    '65': {gate: 0.0, path: tamb, key: "v6"},
    '66': {gate: 0.0, path: tom, key: "v7"},
    '67': {gate: 0.0, path: crash, key: "v8"},
}

const updateVoiceState = e => {
    if (e.hasOwnProperty("noteNumber")) {
        const { noteNumber } = e;
        console.log(noteNumber);
        
        if (voices[noteNumber]) {
            if (e.type === 'noteOn') {
                voices[noteNumber].gate = 1.0;
            }
        
            if (e.type === 'noteOff') {
                voices[noteNumber].gate = 0.0;
            }
        }
    }
}

const samplerVoice = voice => {
    const { gate, path, key } = voice;
    let _gate = el.const({key, value: gate} )
    return el.sample({path: path}, _gate, 1)
}

core.on('load', () => {
    core.on('midi', e => {
        updateVoiceState(e)
        
        let out = el.add(...Object.keys(voices).map(noteNumber => 
            samplerVoice(voices[noteNumber])
        ));
        core.render(out, out)
    });
});

core.initialize();