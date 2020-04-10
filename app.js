// p5.disableFriendlyErrors = true;

let container, canvas, img, mesh, easycam;

function preload() {
  img = loadImage("./texture.png");
  mesh = loadModel("./model.obj", true);
}

function setup() {
  container = document.querySelector("#p5-container");
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent("p5-container");
  setAttributes("antialias", true);

  // fix for EasyCam to work with p5 v0.9.0+
  Dw.EasyCam.prototype.apply = function (n) {
    let o = this.cam;
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
  push();
  let locX = mouseX - height / 2;
  let locY = mouseY - width / 2;

  ambientLight(50);

  directionalLight(250, 250, 250, -locX, -locY, -10);
  directionalLight(250, 250, 250, locX, locY, 10);

  pointLight(255, 255, 255, locX, locY, 250);
  pointLight(255, 255, 255, locX, locY, -250);

  fill(0);
  noStroke();
  rotateX(radians(90));
  specularMaterial(250);
  texture(img);
  model(mesh);
  pop();
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
