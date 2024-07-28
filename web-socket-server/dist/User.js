"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const uuid_1 = require("uuid");
const RoomManager_1 = require("./RoomManager");
class User {
    constructor(id, ws) {
        this.id = id;
        this.ws = ws;
        this.score = 0;
        this.addListeners();
    }
    getId() {
        return this.id;
    }
    getScore() {
        return this.score;
    }
    setScore(score) {
        this.score = score;
    }
    joinRoom(roomId) {
        RoomManager_1.RoomManager.getInstance().addUserToRoom(roomId, this);
    }
    leaveRoom(roomId) {
        RoomManager_1.RoomManager.getInstance().removeUserFromRoom(roomId, this);
    }
    emit(data) {
        this.ws.send(JSON.stringify(data));
    }
    addListeners() {
        this.ws.on('message', (message) => {
            var _a;
            const data = JSON.parse(message);
            switch (data.type) {
                case 'join': {
                    const { roomId, password } = data;
                    if (!RoomManager_1.RoomManager.getInstance().getRoom(roomId)) {
                        this.emit({ type: 'error', message: 'Room does not exist' });
                        return;
                    }
                    if (((_a = RoomManager_1.RoomManager.getInstance().getRoom(roomId).users) === null || _a === void 0 ? void 0 : _a.length) >= 2) {
                        this.emit({ type: 'error', message: 'Room is full' });
                        return;
                    }
                    if (RoomManager_1.RoomManager.getInstance().getRoom(roomId).password && password !== RoomManager_1.RoomManager.getInstance().getRoom(roomId).password) {
                        this.emit({ type: 'error', message: 'Incorrect password' });
                        return;
                    }
                    this.joinRoom(roomId);
                    if (RoomManager_1.RoomManager.getInstance().getRoom(roomId).users.length === 2) {
                        RoomManager_1.RoomManager.getInstance().getRoom(roomId).users.forEach((user) => {
                            user.emit({ type: 'start', message: 'Quiz is starting' });
                        });
                    }
                    break;
                }
                case 'create': {
                    const { password } = data;
                    const roomId = (0, uuid_1.v4)();
                    RoomManager_1.RoomManager.getInstance().createRoom({ id: roomId, name: data.name, users: [], password });
                    this.emit({ type: 'created', roomId });
                    break;
                }
                case 'list': {
                    this.emit({ type: 'rooms', rooms: RoomManager_1.RoomManager.getInstance().getRooms() });
                    break;
                }
                case 'answer': {
                    const { roomId } = data;
                    const user = RoomManager_1.RoomManager.getInstance().getRoom(roomId).users.find((user) => user.ws === this.ws);
                    if (user) {
                        user.setScore(user.getScore() + 1);
                        const scores = RoomManager_1.RoomManager.getInstance().getRoom(roomId).users.map((user) => {
                            return { id: user.id, score: user.getScore() };
                        });
                        this.emit({ type: 'update', room: roomId, scores });
                    }
                    break;
                }
                case 'update': {
                    const { roomId } = data;
                    if (RoomManager_1.RoomManager.getInstance().getRoom(roomId)) {
                        RoomManager_1.RoomManager.getInstance().getRoom(roomId).users.forEach((user) => {
                            user.ws.send(JSON.stringify({
                                type: 'update',
                                scores: data.scores
                            }));
                        });
                    }
                }
            }
        });
        this.ws.on('close', () => {
            for (const roomId in RoomManager_1.RoomManager.getInstance().getRooms()) {
                if (RoomManager_1.RoomManager.getInstance().getRoom(roomId).users) {
                    RoomManager_1.RoomManager.getInstance().getRoom(roomId).users = RoomManager_1.RoomManager.getInstance().getRoom(roomId).users.filter((u) => u.ws !== this.ws);
                    if (RoomManager_1.RoomManager.getInstance().getRoom(roomId).users.length === 0) {
                        // delete rooms[roomId];
                        RoomManager_1.RoomManager.getInstance().removeRoom(roomId);
                    }
                }
            }
        });
    }
}
exports.User = User;
