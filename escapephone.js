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
escapephone.dev.hook = new escapephone.mods.gpiobutton.button({name:'hook', gpiono:22, DOWN:1, interval:20});
escapephone.dev.dial = new escapephone.mods.gpiobutton.button({name:'dial', gpiono:27, longTimeout: 10000});
escapephone.dev.rotary = new escapephone.mods.gpiobutton.button({name:'rotary', gpiono:17, interval:20, DOWN:1});
//escapephone.dev.onoff = new escapephone.mods.gpiobutton.button({name:'switch', gpiono: 18});

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

escapephone.dev.dial.on('longpress', function() {
  console.log("LONG!");
  process.emit('setmode', {from:escapephone.state.mode, to:'-'});
});

escapephone.dev.rotary.on('multipress', function(spec) {
  var digit = Math.ceil(spec.count) % 10;
  //escapephone.state.sofar.push(escapephone.state.mode);
  escapephone.state.sofar.push(digit);

  process.emit('code');

  switch (escapephone.state.mode) {
    case '-':
      process.emit('setmode', {from:escapephone.state.mode, to:''});
      break;
    case '*':
      if (escapephone.state.sofar.length >= 3) {
        process.emit('setmode', {from:escapephone.state.mode, to:''});
        process.emit('clear_code');
      }
      break;
    default:
  }
});
escapephone.dev.rotary.on('buttonpress', function(spec) {
  escapephone.dev.rotary.emit('multipress', spec);
});

process.on('code', function(spec) {
  var code = escapephone.state.sofar.join("");

  console.log("CODE %j", {code:code, state:escapephone.state});

  if (escapephone.state.sofar[0] === 0) {
    process.emit('rotary_query', {rquery:escapephone.state.sofar.slice(1)});
    return;
  }

  switch (code) {
    case '1':
      process.emit("mpc", {cmd:'play'});
      escapephone.state.sofar.shift();
      break;
/*
    case '2':
      process.emit("volume", {volume:100});
      process.emit("mpc", {cmd:'play'});
      escapephone.state.sofar.shift();
      break;
*/
    case '2':
      process.emit("tts", {text:['number','2']});
      process.emit("mpcq", {query:['little','bird,','little','bird']});
      escapephone.state.sofar.shift();
      break;
/*
    case '3':
      process.emit("mpc", {cmd:'next'});
      escapephone.state.sofar.shift();
      break;
    case '4':
      process.emit("mpc", {cmd:'prev'});
      escapephone.state.sofar.shift();
      break;
*/
    case '3':
      process.emit("tts", {text:['number','3']});
      process.emit("mpcq", {query:['humpty','dumpty']});
      escapephone.state.sofar.shift();
      break;
    case '4':
      process.emit("tts", {text:['number','4']});
      process.emit("mpcq", {query:['wiggle','tooth']});
      escapephone.state.sofar.shift();
      break;
    case '5':
      process.emit("tts", {text:['number','5']});
      process.emit("mpcq", {query:['guapo']});
      escapephone.state.sofar.shift();
      break;
    case '6':
      process.emit("tts", {text:['number','6']});
      process.emit("mpcq", {query:['belafonte','matilda']});
      escapephone.state.sofar.shift();
      break;
    case '7':
      process.emit("tts", {text:['number','7']});
      process.emit("mpcq", {query:['susanna','tanyas']});
      escapephone.state.sofar.shift();
      break;
    case '8':
      process.emit("tts", {text:['number','8']});
      process.emit("mpcq", {query:['puff']});
      escapephone.state.sofar.shift();
      break;
    case '9':
      process.emit("tts", {text:['number','9']});
      process.emit("mpcq", {query:['lilly']});
      escapephone.state.sofar.shift();
      break;
    case '-1':
      process.emit('clear_code');
      process.emit('setmode', {from:escapephone.state.mode, to:'*'});
      escapephone.state.sofar.push("*");
      break;
    case '-2':
      process.emit('clear_code');
      process.emit('setmode', {from:escapephone.state.mode, to:'#'});
      escapephone.state.sofar.push("#");
      break;
    case '-3':
    case '-4':
    case '-5':
    case '-6':
    case '-7':
    case '-8':
    case '-9':
      process.emit('mpc', {cmd:['pause']});
      process.emit('mike', {id:escapephone.state.sofar.pop()});
      process.emit('clear_code');
      break;
    case '-0':
      process.emit('setmode', {from:escapephone.state.mode, to:''});
      process.emit('clear_code');
      process.emit('clear_recs');
      break;
    case "*60":
      process.emit('mpc', {cmd:['single', 'on']});
      process.emit('audible_status');
      break;
    case "*80":
      process.emit('mpc', {cmd:['single', 'off']});
      process.emit('audible_status');
      break;
    case "*61":
      process.emit('mpc', {cmd:['random', 'on']});
      process.emit('audible_status');
      break;
    case "*81":
      process.emit('mpc', {cmd:['random', 'off']});
      process.emit('audible_status');
      break;
    case "*65":
      process.emit('audible_trackid');
      break;
    case "*66":
      process.emit('mpc', {cmd:['repeat', 'on']});
      process.emit('audible_status');
      break;
    case "*86":
      process.emit('mpc', {cmd:['repeat', 'off']});
      process.emit('audible_status');
      break;
    case '*78':
      process.emit('shutdown_request');
      break;
  }
});

