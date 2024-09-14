import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from "./socket.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'SocketExample';

  public messages: Array<any>;
  chatBox: string = "";

  public constructor(private socket: SocketService){
    this.messages = [];
    this.chatBox = "";
  }

  public ngOnInit(){
    this.socket.getListener().subscribe(event => {
      if(event.type == "message"){
        let data = event.data.content;
        if(event.data.sender) {
          data = event.data.sender + ": " + data;
        }
        this.messages.push(data);
      }
      if (event.type == "close"){
        this.messages.push("/Connection Closed");
      }
      if (event.type == "open"){
        this.messages.push("/Connection Opened");
      }
    });
  }

  public ngOnDestroy() {
    this.socket.close();
  }

  public send() {
    if(this.chatBox){
      this.socket.send(this.chatBox);
      this.chatBox = "";
    }
  }

  public isSystemMessage(message: string) {
    return message.startsWith("/") ? "<strong>" + message.substring(1) + "</strong>": message;
  }
}
