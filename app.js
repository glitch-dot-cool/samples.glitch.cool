// p5.disableFriendlyErrors = true;

let container, canvas, easycam, img;

function preload() {
  img = loadImage("./cover.jpg");
}

function setup() {
  container = document.querySelector("#p5-container");
  setAttributes("antialias", true);

  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent("p5-container");

  // fix for EasyCam to work with p5 v0.9.0+
  Dw.EasyCam.prototype.apply = function (n) {
    var o = this.cam;
    (n = n || o.renderer),
      n &&
        ((this.camEYE = this.getPosition(this.camEYE)),
        (this.camLAT = this.getCenter(this.camLAT)),
        (this.camRUP = this.getUpVector(this.camRUP)),
        n._curCamera.camera(
          this.camEYE[0],
          this.camEYE[1],
          this.camEYE[2],
          this.camLAT[0],
          this.camLAT[1],
          this.camLAT[2],
          this.camRUP[0],
          this.camRUP[1],
          this.camRUP[2]
        ));
  };
  easycam = createEasyCam({ distance: 300 });

  setupMouseBehavior();
}

function draw() {
  noStroke();
  fill(0, 1);
  plane(width, height);

  strokeWeight(0.25);
  stroke(255);
  fill(255, 64, 0);

  ambientLight(255, 255, 255);

  texture(img);
  box(200, 175, 10);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  easycam.setViewport([0, 0, windowWidth, windowHeight]);
}

function setupMouseBehavior() {
  document.oncontextmenu = function () {
    return false;
  };
  document.onmousedown = function () {
    return false;
  };
}
