import { connection } from "websocket";
import { OuterTypeOfFunction } from "zod";
import { OutgoingMessage, outgoingMessageType } from "./messages/outgoingMessage";

export interface User{
    id: string,
    name: string
}

export interface Room{
    users: User[]
}
export class UserManager{
    private rooms: Map<string,Room>;
    constructor(){
        this.rooms= new Map<string,Room>()
    }

    addUser(roomId: string,userId: string,userName: string, con: connection){
        const room = this.rooms.get(roomId)
        if(!room){
            this.rooms.set(roomId,{
                users:[]
            })
        }
        room?.users.push({
            id:userId,
            name: userName
        })

    }

    removeUser(roomId: string, userId: string){
        const users =this.rooms.get(roomId)?.users;
        if(users){
            users.filter(({id})=>userId===id);
        }
       

    }

    getUser(roomId: string, userId: string){
        const user = this.rooms.get(roomId)?.users.find(({id})=> id===userId)
        return user
    }

    brodcast(roomId: string,userId:string,message:outgoingMessageType){
        const user=this.getUser(roomId,userId)
        if(!user){
            console.log("User not found");
            return
            
        }
        const room =this.rooms.get(roomId)
        if(!room){
            console.log("Room not found");
            return
        }



    }
}