export class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket;
  private callbacks: any = {};

  private constructor() {
    this.ws = new WebSocket("ws://localhost:3001");
    this.init();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new WebSocketManager();
    }
    return this.instance;
  }

  private init() {
    this.ws.onopen = () => {
      console.log("connected"); 
      this.ws.send(JSON.stringify({ type: "list" }));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const type = data.type;
      if(this.callbacks[type]){
        if(type === "update"){
          this.callbacks[type](data.scores);
        }else if(type === "error"){
          this.callbacks[type](data.message);
        }else if(type === "rooms"){
          this.callbacks[type](data.rooms);
        }else if(type === "created"){
          this.callbacks[type](data.roomId);
        }
      }
      
    }
    }

    sendMessage(message: any){
      this.ws.send(JSON.stringify(message));
    }

    async registerCallback(type:string, callback:any){
      this.callbacks[type] = callback;
    }

    async unregisterCallback(type:string){
      delete this.callbacks[type];
    }


    
  public close() {
    this.ws!.close();
  }
}