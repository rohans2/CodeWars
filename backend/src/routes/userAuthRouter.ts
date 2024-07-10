
import express from "express";
export const userAuthRouter = express.Router();


import cookieParser from "cookie-parser";
import cors from "cors";
import jwt, { JwtPayload } from "jsonwebtoken";
import z from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { userMiddleware } from "../middlewares/userMiddleware";
import { getProblem } from "../utils/utils";
import axios from "axios";

const prisma = new PrismaClient();
userAuthRouter.use(cookieParser());
userAuthRouter.use(express.json());
userAuthRouter.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

const JUDGE0_URI = "";

const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
})

const signUpSchema = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8)
})

const submissionSchema = z.object({
    slug: z.string(),
    code: z.string(),
    languageId: z.number(),
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
    if(!req.body.email || !req.body.password || req.body.email.length == 0 || req.body.password.length == 0 ){ 
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

    const token =  jwt.sign({
        email: user.email
    }, process.env.JWT_SECRET!);

    res.cookie("token", token);
    res.json({
        message: "Logged In!"
    })

})

userAuthRouter.post("/signup", async (req,res) => {
    const success = signUpSchema.safeParse(req.body);
    if(!success){
        return res.status(422).json({
            message: "Invalid inputs"
        })
    }
    if(!req.body.email || !req.body.password || req.body.email.length == 0 || req.body.password.length == 0 ){ 
        return res.status(422).json({
            message: "Invalid inputs"
        })
    }
    const password = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
        data: {
            name: req.body?.name || "",
            email: req.body.email,
            password: password,
            role: "USER"
        }
    })

    if(!user){
        return res.status(400).json({
            message: "User already exists"
        })
    }
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

userAuthRouter.get("/problem/:slug", userMiddleware, async (req,res) => {
    const slug = req.params.slug;

    const problem = await prisma.problem.findUnique({
        where: {
            slug: slug
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

userAuthRouter.post("/problem/submit", userMiddleware, async (req,res) => {
    // Implement problem submission, test case execution on EC2, using Redis queue and Judge0
    const success = submissionSchema.safeParse(req.body);
    if(!success){
        return res.status(422).json({
            message: "Invalid inputs"
        })
    }

    const problemSlug = req.body.slug;
    const problem = await prisma.problem.findUnique({
        where: {
            slug: problemSlug
        }
    });

    if(!problem){
        return res.status(404).json({
            message: "Problem not found"
        })
    }
    const problemArgs = await getProblem(problem.slug);

    const response = await axios.post(`${JUDGE0_URI}/submissions/batch?base64_encoded=false`,
        {
            submissions: problemArgs.inputs.map((input, index) => {
                return {
                    language_id: req.body.languageId,
                    source_code: req.body.code,
                    stdin: input,
                    expected_output: problemArgs.outputs[index]
                }
            })
        }
    )

    const submission = await prisma.submission.create({
        data: {
            problemId: req.body.problemId,
            //@ts-ignore
            submittedBy: req.userId,
            code: req.body.code,
            testCases: {
                connect: response.data,
            }
        },
        include: {
            testCases: true
        }
    })

    res.status(200).json({
        message: "Submission successful",
        id: submission.id
    })
})

userAuthRouter.get("/submission/:id", userMiddleware, async (req,res) => {
    const id = req.params.id;
    if(!id){
        return res.status(400).json({
            message: "Invalid id"
        })
    }
    const submission = await prisma.submission.findUnique({
        where: {
            id: id
        }, 
        include: {
            testCases: true
        }
    })

    if(!submission) {
        return res.json(404).json({
            message: "Submission not found"
        })
    }
    res.status(200).json({
        submission
    })
})

userAuthRouter.get("/problems", userMiddleware, async (req,res) => {    
        const problems = await prisma.problem.findMany();
        res.json({
            problems
        })
})

