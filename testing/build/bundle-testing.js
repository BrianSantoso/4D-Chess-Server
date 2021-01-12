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
/******/ 	return __webpack_require__(__webpack_require__.s = "./testing/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./public/js/FormValidator.js":
/*!************************************!*\
  !*** ./public/js/FormValidator.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var validator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! validator */ \"validator\");\n/* harmony import */ var validator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(validator__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var is_empty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! is-empty */ \"is-empty\");\n/* harmony import */ var is_empty__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(is_empty__WEBPACK_IMPORTED_MODULE_1__);\n// https://blog.bitsrc.io/build-a-login-auth-app-with-mern-stack-part-1-c405048e3669\n\n\n\nclass FormValidator {\n    constructor (excludeList=[]) {\n        this.excludeList = excludeList;\n        this.checks = {};\n    }\n\n    validate(data) {\n        let errors = {};\n        // Convert empty fields to an empty string so we can use validator functions\n        data.username = !is_empty__WEBPACK_IMPORTED_MODULE_1___default()(data.username) ? data.username : \"\";\n        data.email = !is_empty__WEBPACK_IMPORTED_MODULE_1___default()(data.email) ? data.email : \"\";\n        data.password = !is_empty__WEBPACK_IMPORTED_MODULE_1___default()(data.password) ? data.password : \"\";\n        data.password2 = !is_empty__WEBPACK_IMPORTED_MODULE_1___default()(data.password2) ? data.password2 : \"\";\n\n        // username checks\n        if (validator__WEBPACK_IMPORTED_MODULE_0___default.a.isEmpty(data.username)) {\n            errors.username = \"Username field is required\";\n        }\n        // Email checks\n        if (validator__WEBPACK_IMPORTED_MODULE_0___default.a.isEmpty(data.email)) {\n            errors.email = \"Email field is required\";\n        } else if (!validator__WEBPACK_IMPORTED_MODULE_0___default.a.isEmail(data.email)) {\n            errors.email = \"Email is invalid\";\n        }\n        // Password checks\n        if (validator__WEBPACK_IMPORTED_MODULE_0___default.a.isEmpty(data.password)) {\n            errors.password = \"Password field is required\";\n        }\n        if (validator__WEBPACK_IMPORTED_MODULE_0___default.a.isEmpty(data.password2)) {\n            errors.password2 = \"Confirm password field is required\";\n        }\n        if (!validator__WEBPACK_IMPORTED_MODULE_0___default.a.isLength(data.password, { min: 6, max: 30 })) {\n            errors.password = \"Password must be at least 6 characters\";\n        }\n        if (!validator__WEBPACK_IMPORTED_MODULE_0___default.a.equals(data.password, data.password2)) {\n            errors.password2 = \"Passwords must match\";\n        }\n        Object.entries(this.checks).forEach(([field, predicate]) => {\n            let fieldInput = data[field];\n            let fieldError = predicate(fieldInput, field);\n            if (!is_empty__WEBPACK_IMPORTED_MODULE_1___default()(fieldError)) {\n                errors[field] = fieldError;\n            }\n        });\n        this.excludeList.forEach(key => {\n            delete errors[key];\n        });\n        return {\n            errors,\n            isValid: is_empty__WEBPACK_IMPORTED_MODULE_1___default()(errors)\n        };\n    }\n\n    addCheck(field, predicate) {\n        // predicate returns error string\n        this.checks[field] = predicate;\n    }\n};\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (FormValidator);\n\n//# sourceURL=webpack:///./public/js/FormValidator.js?");

/***/ }),

/***/ "./testing/main.js":
/*!*************************!*\
  !*** ./testing/main.js ***!
  \*************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongodb */ \"mongodb\");\n/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongodb__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _public_js_FormValidator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../public/js/FormValidator.js */ \"./public/js/FormValidator.js\");\n\n\n// Optional: poolSize\n//  this allows you to control how many tcp connections are opened in parallel.\nmongodb__WEBPACK_IMPORTED_MODULE_0__[\"MongoClient\"].connect('mongodb://localhost:27017/chess4d', (err, client) => {\n    if (err) {\n        console.dir(err);\n        return;\n    }\n    console.log('Connected to mongo database');\n\n    // db.collection('test', (err, collection) => {});\n    \n    // db.createCollection('test', (err, collection) => {});\n    // db.collection('users').find().pretty();\n    let db = client.db('chess4d');\n    let users = db.collection('users');\n    users.find({}).toArray((err, user) => {\n        console.log(JSON.stringify(user, null, 2));\n    });\n    // console.log(JSON.stringify(users, null, 2));\n});\n\nlet fv = new _public_js_FormValidator_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"](['username']);\nfv.addCheck('username', (username) => {\n    if (username !== 'hi') {\n        return 'Username must be hi'\n    }\n})\nconsole.log(fv.validate({\n    username: 'hia',\n    email: 'a@a.com',\n    password: 'mean123',\n    password2: 'mean123'\n}))\n\n\n//# sourceURL=webpack:///./testing/main.js?");

/***/ }),

/***/ "is-empty":
/*!***************************!*\
  !*** external "is-empty" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"is-empty\");\n\n//# sourceURL=webpack:///external_%22is-empty%22?");

/***/ }),

/***/ "mongodb":
/*!**************************!*\
  !*** external "mongodb" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"mongodb\");\n\n//# sourceURL=webpack:///external_%22mongodb%22?");

/***/ }),

/***/ "validator":
/*!****************************!*\
  !*** external "validator" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"validator\");\n\n//# sourceURL=webpack:///external_%22validator%22?");

/***/ })

/******/ });