import Detector from "./Detector.js";
import App from "./App2.js";

if (Detector.webgl) {
    window.onload = App.main;
} else {
    var warning = Detector.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}