$(function() {

    // FIXME: should get melody string from interface, then convert melody string to object, then convert object to abc notation, then finally render notation
  var renderAbc = function() {
    console.log("render abc called.");
    var melodyString = getAbcFromCode(getMelodyString());
    var string = ('X:' + '0' + '\nM:none\nL:1/8\n' + melodyString).replace("enter", "\n").replace(/&#34;/g, '\"');
    console.log("melody string is", string);

    ABCJS.renderAbc('abc-0', string, {}, {staffwidth: $(".staff-container").width() * 0.95, add_classes: true}, {});
  };

    // dynamically update music notation
  $.getScript("/abcjs_basic_latest-min.js", function(data) {

      // initially load blank notation
    var string = ('X:' + '0' + '\nM:6/8\nL:1/8\n' + 'K: C enter zzz zzz | zzz zzz | zzz zzz').replace("enter", "\n").replace(/&#34;/g, '\"');

    console.log("staff container is ", $(".staff-container").width());
    ABCJS.renderAbc('abc-0', string, {}, {staffwidth: $(".staff-container").width() * 0.95, add_classes: true}, {});

      // check key signature
    $('.select-signature').on('change', function() {
      console.log("key signature changed to", $(this).val());
      renderAbc();
    });

      // check chord symbols
    for (var i = 0; i < 3; i++) {
      $('.select-key-' + i).on('change', function() {
        console.log("chord root " + i + " changed to", $(this).val());
        renderAbc();
      });
        $('.select-chord-' + i).on('change', function() {
        console.log("chord type " + i + " changed to", $(this).val());
        renderAbc();
      });
    }

    $('.cell').on("click", function(event) {
      if (!$(this).hasClass('locked')) {
        console.log("cell " + $(this).attr('data-x') + "," + $(this).attr('data-y') + " clicked.");
        renderAbc();
      }
    });
  });

  $('.delete-button').on('click', function(event) {
    event.preventDefault();

    var deleteButton = $(this);
    var myUrl = $(this).attr('data-id');
    console.log("my url is", myUrl);

    $.ajax({
      method:'DELETE',
      url:myUrl
    }).done(function(data) {
      var myTr = deleteButton.closest('tr');
      var nextTr = myTr.next('tr');

      myTr.fadeOut('slow', function() {
        $(this).remove();
      });
      nextTr.fadeOut('slow');
    });
  });

  // creates a string literal from chords and notes chosen through grid interface
  // illegal compositional elements are converted to "+"s or "-"s
  var getMelodyString = function() {
    var myString = "";

    var signatureValue = $('.select-signature').val();
    if (parseInt(signatureValue) == -1) {
      myString = myString.concat("-");
    } else {
      var mySig = parseInt(signatureValue);
      myString = myString.concat(String.fromCharCode(mySig + 65));
    }


    for (var i = 0; i < 3; i++) {
      var keyValue = $('.select-key-' + i).val();
      var chordValue = $('.select-chord-' + i).val();
      if (parseInt(keyValue) == -1) {
        myString = myString.concat("+");
      } else {
        var myKey = parseInt(keyValue);
        myString = myString.concat(String.fromCharCode(myKey + 65));
      }

      if (parseInt(chordValue) == -1) {
        myString = myString.concat("+");
      } else {
        var myChord = parseInt(chordValue);
        myString = myString.concat(String.fromCharCode(myChord + 65));
      }
    }

    for (var i = 1; i <= 18; i++) {
      var myPitch = parseInt($('.cell-x-' + i + '.active').attr('data-y'));
      if (isNaN(myPitch) || (myPitch < 0 || myPitch > 24)) {
        myString = myString.concat("-");
      } else {
        myString = myString.concat(String.fromCharCode(myPitch + 65));
      }
    }
    return myString;
  };

    // publish composition button
  $('#composition-form').on('submit', function(event) {
    var melodyString = getMelodyString();
    $('.composition-string').val(melodyString);

    if ($('#composition-title').val().length > 0 || typeof $('#composition.title-hidden').val() != "undefined") {
      $('#composition-title-hidden').val($('#composition-title').val());
    }
  })

    // mail composition button
  $('#envelope-form').on('submit', function(event) {
    var mailString = getMelodyString();
    $('.composition-string').val(mailString);
  })

    // declare audio context
  var myAudioContext;
  var gainNode;
  var chordGainNode;

    // Fourier transform of annoying siren
  var sirenReal = new Float32Array([0,0.4,0.4,1,1,1,0.3,0.7,0.6,0.5,0.9,0.8]);
  var sirenImag = new Float32Array(sirenReal.length);
  var sirenWave;

    // playback button
  $('.playback-button').on('click', function(event) {

      // user clicked play button
    if ($(this).hasClass('play')) {
      $('.playback-button').each(function() {
        $(this).addClass('disabled');
      });
      $(this).removeClass('disabled');

        // new audio context is created for musical sequence each time
      myAudioContext = new AudioContext();

        // bass and melody gain
      gainNode = myAudioContext.createGain();
      gainNode.connect(myAudioContext.destination);
      gainNode.gain.value = 0.8;

        // chord gain
      chordGainNode = myAudioContext.createGain();
      chordGainNode.connect(myAudioContext.destination);
      chordGainNode.gain.value = 0.2;
      sirenWave = myAudioContext.createPeriodicWave(sirenReal, sirenImag);

      $(this).removeClass('play');
      $(this).html("<i class='glyphicon glyphicon-stop'></i>");
      var melodyString = $(this).attr('data-id') || getMelodyString();
      console.log("melody string is", melodyString);
      playString(melodyString);

      //user clicked stop button
    } else {
      $('.playback-button').each(function() {
        $(this).removeClass('disabled');
      });

      myAudioContext.close();
      $(this).addClass('play');
      $(this).html("<i class='glyphicon glyphicon-play'></i>");
    }
  });

    // create audio context for grid interface
  var cellAudioContext = new AudioContext();
  var cellGainNode = cellAudioContext.createGain();
  cellGainNode.gain.value = 0.5;
  cellGainNode.connect(cellAudioContext.destination);
  var cellSirenWave = cellAudioContext.createPeriodicWave(sirenReal, sirenImag);

    // notes from grid cells
  $('.cell').on("click", function(event) {
    if (!$(this).hasClass('locked')) {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
      } else {
        $('.cell-x-' + $(this).attr('data-x')).removeClass('active');
        $(this).addClass('active');
      }
    }
    var pitch = parseInt($(this).attr('data-y'));
    var oscillator = cellAudioContext.createOscillator();
    playCharCode(pitch + 81, oscillator, true);
  });

    // play notes from typing in keys; uncomment for fun
  // $(this).on("keydown", function(event) {
  //   var oscillator = cellAudioContext.createOscillator();
  //   playCharCode(event.which + 32, oscillator, true);
  // });

    // play notes from pressed keys or grid interface
  var playCharCode = function(charCode, oscillator, first) {

    oscillator.type = 'custom';
    oscillator.setPeriodicWave(cellSirenWave);

    var freq = Math.pow(1.059463094, charCode);

    oscillator.frequency.value = freq;
    oscillator.connect(cellGainNode);
    oscillator.start(0);

    setInterval(function() {
      oscillator.stop(0);
    }, 100.0);
  }

    // create oscillator for each note in musical sequence
  var setNewOscillator = function(charCode, type, octave, startUnit, duration, thisGainNode) {
    console.log("oscillator:", charCode, type, octave, startUnit, duration);
  var newOscillator = myAudioContext.createOscillator();
  newOscillator.type = type;
  if (type == "custom") {
    newOscillator.setPeriodicWave(sirenWave);
  }

  charCode += (octave * 12) + 2;
  var freq = Math.pow(1.059463094, charCode);

  newOscillator.frequency.value = freq;
  console.log("this gain Node gain is", thisGainNode.gain);
  newOscillator.connect(thisGainNode);
  newOscillator.connect(myAudioContext.destination);
  var startTime = startUnit * duration;
  var stopTime = (startUnit + 1) * duration;
  console.log("start to stop", startTime, stopTime);
  newOscillator.start(startTime);
  newOscillator.stop(stopTime);
}

    // play musical sequence
  var playString = function(string) {
    string = string.toUpperCase();

    for (var i = 0; i < 3; i++) {
      var rootCharCode = string.charCodeAt(i * 2 + 1) + 17;
      if (rootCharCode >= 82 && rootCharCode <= 93) {

          // play bass
        setNewOscillator(rootCharCode, "sine", -1, i, 1.8, gainNode);

        var chord = string.charCodeAt(i * 2 + 2) - 65;

        // play chord root, keep within octave range
        if (chord >= 0 && chord < 4) {
          var myUnison = rootCharCode;
          if (myUnison > 111) {
            myUnison -= 12;
          } else if (myUnison < 100) {
            myUnison += 12;
          }
          setNewOscillator(myUnison, "sine", 0, i, 1.8, chordGainNode);

          // play chord third
          var myThird = rootCharCode + (chord % 2 == 0 ? 4 : 3);
          if (myThird > 111) {
            myThird -= 12;
          } else if (myThird < 100) {
            myThird += 12;
          }
          setNewOscillator(myThird, "sine", 0, i, 1.8, chordGainNode);

          // play chord fifth
          var myFifth;
          if (chord < 2) {
            myFifth = rootCharCode + 7;
          } else if (chord == 2) {
            myFifth = rootCharCode + 8;
          } else {
            myFifth = rootCharCode + 6;
          }
          if (myFifth > 111) {
            myFifth -= 12;
          } else if (myFifth < 100) {
            myFifth += 12;
          }
          setNewOscillator(myFifth, "sine", 0, i, 1.8, chordGainNode);
        }
      }
    }

    // play the melody
    for (var j = 7; j < 25; j++) {
      if (string[j] != "-") {
        setNewOscillator(string.charCodeAt(j) + 2, "custom", 1, j - 7, 0.3, gainNode);
      }
    }
  }
})

// FIXME: Totally not DRY! Repeats methods in index.js
var getCompositionFromCode = function(code) {
  code = code.toUpperCase();
  var keys = [];
  var chords = [];
  var pitches = [];
  var signature;

    // string literal fails if less than 24 characters
  if (code.length < 25) {
    return false;
  } else {

    // first character is key signature
    var codedSign = code.charCodeAt(0) - 65;
    if (!isNaN(codedSign) && codedSign >= 0 && codedSign < 12) {
      signature = codedSign;
    } else {
      return false;
    }

      // next 6 characters are chord roots and types
    for (var i = 1; i < 7; i++) {

        // this is a chord root
      if (i % 2 == 1) {
        if (code[i] == '+') {
          keys.push(code[i]);
        } else {
          var key = code.charCodeAt(i) - 65;
          if (!isNaN(key) && key >= 0 && key < 12) {
            keys.push(key);
          } else {
            return false;
          }
        }

        // this is a chord type
      } else {
        if (code[i] == '+') {
          chords.push(code[i]);
        } else {
          var chord = code.charCodeAt(i) - 65;
          if (!isNaN(chord) && chord >= 0 && chord < 4) {
            chords.push(chord);
          } else {
            return false;
          }
        }
      }
    }

      // next 18 characters are notes in the melody
    for (var i = 7; i < 25; i++) {
      if (code[i] == '-') {
        pitches.push(code[i]);
      } else {
        var pitch = code.charCodeAt(i) - 65;
        if (!isNaN(pitch) && pitch >= 0 && pitch <= 24) {
          pitches.push(pitch);
        } else {
          return false;
        }
      }
    }
    return {activePitches: pitches, keys: keys, activeChords: chords, signature: signature};
  }
}

/*
about abc notation:

X: is internal reference number
M: is the meter
L: is the base note duration, C2 is twice the base note duration
K: is the key

"C" is the chord symbol, use C, Cm, Caug, Cdim only
C, to B, is C3 to B3
C to B is C4 to B4
c to b is C5 to B5
^C is C-shart, =C is C-natural, _C is C-flat

| is a barline
|] is the end barline

for more, consult http://abcnotation.com/wiki/abc:standard:v2.1
*/

var getAbcFromCode = function(code) {

    // get object with pitches (activePitches), chord roots (keys), chord types (chords), and key signature(signature)
  var composition = getCompositionFromCode(code);
  if (!composition) {
    return 'K:C\\n zzz zzz | zzz zzz | zzz zzz';
  }

  var signatures = ["Db", "Ab", "Eb", "Bb", "F", "C", "G", "D", "A", "E", "B", "Gb"];

  var chordRoots = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B"];

  var chordTypes = ["", "m", "aug", "dim"];

    // FIXME: consider flat or sharp based on keys, for both chord roots and notes
    // consider note durations
    // consider naturals
    // if there's an eighth note rest, add spaces to avoid beaming across rest

  var letterPitches = ["A,", "_B,", "B,", "C", "_D", "D", "_E", "E", "F", "_G", "G", "_A", "A", "_B", "B", "c", "_d", "d", "_e", "e", "f", "_g", "g", "_a", "a" ];

  var signature = signatures[composition.signature];

    // chord symbols
  var chords = [];
  for (var i = 0; i < 3; i++) {
    var chord = "";
    var rootInteger = composition.keys[i];
    if (isNaN(rootInteger)) {
      chords.push("");
    } else {
      chordRoots[rootInteger];
      var chordTypeInteger = composition.activeChords[i];
      if (isNaN(chordTypeInteger)) {
        chords.push('"' + chordRoots[rootInteger] + '" ');
      } else {
        chords.push('"' + chordRoots[rootInteger] + chordTypes[chordTypeInteger] + '" ');
      }
    }
  }

    // notes
  var notes = [];
  for (var i = 0; i < 6; i++) {
    var halfBar = "";
    for (var j = 0; j < 3; j++) {
      var noteInteger = composition.activePitches[i * 3 + j];
      if (isNaN(noteInteger)) {
        halfBar = halfBar.concat("z")

        // add rest
      } else {
        halfBar = halfBar.concat(letterPitches[noteInteger]);
      }
    }

    notes.push(halfBar);
  }

  var returnString = 'K:' + signature + 'enter' + chords[0] + notes[0] + ' ' + notes[1] + ' | ' + chords[1] + notes[2] + ' ' + notes[3] + ' | ' + chords[2] + notes[4] + ' ' + notes[5];
  console.log(returnString);
  return returnString;
}