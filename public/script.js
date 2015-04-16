$(function() {

  var getMelodyString = function() {
    var myString = "";

    for (var i = 0; i < 3; i++) {
      var myKey = parseInt($('.select-key-' + i).val());
      myString = myString.concat(String.fromCharCode(myKey + 65));

      var myChord = parseInt($('.select-chord-' + i).val());
      myString = myString.concat(String.fromCharCode(myChord + 65));
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

    // play button
  $('#playback-button').on('click', function(event) {
    if ($(this).hasClass('play')) {
      $(this).removeClass('play');
      $(this).html("<i class='glyphicon glyphicon-stop'></i>");
    } else {
      $(this).addClass('play');
      $(this).html("<i class='glyphicon glyphicon-play'></i>");
    }

    var melodyString = getMelodyString();
    playString(melodyString, 6, null);
  });

    // notes from grid cells
  $('.cell').on("click", function(event) {
    if (!$(this).hasClass('locked')) {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
      } else {
        var pitch = parseInt($(this).attr('data-y'));
        $('.cell-x-' + $(this).attr('data-x')).removeClass('active');
        $(this).addClass('active');
        var oscillator = myAudioContext.createOscillator();
        playCharCode(pitch + 79, oscillator, true);
      }
    }
  });

    // notes from pressed keys
  $(this).on("keydown", function(event) {
    var oscillator = myAudioContext.createOscillator();
    playCharCode(event.which + 32, oscillator, true);
  });

  // audio context
  var myAudioContext = new AudioContext();
  var gainNode = myAudioContext.createGain();
  gainNode.gain.value = 0.5;
  gainNode.connect(myAudioContext.destination);

  // Fourier transform
  var sirenReal = new Float32Array([0,0.4,0.4,1,1,1,0.3,0.7,0.6,0.5,0.9,0.8]);
  var sirenImag = new Float32Array(sirenReal.length);
  var sirenWave = myAudioContext.createPeriodicWave(sirenReal, sirenImag);

  var playCharCode = function(charCode, oscillator, first) {

    oscillator.type = 'custom';
    oscillator.setPeriodicWave(sirenWave);

    var freq = Math.pow(1.059463094, charCode);

    oscillator.frequency.value = freq;
    oscillator.connect(gainNode);
    oscillator.start(0);

    setInterval(function() {
      oscillator.stop(0);
    }, 100.0);
  }

  var playString = function(string, index, oscillator) {
    // $('.navbar-brand').append(string[i]);
    console.log(string);
    for (var i = 0; i < string.length; i++) {
      if (string[i] != "-") {

        // setTimeout(function() {
          console.log("playing note", string[i])
          var newOscillator = myAudioContext.createOscillator();
          newOscillator.type = 'custom';
          newOscillator.setPeriodicWave(sirenWave);
          var charCode = string.charCodeAt(i) + 67;
          var freq = Math.pow(1.059463094, charCode);
          newOscillator.frequency.value = freq;
          newOscillator.connect(gainNode);
          newOscillator.start(i * .3);
          newOscillator.stop((i* .3) + 0.1);
        // },i*5000)
      }
    };
    return;

    setTimeout(function() {
      if (oscillator) {
        oscillator.stop(0);
      }

      if (index >= string.length) {
        return;
      }
      $('.navbar-brand').text(index);
      // gainNode.gain.value = 0.5;
      // gainNode.connect(myAudioContext.destination);

      var newOscillator = myAudioContext.createOscillator();

      newOscillator.type = 'custom';
      newOscillator.setPeriodicWave(sirenWave);

      var charCode = string.charCodeAt(index) + 79;
      var freq = Math.pow(1.059463094, charCode);
      newOscillator.frequency.value = freq;

      newOscillator.connect(gainNode);
      newOscillator.start(0.1);
      setInterval(function() {
        playString(string, index + 1, newOscillator);
      }, 100.0);

    }, 200.0);
  }

})