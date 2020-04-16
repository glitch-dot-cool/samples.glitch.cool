p5.disableFriendlyErrors = true;

const waveSpectrum = (sketch) => {
  let sunnk, nuan, fft, binSize;
  let buffer;
  let playNuan = document.querySelector("#play-nuan");
  let playSunnk = document.querySelector("#play-sunnk");
  let pause = document.querySelector("#pause");
  let instructions = document.querySelector(".instructions-container");

  // hacky mobile detection
  const isMobile =
    navigator.userAgent.toLowerCase().indexOf("mobile") !== -1 ||
    navigator.userAgent.toLowerCase().indexOf("iphone") !== -1 ||
    navigator.userAgent.toLowerCase().indexOf("ios") !== -1 ||
    navigator.userAgent.toLowerCase().indexOf("android") !== -1 ||
    navigator.userAgent.toLowerCase().indexOf("windows phone") !== -1;

  sketch.preload = function () {
    sunnk = sketch.loadSound("./sunnk_teaser.mp3");
    nuan = sketch.loadSound("./nuan_sonar_teaser.mp3");
  };

  sketch.setup = function () {
    sketch.getAudioContext().suspend();
    const audioCanvas = sketch.createCanvas(sketch.windowWidth, 200);
    audioCanvas.parent("p5-audio-container");
    sketch.setPixelDensity(isMobile);
    buffer = sketch.createGraphics(sketch.windowWidth * 0.25, 200);

    sketch.initTransportControls();
    isMobile ? (binSize = 256) : (binSize = 512);
    fft = new p5.FFT(0.8, binSize);
  };

  sketch.draw = function () {
    if (nuan.isPlaying()) {
      let audio = sketch.analyzeAudio();

      sketch.drawWaveform(audio);
      sketch.drawSpectrum(audio);
    } else if (sunnk.isPlaying()) {
      let audio = sketch.analyzeAudio();

      sketch.drawWaveformBars(audio);
      sketch.drawSpectrogram(audio);
    } else {
      sketch.clear();
    }
  };

  sketch.windowResized = function () {
    sketch.resizeCanvas(sketch.windowWidth, 200);
  };

  sketch.initTransportControls = function () {
    playNuan.addEventListener("click", () => {
      sketch.userStartAudio();
      if (!nuan.isPlaying()) {
        sunnk.pause();
        nuan.play();
        sketch.clear();
      }

      if (sketch.windowWidth <= 540) {
        instructions.style.display = "none";
      }
    });

    playSunnk.addEventListener("click", () => {
      sketch.userStartAudio();
      if (!sunnk.isPlaying()) {
        nuan.pause();
        sunnk.play();
        sketch.clear();
      }

      if (sketch.windowWidth <= 540) {
        instructions.style.display = "none";
      }
    });

    pause.addEventListener("click", () => {
      nuan.pause();
      sunnk.pause();
      if (sketch.windowWidth <= 540) {
        instructions.style.display = "block";
      }
    });
  };

  sketch.analyzeAudio = function () {
    let spectrum = fft.analyze();
    let waveform = fft.waveform(512);

    return {
      spectrum,
      waveform,
    };
  };

  sketch.drawWaveformBars = function (audio) {
    let sketchWidth = sketch.calculateWidth();

    sketch.fill(0);
    sketch.noStroke();
    sketch.rect(0, 0, sketchWidth, sketch.height);

    for (let i = 0; i < audio.waveform.length; i++) {
      sketch.stroke(audio.waveform[i] * 255);
      let barHeight = sketch.map(audio.waveform[i], 0.01, 1, sketch.height, 0);
      let xPosition = sketch.map(i, 0, audio.waveform.length, 0, sketchWidth);

      sketch.line(xPosition, sketch.height, xPosition, barHeight);
      sketch.line(xPosition, sketch.height, xPosition, -barHeight);
    }
  };

  sketch.drawWaveform = function (audio) {
    let sketchWidth = sketch.calculateWidth();
    sketch.fill(0, 20);
    sketch.rect(0, 0, sketchWidth, sketch.height);

    for (let i = 0; i < audio.waveform.length; i++) {
      sketch.stroke(audio.waveform[i] * 255);
      let barHeight = sketch.map(audio.waveform[i], -1, 1, sketch.height, 0);
      let xPosition = sketch.map(i, 0, audio.waveform.length, 0, sketchWidth);

      sketch.line(xPosition, sketch.height, xPosition, barHeight);
    }
  };

  sketch.drawSpectrum = function (audio) {
    let sketchWidth = sketch.calculateWidth();
    sketch.noStroke();
    sketch.fill(0);
    sketch.rect(sketch.width - sketchWidth, 0, sketchWidth, sketch.height);

    for (let i = 0; i < audio.spectrum.length; i++) {
      let barHeight = sketch.map(audio.spectrum[i], 0, 255, sketch.height, 0);
      let xPosition = sketch.map(
        i,
        0,
        audio.spectrum.length - 128,
        sketch.width - sketchWidth,
        sketch.width
      );
      sketch.stroke(audio.spectrum[i]);
      sketch.line(xPosition, sketch.height, xPosition, barHeight);
    }
  };

  sketch.drawSpectrogram = function (audio) {
    buffer.width = Math.floor(sketch.calculateWidth());
    buffer.noFill();
    buffer.strokeWeight(1.00001);
    for (let i = 0; i < audio.spectrum.length; i++) {
      let band = audio.spectrum[i];
      buffer.stroke(band);
      buffer.point(
        buffer.width,
        buffer.map(i, 0, audio.spectrum.length, buffer.height, -60)
      );
    }

    buffer.copy(
      0,
      0,
      buffer.width,
      buffer.height,
      -2,
      0,
      buffer.width,
      buffer.height
    );

    sketch.image(
      buffer,
      sketch.width - buffer.width,
      0,
      buffer.width,
      buffer.height
    );
  };

  sketch.setPixelDensity = function (isMobile) {
    isMobile ? sketch.pixelDensity(1) : null;
  };

  sketch.calculateWidth = function () {
    return sketch.width > 900
      ? sketch.windowWidth * 0.25
      : sketch.windowWidth * 0.5;
  };
};

let p5Wave = new p5(waveSpectrum);
