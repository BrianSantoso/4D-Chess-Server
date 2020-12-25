import { SortOptions } from '../RegisteredHandler';
export interface RoomListingData<Metadata = any> {
    clients: number;
    locked: boolean;
    private: boolean;
    maxClients: number;
    metadata: Metadata;
    name: string;
    processId: string;
    roomId: string;
    unlisted: boolean;
    updateOne(operations: any): any;
    save(): any;
    remove(): any;
}
export interface QueryHelpers<T> {
    then: Promise<T>['then'];
    sort(options: SortOptions): any;
}
export interface MatchMakerDriver {
    createInstance(initialValues: any): RoomListingData;
    find(conditions: any, additionalProjectionFields?: any): Promise<RoomListingData[]> | RoomListingData[];
    findOne(conditions: any): QueryHelpers<RoomListingData>;
}
