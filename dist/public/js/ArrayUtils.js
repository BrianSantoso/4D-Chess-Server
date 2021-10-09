"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
class ArrayUtils {
}
const unique = function (arr, identifier) {
    return lodash_1.uniqBy(arr, identifier);
};
exports.unique = unique;
exports.default = ArrayUtils;
//# sourceMappingURL=ArrayUtils.js.map