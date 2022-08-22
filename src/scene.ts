import {
    AmbientLight, Object3D, PerspectiveCamera, Scene, WebGLRenderer, XRFrame
} from "three";
import { handleXRHitTest } from "./utils/hitTest";
import { createMarker } from "./utils/marker";
import { GestureController } from "./utils/gestureController";

export function createScene(renderer: WebGLRenderer, model: Object3D, modelInfo: { name: string, link: string }[]) {
    const scene = new Scene(); // for object placement
    const camera = getCamera(); // virtual camera
    const marker = createMarker(); // plane-based marker for hit-testing
    const controller = renderer.xr.getController(0); // XR controller
    const light = new AmbientLight(0xffffff, 1.0);  // provide global & even illumination to the scene
                                                    // 1.0: intensity
    var modelPlaced = false; // check if the object has initially been placed
    model.scale.setScalar(0.5);

    scene.add(marker);
    scene.add(controller);
    scene.add(light);

    // Hit-test handling -----------------------------------------------------------
    controller.addEventListener("select", onSelect);

    function onSelect() {
        if (!modelPlaced && marker.visible) {
            model.position.setFromMatrixPosition(marker.matrix);
            model.visible = true;
            scene.add(model);
            modelPlaced = true;
            
            new GestureController(model, modelInfo, marker, scene);
        }
    }

    function onHitTestReady(hitPoseTransformed : Float32Array) {
        if (hitPoseTransformed) {
            marker.visible = true;
            marker.matrix.fromArray(hitPoseTransformed);
        }
    }

    function onHitTestEmpty() {
        marker.visible = false;
    }

    // Render loop -----------------------------------------------------------------
    function renderLoop(_: number, frame?: XRFrame) {
        if (renderer.xr.isPresenting) {
            if (frame) {
                handleXRHitTest(renderer, frame, onHitTestReady, onHitTestEmpty);
            }
            renderer.render(scene, camera);
        }
    }
    renderer.setAnimationLoop(renderLoop);
}

function getCamera() : PerspectiveCamera {
    return new PerspectiveCamera(
        70, // field of view
        window.innerWidth / window.innerHeight, // aspect ratio
        0.02, // near plane (meters)
        20 // far plane (meters)
    );
}