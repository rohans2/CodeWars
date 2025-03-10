
import express from "express";
export const userAuthRouter = express.Router();


import cookieParser from "cookie-parser";
import cors from "cors";
import jwt, { JwtPayload } from "jsonwebtoken";
import z from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { userMiddleware } from "../middlewares/userMiddleware";
import { generateSystemPrompt, getProblem } from "../utils/utils";
import axios from "axios";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";

const prisma = new PrismaClient();
userAuthRouter.use(cookieParser());
userAuthRouter.use(express.json());
userAuthRouter.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}));

const client = new OpenAI();
const signInLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, // limit each IP to 5 requests per windowMs
    message: "Too many requests, please try again after 60 seconds",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const submissionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 2, // limit each IP to 5 requests per windowMs
    message: "You attempted to submit the code too many times, please try again after 60 seconds",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

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

const roomSchema = z.object({
    name: z.string().optional(),
    password: z.string().optional(),
    roomId: z.string(),
    Users: z.array(z.object({
        name: z.string().optional(),
        roomUserId: z.string(),
        score: z.number(),
        problemsSolved: z.number(),
        problemsAttempted: z.number(),
    }))
})

type signInType = z.infer<typeof signInSchema>
type signUpType = z.infer<typeof signUpSchema>

userAuthRouter.post("/signin", signInLimiter, async (req, res) => {
    const success = signInSchema.safeParse(req.body);
    if (!success) {
        return res.status(422).json({
            message: "Invalid inputs"
        })
    }
    if (!req.body.email || !req.body.password || req.body.email.length == 0 || req.body.password.length == 0) {
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

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        })
    }

    const passwordMatch = await bcrypt.compare(req.body.password, user.password)

    if (!passwordMatch) {
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

userAuthRouter.post("/signup", signInLimiter, async (req, res) => {
    const success = signUpSchema.safeParse(req.body);
    if (!success) {
        return res.status(422).json({
            message: "Invalid inputs"
        })
    }
    if (!req.body.email || !req.body.password || req.body.email.length == 0 || req.body.password.length == 0) {
        return res.status(422).json({
            message: "Invalid inputs"
        })
    }
    const password = await bcrypt.hash(req.body.password, 10);
    try {
        const user = await prisma.user.create({
            data: {
                name: req.body?.name || "",
                email: req.body.email,
                password: password,
                role: "USER"
            }
        })

        if (!user) {
            return res.status(400).json({
                message: "User already exists"
            })
        }
        res.json({
            message: "user created successfully",
            id: user.id
        })
    } catch (e) {
        console.log(e);
        return res.status(400).json({
            message: "User already exists"
        })
    }

})

userAuthRouter.post("/logout", (req, res) => {
    res.cookie("token", "");
    res.json({
        message: "Logged out"
    })
})

userAuthRouter.get("/problem/:slug", userMiddleware, async (req, res) => {
    const slug = req.params.slug;

    const problem = await prisma.problem.findUnique({
        where: {
            slug: slug
        }
    });

    if (!problem) {
        return res.status(404).json({
            message: "Problem not found"
        })
    }

    res.json({
        problem
    })
})

userAuthRouter.post("/problem/submit", userMiddleware, submissionLimiter, async (req, res) => {
    // Implement problem submission, test case execution on EC2, using Redis queue and Judge0
    const success = submissionSchema.safeParse(req.body);
    if (!success) {
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

    if (!problem) {
        return res.status(404).json({
            message: "Problem not found"
        })
    }
    const problemArgs = await getProblem(problem.slug);

    const response = await axios.post(`${process.env.JUDGE0_URI}/submissions/batch?base64_encoded=false`,
        {
            submissions: problemArgs.inputs.map((input, index) => {
                return {
                    language_id: req.body.languageId,
                    source_code: req.body.code,
                    stdin: input,
                    expected_output: problemArgs.outputs[index],
                    callback_url: `${process.env.SUBMISSION_WEBHOOK_URL}/submission`
                }
            })
        }
    )
    console.log("response");
    //console.log(response.data)

    const submission = await prisma.submission.create({
        data: {
            problemId: req.body.problemId,
            //@ts-ignore
            submittedBy: req.userId,
            code: req.body.code,
            testCases: {
                create: response.data,
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

userAuthRouter.get("/submission/:id", userMiddleware, async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            message: "Invalid id"
        })
    }
    let submission = await prisma.submission.findUnique({
        where: {
            id: id
        },
        include: {
            testCases: true
        }
    })

    const testCasesPassed = submission?.testCases.filter((testCase) => testCase.status_id === 3);
    const testCasesPending = submission?.testCases.filter((testCase) => {
        return testCase.status_id === 2 || testCase.status_id === 1;
    });

    if (testCasesPending?.length === 0) {
        submission = await prisma.submission.update({
            where: {
                id: id
            },
            data: {
                status: testCasesPassed?.length === submission?.testCases.length ? "ACCEPTED" : "REJECTED"
            },
            include: {
                testCases: true
            }
        });
    }



    if (!submission) {
        return res.json(404).json({
            message: "Submission not found"
        })
    }
    res.status(200).json({
        submission
    })
})

userAuthRouter.get("/problems", userMiddleware, async (req, res) => {
    const problems = await prisma.problem.findMany();
    res.json({
        problems
    })
})

userAuthRouter.get("/:difficulty/random-problem", userMiddleware, async (req, res) => {
    const difficulty = req.params.difficulty;
    const problemCount = await prisma.problem.count(({
        where: {
            difficulty: req.params.difficulty as "EASY" | "MEDIUM" | "HARD"
        }
    }));
    const skip = Math.floor(Math.random() * problemCount);
    console.log(skip);



    console.log(difficulty);
    const problem = await prisma.problem.findFirst({
        take: 1,
        skip: skip,
        where: {
            difficulty: difficulty as "EASY" | "MEDIUM" | "HARD"
        },
        orderBy: {
            id: "asc"
        }
    })
    console.log(problem);
    return res.json({
        problem
    })
})

userAuthRouter.get("/room/:id", userMiddleware, async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            message: "Invalid id"
        })
    }
    let room = await prisma.room.findUnique({
        where: {
            id: id
        },
        include: {
            Users: true
        }
    })

    if (!room) {
        return res.json(404).json({
            message: "Room not found"
        })
    }
    res.status(200).json({
        room
    })
})

