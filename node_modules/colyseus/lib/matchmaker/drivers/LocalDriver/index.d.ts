import { MatchMakerDriver, QueryHelpers, RoomListingData } from '../Driver';
import { RoomCache } from './RoomData';
export declare class LocalDriver implements MatchMakerDriver {
    rooms: RoomCache[];
    createInstance(initialValues?: any): RoomCache;
    find(conditions: any): RoomCache[];
    findOne(conditions: any): QueryHelpers<RoomListingData<any>>;
}
