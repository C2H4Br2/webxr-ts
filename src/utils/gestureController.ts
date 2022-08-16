import { EventDispatcher, Mesh, Object3D } from "three";

export class GestureController extends EventDispatcher{
    container : HTMLElement | null;
    interact : HTMLDivElement; // area for interaction
    model : Object3D;
    marker : Mesh;
    
    // Interaction support variables
    positions : Pos[];
    action : string; // tap, swipe, pinch
    timeStart : number;

    constructor(model: Object3D, marker: Mesh) {
        super();

        this.container = document.getElementById("ui-container");
        this.interact = document.createElement("div");
        this.model = model;
        this.marker = marker;
        this.positions = [];
        this.action = "tap";
        this.timeStart = 0.0;

        this.initElements();
        this.initInteractions();
    }

    initElements() {
        if (this.container) {
            this.interact.id = "interact";
            this.interact.style.width = "100%";
            this.interact.style.height = "100%";
            this.interact.style.position = "fixed";
            this.interact.style.left = "0";
            this.interact.style.top = "0";

            this.container.appendChild(this.interact);
        }
    }

    initInteractions() {
        this.interact.addEventListener("touchstart", event => {
            event.preventDefault();

            let touches = event.targetTouches;
            this.timeStart = Date.now();
            [...touches].forEach(touch => {
                this.positions.push(new Pos(touch.pageX, touch.pageY));
            });
        });

        this.interact.addEventListener("touchmove", event => {
            event.preventDefault();

            if (Date.now() - this.timeStart > 100) this.action = "rotate";
            if (this.positions.length == 1 && this.action === "rotate") {
                // Swipe - Rotate
                let touchX = event.targetTouches[0].pageX;
                let touchY = event.targetTouches[0].pageY;
                this.rotate(this.positions[0].x, touchX);
                this.positions[0] = new Pos(touchX, touchY);
            }
        });

        this.interact.addEventListener("touchend", event => {
            event.preventDefault();

            if (this.positions.length == 1 && this.action == "tap") { this.place(); }
            this.positions.length = 0;
            this.action = "tap";
            this.timeStart = 0.0;
        });

        this.interact.addEventListener("touchcancel", event => {
            event.preventDefault();
            this.positions.length = 0;
            this.action = "tap";
            this.timeStart = 0.0;
        });
    }

    // Interaction functions -------------------------------------------------------
    place() {
        this.model.position.setFromMatrixPosition(this.marker.matrix);
    }

    rotate(startX : number, endX : number) {
        let delta : number = endX - startX;
        this.model.rotation.y += (Math.PI / 180.0) * delta;
    }
}

class Pos {
    x : number;
    y : number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export default {
    GestureController
}