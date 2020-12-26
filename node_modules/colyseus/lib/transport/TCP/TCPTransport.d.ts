/// <reference types="node" />
import * as net from 'net';
import { ServerOptions } from '../../Server';
import { Transport } from '../Transport';
/**
 * TODO:
 * TCPTransport is not working.
 * It was meant to be used for https://github.com/colyseus/colyseus-gml
 */
export declare class TCPTransport extends Transport {
    constructor(options?: ServerOptions);
    listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): this;
    shutdown(): void;
    simulateLatency(milliseconds: number): void;
    protected onConnection(client: net.Socket & any): void;
    protected onMessage(client: net.Socket & any, message: any): Promise<void>;
}
