"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const User_1 = require("./User");
const RoomManager_1 = require("./RoomManager");
class UserManager {
    constructor() {
        this.users = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new UserManager();
        }
        return this.instance;
    }
    addUser(ws) {
        const id = this.getId();
        const user = new User_1.User(id, ws);
        this.users.set(id, user);
        this.registerOnClose(ws, id);
        return user;
    }
    registerOnClose(ws, id) {
        ws.on("close", () => {
            this.users.delete(id);
            RoomManager_1.RoomManager.getInstance().removeUser(id);
        });
    }
    getUser(id) {
        return this.users.get(id);
    }
    getId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    emitToAll(data) {
        for (const user of this.users.values()) {
            user.emit(data);
        }
    }
}
exports.UserManager = UserManager;
