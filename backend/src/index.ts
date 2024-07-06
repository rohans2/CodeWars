import jwt, { JwtPayload } from 'jsonwebtoken';
import cors from 'cors';
import express from "express";
import { userAuthRouter } from "./routes/userAuthRouter"
import { adminAuthRouter } from "./routes/adminAuthRouter";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from "@prisma/client";
import cookieParser from 'cookie-parser';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

const prisma = new PrismaClient();

app.use('/api/v1/user', userAuthRouter);
app.use('/api/v1/admin', adminAuthRouter);

app.get('/api/v1/me',async(req,res) => {
  const token = req.cookies?.token || null;
    
  if(!token){
      
      return res.status(401).json({
          message: "Unauthorized"
      })
  }
  try{
      const decoded =  jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      const user = await prisma.user.findUnique({
          where: {
              email: decoded.email,
          }
      })
      
      if(!user){
          return res.status(401).json({
              message: "Unauthorized"
          })
      }

      res.status(200).json({
          email: user.email,
          name: user.name,
          role: user.role
      })


  }catch(e){
      return res.status(401).json({
          message: "Unauthorized"
      })
  }
})

interface User{
  ws: WebSocket;
  id: string;
  score: number;
}
interface Room{
  id: string;
  name: string;
  users: User[];
  password: string;
}

const rooms: {[key: string]: Room} = {};
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());

    switch(data.type){
      case 'join': {
        const { roomId, password } = data;
        if(!rooms[roomId]){
          ws.send(JSON.stringify({type: 'error', message: 'Room does not exist'}));
          return;
        }
        if(rooms[roomId].users.length >= 2){
          ws.send(JSON.stringify({type: 'error', message: 'Room is full'}));
          return;
        }
        if(rooms[roomId].password && password !== rooms[roomId].password){
          ws.send(JSON.stringify({type: 'error', message: 'Incorrect password'}));
          return;
        }
        rooms[roomId].users.push({ws, id: data.id, score: 0});
        if(rooms[roomId].users.length === 2){
           rooms[roomId].users.forEach((user) => {
             user.ws.send(JSON.stringify({type: 'start', message: 'Quiz is starting'}));
          })
        }
        break;
      }
      case 'create': {
        const {password} = data;
        const roomId = uuidv4();
        rooms[roomId] = { id: roomId, name: data.name, users: [], password };
        ws.send(JSON.stringify({type: 'created', roomId}));
        break;
      }
      case 'list': {
        ws.send(JSON.stringify({type: 'rooms', rooms: Object.keys(rooms)}));
        break;
      }
      case 'answer': {
        const {roomId } = data;
        const user = rooms[roomId].users.find((user) => user.ws === ws);
        if(user){
          user.score += 1;
          const scores = rooms[roomId].users.map((u) => ({score: u.score}));
          ws.send(JSON.stringify({type: 'update', room: roomId, scores}));
        }
        break;
      }
      case 'update': {
        if(rooms[data.room]){
          rooms[data.room].users.forEach((user) => {
            user.ws.send(JSON.stringify({
              type: 'update',
              scores: data.scores
            }))
          })
        }
      }
    }
  })

  ws.on('close', () => {
    for(const roomId in rooms){
      rooms[roomId].users = rooms[roomId].users.filter((u) => u.ws !== ws)
      if(rooms[roomId].users.length === 0){
        delete rooms[roomId];
      }
    }
  })
})


server.listen(8080,() => {
  console.log('Server is running on port 8080');
})
