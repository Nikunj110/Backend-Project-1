import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);

// have aagals /register lagse atle registerUser call thase so pachi te file ma jase controller vali

export default router;