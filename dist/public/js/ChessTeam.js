"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChessTeam {
    constructor(type) {
        this.type = type;
        this.permissions = new Map();
    }
    setPermissions(whitePerms, blackPerms, ghostPerms) {
        this.permissions.set(ChessTeam.WHITE, whitePerms);
        this.permissions.set(ChessTeam.BLACK, blackPerms);
        this.permissions.set(ChessTeam.GHOST, ghostPerms);
    }
    myTurn() {
        return this.toMoveStatus;
    }
    setToMoveStatus(status) {
        this.toMoveStatus = status;
    }
    lose() {
        return this.loseStatus;
    }
    setLoseStatus(status) {
        this.loseStatus = status;
    }
    attacked() {
        return this.attackedStatus;
    }
    setAttackedStatus(status) {
        this.attackedStatus = status;
    }
    hasPermissions(team) {
        return this.permissions.get(team);
    }
    toJSON() {
        return this.type;
    }
}
ChessTeam.GHOST = new ChessTeam('GHOST');
ChessTeam.NONE = ChessTeam.SPECTATOR = new ChessTeam('NONE'); // TODO: may be problematic since spectator team is NONE and empty piece team is NONE
ChessTeam.WHITE = new ChessTeam('WHITE');
ChessTeam.BLACK = new ChessTeam('BLACK');
ChessTeam.OMNISCIENT = new ChessTeam('OMNISCIENT');
ChessTeam.NONE.setPermissions(false, false, false);
ChessTeam.GHOST.setPermissions(false, false, true);
ChessTeam.WHITE.setPermissions(true, false, false);
ChessTeam.BLACK.setPermissions(false, true, false);
ChessTeam.OMNISCIENT.setPermissions(true, true, false);
ChessTeam.oppositeTeam = (team) => {
    if (team === ChessTeam.WHITE) {
        return ChessTeam.BLACK;
    }
    else if (team === ChessTeam.BLACK) {
        return ChessTeam.WHITE;
    }
    else {
        return null;
    }
};
ChessTeam.revive = (team) => {
    return ChessTeam[team];
};
class ChessStatus {
    constructor(type, winner, terminating, message) {
        this.type = type;
        this.winner = winner;
        this.terminating = terminating;
        this.message = message;
    }
    toJSON() {
        return this.type;
    }
    isTerminating() {
        return this.terminating;
    }
    ongoing() {
        return !this.terminating;
    }
    getWinner() {
        return this.winner;
    }
    isWin() {
        this.terminating && this.winner !== ChessTeam.NONE;
    }
    isTie() {
        return this.terminating && this.winner === ChessTeam.NONE;
    }
    getMessage() {
        return this.message;
    }
    toJSON() {
        return this.type;
    }
}
exports.ChessStatus = ChessStatus;
ChessStatus.revive = (type) => {
    return ChessStatus[type];
};
ChessStatus.WHITE_WIN = new ChessStatus('WHITE_WIN', ChessTeam.WHITE, true, 'Checkmate! White wins!');
ChessStatus.BLACK_WIN = new ChessStatus('BLACK_WIN', ChessTeam.BLACK, true, 'Checkmate! Black wins!');
ChessStatus.WHITE_ATTACKING = new ChessStatus('WHITE_ATTACKING', ChessTeam.NONE, false, 'Black is in check!');
ChessStatus.BLACK_ATTACKING = new ChessStatus('BLACK_ATTACKING', ChessTeam.NONE, false, 'White is in check!');
ChessStatus.STALEMATE = new ChessStatus('STALEMATE', ChessTeam.NONE, true, 'Stalemate! It\'s a draw!');
ChessStatus.AGREE_DRAW = new ChessStatus('AGREE_DRAW', ChessTeam.NONE, true, 'It\'s a draw!');
ChessStatus.REPETITION = new ChessStatus('REPETITION', ChessTeam.NONE, true, 'It\'s a draw by repetition!');
ChessStatus.WHITE_MOVE = new ChessStatus('WHITE_MOVE', ChessTeam.NONE, false, 'White to move');
ChessStatus.BLACK_MOVE = new ChessStatus('BLACK_MOVE', ChessTeam.NONE, false, 'Black to move');
ChessTeam.WHITE.setToMoveStatus(ChessStatus.WHITE_MOVE);
ChessTeam.BLACK.setToMoveStatus(ChessStatus.BLACK_MOVE);
ChessTeam.WHITE.setAttackedStatus(ChessStatus.BLACK_ATTACKING);
ChessTeam.BLACK.setAttackedStatus(ChessStatus.WHITE_ATTACKING);
ChessTeam.WHITE.setLoseStatus(ChessStatus.BLACK_WIN);
ChessTeam.BLACK.setLoseStatus(ChessStatus.WHITE_WIN);
exports.default = ChessTeam;
//# sourceMappingURL=ChessTeam.js.map