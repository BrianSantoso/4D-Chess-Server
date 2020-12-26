/// <reference types="node" />
import http from 'http';
import { Schema } from '@colyseus/schema';
import Clock from '@gamestdio/timer';
import { EventEmitter } from 'events';
import { Presence } from './presence/Presence';
import { Deferred } from './Utils';
import { RoomListingData } from './matchmaker/drivers/Driver';
import { Client, ISendOptions } from './transport/Transport';
export declare const DEFAULT_SEAT_RESERVATION_TIME: number;
export declare type SimulationCallback = (deltaTime: number) => void;
export declare type RoomConstructor<T = any> = new (presence?: Presence) => Room<T>;
export interface IBroadcastOptions extends ISendOptions {
    except?: Client;
}
export declare enum RoomInternalState {
    CREATING = 0,
    CREATED = 1,
    DISCONNECTING = 2
}
export declare abstract class Room<State = any, Metadata = any> {
    get locked(): boolean;
    get metadata(): Metadata;
    listing: RoomListingData<Metadata>;
    clock: Clock;
    roomId: string;
    roomName: string;
    maxClients: number;
    patchRate: number;
    autoDispose: boolean;
    state: State;
    presence: Presence;
    clients: Client[];
    internalState: RoomInternalState;
    /** @internal */
    _events: EventEmitter;
    protected seatReservationTime: number;
    protected reservedSeats: {
        [sessionId: string]: any;
    };
    protected reservedSeatTimeouts: {
        [sessionId: string]: NodeJS.Timer;
    };
    protected reconnections: {
        [sessionId: string]: Deferred;
    };
    private onMessageHandlers;
    private _serializer;
    private _afterNextPatchBroadcasts;
    private _simulationInterval;
    private _patchInterval;
    private _locked;
    private _lockedExplicitly;
    private _maxClientsReached;
    private _autoDisposeTimeout;
    constructor(presence?: Presence);
    onCreate?(options: any): void | Promise<any>;
    onJoin?(client: Client, options?: any, auth?: any): void | Promise<any>;
    onLeave?(client: Client, consented?: boolean): void | Promise<any>;
    onDispose?(): void | Promise<any>;
    onAuth(client: Client, options: any, request?: http.IncomingMessage): any | Promise<any>;
    hasReachedMaxClients(): boolean;
    setSeatReservationTime(seconds: number): this;
    hasReservedSeat(sessionId: string): boolean;
    setSimulationInterval(onTickCallback?: SimulationCallback, delay?: number): void;
    setPatchRate(milliseconds: number): void;
    setState(newState: State): void;
    setMetadata(meta: Partial<Metadata>): Promise<void>;
    setPrivate(bool?: boolean): Promise<void>;
    lock(): Promise<void>;
    unlock(): Promise<void>;
    send(client: Client, type: string | number, message: any, options?: ISendOptions): void;
    send(client: Client, message: Schema, options?: ISendOptions): void;
    broadcast(type: string | number, message?: any, options?: IBroadcastOptions): any;
    broadcast<T extends Schema>(message: T, options?: IBroadcastOptions): any;
    onMessage<T = any>(messageType: '*', callback: (client: Client, type: string | number, message: T) => void): any;
    onMessage<T = any>(messageType: string | number, callback: (client: Client, message: T) => void): any;
    disconnect(): Promise<any>;
    ['_onJoin'](client: Client, req?: http.IncomingMessage): Promise<void>;
    allowReconnection(previousClient: Client, seconds?: number): Deferred;
    protected resetAutoDisposeTimeout(timeoutInSeconds?: number): void;
    protected broadcastPatch(): boolean;
    private broadcastMessageSchema;
    private broadcastMessageType;
    private sendFullState;
    private broadcastAfterPatch;
    private _reserveSeat;
    private _disposeIfEmpty;
    private _dispose;
    private _onMessage;
    private _forciblyCloseClient;
    private _onLeave;
    private _incrementClientCount;
    private _decrementClientCount;
}
