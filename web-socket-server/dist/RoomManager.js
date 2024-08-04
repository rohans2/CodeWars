"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
    }
    addUserToRoom(roomId, user) {
        const room = this.getRoom(roomId);
        if (room && room.users.length < 2) {
            user.setScore(0);
            room.users.push(user);
        }
        else {
            user.emit({ type: 'error', message: 'Room is full' });
        }
    }
    removeUserFromRoom(roomId, user) {
        const room = this.getRoom(roomId);
        if (room && room.users.length >= 1) {
            room.users = room.users.filter((u) => u.getId() !== user.getId());
            if (room.users.length === 0) {
                this.removeRoom(roomId);
            }
        }
        else {
            user.emit({ type: 'error', message: 'Room does not exist' });
        }
    }
    removeUser(userId) {
        for (const roomId in this.rooms) {
            const room = this.rooms.get(roomId);
            const user = room === null || room === void 0 ? void 0 : room.users.find((u) => u.getId() === userId);
            if (user) {
                this.removeUserFromRoom(roomId, user);
            }
        }
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    getRooms() {
        return Array.from(this.rooms.values());
    }
    createRoom(room) {
        this.rooms.set(room.id, room);
        return room;
    }
    removeRoom(roomId) {
        this.rooms.delete(roomId);
    }
}
exports.RoomManager = RoomManager;