process.on('rotary_query', function(spec) {
  if (spec.rquery.length === 0) {
    return;
  }

  spec.regex = spec.rquery.map(function(digit) { return escapephone.digits[digit]; }).join('');
  console.error("RQUERY %j", spec);

  var mpcq = escapephone.mods.cp.exec(['mpc_query', spec.regex].join(' '), function(code, out, err) {

    if (out.length === 0) {
      process.emit('effect', {name:'beep'});
      return;
    }

    var lines = out.split(/\n/);
    console.error("MPCQ %j", {code:code,out:out.slice(0,100),err:err,lines:lines.slice(0,10)});
    if (lines.length === 2) {
      process.emit('mpc', {cmd:['play',lines[0]]});
      return;
    }

    //process.emit('effect', {name:'uhoh'});
    //process.emit('tts', {text:[lines.length]});

  });
});

process.on('clear_code', function(spec) {
  escapephone.state.sofar = [];
});

process.on('clear_recs', function(spec) {
  var timestamp =JSON.stringify(new Date()).slice(1,-2);

  var cmd = [
             'mkdir',
             '-p',
             [process.env.HOME,'tmp',timestamp].join('/'),
             '&&',
             'mv',
             [process.env.HOME,'tmp','?.wav'].join('/'),
             [process.env.HOME,'tmp',timestamp].join('/'),
             '',
             ].join(' ');
  console.error("TRASH: %s", cmd);
  var rm = escapephone.mods.cp.spawn('bash', ['-c',cmd]);
  rm.stdout.pipe(process.stdout);
  rm.stderr.pipe(process.stderr);
  rm.on('exit', function() {
    process.emit('effect', {name:'flush'});
  });
});

process.on('setmode', function(spec) {
  var oldmode = escapephone.state.mode;
  escapephone.state.mode = spec.to;
  process.emit('newmode', spec);
});

process.on('newmode', function(spec) {
  if (spec.to === '-') {
    process.emit('effect', {name:'blip'});
    escapephone.state.sofar.push('-');
  }
});
process.on('newmode', function(spec) {
  if (spec.to === '*') {
    process.emit('effect', {name:'modem'});
    //escapephone.state.sofar.push('*');
  }
});
process.on('newmode', function(spec) {
  if (spec.to === '#') {
    process.emit('effect', {name:'tone'});
    //escapephone.state.sofar.push('#');
  }
});

process.on('shutdown_request', function() {
  process.emit('mpc', {cmd:['stop']});
  process.emit("tts", {text:['goodbye cruel world']});
  setInterval(function() {
    var draw = Math.floor(Math.random()*escapephone.closings.length);
    process.emit("tts", {text:[escapephone.closings[draw]]});
  }, 2500);
  setTimeout(function() {
    escapephone.mods.cp.exec('shutdown -h now', function(err, stdout, stderr) {
      console.error("SHUTDOWN: %j", {err:err,stdout:stdout,stderr:stderr});
    });
  }, 6000);
});

