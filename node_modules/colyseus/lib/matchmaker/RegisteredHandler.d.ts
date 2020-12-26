/// <reference types="node" />
import { EventEmitter } from 'events';
import { RoomConstructor } from './../Room';
import { RoomListingData } from './drivers/Driver';
export declare const INVALID_OPTION_KEYS: Array<keyof RoomListingData>;
export interface SortOptions {
    [fieldName: string]: 1 | -1 | 'asc' | 'desc' | 'ascending' | 'descending';
}
export declare class RegisteredHandler extends EventEmitter {
    klass: RoomConstructor;
    options: any;
    filterOptions: string[];
    sortOptions?: SortOptions;
    constructor(klass: RoomConstructor, options: any);
    enableRealtimeListing(): this;
    filterBy(options: string[]): this;
    sortBy(options: SortOptions): this;
    getFilterOptions(options: any): {};
}
