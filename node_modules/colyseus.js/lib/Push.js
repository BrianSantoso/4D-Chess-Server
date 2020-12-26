"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Push = void 0;
var Push = /** @class */ (function () {
    function Push(endpoint) {
        this.endpoint = endpoint.replace("ws", "http");
    }
    Push.prototype.register = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.check();
                        return [4 /*yield*/, this.registerServiceWorker()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.requestNotificationPermission()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    Push.prototype.registerServiceWorker = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, navigator.serviceWorker.register(this.endpoint + "/push")];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Push.prototype.requestNotificationPermission = function () {
        return __awaiter(this, void 0, void 0, function () {
            var permission;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, window["Notification"].requestPermission()];
                    case 1:
                        permission = _a.sent();
                        // value of permission can be 'granted', 'default', 'denied'
                        // granted: user has accepted the request
                        // default: user has dismissed the notification permission popup by clicking on x
                        // denied: user has denied the request.
                        if (permission !== "granted") {
                            throw new Error("Permission not granted for Notification");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Push.prototype.check = function () {
        if (!("serviceWorker" in navigator)) {
            throw new Error("No Service Worker support!");
        }
        if (!("PushManager" in window)) {
            throw new Error("No Push API Support!");
        }
    };
    return Push;
}());
exports.Push = Push;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9QdXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0lBR0ksY0FBYSxRQUFnQjtRQUN6QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFWSx1QkFBUSxHQUFyQjs7Ozs7d0JBQ0ksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNiLHFCQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFBOzt3QkFBbEMsU0FBa0MsQ0FBQzt3QkFDbkMscUJBQU0sSUFBSSxDQUFDLDZCQUE2QixFQUFFLEVBQUE7O3dCQUExQyxTQUEwQyxDQUFDOzs7OztLQUM5QztJQUFBLENBQUM7SUFFYyxvQ0FBcUIsR0FBckM7Ozs7NEJBQ1cscUJBQU0sU0FBUyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUksSUFBSSxDQUFDLFFBQVEsVUFBTyxDQUFDLEVBQUE7NEJBQXRFLHNCQUFPLFNBQStELEVBQUM7Ozs7S0FDMUU7SUFFZSw0Q0FBNkIsR0FBN0M7Ozs7OzRCQUN1QixxQkFBTSxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsaUJBQWlCLEVBQUUsRUFBQTs7d0JBQTdELFVBQVUsR0FBRyxTQUFnRDt3QkFDbkUsNERBQTREO3dCQUM1RCx5Q0FBeUM7d0JBQ3pDLGlGQUFpRjt3QkFDakYsdUNBQXVDO3dCQUN2QyxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7NEJBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQzt5QkFDOUQ7Ozs7O0tBQ0o7SUFFUyxvQkFBSyxHQUFmO1FBQ0ksSUFBSSxDQUFDLENBQUMsZUFBZSxJQUFJLFNBQVMsQ0FBQyxFQUFFO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1NBQUU7UUFDdkYsSUFBSSxDQUFDLENBQUMsYUFBYSxJQUFJLE1BQU0sQ0FBQyxFQUFFO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQUU7SUFDaEYsQ0FBQztJQUVMLFdBQUM7QUFBRCxDQUFDLEFBakNELElBaUNDO0FBakNZLG9CQUFJIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIFB1c2gge1xuICAgIGVuZHBvaW50OiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvciAoZW5kcG9pbnQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmVuZHBvaW50ID0gZW5kcG9pbnQucmVwbGFjZShcIndzXCIsIFwiaHR0cFwiKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcmVnaXN0ZXIoKSB7XG4gICAgICAgIHRoaXMuY2hlY2soKTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWdpc3RlclNlcnZpY2VXb3JrZXIoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZXF1ZXN0Tm90aWZpY2F0aW9uUGVybWlzc2lvbigpO1xuICAgIH07XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgcmVnaXN0ZXJTZXJ2aWNlV29ya2VyKCkge1xuICAgICAgICByZXR1cm4gYXdhaXQgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoYCR7dGhpcy5lbmRwb2ludH0vcHVzaGApO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyByZXF1ZXN0Tm90aWZpY2F0aW9uUGVybWlzc2lvbigpIHtcbiAgICAgICAgY29uc3QgcGVybWlzc2lvbiA9IGF3YWl0IHdpbmRvd1tcIk5vdGlmaWNhdGlvblwiXS5yZXF1ZXN0UGVybWlzc2lvbigpO1xuICAgICAgICAvLyB2YWx1ZSBvZiBwZXJtaXNzaW9uIGNhbiBiZSAnZ3JhbnRlZCcsICdkZWZhdWx0JywgJ2RlbmllZCdcbiAgICAgICAgLy8gZ3JhbnRlZDogdXNlciBoYXMgYWNjZXB0ZWQgdGhlIHJlcXVlc3RcbiAgICAgICAgLy8gZGVmYXVsdDogdXNlciBoYXMgZGlzbWlzc2VkIHRoZSBub3RpZmljYXRpb24gcGVybWlzc2lvbiBwb3B1cCBieSBjbGlja2luZyBvbiB4XG4gICAgICAgIC8vIGRlbmllZDogdXNlciBoYXMgZGVuaWVkIHRoZSByZXF1ZXN0LlxuICAgICAgICBpZiAocGVybWlzc2lvbiAhPT0gXCJncmFudGVkXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBlcm1pc3Npb24gbm90IGdyYW50ZWQgZm9yIE5vdGlmaWNhdGlvblwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByb3RlY3RlZCBjaGVjaygpIHtcbiAgICAgICAgaWYgKCEoXCJzZXJ2aWNlV29ya2VyXCIgaW4gbmF2aWdhdG9yKSkgeyB0aHJvdyBuZXcgRXJyb3IoXCJObyBTZXJ2aWNlIFdvcmtlciBzdXBwb3J0IVwiKTsgfVxuICAgICAgICBpZiAoIShcIlB1c2hNYW5hZ2VyXCIgaW4gd2luZG93KSkgeyB0aHJvdyBuZXcgRXJyb3IoXCJObyBQdXNoIEFQSSBTdXBwb3J0IVwiKTsgfVxuICAgIH1cblxufSJdfQ==