
$(function() {

    // FIXME: should get melody string from interface, then convert melody string to object, then convert object to abc notation, then finally render notation
  var renderAbc = function() {
    ABCJS.renderAbc('new-abc', getMelodyString(), {}, {staffwidth: 575, add_classes: true}, {});
  };

    // dynamically update music notation
  $.getScript("/abcjs_basic_latest-min.js", function(data) {

      // initially load blank notation
    var string = ('X:' + '0' + '\nM:6/8\nL:1/8\n' + 'K: C enter z3 z3 | z3 z3 | z3 z3').replace("enter", "\n").replace(/&#34;/g, '\"');
    console.log(string);

      // FIXME: not sure why it doesn't allow staff width wider than this
    ABCJS.renderAbc('new-abc', string, {}, {staffwidth: 575, add_classes: true}, {});

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
      deleteButton.closest('tr').fadeOut('slow', function() {
        $(this).remove();
      });
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