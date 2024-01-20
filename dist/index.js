"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
{
    "use strict";
}
const websocket_1 = require("websocket");
const http_1 = __importDefault(require("http"));
const incommingMessage_1 = require("./messages/incommingMessage");
const UserManager_1 = require("./UserManager");
const InMemoryStore_1 = require("./store/InMemoryStore");
const outgoingMessage_1 = require("./messages/outgoingMessage");
const userManager = new UserManager_1.UserManager();
const store = new InMemoryStore_1.InMemoryStore();
var server = http_1.default.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function () {
    console.log((new Date()) + ' Server is listening on port 8080');
});
const wsServer = new websocket_1.server({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}
wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            try {
                messageHandler(JSON.parse(message.utf8Data), connection);
            }
            catch (e) {
            }
            // console.log('Received Message: ' + message.utf8Data);
            // connection.sendUTF(message.utf8Data);
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
function messageHandler(message, ws) {
    if (message.type === incommingMessage_1.SupportedMessage.JoinRoom) {
        const payload = message.payload;
        userManager.addUser(payload.roomId, payload.userId, payload.userName, ws);
    }
    if (message.type === incommingMessage_1.SupportedMessage.SendMessage) {
        const payload = message.payload;
        const user = userManager.getUser(payload.roomId, payload.userId);
        if (!user) {
            console.log("User not found");
            return;
        }
        const chat = store.addChats(payload.roomId, payload.userId, user.name, payload.message);
        if (!chat) {
            return;
        }
        const outgoingPayload = {
            type: outgoingMessage_1.OutgoingMessage.addChat,
            payload: {
                roomId: payload.roomId,
                userId: payload.userId,
                name: user.name,
                upvotes: 0,
                chatId: chat.id
            }
        };
        userManager.brodcast(payload.roomId, payload.userId, outgoingPayload);
    }
    if (message.type === incommingMessage_1.SupportedMessage.UpvoteMessage) {
        const payload = message.payload;
        const chat = store.upvote(payload.userId, payload.roomId, payload.chatId);
        if (!chat) {
            return;
        }
        const outgoingPayload = {
            type: outgoingMessage_1.OutgoingMessage.updateChat,
            payload: {
                roomId: payload.roomId,
                userId: payload.userId,
                upvotes: 0
            }
        };
        userManager.brodcast(payload.roomId, payload.userId, outgoingPayload);
    }
}
