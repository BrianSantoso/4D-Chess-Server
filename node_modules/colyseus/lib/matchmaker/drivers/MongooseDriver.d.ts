import { MatchMakerDriver, QueryHelpers, RoomListingData } from './Driver';
export declare class MongooseDriver implements MatchMakerDriver {
    constructor(connectionURI?: string);
    createInstance(initialValues?: any): RoomListingData<any>;
    find(conditions: any, additionalProjectionFields?: {}): Promise<RoomListingData<any>[]>;
    findOne(conditions: any): QueryHelpers<RoomListingData<any>>;
}
