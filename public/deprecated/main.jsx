import React, { Component } from "react";
import Detector from "./Detector.js";
import { main } from "./app.js";

if (Detector.webgl) {
    main();
} else {
    var warning = Detector.getWebGLErrorMessage();
    document.getElementById('container').appendChild(warning);
}