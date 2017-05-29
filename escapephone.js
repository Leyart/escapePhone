#!/usr/local/bin/env node

var escapephone = {};

escapephone.mods = {};
escapephone.mods.cp = require('child_process');
escapephone.mods.gpiobutton = require('gpiobutton');
escapephone.mods.fs = require('fs');

escapephone.digits = {
  '1': '.*',
  '2': '[abc]',
  '3': '[def]',
  '4': '[ghi]',
  '5': '[jkl]',
  '6': '[mno]',
  '7': '[pqrs]',
  '8': '[tuv]',
  '9': '[wxyz]',
  '0': ' ',
};

escapephone.closings = [
  "goodbye",
  "farewell",
  "see you later",
  "leka nosht",
  "ciao"
];

escapephone.state = {};
escapephone.state.mode = "";
escapephone.state.sofar = [];

escapephone.effects = {
  beep: 'Answering_Machine_Beep-Mike_Koenig-SoundBible.com-1804176620.wav',
  blip: 'Robot_blip-Marianne_Gagnon-SoundBible.com-120342607.wav',
  tone: 'Short_Dial_Tone-Mike_Koenig-SoundBible.com-1911037576.wav',
  modem: 'Dial_Up_Modem-ezwa-SoundBible.com-909377495.wav',
  flush: 'Flushing_The_Toilet-Grzegorz_Adam_Hankie-SoundBible.com-399247839.wav',
  uhoh: 'Uh_Oh_Baby-Mike_Koenig-SoundBible.com-1858856676.wav',
};

escapephone.root = require.resolve('./escapephone.js').split('/').slice(0,-1).join("/");

escapephone.dev = {};
//escapephone.dev.hook = new escapephone.mods.gpiobutton.button({name:'hook', gpiono:22, DOWN:1, interval:20});
escapephone.dev.dial = new escapephone.mods.gpiobutton.button({name:'dial', gpiono:27, longTimeout: 10000});
escapephone.dev.rotary = new escapephone.mods.gpiobutton.button({name:'rotary', gpiono:17, interval:20, DOWN:1});
//escapephone.dev.onoff = new escapephone.mods.gpiobutton.button({name:'switch', gpiono: 18});

/*
escapephone.dev.hook.on('buttondown', function() {
  process.emit('clear_code');
  if (escapephone.mike) {
    escapephone.mike.kill();
  }
});
escapephone.dev.hook.on('longpress', function() {
  process.emit('mpc', {cmd:['pause']});
});
escapephone.dev.hook.on('buttonpress', function() {
  process.emit("volume", {volume:100});
});
escapephone.dev.hook.on('multipress', function(spec) {
  var vol = 120 - (10*(spec.count));
  process.emit("volume", {volume:vol});
});
*/

escapephone.dev.dial.on('longpress', function() {
  console.log("LONG!");
  process.emit('setmode', {from:escapephone.state.mode, to:'-'});
});

escapephone.dev.rotary.on('multipress', function(spec) {
  var digit = Math.ceil(spec.count) % 10;
  //escapephone.state.sofar.push(escapephone.state.mode);
  escapephone.state.sofar.push(digit);

  process.emit('code');

});

escapephone.dev.rotary.on('buttonpress', function(spec) {
  escapephone.dev.rotary.emit('multipress', spec);
});

process.on('code', function(spec) {
  var code = escapephone.state.sofar.join("");

  console.log("CODE %j", {code:code, state:escapephone.state});

  switch (code) {
    case '1':
      process.emit("tts", {text:['number','1']});
      console.log("Number 1");
      escapephone.state.sofar.shift();
      break;

    case '2':
      process.emit("tts", {text:['number','2']});
      console.log("Number 2");
      escapephone.state.sofar.shift();
      break;

    case '3':
      process.emit("tts", {text:['number','3']});
      console.log("Number 3");
      escapephone.state.sofar.shift();
      break;

    case '4':
      process.emit("tts", {text:['number','4']});
      console.log("Number 4");
      escapephone.state.sofar.shift();
      break;

    case '5':
      process.emit("tts", {text:['number','5']});
      console.log("Number 5");
      escapephone.state.sofar.shift();
      break;

    case '6':
      process.emit("tts", {text:['number','6']});
      console.log("Number 6");
      escapephone.state.sofar.shift();
      break;

    case '7':
      process.emit("tts", {text:['number','7']});
      console.log("Number 7");
      escapephone.state.sofar.shift();
      break;

    case '8':
      process.emit("tts", {text:['number','8']});
      console.log("Number 8");
      escapephone.state.sofar.shift();
      break;

    case '9':
      process.emit("tts", {text:['number','9']});
      console.log("Number 9");
      escapephone.state.sofar.shift();
      break;
   }
});


process.on('setmode', function(spec) {
  var oldmode = escapephone.state.mode;
  escapephone.state.mode = spec.to;
  process.emit('newmode', spec);
});

process.on('newmode', function(spec) {
  if (spec.to === '-') {
    //process.emit('effect', {name:'blip'});
    escapephone.state.sofar.push('-');
  }
});
process.on('newmode', function(spec) {
  if (spec.to === '*') {
    //process.emit('effect', {name:'modem'});
    //escapephone.state.sofar.push('*');
  }
});
process.on('newmode', function(spec) {
  if (spec.to === '#') {
    //process.emit('effect', {name:'tone'});
    //escapephone.state.sofar.push('#');
  }
});

console.log("Escape Phone v0.0.2 Started...")
