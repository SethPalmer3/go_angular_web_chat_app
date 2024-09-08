type ClientManager struct {
	clients    map[*Client]bool
	boradcast  chan []byte
	register   chan *Client
	unregister chan *Client
}

type Client struct {
	id     string
	socket *websocket.Conn
	send   chan []byte
}

type Message struct {
	Sender    string `json:"sender,omitempty"`
	Recipient string `json:"recipient,omitempty"`
	Content   string `json:"content,omitempty"`
}

var manager = ClientManager{
	clients:    make(map[*Client]bool),
	broadcast:   make(chan []byte),
	register:   make(chan *Client),
	unregister: make(chan *Client),
}

// Handler for the managers unregister, register, and brodcast

func (manager *ClientManager) Start() {
	for {
		select {
		case conn := <-manager.register:
			manager.clients[conn] = true
			// fmt.Println("Size of Connection Pool: ", len(manager.clients))
			jsonMessage, _ := json.Marshal(&Message{Content: "New User Joined..."})
			manager.send(jsonMessage, conn)
		case conn := <-manager.unregister:
			if _, ok := manager.clients[conn]; ok {
				close(conn.send)
				delete(manager.clients, conn)
				jsonMessage, _ := json.Marshal(&Message{Content: "User Disconnected..."})
				manager.send(jsonMessage, conn)
			}
		}
		case message := <-manager.broadcast:
			for conn := range manager.clients {
                select {
                    case conn.send <- message:
                    default:
                        close(conn.send)
                        delete(manager.clients, conn)
                }
            }
        }
	}
}

func (manager *ClientManager) send(message []byte, ignore *Client){
	for conn := range manager.clients {
		if conn != ignore {
			conn.send <- message
		}
	}
}
