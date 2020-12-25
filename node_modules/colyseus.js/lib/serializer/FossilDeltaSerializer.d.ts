import { Serializer } from "./Serializer";
import { StateContainer } from '@gamestdio/state-listener';
export declare class FossilDeltaSerializer<State = any> implements Serializer<State> {
    api: StateContainer<State>;
    protected previousState: any;
    getState(): State;
    setState(encodedState: any): void;
    patch(binaryPatch: any): void;
    teardown(): void;
}
