"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
class UserManager {
    constructor() {
        this.rooms = new Map();
    }
    addUser(roomId, userId, userName, con) {
        const room = this.rooms.get(roomId);
        if (!room) {
            this.rooms.set(roomId, {
                users: []
            });
        }
        room === null || room === void 0 ? void 0 : room.users.push({
            id: userId,
            name: userName
        });
    }
    removeUser(roomId, userId) {
        var _a;
        const users = (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.users;
        if (users) {
            users.filter(({ id }) => userId === id);
        }
    }
    getUser(roomId, userId) {
        var _a;
        const user = (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.users.find(({ id }) => id === userId);
        return user;
    }
    brodcast(roomId, userId, message) {
        const user = this.getUser(roomId, userId);
        if (!user) {
            console.log("User not found");
            return;
        }
        const room = this.rooms.get(roomId);
        if (!room) {
            console.log("Room not found");
            return;
        }
    }
}
exports.UserManager = UserManager;
