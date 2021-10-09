"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ChessTeam_js_1 = tslib_1.__importDefault(require("./ChessTeam.js"));
const rayCastParams_json_1 = tslib_1.__importDefault(require("./rayCastParams.json"));
class Piece {
    constructor(team = ChessTeam_js_1.default.NONE, type = 'Empty') {
        this.team = team;
        this.hasMoved = false;
        this.type = type;
        this.x = -1;
        this.y = -1;
        this.z = -1;
        this.w = -1;
    }
    set(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    assignId(id) {
        this.id = id;
    }
    update() {
        this.hasMoved = true;
    }
    movement() {
        return null;
    }
    attackRayCastParams() {
        return rayCastParams_json_1.default[this._paramKey()]['attack'];
    }
    rayCastParams() {
        return rayCastParams_json_1.default[this._paramKey()]['behavior'];
    }
    oppositeTeam(otherPiece) {
        if (this.team === ChessTeam_js_1.default.WHITE) {
            return otherPiece.team === ChessTeam_js_1.default.BLACK;
        }
        else if (this.team === ChessTeam_js_1.default.BLACK) {
            return otherPiece.team === ChessTeam_js_1.default.WHITE;
        }
        else {
            return false;
        }
    }
    sameTeam(otherPiece) {
        return this.team == otherPiece.team;
    }
    isEmpty() {
        return this.team == ChessTeam_js_1.default.NONE;
    }
    _paramKey() {
        return this.type;
    }
}
Piece.revive = (fields) => {
    if (!fields) {
        return null;
    }
    let piece = new Piece[fields.type]();
    return Object.assign(piece, fields, {
        team: ChessTeam_js_1.default.revive(fields.team)
    });
};
class Pawn extends Piece {
    constructor(team) {
        super(team, 'Pawn');
    }
    _paramKey() {
        let moved = this.hasMoved ? 'Moved' : 'Unmoved';
        let team = this.team.type;
        return this.type + moved + team;
    }
}
exports.Pawn = Pawn;
class King extends Piece {
    constructor(team) {
        super(team, 'King');
    }
}
exports.King = King;
class Queen extends Piece {
    constructor(team) {
        super(team, 'Queen');
    }
}
exports.Queen = Queen;
class Bishop extends Piece {
    constructor(team) {
        super(team, 'Bishop');
    }
}
exports.Bishop = Bishop;
class Knight extends Piece {
    constructor(team) {
        super(team, 'Knight');
    }
}
exports.Knight = Knight;
class Rook extends Piece {
    constructor(team) {
        super(team, 'Rook');
    }
}
exports.Rook = Rook;
Piece.Pawn = Pawn;
Piece.Rook = Rook;
Piece.Knight = Knight;
Piece.Bishop = Bishop;
Piece.King = King;
Piece.Queen = Queen;
Piece.Empty = Piece;
exports.default = Piece;
//# sourceMappingURL=Piece.js.map