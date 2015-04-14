$(function() {

      // mail button
  $('#record-button').on('click', function(event) {
    event.preventDefault();
    $(this).removeClass('btn-primary');
    $(this).addClass('btn-warning');

    var melodyString = "";
    for (var i = 1; i <= 18; i++) {
      // $('.cell-x-' + i + '.active').attr('data-x').removeClass('active').addClass('test');
      var thing = $('.cell-x-' + i + '.active');
      console.log(thing);
      // var pitch = array[0].attr('data-x');
      // if (pitch.isInteger()) {
      //   melodyString = melodyString.concat(String.fromCharCode(pitch));
      // } else {
      //   melodyString = melodyString.concat("x");
      // }
    }
    // $('.navbar-brand').text(melodyString);
  })

    // notes from grid cells
  $('.cell').on("click", function(event) {
    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
    } else {
      var pitch = parseInt($(this).attr('data-y'));
      $('.cell-x-' + $(this).attr('data-x')).removeClass('active');
      $(this).addClass('active');
      var oscillator = myAudioContext.createOscillator();
      playString(String.fromCharCode(pitch + 64), oscillator, true);
    }
  });

  // navbar toggle active
  $(".navbar a").on("click", function() {
    // $(".navbar li").find(".active").removeClass("active");
    $(this).parent().addClass("active");
  });

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
  $('#envelope-form').on('submit', function(event) {
    event.preventDefault();

    var myData = $('#composition-form').serialize();
    $('.navbar-brand').text(myData);

    $.ajax({
      method:'POST',
      url:"compositions/mail",
      data:myData
    }).done(function(data) {

    });
  })
})