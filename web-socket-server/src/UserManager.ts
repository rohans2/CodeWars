import { WebSocket } from "ws";
import { User } from "./User";
import { RoomManager } from "./RoomManager";

export class UserManager{
    private static instance: UserManager;
    private users: Map<string, User> = new Map();

    private constructor() {

    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new UserManager();
        }
        return this.instance;
    }

    public addUser(ws: WebSocket){
        const id = this.getId();
        const user = new User(id, ws);
        this.users.set(id, user);
        this.registerOnClose(ws, id);
        return user;
    }

    private registerOnClose(ws: WebSocket, id: string){
        ws.on("close", () => {
            this.users.delete(id);
            RoomManager.getInstance().removeUser(id);
        });
    }

    public getUser(id: string){
        return this.users.get(id);
    }

    private getId(){
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    public emitToAll(data: any){
        for(const user of this.users.values()){
            user.emit(data);
        }
    }
}