// Verify whether the current browser supports immersive AR
export async function browserSupportsImmersiveAR() : Promise<boolean> {
    if (window.navigator.xr) {
        const isSupported : boolean | undefined = await navigator.xr?.isSessionSupported("immersive-ar");
        if (typeof isSupported == "undefined") {
            console.error("[ERROR] 'isSupported' is undefined!");
            return false;
        }
        let info = isSupported ? "supports" : "does not support";
        console.info(`[DEBUG] Current browser ${info} immersive AR.`);
        return isSupported;
    }
    return false;
}

// Show message according to the browser's capabilities of immersive AR
export async function displayMessage(supported: boolean) {
    const appRoot : HTMLElement | null = document.getElementById("app-root");
    const title : HTMLParagraphElement = document.createElement("h1");
    const message : HTMLParagraphElement = document.createElement("p");
    const help : HTMLParagraphElement = document.createElement("p");

    if (supported) {
        title.innerText = "Welcome!";
        message.innerText = "Press the button below to enter AR experience!";
        help.innerText = "Note: It is better to run the app in well lit environment, with enough space to move around.";
    } else {
        title.innerText = "Oh no!";
        message.innerText = "It seems your browser does not support WebXR.";
        help.innerText = "Try opening the page in a recent version of Chrome on Android.";
    }

    help.style.fontSize = "16px";
    help.style.fontSize = "bold";
    help.style.padding = "64px 64px 0px 64px";
    help.style.opacity = "0.8";

    if (appRoot) {
        appRoot.appendChild(title);
        appRoot.appendChild(message);
        appRoot.appendChild(help);
    }

    return () => {
        if (appRoot) {
            if (appRoot.contains(title)) {
                appRoot.removeChild(title);
            }
            if (appRoot.contains(message)) {
                appRoot.removeChild(message);
            }
            if (appRoot.contains(help)) {
                appRoot.removeChild(help);
            }
        }
    };
}

export default {
    browserSupportsImmersiveAR,
    displayMessage
};