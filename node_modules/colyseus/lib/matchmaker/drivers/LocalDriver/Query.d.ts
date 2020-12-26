import { SortOptions } from '../../RegisteredHandler';
import { QueryHelpers } from '../Driver';
export declare class Query<T> implements QueryHelpers<T> {
    private $rooms;
    private conditions;
    constructor(rooms: any[], conditions: any);
    sort(options: SortOptions): void;
    then(resolve: any, reject: any): any;
}
