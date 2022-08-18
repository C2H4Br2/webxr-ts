import { EventDispatcher, Mesh, Object3D, Scene } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class GestureController extends EventDispatcher{
    container : HTMLDivElement;
    interact : HTMLDivElement; // area for interaction
    loading : HTMLDivElement;
    model : Object3D;
    scene : Scene;
    marker : Mesh;
    loader : GLTFLoader;
    
    // Interaction support variables
    positions : Pos[] = [];
    action : string = "tap"; // tap, swipe, pinch
    timeStart : number = 0.0;
    currentIds : number[] = [];
    currentScale : number = 0.5; // current model scale

    // UI Overlay
    debugDivs : { div: HTMLDivElement, name: string }[] = [];
    debugDivsLen : number = 4;
    btnSwap : HTMLButtonElement;


    constructor(model: Object3D, marker: Mesh, scene : Scene) {
        super();

        this.container = <HTMLDivElement>document.getElementById("ui-container");
        this.interact = document.createElement("div");
        this.loading = document.createElement("div");
        this.btnSwap = <HTMLButtonElement>document.createElement("button");
        this.model = model;
        this.scene = scene;
        this.marker = marker;
        this.loader = new GLTFLoader();

        this.initElements();
        this.initInteractions();
    }

    initElements() {
        this.interact.id = "interact";
        this.interact.style.width = "100%";
        this.interact.style.height = "100%";
        this.interact.style.position = "fixed";
        this.interact.style.left = "0";
        this.interact.style.top = "0";
        this.container.appendChild(this.interact);

        this.loading
        
        for (let i = 0; i < this.debugDivsLen; i++) {
            let div : HTMLDivElement = document.createElement("div");
            let name : string = "Touches";
            switch (i) {
                case 1: name = "Action"; break;
                case 2: name = "Rotate"; break;
                case 3: name = "Scale"; break;
            }
            div.id = `div-${name}`;
            let innerHTMLTail : string = this.getElementHTMLTail(i);
            div.innerHTML = name + ": " + innerHTMLTail;
            div.style.position = "fixed";
            div.style.left = "16px";
            div.style.top = `${48 + 32 * i}px`;
            this.debugDivs.push({div, name});
            this.container.appendChild(div);
        }

        this.btnSwap.className = "btn";
        this.btnSwap.innerHTML = "Change Model"
        this.btnSwap.onclick = () => {
            this.setContainerVisible(false);
            var swapName : string = "bookcase";
            if (this.model.name == "workbench") {
                swapName = "bookcase";
            } else swapName = "workbench";
            this.loader.load(`../assets/models/${swapName}.glb`, (gltf: GLTF) => {
                this.scene.remove(this.model);
                this.model = gltf.scene.children[0];
                this.model.position.setFromMatrixPosition(this.marker.matrix);
                this.model.visible = false;
                this.model.scale.setScalar(0.5);
                this.model.name = swapName;
                this.scene.add(this.model);
                this.setContainerVisible(true);
            });
        };
        this.container.appendChild(this.btnSwap);
    }

    getElementHTMLTail(idx : number) : string {
        switch (idx) {
            case 1: return this.action;
            case 2: return Math.round((this.model.rotation.y * (180.0 / Math.PI))).toString();
            case 3: return this.model.scale.x.toFixed(2).toString();
            default: return this.positions.length.toString();
        }
    }

    resetDebugDivs() {
        for (let i = 0; i < this.debugDivsLen; i++) {
            this.debugDivs[i].div.innerHTML = this.debugDivs[i].name + ": " + this.getElementHTMLTail(i);
        }
    }

    setContainerVisible(visible: boolean) {
        if (visible) {
            this.container.style.visibility = "visible";
        } else {
            this.container.style.visibility = "hidden";
        }
    }

    // Interaction functions -------------------------------------------------------
    initInteractions() {
        this.interact.addEventListener("touchstart", event => {
            event.preventDefault();

            let touches = event.targetTouches;
            this.timeStart = Date.now();
            [...touches].forEach(touch => {
                if (!(touch.identifier in this.currentIds)) {
                    this.positions.push(new Pos(touch.pageX, touch.pageY));
                    this.currentIds.push(touch.identifier);
                }
                if (this.positions.length == 2) this.currentScale = this.model.scale.x;
            });
        });

        this.interact.addEventListener("touchmove", event => {
            event.preventDefault();

            if (Date.now() - this.timeStart > 100) {
                if (this.positions.length == 1) this.action = "rotate";
                else if (this.positions.length == 2) this.action = "scale";
                else this.action = "unknown";
            }
            if (this.action === "rotate") {
                // Swipe - Rotate
                let touchX = event.targetTouches[0].pageX;
                let touchY = event.targetTouches[0].pageY;
                this.rotate(this.positions[0].x, touchX);
                this.positions[0] = new Pos(touchX, touchY);
            } else if (this.action === "scale") {
                // Pinch - Scale
                let pos = this.positions;
                let target = event.targetTouches;
                let pos_1 = new Pos(target[0].pageX, target[0].pageY);
                let pos_2 = new Pos(target[1].pageX, target[1].pageY);
                this.scale(pos, pos_1, pos_2);
            }
            
            this.resetDebugDivs();
        });

        this.interact.addEventListener("touchend", event => {
            event.preventDefault();

            // Tap - Place
            if (this.positions.length == 1) {
                if (this.action === "tap") {
                    this.place();
                    if (!this.model.visible) this.model.visible = true;
                }
            }
            this.positions.length = 0;
            this.currentIds.length = 0;
            this.action = "tap";
            this.timeStart = 0.0;
            this.currentScale = this.model.scale.x;
            this.resetDebugDivs();
        });

        this.interact.addEventListener("touchcancel", event => {
            event.preventDefault();
            this.positions.length = 0;
            this.currentIds.length = 0;
            this.action = "tap";
            this.timeStart = 0.0;
            this.currentScale = this.model.scale.x;
            this.resetDebugDivs();
        });
    }

    place() {
        this.model.position.setFromMatrixPosition(this.marker.matrix);
    }

    rotate(startX : number, endX : number) {
        let delta : number = endX - startX;
        this.model.rotation.y += (Math.PI / 180.0) * delta;
    }

    scale(pos : Pos[], pos_1 : Pos, pos_2 : Pos) {
        let baseDistance = Math.sqrt(Math.pow(pos[1].x - pos[0].x, 2) + Math.pow(pos[1].y - pos[0].y, 2));
        let curDistance = Math.sqrt(Math.pow(pos_2.x - pos_1.x, 2) + Math.pow(pos_2.y - pos_1.y, 2));
        let scaleRatio = curDistance / baseDistance;
        this.model.scale.setScalar(this.currentScale * scaleRatio);
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