import { Injectable, EventEmitter } from '@angular/core';

@Injectable()

export class SocketService {
  private socket: WebSocket;
  private listener: EventEmitter<any> = new EventEmitter();

  constructor() {
    this.socket = new WebSocket('ws://localhost:8080');
    this.socket.onopen = event => {
      this.listener.emit({"type": "open", "data": event});
    }
    this.socket.onclose = event => {
      this.listener.emit({"type": "close", "data": event});
    }
    this.socket.onmessage = event => {
      this.listener.emit({"type": "message", "data": event});
    }
  }

  public send(data: string){
    this.socket.send(data);
  }

  public close(){
    this.socket.close();
  }

  public getListener(){
    return this.listener;
  }
}
