import express from "express";
export const adminAuthRouter = express.Router();


import cookieParser from "cookie-parser";
import fs from "node:fs/promises";
import cors from "cors";
import jwt, { JwtPayload } from "jsonwebtoken";
import z from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { adminMiddleware } from "../middlewares/adminMiddleware";

const prisma = new PrismaClient();
adminAuthRouter.use(cookieParser());
adminAuthRouter.use(express.json());
adminAuthRouter.use(cors({
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

const postAProblemSchema = z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    difficulty: z.string(),
    status: z.string().optional() ,
    defaultCode: z.string().optional(),
    testCases: z.array(z.object({
        input: z.string(),
        output: z.string()
    })),
    examples: z.array(z.object({
        input: z.string(),
        output: z.string()
    })).optional()
})

const putAProblemSchema = z.object({
    slug: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    difficulty: z.string().optional(),
    status: z.string().optional() 
})

type signInType = z.infer<typeof signInSchema>
type signUpType = z.infer<typeof signUpSchema>

adminAuthRouter.post("/signin", async (req,res) => {
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
            role: "ADMIN"
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

adminAuthRouter.post("/signup", async (req,res) => {
    const success = signUpSchema.safeParse(req.body);
    if(!success){
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
            role: "ADMIN"
        }
    })

    res.json({
        message: "user created successfully",
        id: user.id
    })
})

adminAuthRouter.post("/logout", (req,res) => {
    res.cookie("token", "");
    res.json({
        message: "Logged out"
    })
})

adminAuthRouter.get("/problems", adminMiddleware, async(req,res) => {
    const problems = await prisma.problem.findMany();
    console.log(problems);
    res.json({
        problems
    })
})

adminAuthRouter.get("/problem/:slug", adminMiddleware, async (req,res) => {
    const problem = await prisma.problem.findFirst({
        where: {
            slug: req.params?.slug
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

adminAuthRouter.post("/problem", adminMiddleware, async (req,res) => {
    const success = postAProblemSchema.safeParse(req.body);
    if(!success){
        return res.status(422).json({
            message: "Invalid inputs"
        })
    }
   
    
    // improve room logic
    // test end points
    // buy ec2 instance, run judge0, and test web sockets , signup, signin there, also problem uploadj
    // Connect backend and frontend, remove hard coded test data from frontend
    // Doneeeeee.
    const problem = await prisma.problem.create({
        data: {
            slug: req.body.slug,
            title: req.body.title,
            description: req.body.description,
            difficulty: req.body.difficulty,
            status: 'HIDDEN',
            defaultCode: req.body.defaultCode,
            examples: req.body.examples
        }
    });

    type testCaseType = {input: string, output: string};

    const parsedTestCases = JSON.parse(req.body?.testCases);
    const testCases = parsedTestCases.map((testCase: testCaseType) => ({
        input: testCase.input,
        output: testCase.output
    }))

    console.log(testCases);
    console.log('parsedTestCases', parsedTestCases);

    const inputs = testCases?.map((testCase: testCaseType) => testCase.input); 
    const outputs = testCases?.map((testCase: testCaseType) => testCase.output);

    await fs.mkdir(`./src/problems/${problem.slug}/inputs`, {
        recursive: true});
    
    await fs.mkdir(`./src/problems/${problem.slug}/outputs`, {
        recursive: true});
;    inputs?.forEach(async(input: String, index:  number) => {
        const inputFilePath = `./src/problems/${problem.slug}/inputs/${index}.txt`;
        await fs.writeFile(inputFilePath, input);
    })
    outputs?.forEach(async(output: String, index:  number) => {
        const outputFilePath = `./src/problems/${problem.slug}/outputs/${index}.txt`;
        await fs.writeFile(outputFilePath, output);
    })

    //push to github using octokit/ simple-git
    // add the whole process to a transaction
    
    res.json({
        problem
    })
})


adminAuthRouter.put("/problem/:id", adminMiddleware, async (req,res) => {
    const success = putAProblemSchema.safeParse(req.body);
    if(!success){
        return res.status(422).json({
            message: "Invalid inputs"
        })
    }
    await prisma.problem.update({
        where: {
            id: req.params.id
        },
        data: {
            slug: req.body?.slug,
            title: req.body?.title,
            description: req.body?.description,
            difficulty: req.body?.difficulty,
            status: req.body?.status,
            defaultCode: req.body?.defaultCode
        }
    })
    return res.json({
        message: "Problem updated successfully"
    })
})