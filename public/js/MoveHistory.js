import Move from './Move.js';
import ChessTeam from './ChessTeam.js';

class MoveHistory {
    constructor() {
        this._index = -1;
        this._moves = [];
    }

    viewingTurn() {
        return (this._index + 1) % 2 === 0 ? ChessTeam.WHITE : ChessTeam.BLACK;
    }

    currTurn() {
        return this.length() % 2 === 0 ? ChessTeam.WHITE : ChessTeam.BLACK;
    }
    
    add(move, time, status, possibleMovesBefore, possibleMovesAfter) {
        // Chop off future
        this._moves.splice(this._index + 1);
        // New future
        this.addToEnd(move, time, status, possibleMovesBefore, possibleMovesAfter);
        this._index += 1;
        console.log(this._moves);
    }

    addToEnd(move, time, status, possibleMovesBefore, possibleMovesAfter) {
        this._moves.push({
            move: move,
            status: status, // Status at end of turn
            possibleMovesBefore: possibleMovesBefore, // All possible moves at beginning of turn
            possibleMovesAfter: possibleMovesAfter, // All possible moves at end of turn
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
        if (index < 0 || index >= this.length()) {
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

    next() {
        return this.get(this._index + 1);
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
}

MoveHistory.revive = (fields) => {
    return Object.assign(new MoveHistory(), fields, {
        _moves: fields._moves.map((moveData) => ({
            move: Move.revive(moveData.move),
            status: ChessTeam.revive(moveData.status),
            possibleMovesBefore: moveData.possibleMovesBefore.map(Move.revive) || null,
            possibleMovesAfter: moveData.possibleMovesAfter.map(Move.revive) || null,
            timestamp: new Date(moveData.timestamp),
            time: moveData.time
        }))
    });
};

export default MoveHistory;