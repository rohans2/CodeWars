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
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const prisma = new client_1.PrismaClient();
app.put("/submission", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Received a submission!");
    console.log("req", req.body);
    const submission = req.body;
    yield prisma.testCase.update({
        where: {
            token: submission.token,
        },
        data: {
            status_id: submission.status.id
        }
    });
    res.json(req.body);
}));
app.listen(3000, () => {
    console.log("Example app listening on port 3000!");
});
/*
Received a submission!
req {
  stdout: 'NQo=\n',
  time: '0.022',
  memory: 5036,
  stderr: null,
  token: '26a9537e-723e-4914-a684-10c341642fa3',
  compile_output: null,
  message: null,
  status: { id: 4, description: 'Wrong Answer' }
}
Received a submission!
req {
  stdout: 'NQo=\n',
  time: '0.024',
  memory: 6904,
  stderr: null,
  token: '97d0e026-fa71-4817-adb3-466cc9dd383b',
  compile_output: null,
  message: null,
  status: { id: 3, description: 'Accepted' }
}

*/ 
