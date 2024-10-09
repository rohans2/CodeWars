"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuthRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.userAuthRouter = express_1.default.Router();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = __importDefault(require("zod"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userMiddleware_1 = require("../middlewares/userMiddleware");
const utils_1 = require("../utils/utils");
const axios_1 = __importDefault(require("axios"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const prisma = new client_1.PrismaClient();
exports.userAuthRouter.use((0, cookie_parser_1.default)());
exports.userAuthRouter.use(express_1.default.json());
exports.userAuthRouter.use((0, cors_1.default)({
    credentials: true,
    origin: "http://localhost:5173"
}));
const signInLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, // limit each IP to 5 requests per windowMs
    message: "Too many requests, please try again after 60 seconds",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const submissionLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 2, // limit each IP to 5 requests per windowMs
    message: "You attempted to submit the code too many times, please try again after 60 seconds",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
const signInSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(8)
});
const signUpSchema = zod_1.default.object({
    name: zod_1.default.string().optional(),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(8)
});
const submissionSchema = zod_1.default.object({
    slug: zod_1.default.string(),
    code: zod_1.default.string(),
    languageId: zod_1.default.number(),
});
const roomSchema = zod_1.default.object({
    name: zod_1.default.string().optional(),
    password: zod_1.default.string().optional(),
    roomId: zod_1.default.string(),
    Users: zod_1.default.array(zod_1.default.object({
        name: zod_1.default.string().optional(),
        roomUserId: zod_1.default.string(),
        score: zod_1.default.number(),
        problemsSolved: zod_1.default.number(),
        problemsAttempted: zod_1.default.number(),
    }))
});
exports.userAuthRouter.post("/signin", signInLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const success = signInSchema.safeParse(req.body);
    if (!success) {
        return res.status(422).json({
            message: "Invalid inputs"
        });
    }
    if (!req.body.email || !req.body.password || req.body.email.length == 0 || req.body.password.length == 0) {
        return res.status(422).json({
            message: "Invalid inputs"
        });
    }
    const email = req.body.email;
    const user = yield prisma.user.findUnique({
        where: {
            email: email,
            role: "USER"
        }
    });
    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }
    const passwordMatch = yield bcrypt_1.default.compare(req.body.password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({
            message: "Wrong password"
        });
    }
    const token = jsonwebtoken_1.default.sign({
        email: user.email
    }, process.env.JWT_SECRET);
    res.cookie("token", token);
    res.json({
        message: "Logged In!"
    });
}));
exports.userAuthRouter.post("/signup", signInLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const success = signUpSchema.safeParse(req.body);
    if (!success) {
        return res.status(422).json({
            message: "Invalid inputs"
        });
    }
    if (!req.body.email || !req.body.password || req.body.email.length == 0 || req.body.password.length == 0) {
        return res.status(422).json({
            message: "Invalid inputs"
        });
    }
    const password = yield bcrypt_1.default.hash(req.body.password, 10);
    try {
        const user = yield prisma.user.create({
            data: {
                name: ((_a = req.body) === null || _a === void 0 ? void 0 : _a.name) || "",
                email: req.body.email,
                password: password,
                role: "USER"
            }
        });
        if (!user) {
            return res.status(400).json({
                message: "User already exists"
            });
        }
        res.json({
            message: "user created successfully",
            id: user.id
        });
    }
    catch (e) {
        console.log(e);
        return res.status(400).json({
            message: "User already exists"
        });
    }
}));
exports.userAuthRouter.post("/logout", (req, res) => {
    res.cookie("token", "");
    res.json({
        message: "Logged out"
    });
});
exports.userAuthRouter.get("/problem/:slug", userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const problem = yield prisma.problem.findUnique({
        where: {
            slug: slug
        }
    });
    if (!problem) {
        return res.status(404).json({
            message: "Problem not found"
        });
    }
    res.json({
        problem
    });
}));
exports.userAuthRouter.post("/problem/submit", userMiddleware_1.userMiddleware, submissionLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Implement problem submission, test case execution on EC2, using Redis queue and Judge0
    const success = submissionSchema.safeParse(req.body);
    if (!success) {
        return res.status(422).json({
            message: "Invalid inputs"
        });
    }
    const problemSlug = req.body.slug;
    const problem = yield prisma.problem.findUnique({
        where: {
            slug: problemSlug
        }
    });
    if (!problem) {
        return res.status(404).json({
            message: "Problem not found"
        });
    }
    const problemArgs = yield (0, utils_1.getProblem)(problem.slug);
    const response = yield axios_1.default.post(`${process.env.JUDGE0_URI}/submissions/batch?base64_encoded=false`, {
        submissions: problemArgs.inputs.map((input, index) => {
            return {
                language_id: req.body.languageId,
                source_code: req.body.code,
                stdin: input,
                expected_output: problemArgs.outputs[index],
                callback_url: `${process.env.SUBMISSION_WEBHOOK_URL}/submission`
            };
        })
    });
    console.log("response");
    //console.log(response.data)
    const submission = yield prisma.submission.create({
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
    });
    res.status(200).json({
        message: "Submission successful",
        id: submission.id
    });
}));
exports.userAuthRouter.get("/submission/:id", userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            message: "Invalid id"
        });
    }
    let submission = yield prisma.submission.findUnique({
        where: {
            id: id
        },
        include: {
            testCases: true
        }
    });
    const testCasesPassed = submission === null || submission === void 0 ? void 0 : submission.testCases.filter((testCase) => testCase.status_id === 3);
    const testCasesPending = submission === null || submission === void 0 ? void 0 : submission.testCases.filter((testCase) => {
        return testCase.status_id === 2 || testCase.status_id === 1;
    });
    if ((testCasesPending === null || testCasesPending === void 0 ? void 0 : testCasesPending.length) === 0) {
        submission = yield prisma.submission.update({
            where: {
                id: id
            },
            data: {
                status: (testCasesPassed === null || testCasesPassed === void 0 ? void 0 : testCasesPassed.length) === (submission === null || submission === void 0 ? void 0 : submission.testCases.length) ? "ACCEPTED" : "REJECTED"
            },
            include: {
                testCases: true
            }
        });
    }
    if (!submission) {
        return res.json(404).json({
            message: "Submission not found"
        });
    }
    res.status(200).json({
        submission
    });
}));
exports.userAuthRouter.get("/problems", userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const problems = yield prisma.problem.findMany();
    res.json({
        problems
    });
}));
exports.userAuthRouter.get("/:difficulty/random-problem", userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const difficulty = req.params.difficulty;
    const problemCount = yield prisma.problem.count(({
        where: {
            difficulty: req.params.difficulty
        }
    }));
    const skip = Math.floor(Math.random() * problemCount);
    console.log(skip);
    console.log(difficulty);
    const problem = yield prisma.problem.findFirst({
        take: 1,
        skip: skip,
        where: {
            difficulty: difficulty
        },
        orderBy: {
            id: "asc"
        }
    });
    console.log(problem);
    return res.json({
        problem
    });
}));
exports.userAuthRouter.get("/room/:id", userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({
            message: "Invalid id"
        });
    }
    let room = yield prisma.room.findUnique({
        where: {
            id: id
        },
        include: {
            Users: true
        }
    });
    if (!room) {
        return res.json(404).json({
            message: "Room not found"
        });
    }
    res.status(200).json({
        room
    });
}));
exports.userAuthRouter.post("/room/create", userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const success = roomSchema.safeParse(req.body);
    if (!success) {
        return res.status(422).json({
            message: "Invalid inputs"
        });
    }
    const room = yield prisma.room.upsert({
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
    });
    res.json({
        room
    });
}));
