import Move from './Move.js';
import ChessTeam from './ChessTeam.js';

class MoveHistory {
    constructor() {
        this._index = -1;
        this._moves = [];
    }

    currTurn() {
        return this.length() % 2 === 0 ? ChessTeam.WHITE : ChessTeam.BLACK;
    }
    
    add(move, time, status, allPossibleMoves) {
        // Chop off future
        this._moves.splice(this._index + 1);
        // New future
        this.addToEnd(move, time, status, allPossibleMoves);
        this._index += 1;
        console.log(this._moves);
    }

    addToEnd(move, time, status, allPossibleMoves) {
        this._moves.push({
            move: move,
            status: status,
            allPossibleMoves: allPossibleMoves,
            time: time,
            timestamp: new Date()
        });
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
            return this._moves[index];
        }
    }

    getLast() {
        return this.get(this.length() - 1);
    }

    curr() {
        return this.get(this._index);
    }

    length() {
        return this._moves.length;
    }

    isEmpty() {
        return this._length === 0;
    }

    atLast() {
        // NOTE: Will return true if length is 0, index is -1
        return this._index === this.length() - 1;
    }

    browsing() {
        return !this.atLast();
    }

    atOrigin() {
        return this._index === -1;
    }

    // toJSON() {
    //     return {
    //         _index: this._index,

    //     };
    // }
}

MoveHistory.revive = (fields) => {
    return Object.assign(new MoveHistory(), fields, {
        _moves: fields._moves.map((moveData) => ({
            move: Move.revive(moveData.move),
            status: ChessTeam.revive(moveData.status),
            allPossibleMoves: moveData.allPossibleMoves || null,
            timestamp: new Date(moveData.timestamp),
            time: moveData.time
        }))
    });
};

export default MoveHistory;