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
const prisma = new client_1.PrismaClient();
exports.userAuthRouter.use((0, cookie_parser_1.default)());
exports.userAuthRouter.use(express_1.default.json());
exports.userAuthRouter.use((0, cors_1.default)({
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
exports.userAuthRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.userAuthRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.userAuthRouter.post("/problem/:id/submit", userMiddleware_1.userMiddleware, (req, res) => {
    // Implement problem submission, test case execution on EC2, using Redis queue and Judge0
});
exports.userAuthRouter.get("/problems", userMiddleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const problems = yield prisma.problem.findMany();
    res.json({
        problems
    });
}));