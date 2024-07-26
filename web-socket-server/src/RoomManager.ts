import { User } from "./User";

interface Room{
    id: string;
    name?: string;
    users: User[];
    password: string;
}
export class RoomManager{
    private static instance: RoomManager;
    private rooms: Map<string, Room> = new Map();

    private constructor() {
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new RoomManager();
        }
        return this.instance;
    }

    public addUserToRoom(roomId: string, user: User){
        const room = this.getRoom(roomId);
        if(room && room.users.length < 2){
            room.users.push(user);
        }else{
            throw new Error('Room does not exist');
        }

    }

    public removeUserFromRoom(roomId: string, user: User){
        const room = this.getRoom(roomId);
        if(room && room.users.length >= 1){
            if(room.users.length === 1){
                this.removeRoom(roomId);
            }
            room.users = room.users.filter((u: User) => u.getId() !== user.getId())
        }else{
            throw new Error('Room does not exist');
        }
    }

    public removeUser(userId: string){
        for(const roomId in this.rooms){
            const room = this.rooms.get(roomId);
            const user = room?.users.find((u) => u.getId() === userId)
            if(user){
                this.removeUserFromRoom(roomId, user);
            }
        }
    }

    public getRoom(roomId: string):Room | undefined{
        return this.rooms.get(roomId);
    }

    public getRooms(): Room[] {
        return Array.from(this.rooms.values());
    }

    public createRoom(room:Room){
        this.rooms.set(room.id, room);
    }

    public removeRoom(roomId: string){
        this.rooms.delete(roomId);
    }

}