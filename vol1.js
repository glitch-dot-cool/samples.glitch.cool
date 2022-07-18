p5.disableFriendlyErrors = true;

const main = (sketch) => {
  let img, mesh;

  // hacky mobile detection
  const isMobile =
    navigator.userAgent.toLowerCase().indexOf("mobile") !== -1 ||
    navigator.userAgent.toLowerCase().indexOf("iphone") !== -1 ||
    navigator.userAgent.toLowerCase().indexOf("ios") !== -1 ||
    navigator.userAgent.toLowerCase().indexOf("android") !== -1 ||
    navigator.userAgent.toLowerCase().indexOf("windows phone") !== -1;

  sketch.preload = function () {
    img = sketch.loadImage("./vol1_texture.jpg");
    mesh = sketch.loadModel("./model.obj", true);
  };

  sketch.setup = function () {
    const canvas = sketch.createCanvas(
      sketch.windowWidth,
      sketch.windowHeight,
      sketch.WEBGL
    );
    canvas.parent("p5-container");

    sketch.setPixelDensity(isMobile);
    sketch.setAttributes("antialias", true);
    sketch.background(0);

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

    sketch.easycam = new Dw.EasyCam(this._renderer, {
      distance: 300,
    });

    sketch.initHUD();
    sketch.setupMouseBehavior();

    const clear = document.querySelector("#clear");
    clear.addEventListener("click", () => {
      sketch.background(0);
    });
  };

  sketch.draw = function () {
    sketch.push();
    let state = sketch.easycam.getState().rotation.reduce((a, b) => a + b, 0);
    let rotation = sketch.map(state, -2, 4, 0, 255);
    let locX = sketch.mouseX - sketch.height / 2;
    let locY = sketch.mouseY - sketch.width / 2;

    sketch.ambientLight(100);

    sketch.directionalLight(175, 175, 175, -locX, -locY, -10);
    sketch.directionalLight(175, 175, 175, locX, locY, 10);

    sketch.pointLight(175, 175, 175, locX, locY, 250);
    sketch.pointLight(175, 175, 175, locX, locY, -250);

    // edges of case
    sketch.push();
    sketch.strokeWeight(0.25);
    sketch.stroke(rotation);
    sketch.shininess(500);
    sketch.specularMaterial(0);
    sketch.box(201, 176, 9);
    sketch.pop();

    // case front/back
    sketch.fill(0);
    sketch.noStroke();
    sketch.rotateX(sketch.radians(90));
    sketch.rotateY(sketch.radians(180));

    sketch.texture(img);
    sketch.model(mesh);

    sketch.pop();
    sketch.displayHUD();
  };

  sketch.windowResized = function () {
    sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight);
    sketch.background(0);
    sketch.easycam.setViewport([0, 0, sketch.windowWidth, sketch.windowHeight]);
  };

  sketch.setupMouseBehavior = function () {
    document.oncontextmenu = function () {
      return false;
    };
  };

  // utility function to get some GL/GLSL/WEBGL information
  sketch.getGLInfo = function () {
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
  };

  sketch.initHUD = function () {
    let hleft = sketch.select("#hud-left");
    let hright = sketch.select("#hud-right");

    sketch.createElement("li", "gpu_renderer:").parent(hleft);
    sketch.createElement("li", "wgl_version:").parent(hleft);
    sketch.createElement("li", "wgl_glsl:").parent(hleft);
    sketch.createElement("li", "framerate:").parent(hleft).attribute("gap", "");
    sketch.createElement("li", "viewport:").parent(hleft);
    sketch.createElement("li", "distance:").parent(hleft).attribute("gap", "");
    sketch.createElement("li", "center:").parent(hleft);
    sketch.createElement("li", "rotation:").parent(hleft);

    let info = sketch.getGLInfo();
    sketch.createElement("li", info.gpu_renderer || ".").parent(hright);
    sketch.createElement("li", info.wgl_version || ".").parent(hright);
    sketch.createElement("li", info.wgl_glsl || ".").parent(hright);
    sketch.createElement("li", ".").parent(hright).attribute("gap", "");
    sketch.createElement("li", ".").parent(hright);
    sketch.createElement("li", ".").parent(hright).attribute("gap", "");
    sketch.createElement("li", ".").parent(hright);
    sketch.createElement("li", ".").parent(hright);
  };

  sketch.displayHUD = function () {
    let state = sketch.easycam.getState();

    // update list
    let ul = sketch.select("#hud-right");
    ul.elt.children[3].innerHTML = sketch.nfs(sketch.frameRate(), 1, 2);
    ul.elt.children[4].innerHTML = sketch.nfs(
      sketch.easycam.getViewport(),
      1,
      0
    );
    ul.elt.children[5].innerHTML = sketch.nfs(state.distance, 1, 2);
    ul.elt.children[6].innerHTML = sketch.nfs(state.center, 1, 2);
    ul.elt.children[7].innerHTML = sketch.nfs(state.rotation, 1, 3);
  };

  sketch.setPixelDensity = function (isMobile) {
    isMobile ? sketch.pixelDensity(1.5) : null;
  };
};

let p5Main = new p5(main);
