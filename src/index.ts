{"use strict"}

import {server as WebSocketServer, connection} from "websocket"
import http from 'http'
import { IncommingMessage, SupportedMessage } from "./messages/incommingMessage";
import { UserManager  } from "./UserManager";
import { InMemoryStore } from "./store/InMemoryStore";
import { OutgoingMessage, outgoingMessageType } from "./messages/outgoingMessage";




const userManager = new UserManager()
const store = new InMemoryStore()



var server = http.createServer(function(request: any, response:any) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin: string) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {

            try{
                messageHandler(JSON.parse(message.utf8Data),connection)
            }catch(e){

            }

            // console.log('Received Message: ' + message.utf8Data);
            // connection.sendUTF(message.utf8Data);
        }
        
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});


function messageHandler(message: IncommingMessage,ws:connection){
    if(message.type===SupportedMessage.JoinRoom){
        const payload=message.payload;
        userManager.addUser(payload.roomId,payload.userId,payload.userName,ws)
    }
    
    if(message.type===SupportedMessage.SendMessage){
        const payload=message.payload;
        const user = userManager.getUser(payload.roomId,payload.userId)
        if(!user){
            console.log("User not found");
            return
        }

        const chat=store.addChats(payload.roomId,
            payload.userId,
            user.name,
            payload.message)

        if(!chat){
            return
        }

        const outgoingPayload:outgoingMessageType= {
          
            type:OutgoingMessage.addChat,
            payload:{
                roomId:payload.roomId,
                userId:payload.userId,
                name:user.name,
                upvotes:0,
                chatId:chat.id
            }
            

        }

        userManager.brodcast(payload.roomId,payload.userId,outgoingPayload)
       
    }

    if(message.type===SupportedMessage.UpvoteMessage){
        const payload=message.payload
        const chat =store.upvote(payload.userId,payload.roomId,payload.chatId)
        if(!chat){
            return
        }


        const outgoingPayload:outgoingMessageType= {
          
            type:OutgoingMessage.updateChat,
            payload:{
                roomId:payload.roomId,
                userId:payload.userId,
                upvotes:0
            }
            

        }

        userManager.brodcast(payload.roomId,payload.userId,outgoingPayload)
       
    }
}