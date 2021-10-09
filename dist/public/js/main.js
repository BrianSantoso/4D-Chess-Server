"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Detector_js_1 = tslib_1.__importDefault(require("./Detector.js"));
const App2_js_1 = tslib_1.__importDefault(require("./App2.js"));
if (Detector_js_1.default.webgl) {
    window.onload = App2_js_1.default.main;
}
else {
    var warning = Detector_js_1.default.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}
//# sourceMappingURL=main.js.map