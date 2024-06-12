import express from "express";
export const userAuthRouter = express.Router();


import cookieParser from "cookie-parser";
import cors from "cors";
import jwt, { JwtPayload } from "jsonwebtoken";
import z from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { userMiddleware } from "../middlewares/userMiddleware";

const prisma = new PrismaClient();
userAuthRouter.use(cookieParser());
userAuthRouter.use(express.json());
userAuthRouter.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));


const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

const signUpSchema = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8)
})

type signInType = z.infer<typeof signInSchema>
type signUpType = z.infer<typeof signUpSchema>

userAuthRouter.post("/signin", async (req,res) => {
    const success = signInSchema.safeParse(req.body);
    if(!success){
        return res.status(422).json({
            message: "Invalid inputs"
        })
    }

    const email = req.body.email;
    const user = await prisma.user.findUnique({
        where: {
            email: email,
            role: "USER"
        }
    });
    
    if(!user){
        return res.status(404).json({
            message: "User not found"
        })
    }
    
    const passwordMatch = await bcrypt.compare(req.body.password, user.password)
    if(!passwordMatch){
        return res.status(401).json({
            message: "Wrong password"
        })
    }

    const token = jwt.sign({
        email: user.email
    }, process.env.JWT_SECRET!);

    res.cookie("token", token);
    res.json({
        message: "Logged In!"
    })

})

userAuthRouter.post("signup", async (req,res) => {
    const success = signUpSchema.safeParse(req.body);
    if(!success){
        return res.status(422).json({
            message: "Invalid inputs"
        })
    }
    const user = await prisma.user.create({
        data: {
            name: req.body?.name || "",
            email: req.body.email,
            password: req.body.password,
            role: "USER"
        }
    })

    res.json({
        message: "user created successfully",
        id: user.id
    })
})

userAuthRouter.post("/logout", (req,res) => {
    res.cookie("token", "");
    res.json({
        message: "Logged out"
    })
})

userAuthRouter.get("/problem/:id", userMiddleware, (req,res) => {
    const id = Number(req.params.id);

    const problem = prisma.problem.findUnique({
        where: {
            id: id
        }
    });
    
    if(!problem){
        return res.status(404).json({
            message: "Problem not found"
        })
    }

    res.json({
        problem
    })
})

userAuthRouter.post("/problem/:id/submit", userMiddleware, (req,res) => {
    // Implement problem submission, test case execution on EC2, using Redis queue
})

userAuthRouter.get("/problems", userMiddleware, (req,res) => {    
        const problems = prisma.problem.findMany();
        res.json({
            problems
        })
})

