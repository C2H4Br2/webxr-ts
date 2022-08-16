import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";

export function createRenderer() : WebGLRenderer {
    const { devicePixelRatio, innerHeight, innerWidth } = window;

    const renderer = new WebGLRenderer({ 
        antialias: true, // make the model look cleaner
        alpha: true // allow utilization of transparency on objects rendered in the scene
    });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.xr.enabled = true;

    return renderer;
}