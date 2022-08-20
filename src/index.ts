import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { createScene } from "./scene";
import { browserSupportsImmersiveAR, displayMessage } from "./utils/domUtils";
import "./styles.css";
import { createRenderer } from "./utils/renderer";
import { Object3D } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { OverlayInitiator } from "./utils/overlayUtils";

function initializeXRApp() {
    console.info("[DEBUG] Initializing XR App...");

    // Create WebGL renderer
    const renderer : WebGLRenderer = createRenderer();
    document.body.appendChild(renderer.domElement);
    console.info("[DEBUG] Created WebGL renderer.");
    
    let options = {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay"],
        domOverlay: { root: document.getElementById("ui-container") }
    }

    // Create the AR button
    document.body.appendChild(ARButton.createButton(
        renderer,
        options
    ));

    // Load model, then create the scene if successful
    let model : Object3D;
    const loader = new GLTFLoader();
    loader.load("../assets/models/cameraSmol.glb", (gltf: GLTF) => {
        model = gltf.scene.children[0];
        model.name = "workbench";
        createScene(renderer, model);
    });
};

async function start() {
    // Initialize the app according to whether the browser supports AR or not
    const immersiveARSupported = await browserSupportsImmersiveAR();
    if (immersiveARSupported) {
        displayMessage(true);
        //new OverlayInitiator();
        initializeXRApp();
    }
    else displayMessage(false);
}

start();