"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const colyseus_1 = require("colyseus");
const express_1 = tslib_1.__importDefault(require("express"));
const http_1 = tslib_1.__importDefault(require("http"));
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const dotenv_1 = require("dotenv");
const passport_1 = tslib_1.__importDefault(require("passport"));
const JWTPassportUtils_js_1 = require("./js/JWTPassportUtils.js");
const Users_js_1 = tslib_1.__importDefault(require("./js/routes/Users.js"));
const Register_js_1 = tslib_1.__importDefault(require("./js/routes/Register.js"));
const Login_js_1 = tslib_1.__importDefault(require("./js/routes/Login.js"));
const ChessRoom_js_1 = tslib_1.__importDefault(require("./js/ChessRoom.js"));
const config_json_1 = tslib_1.__importDefault(require("../public/js/config.json"));
const ChessGame_js_1 = require("../public/js/ChessGame.js");
const BoardGraphics_js_1 = tslib_1.__importDefault(require("../public/js/BoardGraphics.js"));
const TimeControl_js_1 = tslib_1.__importDefault(require("../public/js/TimeControl.js"));
dotenv_1.config();
JWTPassportUtils_js_1.configurePassport(passport_1.default);
class ServerInstance {
    // Contains game server and colyseus-websocket server
    constructor() {
        this.PORT = process.env.PORT || 3000;
        this.app = express_1.default();
        this.app.use(express_1.default.json());
        // this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(express_1.default.static('public'));
        this.connectToDb();
        this.configureAPI();
        this.gameServer = new colyseus_1.Server({
            server: http_1.default.createServer(this.app)
        });
        this.defineRooms();
        this.gameServer.listen(this.PORT, () => {
            console.log(`Listening on port ${this.PORT}`);
        });
    }
    connectToDb() {
        const uri = process.env.DB_URI;
        mongoose_1.default.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true // is this needed?
        })
            .then(() => console.log('MongoDB database connection established successfully'))
            .catch(err => console.error('MongoDB connection error: ', err));
        this.db = mongoose_1.default.connection;
    }
    configureAPI() {
        this.app.use(passport_1.default.initialize());
        this.app.use('/users', Users_js_1.default);
        this.app.use('/register', Register_js_1.default);
        this.app.use('/login', Login_js_1.default);
    }
    defineRooms() {
        let standardOptions = {
            mode: ChessGame_js_1.ChessMode.ONLINE_MULTIPLAYER,
            boardConfig: config_json_1.default.boards.classic,
            BoardGraphics: BoardGraphics_js_1.default,
            whitePlayerType: 'AbstractPlayer',
            blackPlayerType: 'AbstractPlayer',
            timeControl: TimeControl_js_1.default.create('OneZero')
        };
        this.gameServer.define('standard', ChessRoom_js_1.default, standardOptions);
    }
}
let server = new ServerInstance();
//# sourceMappingURL=index.js.map