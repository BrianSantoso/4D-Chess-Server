/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./testing/PieceBehavior.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./public/js/ArrayUtils.js":
/*!*********************************!*\
  !*** ./public/js/ArrayUtils.js ***!
  \*********************************/
/*! exports provided: default, union, contains, unique */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"union\", function() { return union; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"contains\", function() { return contains; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"unique\", function() { return unique; });\n/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash */ \"lodash\");\n/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);\n\n\nclass ArrayUtils {\n\t\n}\n\nconst union = function(movesA, movesB) {\n\tlet result = [...movesA]\n\tmovesB.forEach(move => {\n\t\tif (!contains(result, move)) {\n\t\t\tresult.push(move);\n\t\t}\n\t});\n\treturn result;\n}\n\nconst contains = function(moveList, move) {\n\tfor (let curr of moveList) {\n\t\tif (Object(lodash__WEBPACK_IMPORTED_MODULE_0__[\"isEqual\"])(curr, move)) {\n\t\t\treturn true;\n\t\t}\n\t}\n\treturn false;\n}\n\nconst indexOf = function(arr, item, predicate=lodash__WEBPACK_IMPORTED_MODULE_0__[\"isEqual\"]) {\n\tfor (let i = 0; i < arr.length; i++) {\n\t\tif (predicate(arr[i], item)) {\n\t\t\treturn i;\n\t\t}\n\t}\n\treturn -1;\n}\n\nconst unique = function(arr) {\n\treturn arr.filter((item, index) => {\n\t\treturn indexOf(arr, item) === index\n\t});\n}\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (ArrayUtils);\n\n\n//# sourceURL=webpack:///./public/js/ArrayUtils.js?");

/***/ }),

