import Piece, { Pawn, Rook, Knight, Bishop, King, Queen } from "./Piece.js";

function initTeam8181(team, z0, z1) {
    this.spawn(0, 0, z0, 0, new Rook(team));
    this.spawn(1, 0, z0, 0, new Knight(team));
    this.spawn(2, 0, z0, 0, new Bishop(team));
    this.spawn(3, 0, z0, 0, new Queen(team));
    this.spawn(4, 0, z0, 0, new King(team));
    this.spawn(5, 0, z0, 0, new Bishop(team));
    this.spawn(6, 0, z0, 0, new Knight(team));
    this.spawn(7, 0, z0, 0, new Rook(team));

    this.spawn(0, 0, z1, 0, new Pawn(team));
    this.spawn(1, 0, z1, 0, new Pawn(team));
    this.spawn(2, 0, z1, 0, new Pawn(team));
    this.spawn(3, 0, z1, 0, new Pawn(team));
    this.spawn(4, 0, z1, 0, new Pawn(team));
    this.spawn(5, 0, z1, 0, new Pawn(team));
    this.spawn(6, 0, z1, 0, new Pawn(team));
    this.spawn(7, 0, z1, 0, new Pawn(team));
}

function initTeam4444(team, z0, z1, w0, w1) {
    this.spawn(0, 0, z0, w0, new Rook(team));
    this.spawn(1, 0, z0, w0, new Knight(team));
    this.spawn(2, 0, z0, w0, new Knight(team));
    this.spawn(3, 0, z0, w0, new Rook(team));

    this.spawn(0, 1, z0, w0, new Bishop(team));
    this.spawn(1, 1, z0, w0, new Queen(team));
    this.spawn(2, 1, z0, w0, new Queen(team));
    this.spawn(3, 1, z0, w0, new Bishop(team));

    this.spawn(0, 2, z0, w0, new Bishop(team));
    this.spawn(1, 2, z0, w0, new Queen(team));
    this.spawn(2, 2, z0, w0, new King(team));
    this.spawn(3, 2, z0, w0, new Bishop(team));

    this.spawn(0, 3, z0, w0, new Rook(team));
    this.spawn(1, 3, z0, w0, new Knight(team));
    this.spawn(2, 3, z0, w0, new Knight(team));
    this.spawn(3, 3, z0, w0, new Rook(team));
    
    
    
    

    this.spawn(0, 0, z1, w0, new Pawn(team));
    this.spawn(1, 0, z1, w0, new Pawn(team));
    this.spawn(2, 0, z1, w0, new Pawn(team));
    this.spawn(3, 0, z1, w0, new Pawn(team));

    this.spawn(0, 1, z1, w0, new Pawn(team));
    this.spawn(1, 1, z1, w0, new Pawn(team));
    this.spawn(2, 1, z1, w0, new Pawn(team));
    this.spawn(3, 1, z1, w0, new Pawn(team));

    this.spawn(0, 2, z1, w0, new Pawn(team));
    this.spawn(1, 2, z1, w0, new Pawn(team));
    this.spawn(2, 2, z1, w0, new Pawn(team));
    this.spawn(3, 2, z1, w0, new Pawn(team));

    this.spawn(0, 3, z1, w0, new Pawn(team));
    this.spawn(1, 3, z1, w0, new Pawn(team));
    this.spawn(2, 3, z1, w0, new Pawn(team));
    this.spawn(3, 3, z1, w0, new Pawn(team));
    
    
    
    
    this.spawn(0, 0, z0, w1, new Pawn(team));
    this.spawn(1, 0, z0, w1, new Pawn(team));
    this.spawn(2, 0, z0, w1, new Pawn(team));
    this.spawn(3, 0, z0, w1, new Pawn(team));

    this.spawn(0, 1, z0, w1, new Pawn(team));
    this.spawn(1, 1, z0, w1, new Pawn(team));
    this.spawn(2, 1, z0, w1, new Pawn(team));
    this.spawn(3, 1, z0, w1, new Pawn(team));

    this.spawn(0, 2, z0, w1, new Pawn(team));
    this.spawn(1, 2, z0, w1, new Pawn(team));
    this.spawn(2, 2, z0, w1, new Pawn(team));
    this.spawn(3, 2, z0, w1, new Pawn(team));

    this.spawn(0, 3, z0, w1, new Pawn(team));
    this.spawn(1, 3, z0, w1, new Pawn(team));
    this.spawn(2, 3, z0, w1, new Pawn(team));
    this.spawn(3, 3, z0, w1, new Pawn(team));
    
    
    
    this.spawn(0, 0, z1, w1, new Pawn(team));
    this.spawn(1, 0, z1, w1, new Pawn(team));
    this.spawn(2, 0, z1, w1, new Pawn(team));
    this.spawn(3, 0, z1, w1, new Pawn(team));

    this.spawn(0, 1, z1, w1, new Pawn(team));
    this.spawn(1, 1, z1, w1, new Pawn(team));
    this.spawn(2, 1, z1, w1, new Pawn(team));
    this.spawn(3, 1, z1, w1, new Pawn(team));

    this.spawn(0, 2, z1, w1, new Pawn(team));
    this.spawn(1, 2, z1, w1, new Pawn(team));
    this.spawn(2, 2, z1, w1, new Pawn(team));
    this.spawn(3, 2, z1, w1, new Pawn(team));

    this.spawn(0, 3, z1, w1, new Pawn(team));
    this.spawn(1, 3, z1, w1, new Pawn(team));
    this.spawn(2, 3, z1, w1, new Pawn(team));
    this.spawn(3, 3, z1, w1, new Pawn(team));
}

export { initTeam8181, initTeam4444 };