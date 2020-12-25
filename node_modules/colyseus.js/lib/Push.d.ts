export declare class Push {
    endpoint: string;
    constructor(endpoint: string);
    register(): Promise<void>;
    protected registerServiceWorker(): Promise<ServiceWorkerRegistration>;
    protected requestNotificationPermission(): Promise<void>;
    protected check(): void;
}
