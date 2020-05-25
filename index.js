var effect = null;


navigator.mediaDevices.getUserMedia({
    audio: true
}).then(stream => {
    const context = new AudioContext();
    const input = context.createMediaStreamSource(stream);
    var convolver = context.createConvolver();
    effect = telephone(context);
    input.connect(effect);
    effect.connect(context.destination);
}, error => {
    console.log(error);
});


function telephone(audioContext) {
    var lp1 = audioContext.createBiquadFilter();
    lp1.type = "lowpass";
    lp1.frequency.value = 2000.0;
    var lp2 = audioContext.createBiquadFilter();
    lp2.type = "lowpass";
    lp2.frequency.value = 2000.0;
    var hp1 = audioContext.createBiquadFilter();
    hp1.type = "highpass";
    hp1.frequency.value = 500.0;
    var hp2 = audioContext.createBiquadFilter();
    hp2.type = "highpass";
    hp2.frequency.value = 500.0;
    lp1.connect( hp1 );
    lp2.connect( hp1 );
    hp1.connect( hp2 );
    return lp1
}