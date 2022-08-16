import { Mesh, Object3D, Scene } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class OverlayController {
    container : HTMLElement | null;
    rotateRange : LabeledRange;
    scaleRange : LabeledRange;
    placeButton : HTMLButtonElement;
    modelSelect : HTMLSelectElement;
    currentModel : string;
    model : Object3D;

    constructor(scene: Scene, model: Object3D, marker: Mesh) {
        this.container = document.getElementById("ui-container");
        this.rotateRange = new LabeledRange("rotate", 0, 359, 0, 0);
        this.scaleRange = new LabeledRange("scale", 25, 200, 50, 1);
        const modelList = ["workbench", "bookcase"];
        this.currentModel = modelList[0];
        this.model = model;
        this.placeButton = createPlaceButton();
        this.placeButton.onclick = () => {
            if (!this.model.visible) {
                this.model.visible = true;
            }
            this.model.position.setFromMatrixPosition(marker.matrix);
        }


        this.modelSelect = createModelSelect(modelList);
        this.modelSelect.onchange = () => {
            scene.remove(this.model);
            const loader = new GLTFLoader();
            const modelName = this.modelSelect.value;
            loader.load(`../assets/models/${modelName}.glb`, (gltf: GLTF) => {
                this.model = gltf.scene.children[0];
                this.model.position.setFromMatrixPosition(marker.matrix);
                this.model.visible = false;
                this.model.scale.setScalar(0.5);
                scene.add(this.model);

                this.scaleRange.setValue("50");
                this.rotateRange.setValue("0");
            });
        }

        if (this.container) {
            this.container.appendChild(this.rotateRange.container);
            this.container.appendChild(this.scaleRange.container);
            this.container.appendChild(this.placeButton);
            this.container.appendChild(this.modelSelect);

            this.setRotationControl();
            this.setScalingControl();
        }
    }

    setRotationControl() {
        var rotateValue : HTMLElement | null = document.getElementById("rotate-label");
        if (this.rotateRange && rotateValue) {
            rotateValue.innerHTML = this.rotateRange.getValue();
            this.rotateRange.range.oninput = () => { 
                if (rotateValue) rotateValue.innerHTML = this.rotateRange.getValue();
                this.model.rotation.y = (Math.PI / 180) * parseInt(this.rotateRange.getValue());
            }
        }
    }

    setScalingControl() {
        var scaleValue : HTMLElement | null = document.getElementById("scale-label");
        if (this.scaleRange && scaleValue) {
            scaleValue.innerHTML = this.scaleRange.getValue();
            this.scaleRange.range.oninput = () => { 
                if (scaleValue) scaleValue.innerHTML = this.scaleRange.getValue();
                let scaleRatio = parseFloat(this.scaleRange.getValue()) / 100.0;
                this.model.scale.setScalar(scaleRatio);
            }
        }
    }

    setVisible(isVisible: boolean) {
        if (this.container) {
            this.container.style.visibility = isVisible ? "block" : "none";
        }
    }
}

// UI elements
class LabeledRange {
    container : HTMLDivElement;
    label : HTMLParagraphElement;
    range : HTMLInputElement;

    constructor(idText: string, min: number, max: number, value: number, order: number) {
        this.container = document.createElement("div");
        this.label = createValueLabel(idText, value);
        this.range = createRange(idText, min, max, value, order);

        this.container.style.alignContent = "flex-start";
        this.container.appendChild(this.label);
        this.container.appendChild(this.range);

        // Positioning
        this.container.style.position = "fixed";
        let position = 64 * order;
        this.container.style.right = `${position}px`;
        this.container.style.bottom = "128px";
    }
    
    getValue() : string {
        return this.range.value;
    }

    setValue(value: string) {
        this.range.value = value;
        this.label.innerText = value;
    }
}

function createRange(idText: string, min: number, max: number, value: number, order: number) : HTMLInputElement {
    const range : HTMLInputElement = document.createElement("input");
    range.type = "range";
    range.min = `${min}`;
    range.max = `${max}`;
    range.value = `${value}`;
    range.id = `${idText}-range`;
    range.style.transform = "rotate(-90deg)";
    range.style.marginTop = "64px";

    return range;
}

function createValueLabel(idText: string, value: number) : HTMLParagraphElement {
    const label : HTMLParagraphElement = document.createElement("p");
    label.innerText = `${value}`;
    label.id = `${idText}-label`;
    label.style.textAlign = "center";
    return label;
}

function createPlaceButton() : HTMLButtonElement {
    const button : HTMLButtonElement = document.createElement("button");
    button.innerText = "Place";
    button.id = "place-button";
    button.style.position = "fixed";
    button.style.right = "32px";
    button.style.bottom = "32px";
    return button;
}

function createModelSelect(modelList: string[]) : HTMLSelectElement {
    const select : HTMLSelectElement = document.createElement("select");
    for (let i = 0; i < modelList.length; i++) {
        const option : HTMLOptionElement = document.createElement("option");
        option.value = modelList[i];
        option.innerHTML = modelList[i];
        select.appendChild(option);
    }
    select.style.position = "fixed";
    select.style.left = "32px";
    select.style.top = "64px";

    return select;
}

export default {
    OverlayController
};