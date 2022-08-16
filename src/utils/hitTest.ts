import { WebGLRenderer, XRFrame, XRHitTestSource } from "three";

let hitTestSource : XRHitTestSource;
let hitTestSourceRequested = false;

export function handleXRHitTest(
    renderer: WebGLRenderer,
    frame: XRFrame,
    onHitTestResultReady: (hitPoseMatrix: Float32Array) => void,
    onHitTestResultEmpty: () => void
) {
    const referenceSpace = renderer.xr.getReferenceSpace(); // ensure objects are rendered correctly 
                                                            // relative to the device
    const session = renderer.xr.getSession();   // refer to current XR session 
                                                // for information like device's position and orientation
    let xrHitPoseMatrix : Float32Array | null | undefined; // store the most recent hit test result

    if (session && hitTestSourceRequested == false) {
        session.requestReferenceSpace("viewer") // ref. Space that requires no tracking, 
                                                // creating experiences that don't respond to the device's motion
            .then((referenceSpace) => {
                // Retrieve hit test source    
                if (session) {
                    session
                        .requestHitTestSource({ space: referenceSpace })
                        .then((source) => {
                            hitTestSource = source;
                        });
                }
        });
        hitTestSourceRequested = true;
    }

    if (hitTestSource) {
        const hitTestResults = frame.getHitTestResults(hitTestSource); // get current frame's hit test results

        if (hitTestResults.length) {
            const hit = hitTestResults[0];

            if (hit && hit !== null && referenceSpace) {
                const xrHitPose = hit.getPose(referenceSpace); // get the pose from the hit object
                if (xrHitPose) {
                    xrHitPoseMatrix = xrHitPose.transform.matrix;
                    onHitTestResultReady(xrHitPoseMatrix); // place the object in the scene
                }
            }
        } else {
            onHitTestResultEmpty();
        }
    }
};