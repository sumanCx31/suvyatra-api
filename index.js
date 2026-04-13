const http = require("http");
const { Server } = require("socket.io"); 
const app = require("./src/config/express.config");

const server = http.createServer(app);

const ALLOWED_ORIGINS = [
    "https://nextjs-suvyatra-fe.vercel.app",
    "https://frontendvite-suvyatra4.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
];

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 9005;

io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
});

server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});