process.on('mpc', function(spec) {
  escapephone.mods.cp.exec(['mpc'].concat(spec.cmd).join(" "), function(err, stdout, stderr) {
    console.error("%s: %j", spec.cmd, {err:err,stdout:stdout,stderr:stderr});
  });
});
process.on('volume', function(spec) {
  escapephone.mods.cp.exec(['mpc','volume',spec.volume].join(" "), function(err, stdout, stderr) {
    console.error("VOL: %j", {vol:spec.volume,err:err,stdout:stdout,stderr:stderr});
  });
});

process.on('tts', function(spec) {
  var tts = escapephone.mods.cp.spawn('/usr/local/bin/tts', spec.text);
  tts.stdout.pipe(process.stdout);
  tts.stderr.pipe(process.stderr);
  //tts.stdin.write(spec.text.concat(['\n']).join(" "));;
  //tts.stdin.end();
});

process.on('effect', function(spec) {
  var name = spec.name;
  var filename = escapephone.effects[name];
  var path = [escapephone.root,'wav',filename].join("/");
  console.error("PATH: %s -> %s %j", name, filename, path);
  var aplay = escapephone.mods.cp.spawn('aplay', [path]);
  aplay.stdout.pipe(process.stdout);
  aplay.stderr.pipe(process.stderr);
});

process.on('audible_trackid', function(spec) {
  var stat = escapephone.mods.cp.spawn('bash', ['-c', 'mpc current | tts']);

  stat.stdout.pipe(process.stderr);
  stat.stderr.pipe(process.stderr);
  //tts.stdin.write(spec.text.concat(['\n']).join(" "));;
  //tts.stdin.end();
});

process.on('audible_status', function(spec) {
  var stat = escapephone.mods.cp.spawn('bash', ['-c', 'mpc | tail -1 | tts']);

  stat.stdout.pipe(process.stderr);
  stat.stderr.pipe(process.stderr);
  //tts.stdin.write(spec.text.concat(['\n']).join(" "));;
  //tts.stdin.end();
});

process.on('mike', function(spec) {
  if (escapephone.mike) { return; }
  var mikeid = spec.id;
  var mikefile = [process.env.HOME, 'tmp', [mikeid,'wav'].join(".")].join('/');

  escapephone.mods.fs.exists(mikefile, function(exists) {
    if (exists) {
      var play = escapephone.mods.cp.spawn('aplay', [mikefile]);
      play.stdout.pipe(process.stdout);
      play.stderr.pipe(process.stderr);
      return;
    }

    process.emit('effect', {name: 'beep'});
    var cmd = [
      //'(',
      'exec',
      'arecord',
      '-Dplug:usb',
      '--format=S16_LE',
      '--duration=120',
      mikefile
    ].join(" ");
    escapephone.mike = escapephone.mods.cp.spawn('bash', ['-c', cmd]);
    escapephone.mike.stdout.pipe(process.stdout);
    escapephone.mike.stderr.pipe(process.stderr);
    escapephone.mike.on('exit', function() {
      console.error("DROPMIKE");
      process.emit('effect', {name:'tone'});
      delete escapephone.mike;
    });

  });

  return;

  var cmd = [
      //'(',
      'aplay',
      mikefile,
      //')',
      '||',
      'exec',
      'arecord',
      '-Dplug:usb',
      '--format=S16_LE',
      '--duration=120',
      mikefile
      ].join(" ");
  console.error("MIKE: %s", cmd);
  escapephone.mike = escapephone.mods.cp.spawn('bash', ['-c', cmd]);
  escapephone.mike.stdout.pipe(process.stdout);
  escapephone.mike.stderr.pipe(process.stderr);
  escapephone.mike.on('exit', function() {
    console.error("DROPMIKE");
    delete escapephone.mike;
  });

});

process.on('mpcq', function(spec) {
    //process.emit('tts', {text:spec.query});
    var mpc = escapephone.mods.cp.exec(['/usr/local/bin/mpc_query',spec.query.join(".*")].concat([
      '|',
      'xargs mpc play'
    ]).join(" "), function(err,stdout,stderr) {
    //console.error("DEMAND: %j", {err:err,stdout:stdout,stderr:stderr});
  });
});

process.emit('tts', {text:['hello', 'world']});
