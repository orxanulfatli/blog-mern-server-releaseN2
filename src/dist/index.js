"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
const error_1 = require("./middleware/error");
//import Application constants
const index_2 = __importDefault(require("./constants/index"));
const http_1 = require("http");
//import socket io
const socket_io_1 = require("socket.io");
//Middleware
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cors_1.default)({
    credentials: true,
    origin: ["https://blog-ulfatli.netlify.app", 'http://localhost:3000']
}));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
//socket 
const http = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(http, {
    cors: {
        credentials: true,
        origin: ["https://blog-ulfatli.netlify.app", 'http://localhost:3000']
    }
});
const socket_1 = require("./config/socket");
exports.io.on("connection", (socket) => (0, socket_1.SocketServer)(socket));
//Routes
app.use('/api', index_1.default.authRouter);
app.use('/api', index_1.default.userRouter);
app.use('/api', index_1.default.categoryRouter);
app.use('/api', index_1.default.blogRouter);
app.use('/api', index_1.default.commentRouter);
//error middleware
app.use(error_1.errorMiddleware);
//DB
require("./config/database");
//server listening
http.listen(index_2.default.PORT, () => {
    console.log('Server is running on port', index_2.default.PORT);
});
