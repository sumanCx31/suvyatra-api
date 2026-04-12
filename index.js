const http = require("http");
const { Server } = require("socket.io"); 
const app = require("./src/config/express.config");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

const PORT = 9005;
const HOST = "127.0.0.1";

server.listen(PORT, HOST, (err) => {
    if(!err) {
        console.log("Server is running on port:", PORT);
        console.log("Press CTRL+C to discontinue server...");
    }
});