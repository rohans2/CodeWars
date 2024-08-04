export class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket;
  private bufferedMessages: any[] = [];
  private callbacks: any = {};
  private id: number;
  private initialized: boolean = false;

  private constructor() {
    this.ws = new WebSocket("ws://localhost:3001");
    this.init();
    this.id = 1;
    this.bufferedMessages = [];
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new WebSocketManager();
    }
    return this.instance;
  }

  private init() {
    this.ws.onopen = () => {
      this.initialized = true;
      this.bufferedMessages.forEach(message => {
        this.ws.send(JSON.stringify(message));
      })
      this.bufferedMessages = [];
      console.log("connected"); 
      this.ws.send(JSON.stringify({ type: "list" }));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const type = data.type;
      if(this.callbacks[type]){
        // if(type === "update"){
        //   this.callbacks[type](data.scores);
        // }else if(type === "error"){
        //   this.callbacks[type](data.message);
        // }else if(type === "rooms"){
        //   this.callbacks[type](data);
        // }else if(type === "created"){
        //   this.callbacks[type](data);
        // }
        this.callbacks[type](data);
      }
      
    }
    }

    sendMessage(message: any){
      const messageToSend = {
        ...message,
        id: this.id++
    }
    if (!this.initialized) {
        this.bufferedMessages.push(messageToSend);
        return;
    }
      this.ws.send(JSON.stringify(messageToSend));
    }

    async registerCallback(type:string, callback:any){
      this.callbacks[type] = callback;
    }

    async unregisterCallback(type:string){
      delete this.callbacks[type];
    }

    public isConnected(){
        return this.ws?.readyState === this.ws?.OPEN;
    }
    
  public close() {
    this.ws!.close();
  }
}