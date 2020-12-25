import { Room } from '../Room';
import { RoomListingData } from './drivers/Driver';
export declare function updateLobby(room: Room, removed?: boolean): void;
export declare function subscribeLobby(callback: (roomId: string, roomListing: RoomListingData) => void): Promise<() => any>;
