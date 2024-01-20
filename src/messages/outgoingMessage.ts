


export enum OutgoingMessage{
    addChat= "ADD_CHAT",
    updateChat = "UPDATE_CHAT"
}

export interface MessagePayload{
    roomId:string,
    userId:string,
    name:string,
    upvotes:number,
    chatId:string

}

export type outgoingMessageType ={
    type:OutgoingMessage.addChat,
    payload:MessagePayload
}|{
    type:OutgoingMessage.updateChat,
    payload:Partial<MessagePayload>
}