userAuthRouter.post("/room/create", userMiddleware, async (req, res) => {
    const success = roomSchema.safeParse(req.body);
    if (!success) {
        return res.status(422).json({
            message: "Invalid inputs"
        })
    }
    const room = await prisma.room.upsert({
        where: {
            roomId: req.body.roomId
        },
        create: {
            roomId: req.body.roomId,
            name: req.body.name,
            password: req.body.password,
            Users: {
                create: req.body.Users
            }
        },
        update: {
            name: req.body.name,
            password: req.body.password,
            Users: {
                create: req.body.Users
            }
        }
    })

    res.json({
        room
    })
})

userAuthRouter.post("/problem/requestSolution", userMiddleware, async (req, res) => {
    const problem = req.body.problem;
    const language = req.body.language;
    console.log('req.body', req.body);
    console.log('language', language);
    const stream = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: problem.description }, { role: "system", content: generateSystemPrompt(language) }],
        max_tokens: 8000,
        stream: true,
        store: true
    });

    //chunk.choices[0]?.delta?.content || ""
    for await (const chunk of stream) {
        try {
            const data = chunk.choices[0].delta.content
            if (data) {
                res.write(`${data}`)
                console.log(data);
            }
        }
        catch (e) {
            res.status(404).json({
                message: "Error inn fetching response. Please try again."
            })
        }
    }






});