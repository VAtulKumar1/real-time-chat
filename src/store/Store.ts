export type UserId= string

export interface Chat{
    id: string,
    userId: UserId,
    userName : string,
    message: string,
    upvotes: UserId[]
}

export abstract class Store{
    constructor(){

    }

    initRoom(roomId: string){

    }

    getChats(roomId: string,limit: number,offset: number){

    }

    addChats(roomid: string,userId: UserId,userName: string,message: string){

    }

    upvote(userId: string,roomId:string,id: string){


    }


}