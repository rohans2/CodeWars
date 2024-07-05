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
exports.adminAuthRouter = void 0;
const express_1 = __importDefault(require("express"));
exports.adminAuthRouter = express_1.default.Router();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const promises_1 = __importDefault(require("node:fs/promises"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = __importDefault(require("zod"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const adminMiddleware_1 = require("../middlewares/adminMiddleware");
const prisma = new client_1.PrismaClient();
exports.adminAuthRouter.use((0, cookie_parser_1.default)());
exports.adminAuthRouter.use(express_1.default.json());
exports.adminAuthRouter.use((0, cors_1.default)({
    credentials: true,
    origin: "http://localhost:5173"
}));
const signInSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(8)
});
const signUpSchema = zod_1.default.object({
    name: zod_1.default.string().optional(),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(8)
});
const postAProblemSchema = zod_1.default.object({
    slug: zod_1.default.string(),
    title: zod_1.default.string(),
    description: zod_1.default.string(),
    difficulty: zod_1.default.string(),
    status: zod_1.default.string().optional(),
    defaultCode: zod_1.default.string().optional(),
    testCases: zod_1.default.array(zod_1.default.object({
        input: zod_1.default.string(),
        output: zod_1.default.string()
    })),
    examples: zod_1.default.array(zod_1.default.object({
        input: zod_1.default.string(),
        output: zod_1.default.string()
    })).optional()
});
const putAProblemSchema = zod_1.default.object({
    slug: zod_1.default.string().optional(),
    title: zod_1.default.string().optional(),
    description: zod_1.default.string().optional(),
    difficulty: zod_1.default.string().optional(),
    status: zod_1.default.string().optional()
});
exports.adminAuthRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const success = signInSchema.safeParse(req.body);
    if (!success) {
        return res.status(422).json({
            message: "Invalid inputs"
        });
    }
    const email = req.body.email;
    const user = yield prisma.user.findUnique({
        where: {
            email: email,
            role: "ADMIN"
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
exports.adminAuthRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const success = signUpSchema.safeParse(req.body);
    if (!success) {
        return res.status(422).json({
            message: "Invalid inputs"
        });
    }
    const password = yield bcrypt_1.default.hash(req.body.password, 10);
    const user = yield prisma.user.create({
        data: {
            name: ((_a = req.body) === null || _a === void 0 ? void 0 : _a.name) || "",
            email: req.body.email,
            password: password,
            role: "ADMIN"
        }
    });
    res.json({
        message: "user created successfully",
        id: user.id
    });
}));
exports.adminAuthRouter.post("/logout", (req, res) => {
    res.cookie("token", "");
    res.json({
        message: "Logged out"
    });
});
exports.adminAuthRouter.get("/problems", adminMiddleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const problems = yield prisma.problem.findMany();
    console.log(problems);
    res.json({
        problems
    });
}));
exports.adminAuthRouter.get("/problem/:id", adminMiddleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const problem = yield prisma.problem.findFirst({
        where: {
            id: (_b = req.params) === null || _b === void 0 ? void 0 : _b.id
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
exports.adminAuthRouter.post("/problem", adminMiddleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const success = postAProblemSchema.safeParse(req.body);
    if (!success) {
        return res.status(422).json({
            message: "Invalid inputs"
        });
    }
    // improve room logic
    // test end points
    // buy ec2 instance, run judge0, and test web sockets , signup, signin there, also problem uploadj
    // Connect backend and frontend, remove hard coded test data from frontend
    // Doneeeeee.
    const problem = yield prisma.problem.create({
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
    const parsedTestCases = JSON.parse((_c = req.body) === null || _c === void 0 ? void 0 : _c.testCases);
    const testCases = parsedTestCases.map((testCase) => ({
        input: testCase.input,
        output: testCase.output
    }));
    console.log(testCases);
    console.log('parsedTestCases', parsedTestCases);
    const inputs = testCases === null || testCases === void 0 ? void 0 : testCases.map((testCase) => testCase.input);
    const outputs = testCases === null || testCases === void 0 ? void 0 : testCases.map((testCase) => testCase.output);
    yield promises_1.default.mkdir(`./src/problems/${problem.slug}/inputs`, {
        recursive: true
    });
    yield promises_1.default.mkdir(`./src/problems/${problem.slug}/outputs`, {
        recursive: true
    });
    ;
    inputs === null || inputs === void 0 ? void 0 : inputs.forEach((input, index) => __awaiter(void 0, void 0, void 0, function* () {
        const inputFilePath = `./src/problems/${problem.slug}/inputs/${index}.txt`;
        yield promises_1.default.writeFile(inputFilePath, input);
    }));
    outputs === null || outputs === void 0 ? void 0 : outputs.forEach((output, index) => __awaiter(void 0, void 0, void 0, function* () {
        const outputFilePath = `./src/problems/${problem.slug}/outputs/${index}.txt`;
        yield promises_1.default.writeFile(outputFilePath, output);
    }));
    //push to github using octokit/ simple-git
    // add the whole process to a transaction
    res.json({
        problem
    });
}));
exports.adminAuthRouter.put("/problem/:id", adminMiddleware_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f, _g, _h, _j;
    const success = putAProblemSchema.safeParse(req.body);
    if (!success) {
        return res.status(422).json({
            message: "Invalid inputs"
        });
    }
    yield prisma.problem.update({
        where: {
            id: req.params.id
        },
        data: {
            slug: (_d = req.body) === null || _d === void 0 ? void 0 : _d.slug,
            title: (_e = req.body) === null || _e === void 0 ? void 0 : _e.title,
            description: (_f = req.body) === null || _f === void 0 ? void 0 : _f.description,
            difficulty: (_g = req.body) === null || _g === void 0 ? void 0 : _g.difficulty,
            status: (_h = req.body) === null || _h === void 0 ? void 0 : _h.status,
            defaultCode: (_j = req.body) === null || _j === void 0 ? void 0 : _j.defaultCode
        }
    });
    return res.json({
        message: "Problem updated successfully"
    });
}));
