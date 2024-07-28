export class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket;

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
    }


    
  public close() {
    this.ws!.close();
  }
}