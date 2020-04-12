const waveSpectrum = (sketch) => {
  let song, amplitude, fft;
  let play = document.querySelector("#play");
  let pause = document.querySelector("#pause");

  sketch.preload = function () {
    song = sketch.loadSound("./teaser.mp3");
  };

  sketch.setup = function () {
    sketch.getAudioContext().suspend();
    const audioCanvas = sketch.createCanvas(sketch.windowWidth, 200);
    audioCanvas.parent("p5-audio-container");

    sketch.initTransportControls();

    amplitude = new p5.Amplitude();
    fft = new p5.FFT(0.8, 512);
  };

  sketch.draw = function () {
    if (song.isPlaying()) {
      let audio = sketch.analyzeAudio();

      sketch.drawWaveform(audio);
      sketch.drawSpectrum(audio);
    } else {
      sketch.clear();
    }
  };

  sketch.windowResized = function () {
    sketch.resizeCanvas(sketch.windowWidth, 200);
  };

  sketch.initTransportControls = function () {
    play.addEventListener("click", () => {
      if (!song.isPlaying()) {
        sketch.userStartAudio();
        song.play();
      }
    });

    pause.addEventListener("click", () => {
      song.pause();
    });
  };

  sketch.analyzeAudio = function () {
    let spectrum = fft.analyze();
    let waveform = fft.waveform(512);

    let volume = amplitude.getLevel();
    let leftVol = amplitude.getLevel(0);
    let rightVol = amplitude.getLevel(1);

    let bass = fft.getEnergy("bass");
    let mid = fft.getEnergy("mid");
    let high = fft.getEnergy("treble");

    let volEased = sketch.smoother(volume, 0.5);

    return {
      spectrum,
      waveform,
      volume,
      leftVol,
      rightVol,
      bass,
      mid,
      high,
      volEased,
    };
  };

  sketch.smoother = function (volume, easing) {
    let scaler = 1,
      volEased = 0.001;

    let target = volume * scaler;
    let diff = target - volEased;
    volEased += diff * easing;

    return volEased;
  };

  sketch.drawWaveform = function (audio) {
    sketch.fill(0, 20);
    sketch.rect(0, 0, 200, sketch.height);

    for (let i = 0; i < audio.waveform.length; i++) {
      sketch.stroke(audio.waveform[i] * 255);
      let barHeight = sketch.map(audio.waveform[i], 0.01, 1, sketch.height, 0);
      let xPosition = sketch.map(i, 0, audio.waveform.length, 0, 200);

      sketch.line(xPosition, sketch.height, xPosition, barHeight);
      sketch.line(xPosition, sketch.height, xPosition, -barHeight);
    }
  };

  sketch.drawSpectrum = function (audio) {
    sketch.noStroke();
    sketch.fill(0);
    sketch.rect(sketch.width - 200, 0, 200, sketch.height);

    for (let i = 0; i < audio.spectrum.length; i++) {
      let barHeight = sketch.map(audio.spectrum[i], 0, 255, sketch.height, 0);
      let xPosition = sketch.map(
        i,
        0,
        audio.spectrum.length - 128,
        sketch.width - 200,
        sketch.width
      );
      sketch.stroke(audio.spectrum[i]);
      sketch.line(xPosition, sketch.height, xPosition, barHeight);
    }
  };
};

let p5Wave = new p5(waveSpectrum);
