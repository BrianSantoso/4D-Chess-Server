class RoomData {
    constructor(room) {
        this._room = room; // Colyseus room
        
    }

    setRoom() {
        this._room = room;
    }

    room() {
        return this._room;
    }
}