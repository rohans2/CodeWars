"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const userAuthRouter_1 = require("./routes/userAuthRouter");
const adminAuthRouter_1 = require("./routes/adminAuthRouter");
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const client_1 = require("@prisma/client");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    credentials: true,
    origin: "http://localhost:5173"
}));
const prisma = new client_1.PrismaClient();
app.use('/api/v1/user', userAuthRouter_1.userAuthRouter);
app.use('/api/v1/admin', adminAuthRouter_1.adminAuthRouter);
app.get('/api/v1/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) || null;
    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield prisma.user.findUnique({
            where: {
                email: decoded.email,
            }
        });
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        res.status(200).json({
            email: user.email,
            name: user.name,
            role: user.role
        });
    }
    catch (e) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
}));
const rooms = {};
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        switch (data.type) {
            case 'join': {
                const { roomId, password } = data;
                if (!rooms[roomId]) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Room does not exist' }));
                    return;
                }
                if (rooms[roomId].users.length >= 2) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
                    return;
                }
                if (rooms[roomId].password && password !== rooms[roomId].password) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Incorrect password' }));
                    return;
                }
                rooms[roomId].users.push({ ws, id: data.id, score: 0 });
                if (rooms[roomId].users.length === 2) {
                    rooms[roomId].users.forEach((user) => {
                        user.ws.send(JSON.stringify({ type: 'start', message: 'Quiz is starting' }));
                    });
                }
                break;
            }
            case 'create': {
                const { password } = data;
                const roomId = (0, uuid_1.v4)();
                rooms[roomId] = { id: roomId, name: data.name, users: [], password };
                ws.send(JSON.stringify({ type: 'created', roomId }));
                break;
            }
            case 'list': {
                ws.send(JSON.stringify({ type: 'rooms', rooms: Object.keys(rooms) }));
                break;
            }
            case 'answer': {
                const { roomId } = data;
                const user = rooms[roomId].users.find((user) => user.ws === ws);
                if (user) {
                    user.score += 1;
                    const scores = rooms[roomId].users.map((u) => ({ score: u.score }));
                    ws.send(JSON.stringify({ type: 'update', room: roomId, scores }));
                }
                break;
            }
            case 'update': {
                if (rooms[data.room]) {
                    rooms[data.room].users.forEach((user) => {
                        user.ws.send(JSON.stringify({
                            type: 'update',
                            scores: data.scores
                        }));
                    });
                }
            }
        }
    });
    ws.on('close', () => {
        for (const roomId in rooms) {
            rooms[roomId].users = rooms[roomId].users.filter((u) => u.ws !== ws);
            if (rooms[roomId].users.length === 0) {
                delete rooms[roomId];
            }
        }
    });
});
server.listen(8080, () => {
    console.log('Server is running on port 8080');
});
