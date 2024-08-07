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
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const uuid_1 = require("uuid");
const RoomManager_1 = require("./RoomManager");
const UserManager_1 = require("./UserManager");
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
    handleJoin(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { roomId } = data;
            console.log('join called websocket');
            if (!RoomManager_1.RoomManager.getInstance().getRoom(roomId)) {
                this.emit({ type: 'error', message: 'Room does not exist' });
                return;
            }
            else if (((_a = RoomManager_1.RoomManager.getInstance().getRoom(roomId).users) === null || _a === void 0 ? void 0 : _a.length) >= 2) {
                console.log('Room is full');
                this.emit({ type: 'error', message: 'Room is full' });
                return;
            }
            // if(RoomManager.getInstance().getRoom(roomId)!.password && password !== RoomManager.getInstance().getRoom(roomId)!.password){
            //   this.emit({type: 'error', message: 'Incorrect password'});
            //   return;
            // }
            this.joinRoom(roomId);
            (_b = RoomManager_1.RoomManager.getInstance().getRoom(roomId)) === null || _b === void 0 ? void 0 : _b.users.forEach((user) => {
                user.emit({ type: 'roomDetails', roomId, room: RoomManager_1.RoomManager.getInstance().getRoom(roomId) });
            });
            // if (RoomManager.getInstance().getRoom(roomId)!.users.length === 2) {
            //   RoomManager.getInstance().getRoom(roomId)!.users.forEach((user) => {
            //     user.emit({ type: 'start', message: 'Quiz is starting' });
            //   })
            // }
        });
    }
    addListeners() {
        this.ws.on('message', (message) => __awaiter(this, void 0, void 0, function* () {
            const data = JSON.parse(message);
            switch (data.type) {
                case 'join': {
                    yield this.handleJoin(data);
                    break;
                }
                case 'start': {
                    const { message } = data;
                    console.log(message);
                    break;
                }
                case 'create': {
                    //const {password} = data;
                    const roomId = (0, uuid_1.v4)();
                    const room = RoomManager_1.RoomManager.getInstance().createRoom({ id: roomId, name: data.name, users: [] });
                    this.joinRoom(roomId);
                    this.emit({ type: 'created', room });
                    UserManager_1.UserManager.getInstance().emitToAll({ type: 'rooms', rooms: RoomManager_1.RoomManager.getInstance().getRooms() });
                    break;
                }
                case 'list': {
                    this.emit({ type: 'rooms', rooms: RoomManager_1.RoomManager.getInstance().getRooms() });
                    break;
                }
                case 'answer': {
                    const { roomId } = data;
                    const { score } = data;
                    const user = RoomManager_1.RoomManager.getInstance().getRoom(roomId).users.find((user) => user.ws === this.ws);
                    if (user) {
                        user.setScore(score);
                        const scores = RoomManager_1.RoomManager.getInstance().getRoom(roomId).users.map((user) => {
                            return { id: user.id, score: user.getScore() };
                        });
                        this.emit({ type: 'update', roomId, scores });
                    }
                    break;
                }
                case 'update': {
                    const { roomId } = data;
                    if (RoomManager_1.RoomManager.getInstance().getRoom(roomId)) {
                        RoomManager_1.RoomManager.getInstance().getRoom(roomId).users.forEach((user) => {
                            user.ws.send(JSON.stringify({
                                type: 'update',
                                roomId,
                                scores: data.scores
                            }));
                        });
                    }
                }
                case 'getRoom': {
                    const { roomId } = data;
                    this.emit({ type: 'roomDetails', roomId, room: RoomManager_1.RoomManager.getInstance().getRoom(roomId) });
                }
            }
        }));
        this.ws.on('close', () => {
            for (const roomId in RoomManager_1.RoomManager.getInstance().getRooms()) {
                if (RoomManager_1.RoomManager.getInstance().getRoom(roomId)) {
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
