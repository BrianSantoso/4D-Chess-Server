"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TimeControl {
    constructor() {
        this.type;
    }
}
TimeControl.Standard = (whiteStartTime, whiteIncrement, blackStartTime, blackIncrement) => {
    let base = TimeControl.create('');
    let delta = {
        type: 'Standard',
        _whiteStartTime: whiteStartTime,
        _whiteIncrement: whiteIncrement,
        _blackStartTime: blackStartTime,
        _blackIncrement: blackIncrement
    };
    return Object.assign(base, delta);
};
TimeControl.OneZero = () => {
    const oneMinute = 60 * 1000;
    let base = TimeControl.create('Standard', oneMinute, 0, oneMinute, 0);
    let delta = {
        type: 'OneZero'
    };
    return Object.assign(base, delta);
};
TimeControl.create = (type, ...args) => {
    if (TimeControl[type]) {
        return TimeControl[type](...args);
    }
    else {
        return new TimeControl(...args);
    }
};
TimeControl.revive = (fields) => {
    let base = TimeControl.create(fields.type);
    return Object.assign(base, fields);
};
exports.default = TimeControl;
//# sourceMappingURL=TimeControl.js.map