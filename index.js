var context, effect, gain;

window.onload=function(){
    context = new AudioContext();
    effect = null;
    gain = context.createGain();
}

navigator.mediaDevices.getUserMedia({
    audio: true
}).then(stream => {
    const input = context.createMediaStreamSource(stream);
    var convolver = context.createConvolver();
    effect = telephone(context);
    input.connect(effect);
    effect.connect(context.destination);
}, error => {
    console.log(error);
});


function telephone() {
    var lp1 = context.createBiquadFilter();
    lp1.type = "lowpass";
    lp1.frequency.value = 1500.0;
    var lp2 = context.createBiquadFilter();
    lp2.type = "lowpass";
    lp2.frequency.value = 2000.0;
    var hp1 = context.createBiquadFilter();
    hp1.type = "highpass";
    hp1.frequency.value = 500.0;
    var hp2 = context.createBiquadFilter();
    hp2.type = "highpass";
    hp2.frequency.value = 1000.0;
    var reverb = context.createConvolver();
    var compressor = context.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, context.currentTime);
    gain = context.createGain();
    reverb.connect(compressor);
    gain.connect(compressor);
    lp1.connect(gain);
    lp1.connect( hp1 );
    lp2.connect( hp1 );
    hp1.connect( hp2 );
    return lp1
}