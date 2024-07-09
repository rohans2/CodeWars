import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"

const prisma = new PrismaClient();
export const userMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
                role: "USER"
            }
        })
        
        if(!user){
            console.log('user is null');
            return res.status(401).json({
                message: "Unauthorized"
            })
        }
        //@ts-ignore
        req.userId = user.id;
        next()


    }catch(e){
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
    
    
}