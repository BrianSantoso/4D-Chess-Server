class FocusState {
    constructor(maximized) {
        this._maximized = maximized;
    }

    maximized() {
        return this._maximized;
    }

    minimized() {
        return !this._maximized;
    }
}

FocusState.MINIMIZED = new FocusState(false);
FocusState.GAMING = new FocusState(true);

export default FocusState;