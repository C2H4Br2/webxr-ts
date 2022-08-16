import { Mesh, MeshBasicMaterial, RingGeometry } from "three";

// Create a plane-based ring indicator for object placement
export function createMarker() {
    const markerMaterial = new MeshBasicMaterial({ color: 0xfffffff });
    const markerGeometry = new RingGeometry(0.14, 0.15, 16).rotateX(-Math.PI / 2);
    const marker = new Mesh(markerGeometry, markerMaterial);

    marker.matrixAutoUpdate = false;

    return marker;
}