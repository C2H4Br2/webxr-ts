import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { createScene } from "./scene";
import { browserSupportsImmersiveAR, displayMessage } from "./utils/domUtils";
import "./styles.css";
import { createRenderer } from "./utils/renderer";
import { Object3D } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

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
    const modelInfo : { name: string, link: string }[] = [
        {
            name: "Camera",
            link: "https://cdn.glitch.global/b877cc58-c669-4f5c-b017-4c0494397cb4/camera.glb?v=1661140606211"
        },
        {
            name: "Bookcase",
            link: "https://cdn.glitch.global/b877cc58-c669-4f5c-b017-4c0494397cb4/bookcase.glb?v=1661140589122"
        }
    ];
    loader.load(modelInfo[0].link, (gltf: GLTF) => {
        model = gltf.scene.children[0];
        model.name = modelInfo[0].name;
        createScene(renderer, model, modelInfo);
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