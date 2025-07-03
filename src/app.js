import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true 
}));

app.use(express.json({ limit: "16kb" }));
// aa form aavse tyare handle karse
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));
// aa url mathi data aavse tyare handle karse
app.use(express.static("public"));
// another one configuration is static pdf image store karava mate public banavse 


// cookie parser used for server->browser ni cookie access karva mate and for set 
app.use(cookieParser());

// routes import

import userRouter from "./routes/user.routes.js"
// routes declaration
// app.use("/users",userRouter); 
// here we are making url like http://localhost:8000/users/login
// login user.routes file mathi add thase
// but we use api so we make a 
app.use("/api/v1/users",userRouter);
// here we are making url like http://localhost:8000/api/v1/users/login
// /api/v1/users aana par javathi userRouter activate thase means the file ma jsu






export { app }