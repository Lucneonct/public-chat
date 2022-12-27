import express from 'express';
import morgan from 'morgan';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import cors from 'cors';
import { PORT } from "./config.js";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: '*'
  }
});

io.on('connection' , (socket) => {
  console.log('a user connected', socket.id)
  socket.on('message', message => {
    socket.broadcast.emit('message', {
      ...message,
      user_id: socket.id
    })
  })
})

app.use(express.static(path.join(__dirname, "../client/build")))

app.use(cors())
app.use(morgan("dev"));

server.listen(process.env.PORT || PORT);
console.log('Server started on port', process.env.PORT || PORT);