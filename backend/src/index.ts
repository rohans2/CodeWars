import jwt, { JwtPayload } from 'jsonwebtoken';
import cors from 'cors';
import express from "express";
import { userAuthRouter } from "./routes/userAuthRouter"
import { adminAuthRouter } from "./routes/adminAuthRouter";
import { PrismaClient } from "@prisma/client";
import cookieParser from 'cookie-parser';

const app = express();

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

