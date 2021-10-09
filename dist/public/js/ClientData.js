class ClientData {
    constructor() {
        this._authToken;
        this._client;
    }
    getDecoded() {
        return jwt.decode(this._authToken, { complete: true });
    }
    setAuthToken() {
        this._authToken = token;
    }
    getAuthToken() {
        this._authToken;
    }
}
//# sourceMappingURL=ClientData.js.map