import Move from './Move.js';

class MoveHistory {
    constructor() {
        this._index = -1;
        this._list = [];
    }
    
    add(move) {
        // Chop off future
        this._list.splice(this._index + 1);
        // New future
        this._list.push(move);
        this._index += 1;
        console.log(this._list);
    }

    undo() {
        let move = this.curr();
        if (!this.atOrigin()) {
            this._index -= 1;
        }
        return move;
    }

    redo() {
        if (!this.atLast()) {
            this._index += 1;
            return this.curr();
        } else {
            return null;
        }
    }

    get(index) {
        if (index < 0) {
            return null;
        } else {
            return this._list[index];
        }
    }

    curr() {
        return this.get(this._index);
    }

    length() {
        return this._list.length;
    }

    isEmpty() {
        return this._length === 0;
    }

    atLast() {
        // NOTE: Will return true if length is 0, index is -1
        return this._index === this.length() - 1;
    }

    atOrigin() {
        return this._index === -1;
    }
}

export default MoveHistory;