/***/ "./testing/PieceBehavior.js":
/*!**********************************!*\
  !*** ./testing/PieceBehavior.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _public_js_ArrayUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../public/js/ArrayUtils.js */ \"./public/js/ArrayUtils.js\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);\n\n\n\nclass PieceParamsTemplate {\n\tconstructor(type) {\n\t\tthis.type = type;\n\t}\n\t\n\tmovement() {\n\t\treturn null;\n\t}\n\t\n\tattack() {\n\t\t// By default, piece attacking behavior is identical to its movement, except that it can capture\n\t\tlet attackBehavior = this.movement().map(behavior => {\n\t\t\tlet attackingVersion = behavior.attackingVersion();\n\t\t\treturn attackingVersion;\n\t\t});\n\t\treturn attackBehavior;\n\t}\n\t\n\tbehavior() {\n\t\treturn this.movement().concat(this.attack());\n\t}\n\t\n\tattackRayCastParams() {\n\t\tif (!this._attackRayCastParams) {\n\t\t\tlet behaviors = this.attack();\n\t\t\tlet params = behaviors.map(b => b.toRayCastParams()).flat();\n\t\t\tthis._attackRayCastParams = Object(_public_js_ArrayUtils_js__WEBPACK_IMPORTED_MODULE_0__[\"unique\"])(params);\n\t\t}\n\t\treturn this._attackRayCastParams;\n\t}\n\t\n\trayCastParams() {\n\t\tif (!this._rayCastParams) {\n\t\t\tlet behaviors = this.behavior();\n\t\t\tlet params = behaviors.map(b => b.toRayCastParams()).flat();\n\t\t\tthis._rayCastParams = Object(_public_js_ArrayUtils_js__WEBPACK_IMPORTED_MODULE_0__[\"unique\"])(params);\n\t\t}\n\t\treturn this._rayCastParams;\n\t}\n}\n\nclass PawnUnmoved extends PieceParamsTemplate {\n\tconstructor(team) {\n\t\tsuper('pawnUnmoved'+team);\n\t\tthis.team = team;\n\t}\n\t\n\tmovement() {\n\t\tlet forwards = this.team == 'White' ? \n\t\t\tPieceBehavior.FORWARD : PieceBehavior.BACKWARD;\n\t\tlet movement = [\n\t\t\tPieceBehavior.create([1], 2, false, [\n\t\t\t\tPieceBehavior.CANT_MOVE,\n\t\t\t\tPieceBehavior.CANT_MOVE,\n\t\t\t\tforwards,\n\t\t\t\tforwards\n\t\t\t])\n\t\t];\t\n\t\treturn movement;\n\t}\n\t\n\tattack() {\n\t\tlet forwards = this.team == 'White' ? \n\t\t\tPieceBehavior.FORWARD : PieceBehavior.BACKWARD;\n\t\treturn [\n\t\t\tPieceBehavior.create([1, 1], 1, true, [\n\t\t\t\tPieceBehavior.BIDIRECTIONAL,\n\t\t\t\tPieceBehavior.BIDIRECTIONAL,\n\t\t\t\tforwards,\n\t\t\t\tforwards\n\t\t\t])\n\t\t];\n\t}\n}\n\nclass PawnMoved extends PieceParamsTemplate {\n\tconstructor(team) {\n\t\tsuper('pawnMoved'+team);\n\t\tthis.team = team;\n\t}\n\t\n\tmovement() {\n\t\tlet forwards = this.team == this.team == 'White' ? \n\t\t\tPieceBehavior.FORWARD : PieceBehavior.BACKWARD;\n\t\tlet movement = [\n\t\t\tPieceBehavior.create([1], 1, false, [\n\t\t\t\tPieceBehavior.CANT_MOVE,\n\t\t\t\tPieceBehavior.CANT_MOVE,\n\t\t\t\tforwards,\n\t\t\t\tforwards\n\t\t\t])\n\t\t];\n\t\treturn movement;\n\t}\n\t\n\tattack() {\n\t\tlet forwards = this.team == 'White' ? \n\t\t\tPieceBehavior.FORWARD : PieceBehavior.BACKWARD;\n\t\treturn [\n\t\t\tPieceBehavior.create([1, 1], 1, true, [\n\t\t\t\tPieceBehavior.BIDIRECTIONAL,\n\t\t\t\tPieceBehavior.BIDIRECTIONAL,\n\t\t\t\tforwards,\n\t\t\t\tforwards\n\t\t\t])\n\t\t];\n\t}\n}\n\nclass King extends PieceParamsTemplate {\n\tconstructor() {\n\t\tsuper('king');\n\t}\n\tmovement() {\n\t\tlet orthogonal = PieceBehavior.create([1], 1);\n\t\tlet diagonal = PieceBehavior.create([1, 1], 1);\n\t\treturn [orthogonal, diagonal];\n\t}\n}\n\nclass Queen extends PieceParamsTemplate {\n\tconstructor() {\n\t\tsuper('queen');\n\t}\n\tmovement() {\n\t\tlet orthogonal = PieceBehavior.create([1], Infinity);\n\t\tlet diagonal = PieceBehavior.create([1, 1], Infinity);\n\t\treturn [orthogonal, diagonal];\n\t}\n}\n\nclass Bishop extends PieceParamsTemplate {\n\tconstructor() {\n\t\tsuper('bishop');\n\t}\n\tmovement() {\n\t\tlet diagonal = PieceBehavior.create([1, 1], Infinity);\n\t\treturn [diagonal];\n\t}\n}\n\nclass Knight extends PieceParamsTemplate {\n\tconstructor() {\n\t\tsuper('knight');\n\t}\n\tmovement() {\n\t\tlet L = PieceBehavior.create([1, 2], 1);\n\t\treturn [L];\n\t}\n}\n\nclass Rook extends PieceParamsTemplate {\n\tconstructor() {\n\t\tsuper('rook');\n\t}\n\tmovement() {\n\t\tlet orthogonal = PieceBehavior.create([1], Infinity);\n\t\treturn [orthogonal];\n\t}\n}\n\nclass PieceBehavior {\n\t// TODO: PieceBehaviors and their rayCastParams can be cached for potential optimization\n\t\n\t// Describes a raycast operation\n\tconstructor(units, maxSteps, canCapture=false, axisRules=PieceBehavior.ALL_DIRS) {\n\t\tthis.units = units; // Number of units to step in any axis. Denote a different axis by an additional unit in the array\n\t\tthis.maxSteps = maxSteps;\n\t\tthis.canCapture = canCapture // Whether piece can capture another piece. Used to differentiate between movement and attacks\n\t\tthis.axisRules = axisRules;\n\t\tthis._rayCastParams;\n\t}\n\t\n\tattackingVersion() {\n\t\treturn PieceBehavior.create(this.units, this.maxSteps, true, this.axisRules);\n\t}\n\t\n\ttoRayCastParams() {\n\t\t// Returns all ray cast directions given for this piece behavior\n\t\tif (!this._rayCastParams) {\n\t\t\tlet directions = this._permuteReplace();\n\t\t\tthis._rayCastParams = directions.map(dir => ({\n\t\t\t\tdirection: dir,\n\t\t\t\tmaxSteps: this.maxSteps,\n\t\t\t\tcanCapture: this.canCapture\n\t\t\t}));\n\t\t}\n\t\treturn this._rayCastParams;\n\t}\n\t\n\thash() {\n\t\treturn JSON.stringify([this.units, this.maxSteps, this.canCapture, this.axisRules]);\n\t}\n\t\n\t_expandAxisRules() {\n\t\t// Replaces all BIDIRECTIONAL in axisRules with a FORWARD and BACKWARDs\n\t\tconst appendToAll = (arrs, item) =>\n\t\t\tarrs.map(inner => \n\t\t\t\tinner.concat([item])\n\t\t\t)\n\t\t\n\t\tlet result = [[]];\n\t\tthis.axisRules.forEach(rule => {\n\t\t\tif (rule == PieceBehavior.BIDIRECTIONAL) {\n\t\t\t\tlet pos = appendToAll(result, PieceBehavior.FORWARD);\n\t\t\t\tlet neg = appendToAll(result, PieceBehavior.BACKWARD);\n\t\t\t\tresult = pos.concat(neg);\n\t\t\t} else {\n\t\t\t\tresult = appendToAll(result, rule);\n\t\t\t}\n\t\t});\n\t\treturn result;\n\t}\n\t\n\t_permuteReplace() {\n\t\t// Returns all permutations of this.units on this.axisRules\n\t\t// Permute(axisRules, units) = [...list of ray cast directions]\n\t\t\n\t\t// Insert an item to beginning of every array in a list of arrays\n\t\tconst insertToAll = (item, arrs) => \n\t\t\tarrs.map(inner => [item].concat(inner))\n\t\t\n\t\tconst permuteReplace = (units, axis) => {\n\t\t\tif (axis.length == 0) {\n\t\t\t\tif (units.length > 0) {\n\t\t\t\t\treturn []; // There are still items in units left, but no axis, so invalidate\n\t\t\t\t} else {\n\t\t\t\t\treturn [[]]; // We reached the end of axis, so construct a new list for this path\n\t\t\t\t}\n\t\t\t}\n\t\t\t\n\t\t\tif (axis[0] == PieceBehavior.NONE) {\n\t\t\t\t// Can't replace NONE, so skip\n\t\t\t\treturn insertToAll(0, permuteReplace(units, axis.slice(1)));\n\t\t\t}\n\t\t\t\n\t\t\tif (units.length == 0) {\n\t\t\t\t// There are still some axis left, so pad with 0's\n\t\t\t\treturn insertToAll(0, permuteReplace(units, axis.slice(1)));\n\t\t\t}\n\t\t\t\n\t\t\tlet result = []\n\t\t\t// replace current slot (axis[0]) with one of each unit\n\t\t\tfor (let i = 0; i < units.length; i++) {\n\t\t\t\tlet unit = units[i] * axis[0];\n\t\t\t\tlet rest = [...units]\n\t\t\t\trest.splice(i, 1);\n\t\t\t\tresult = result.concat(insertToAll(unit, permuteReplace(rest, axis.slice(1))));\n\t\t\t}\n\t\t\t\n\t\t\t// use none of the units to replace this slot, so skip\n\t\t\tresult = result.concat(insertToAll(0, permuteReplace(units, axis.slice(1))));\n\t\t\treturn result;\n\t\t}\n\t\t\n\t\tlet axisRules = this._expandAxisRules();\n\t\tlet directions = axisRules.map(axisRule => {\n\t\t\tlet dirs = permuteReplace(this.units, axisRule);\n\t\t\tlet uniqueDirs = Object(_public_js_ArrayUtils_js__WEBPACK_IMPORTED_MODULE_0__[\"unique\"])(dirs)\n\t\t\treturn uniqueDirs;\n\t\t});\n\t\tdirections = directions.flat();\n\t\treturn Object(_public_js_ArrayUtils_js__WEBPACK_IMPORTED_MODULE_0__[\"unique\"])(directions);\n\t}\n\t\n}\n\nPieceBehavior.cachedBehaviors = {};\n\nPieceBehavior.create = (units, maxSteps, canCapture=false, axisRules=PieceBehavior.ALL_DIRS) => {\n\tlet behavior = new PieceBehavior(units, maxSteps, canCapture, axisRules);\n\tlet hash = behavior.hash();\n\tlet result;\n\tif (hash in PieceBehavior.cachedBehaviors) {\n\t\treturn PieceBehavior.cachedBehaviors[hash];\n\t} else {\n\t\tPieceBehavior.cachedBehaviors[hash] = behavior;\n\t\tbehavior.toRayCastParams();\n\t\treturn behavior;\n\t}\n\treturn behavior;\n}\n\nPieceBehavior.BACKWARD = -1;\nPieceBehavior.CANT_MOVE = 0;\nPieceBehavior.FORWARD = 1;\nPieceBehavior.BIDIRECTIONAL = 2;\nPieceBehavior.ALL_DIRS = [\n\tPieceBehavior.BIDIRECTIONAL, \n\tPieceBehavior.BIDIRECTIONAL, \n\tPieceBehavior.BIDIRECTIONAL, \n\tPieceBehavior.BIDIRECTIONAL\n];\n\nPieceBehavior.computeAll = () => {\n\tlet output = {};\n\tlet templates = [\n\t\tnew PawnUnmoved('White'),\n\t\tnew PawnUnmoved('Black'),\n\t\tnew PawnMoved('White'),\n\t\tnew PawnMoved('Black'),\n\t\tnew Rook(),\n\t\tnew Knight(),\n\t\tnew Bishop(),\n\t\tnew Queen(),\n\t\tnew King(),\n\t];\n\ttemplates.forEach(piece => {\n\t\tlet pieceParams = {\n\t\t\tattack: piece.attackRayCastParams(),\n\t\t\tbehavior: piece.rayCastParams()\n\t\t}\n\t\toutput[piece.type] = pieceParams;\n\t});\n\tfs__WEBPACK_IMPORTED_MODULE_1__[\"writeFile\"]('./testing/rayCastParams.json', JSON.stringify(output), (err) => {\n        if (err) {\n\t\t\tconsole.log('Error writing file:', err);\n\t\t}\n    });\n\tconsole.log(output);\n}\n\nPieceBehavior.computeAll();\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (PieceBehavior);\n\n//# sourceURL=webpack:///./testing/PieceBehavior.js?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash\");\n\n//# sourceURL=webpack:///external_%22lodash%22?");

/***/ })

/******/ });