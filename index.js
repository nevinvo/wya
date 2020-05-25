navigator.mediaDevices.getUserMedia({
    audio: true
}).then(stream => {
    const context = new AudioContext();
    const input = context.createMediaStreamSource(stream);
    input.connect(context.destination);
}, error => {
    console.log(error);
});