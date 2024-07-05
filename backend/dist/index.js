"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userAuthRouter_1 = require("./routes/userAuthRouter");
const adminAuthRouter_1 = require("./routes/adminAuthRouter");
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
app.use('/api/v1/user', userAuthRouter_1.userAuthRouter);
app.use('/api/v1/admin', adminAuthRouter_1.adminAuthRouter);
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
