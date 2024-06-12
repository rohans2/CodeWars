import express from "express";
import { userAuthRouter } from "./routes/userAuthRouter"
import { adminAuthRouter } from "./routes/adminAuthRouter";

const app = express();

app.use('/api/v1/user', userAuthRouter);
app.use('/api/v1/admin', adminAuthRouter);

//Web Socket implementation for rooms and competition