$(function() {

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
})