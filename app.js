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
  background(0);

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

  easycam = new Dw.EasyCam(this._renderer, { distance: 300 });
  initHUD();

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

  // edges of case
  push();
  let state = easycam.getState().rotation.reduce((a, b) => a + b, 0);
  let rotation = map(state, -2, 4, 0, 255);
  strokeWeight(0.25);
  stroke(rotation);
  shininess(100);
  specularMaterial(0);
  box(201, 176, 9);
  pop();

  // case front/back
  fill(0);
  noStroke();
  rotateX(radians(90));
  specularMaterial(250);
  texture(img);
  model(mesh);
  pop();

  displayHUD();
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

// utility function to get some GL/GLSL/WEBGL information
function getGLInfo() {
  let gl = this._renderer.GL;

  let info = {};
  info.gl = gl;

  let debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  if (debugInfo) {
    info.gpu_renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    info.gpu_vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
  }
  info.wgl_renderer = gl.getParameter(gl.RENDERER);
  info.wgl_version = gl.getParameter(gl.VERSION);
  info.wgl_glsl = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
  info.wgl_vendor = gl.getParameter(gl.VENDOR);

  return info;
}

function initHUD() {
  let hleft = select("#hud-left");
  let hright = select("#hud-right");

  createElement("li", "gpu_renderer:").parent(hleft);
  createElement("li", "wgl_version:").parent(hleft);
  createElement("li", "wgl_glsl:").parent(hleft);
  createElement("li", "framerate:").parent(hleft).attribute("gap", "");
  createElement("li", "viewport:").parent(hleft);
  createElement("li", "distance:").parent(hleft).attribute("gap", "");
  createElement("li", "center:").parent(hleft);
  createElement("li", "rotation:").parent(hleft);

  let info = getGLInfo();
  createElement("li", info.gpu_renderer || ".").parent(hright);
  createElement("li", info.wgl_version || ".").parent(hright);
  createElement("li", info.wgl_glsl || ".").parent(hright);
  createElement("li", ".").parent(hright).attribute("gap", "");
  createElement("li", ".").parent(hright);
  createElement("li", ".").parent(hright).attribute("gap", "");
  createElement("li", ".").parent(hright);
  createElement("li", ".").parent(hright);
}

function displayHUD() {
  let state = easycam.getState();

  // update list
  let ul = select("#hud-right");
  ul.elt.children[3].innerHTML = nfs(frameRate(), 1, 2);
  ul.elt.children[4].innerHTML = nfs(easycam.getViewport(), 1, 0);
  ul.elt.children[5].innerHTML = nfs(state.distance, 1, 2);
  ul.elt.children[6].innerHTML = nfs(state.center, 1, 2);
  ul.elt.children[7].innerHTML = nfs(state.rotation, 1, 3);
}
