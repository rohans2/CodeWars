import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"

const prisma = new PrismaClient();
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
                role: "ADMIN"
            }
        })
        
        if(!user){
            return res.status(401).json({
                message: "Unauthorized"
            })
        }
        next();


    }catch(e){
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
    
    
}