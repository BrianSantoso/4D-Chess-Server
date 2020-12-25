/// <reference types="node" />
import http from 'http';
import WebSocket from 'ws';
import { ServerOptions } from '../../Server';
import { Transport } from '../Transport';
declare type RawWebSocketClient = WebSocket & {
    pingCount: number;
};
export declare class WebSocketTransport extends Transport {
    protected wss: WebSocket.Server;
    protected pingInterval: NodeJS.Timer;
    protected pingIntervalMS: number;
    protected pingMaxRetries: number;
    constructor(options: ServerOptions, engine: any);
    listen(port: number, hostname?: string, backlog?: number, listeningListener?: () => void): this;
    shutdown(): void;
    simulateLatency(milliseconds: number): void;
    protected autoTerminateUnresponsiveClients(pingInterval: number, pingMaxRetries: number): void;
    protected onConnection(rawClient: RawWebSocketClient, req?: http.IncomingMessage & any): Promise<void>;
}
export {};
