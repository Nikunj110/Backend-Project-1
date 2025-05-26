import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credential:true
}));

app.use(express.json({limit:"16kb"}));
// aa form aavse tyare handle karse
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}));
// aa url mathi data aavse tyare handle karse
app.use(express.static("public"));
// another one configuration is static pdf image store karava mate public banavse 


// cookie parser used for server->browser ni cookie access karva mate and for set 
app.use(cookieParser());


export {app}