var context, gain;

window.onload=function(){
    context = new AudioContext();
    gain = context.createGain();
    gain.connect(context.destination);
}

navigator.mediaDevices.getUserMedia({
    audio: true
}).then(stream => {
    const input = context.createMediaStreamSource(stream);
    plane(input); // change here for effect
}, error => {
    console.log(error);
});

function plane(input){
    var bufferSize = 4096;
    var brownNoise = (function() {
        var lastOut = 0.0;
        var node = context.createScriptProcessor(bufferSize, 1, 1);
        node.onaudioprocess = function(e) {
            var output = e.outputBuffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                var white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
        }
        return node;
    })();
    // https://noisehack.com/generate-noise-web-audio-api/
    brownGain = context.createGain();
    brownGain.gain.setValueAtTime(.1, context.currentTime);
    brownNoise.connect(brownGain);
    brownGain.connect(gain);
    var bp = context.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1000;
    input.connect(bp);
    bp.connect(gain); 
}

function telephone(input) {
    var lp1 = context.createBiquadFilter();
    lp1.type = "lowpass";
    lp1.frequency.value = 1500;
    var lp2 = context.createBiquadFilter();
    lp2.type = "lowpass";
    lp2.frequency.value = 2000;
    var hp1 = context.createBiquadFilter();
    hp1.type = "highpass";
    hp1.frequency.value = 500;
    var hp2 = context.createBiquadFilter();
    hp2.type = "highpass";
    hp2.frequency.value = 1000;
    var reverb = context.createConvolver();
    var compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, context.currentTime);
    var waveShaper = context.createWaveShaper();
    waveShaper.curve = makeDistortionCurve(5);
    reverb.connect(compressor);
    gain.connect(compressor);
    lp1.connect( hp1 );
    lp2.connect( hp1 );
    hp1.connect( hp2 );
    input.connect(lp1);
    input.connect(waveShaper);
    waveShaper.connect(gain);
    lp1.connect(gain);
}


// https://www.youtube.com/watch?v=k1InjBvR3HQ used this tutorial and converted it to code
function otherRoom(input){
    var lp = context.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 200;
    var mid = context.createBiquadFilter();
    mid.type = "peaking";
    mid.frequency.value = 1000;
    mid.Q.value = 0.5;
    var hp = context.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2000;
    mid.connect(lp);
    hp.connect(mid);
    lp.connect(gain);
    var distortion = context.createWaveShaper();
    distortion.curve = makeDistortionCurve(10);
    distortion.oversample = '4x';
    gain.connect(distortion);
    distortion.connect(context.destination);
    input.connect(lp);
    lp.connect(gain);
}

function hallway(input){
    var convolver = loadconnvolverbuffer('sounds/hall.wav');
    convolver.connect(gain);
    input.connect(convolver);
    convolver.connect(gain);
}

function loadconnvolverbuffer(filename){
    var convolver = context.createConvolver();
    var url = filename;
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = function(){
        context.decodeAudioData( request.response, function (buffer) {
            convolver.buffer = buffer;
        }, function(err) { console.log(err);} );
    };request.onerror = function(e){
        console.log( e );
    };
    request.send();
    return convolver;
}

// https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createWaveShaper
function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
  };