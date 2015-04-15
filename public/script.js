$(function() {

  var getMailString = function() {
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

      // record button
  // $('#record-button').on('click', function(event) {
  //   event.preventDefault();
  //   $(this).removeClass('btn-primary');
  //   $(this).addClass('btn-warning');
  //   $('.navbar-brand').text(getMailString());
  // })

      // mail button
  $('#envelope-form').on('submit', function(event) {
    var mailString = getMailString();
    $('#melody-string').val(mailString);
  })

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
        playString(String.fromCharCode(pitch + 64), oscillator, true);
      }
    }
  });

  // navbar toggle active (doesn't seem to work!)
  // $(".navbar a").on("click", function() {
    // $(".navbar li").find(".active").removeClass("active");
    // $(this).parent().addClass("active");
  // });

  // audio context
  var myAudioContext = new AudioContext();
  var gainNode = myAudioContext.createGain();
  gainNode.connect(myAudioContext.destination);

  // Fourier transform
  var sirenReal = new Float32Array([0,0.4,0.4,1,1,1,0.3,0.7,0.6,0.5,0.9,0.8]);
  var sirenImag = new Float32Array(sirenReal.length);
  var sirenWave = myAudioContext.createPeriodicWave(sirenReal, sirenImag);

  // notes from pressed keys
  $(this).on("keydown", function(event) {

    var oscillator = myAudioContext.createOscillator();
    playString(String.fromCharCode(event.which + 32), oscillator, true);
  });

  // music from clicked music buttons
  $('.music-button').on('click', function(event) {
    event.preventDefault();
    var myName = $(this).data('id');
    var oscillator = myAudioContext.createOscillator();
    playString(myName, oscillator, true);
  });

  var playString = function(name, oscillator, first) {

    if (name.length == 0) {
      oscillator.stop(0);
      return;
    }

    oscillator.type = 'custom';
    oscillator.setPeriodicWave(sirenWave);

    var charCode = name.charCodeAt(0) + 32;
    var freq = Math.pow(1.059463094, charCode);
    oscillator.frequency.value = freq;

    if (first) {
      oscillator.connect(gainNode);
      oscillator.start(0);
    }

    setInterval(function() {
      name = name.slice(1);
      playString(name, oscillator, false);
    }, 75.0);
  };

    // mail button
  // $('#envelope-form').on('submit', function(event) {
  //   event.preventDefault();

  //   var myData = $('#composition-form').serialize();
  //   $('.navbar-brand').text(myData);

  //   $.ajax({
  //     method:'POST',
  //     url:"compositions/mail",
  //     data:myData
  //   }).done(function(data) {

  //   });
  // })
})