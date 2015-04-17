$(function() {

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

  var getMelodyString = function() {
    var myString = "";

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

    // publish button
  $('#composition-form').on('submit', function(event) {
    var melodyString = getMelodyString();
    $('.composition-string').val(melodyString);
  })

    // mail button
  $('#envelope-form').on('submit', function(event) {
    var mailString = getMelodyString();
    $('.composition-string').val(mailString);
  })

    // audio context
  var myAudioContext;
  var gainNode;
  var chordGainNode;
    // Fourier transform
  var sirenReal = new Float32Array([0,0.4,0.4,1,1,1,0.3,0.7,0.6,0.5,0.9,0.8]);
  var sirenImag = new Float32Array(sirenReal.length);
  var sirenWave;

    // play button
  $('.playback-button').on('click', function(event) {
    if ($(this).hasClass('play')) {
      $('.playback-button').each(function() {
        $(this).addClass('disabled');
      });
      $(this).removeClass('disabled');
      myAudioContext = new AudioContext();
      gainNode = myAudioContext.createGain();
      gainNode.connect(myAudioContext.destination);
      gainNode.gain.value = 0.2;
      chordGainNode = myAudioContext.createGain();
      chordGainNode.connect(myAudioContext.destination);
      chordGainNode.gain.value = 0.2;
      sirenWave = myAudioContext.createPeriodicWave(sirenReal, sirenImag);
      $(this).removeClass('play');
      $(this).html("<i class='glyphicon glyphicon-stop'></i>");
      var melodyString = $(this).attr('data-id') || getMelodyString();
      playString(melodyString);

    } else {
      $('.playback-button').each(function() {
        $(this).removeClass('disabled');
      });

      myAudioContext.close();
      $(this).addClass('play');
      $(this).html("<i class='glyphicon glyphicon-play'></i>");
    }
  });

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
        var pitch = parseInt($(this).attr('data-y'));
        $('.cell-x-' + $(this).attr('data-x')).removeClass('active');
        $(this).addClass('active');
        var oscillator = cellAudioContext.createOscillator();
        playCharCode(pitch + 79, oscillator, true);
      }
    }
  });

    // notes from pressed keys
  // $(this).on("keydown", function(event) {
  //   var oscillator = cellAudioContext.createOscillator();
  //   playCharCode(event.which + 32, oscillator, true);
  // });

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

  var playString = function(string) {
    string = string.toUpperCase();

    for (var i = 0; i < 3; i++) {
      var rootCharCode = string.charCodeAt(i * 2) + 17;
      if (rootCharCode >= 82 && rootCharCode <= 93) {
        console.log("rootCharCode is", rootCharCode);
        setNewOscillator(rootCharCode, "sine", -1, i, 1.8, gainNode);

        var chord = string.charCodeAt(i * 2 + 1) - 65;

        // root
        if (chord >= 0 && chord < 4) {
          var myUnison = rootCharCode;
          if (myUnison > 111) {
            myUnison -= 12;
          } else if (myUnison < 100) {
            myUnison += 12;
          }
          setNewOscillator(myUnison, "sine", 0, i, 1.8, chordGainNode);

          // third
          var myThird = rootCharCode + (chord % 2 == 0 ? 4 : 3);
          if (myThird > 111) {
            myThird -= 12;
          } else if (myThird < 100) {
            myThird += 12;
          }
          setNewOscillator(myThird, "sine", 0, i, 1.8, chordGainNode);

          // fifth
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

    // melody
    for (var j = 6; j < 24; j++) {
      if (string[j] != "-") {
        setNewOscillator(string.charCodeAt(j), "custom", 1, j - 6, 0.3, gainNode);
      }
    }
  }
})