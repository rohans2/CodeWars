import { WebSocket } from "ws";
import { v4 as uuidv4 } from 'uuid';

import { RoomManager } from "./RoomManager";
import { UserManager } from "./UserManager";

export class User {
  private id: string;
  private ws: WebSocket
  private score: number;

  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;
    this.score = 0;
    this.addListeners();
  }
  public getId(): string {
    return this.id;
  }

  public getScore(): number {
    return this.score;
  }

  public setScore(score: number) {
    this.score = score;
  }
  public joinRoom(roomId: string) {
    RoomManager.getInstance().addUserToRoom(roomId, this);
  }

  public leaveRoom(roomId: string) {
    RoomManager.getInstance().removeUserFromRoom(roomId, this);
  }

  emit(data: any) {
    this.ws.send(JSON.stringify(data));
  }


  private async handleJoin(data: any) {
    const { roomId } = data;
    console.log('join called websocket');
    if (!RoomManager.getInstance().getRoom(roomId)) {
      this.emit({ type: 'error', message: 'Room does not exist' });
      return;
    }
    else if (RoomManager.getInstance().getRoom(roomId)!.users?.length >= 2) {
      console.log('Room is full');
      this.emit({ type: 'error', message: 'Room is full' });
      return;
    }
    // if(RoomManager.getInstance().getRoom(roomId)!.password && password !== RoomManager.getInstance().getRoom(roomId)!.password){
    //   this.emit({type: 'error', message: 'Incorrect password'});
    //   return;
    // }
    this.joinRoom(roomId);
    RoomManager.getInstance().getRoom(roomId)?.users.forEach((user) => {
      user.emit({ type: 'joined', users: RoomManager.getInstance().getRoom(roomId)!.users });
    })

    // if (RoomManager.getInstance().getRoom(roomId)!.users.length === 2) {
    //   RoomManager.getInstance().getRoom(roomId)!.users.forEach((user) => {
    //     user.emit({ type: 'start', message: 'Quiz is starting' });
    //   })
    // }
  }

  private addListeners() {
    this.ws.on('message', async (message: string) => {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join': {
          await this.handleJoin(data);
          break;
        }
        case 'start': {
          const { message } = data;
          console.log(message);
          break;
        }

        case 'create': {
          //const {password} = data;
          const roomId = uuidv4();
          const room = RoomManager.getInstance().createRoom({ id: roomId, name: data.name, users: [] });
          this.joinRoom(roomId);
          this.emit({ type: 'created', room });
          UserManager.getInstance().emitToAll({ type: 'rooms', rooms: RoomManager.getInstance().getRooms() });
          break;
        }
        case 'list': {
          this.emit({ type: 'rooms', rooms: RoomManager.getInstance().getRooms() });
          break;
        }
        case 'answer': {
          const { roomId } = data;
          const user = RoomManager.getInstance().getRoom(roomId)!.users.find((user) => user.ws === this.ws);
          if (user) {
            user.setScore(user.getScore() + 1);
            const scores = RoomManager.getInstance().getRoom(roomId)!.users.map((user) => {
              return { id: user.id, score: user.getScore() };
            });
            this.emit({ type: 'update', roomId, scores });
          }
          break;
        }
        case 'update': {
          const { roomId } = data;
          if (RoomManager.getInstance().getRoom(roomId)) {
            RoomManager.getInstance().getRoom(roomId)!.users.forEach((user) => {
              user.ws.send(JSON.stringify({
                type: 'update',
                roomId,
                scores: data.scores
              }))
            })
          }
        }
        case 'getRoom': {
          const { roomId } = data;
          this.emit({ type: 'roomDetails', roomId, room: RoomManager.getInstance().getRoom(roomId) });
        }
      }
    })
    this.ws.on('close', () => {
      for (const roomId in RoomManager.getInstance().getRooms()) {
        if (RoomManager.getInstance().getRoom(roomId)) {
          RoomManager.getInstance().getRoom(roomId)!.users = RoomManager.getInstance().getRoom(roomId)!.users.filter((u) => u.ws !== this.ws)
          if (RoomManager.getInstance().getRoom(roomId)!.users.length === 0) {
            // delete rooms[roomId];
            RoomManager.getInstance().removeRoom(roomId);
          }
        }

      }
    })
  }

}

