const waveSpectrum = (sketch) => {
  let song, amplitude, fft;
  let play = document.querySelector("#play");
  let pause = document.querySelector("#pause");

  sketch.preload = function () {
    song = sketch.loadSound("./teaser.mp3");
  };

  sketch.setup = function () {
    const audioCanvas = sketch.createCanvas(200, 200);
    audioCanvas.parent("p5-audio-container");

    sketch.initTransportControls();

    amplitude = new p5.Amplitude();
    fft = new p5.FFT(0.8, 512);
  };

  sketch.draw = function () {
    let audio = sketch.analyzeAudio();

    sketch.drawWaveform(audio);
  };

  sketch.initTransportControls = function () {
    play.addEventListener("click", () => {
      if (!song.isPlaying()) {
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
    if (sketch.frameCount % 2 === 0) {
      sketch.background(0, audio.volEased * 120);
    } else {
      sketch.background(0, 1);
    }

    for (let i = 0; i < audio.waveform.length; i++) {
      sketch.stroke(audio.waveform[i] * 255);
      let barHeight = sketch.map(audio.waveform[i], 0.01, 1, sketch.height, 0);
      let xPosition = sketch.map(i, 0, audio.waveform.length, 0, sketch.width);

      sketch.line(xPosition, sketch.height, xPosition, barHeight);
    }
  };
};

let p5Wave = new p5(waveSpectrum);
