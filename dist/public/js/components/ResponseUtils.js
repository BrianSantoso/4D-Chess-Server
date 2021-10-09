"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let firstError = (errors) => {
    let firstError;
    for (let errField in errors) {
        firstError = errors[errField];
        return firstError;
    }
};
exports.firstError = firstError;
//# sourceMappingURL=ResponseUtils.js.map