"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FocusState {
    constructor(maximized, showing) {
        this._maximized = maximized;
        this._showing = showing;
    }
    showing() {
        return this._showing;
    }
    maximized() {
        return this._maximized;
    }
    minimized() {
        return !this._maximized;
    }
}
FocusState.MINIMIZED = new FocusState(false, true);
FocusState.GAMING = new FocusState(true, true);
FocusState.CLOSED = new FocusState(false, false);
exports.default = FocusState;
//# sourceMappingURL=FocusState.js.map