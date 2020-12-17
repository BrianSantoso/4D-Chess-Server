import Piece, { Pawn, Rook, Knight, Bishop, King, Queen } from "./Piece.js";

function initTeam8181(team, z0, z1) {
    this.set(0, 0, z0, 0, new Rook(team));
    this.set(1, 0, z0, 0, new Knight(team));
    this.set(2, 0, z0, 0, new Bishop(team));
    this.set(3, 0, z0, 0, new Queen(team));
    this.set(4, 0, z0, 0, new King(team));
    this.set(5, 0, z0, 0, new Bishop(team));
    this.set(6, 0, z0, 0, new Knight(team));
    this.set(7, 0, z0, 0, new Rook(team));

    this.set(0, 0, z1, 0, new Pawn(team));
    this.set(1, 0, z1, 0, new Pawn(team));
    this.set(2, 0, z1, 0, new Pawn(team));
    this.set(3, 0, z1, 0, new Pawn(team));
    this.set(4, 0, z1, 0, new Pawn(team));
    this.set(5, 0, z1, 0, new Pawn(team));
    this.set(6, 0, z1, 0, new Pawn(team));
    this.set(7, 0, z1, 0, new Pawn(team));
}

function initTeam4444(team, z0, z1, w0, w1) {
    this.set(0, 0, z0, w0, new Rook(team));
    this.set(1, 0, z0, w0, new Knight(team));
    this.set(2, 0, z0, w0, new Knight(team));
    this.set(3, 0, z0, w0, new Rook(team));

    this.set(0, 1, z0, w0, new Bishop(team));
    this.set(1, 1, z0, w0, new Queen(team));
    this.set(2, 1, z0, w0, new Queen(team));
    this.set(3, 1, z0, w0, new Bishop(team));

    this.set(0, 2, z0, w0, new Bishop(team));
    this.set(1, 2, z0, w0, new Queen(team));
    this.set(2, 2, z0, w0, new King(team));
    this.set(3, 2, z0, w0, new Bishop(team));

    this.set(0, 3, z0, w0, new Rook(team));
    this.set(1, 3, z0, w0, new Knight(team));
    this.set(2, 3, z0, w0, new Knight(team));
    this.set(3, 3, z0, w0, new Rook(team));
    
    
    
    

    this.set(0, 0, z1, w0, new Pawn(team));
    this.set(1, 0, z1, w0, new Pawn(team));
    this.set(2, 0, z1, w0, new Pawn(team));
    this.set(3, 0, z1, w0, new Pawn(team));

    this.set(0, 1, z1, w0, new Pawn(team));
    this.set(1, 1, z1, w0, new Pawn(team));
    this.set(2, 1, z1, w0, new Pawn(team));
    this.set(3, 1, z1, w0, new Pawn(team));

    this.set(0, 2, z1, w0, new Pawn(team));
    this.set(1, 2, z1, w0, new Pawn(team));
    this.set(2, 2, z1, w0, new Pawn(team));
    this.set(3, 2, z1, w0, new Pawn(team));

    this.set(0, 3, z1, w0, new Pawn(team));
    this.set(1, 3, z1, w0, new Pawn(team));
    this.set(2, 3, z1, w0, new Pawn(team));
    this.set(3, 3, z1, w0, new Pawn(team));
    
    
    
    
    this.set(0, 0, z0, w1, new Pawn(team));
    this.set(1, 0, z0, w1, new Pawn(team));
    this.set(2, 0, z0, w1, new Pawn(team));
    this.set(3, 0, z0, w1, new Pawn(team));

    this.set(0, 1, z0, w1, new Pawn(team));
    this.set(1, 1, z0, w1, new Pawn(team));
    this.set(2, 1, z0, w1, new Pawn(team));
    this.set(3, 1, z0, w1, new Pawn(team));

    this.set(0, 2, z0, w1, new Pawn(team));
    this.set(1, 2, z0, w1, new Pawn(team));
    this.set(2, 2, z0, w1, new Pawn(team));
    this.set(3, 2, z0, w1, new Pawn(team));

    this.set(0, 3, z0, w1, new Pawn(team));
    this.set(1, 3, z0, w1, new Pawn(team));
    this.set(2, 3, z0, w1, new Pawn(team));
    this.set(3, 3, z0, w1, new Pawn(team));
    
    
    
    this.set(0, 0, z1, w1, new Pawn(team));
    this.set(1, 0, z1, w1, new Pawn(team));
    this.set(2, 0, z1, w1, new Pawn(team));
    this.set(3, 0, z1, w1, new Pawn(team));

    this.set(0, 1, z1, w1, new Pawn(team));
    this.set(1, 1, z1, w1, new Pawn(team));
    this.set(2, 1, z1, w1, new Pawn(team));
    this.set(3, 1, z1, w1, new Pawn(team));

    this.set(0, 2, z1, w1, new Pawn(team));
    this.set(1, 2, z1, w1, new Pawn(team));
    this.set(2, 2, z1, w1, new Pawn(team));
    this.set(3, 2, z1, w1, new Pawn(team));

    this.set(0, 3, z1, w1, new Pawn(team));
    this.set(1, 3, z1, w1, new Pawn(team));
    this.set(2, 3, z1, w1, new Pawn(team));
    this.set(3, 3, z1, w1, new Pawn(team));
}

export { initTeam8181, initTeam4444 };