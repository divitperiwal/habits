import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/logout", AuthMiddleware, AuthController.logout);

export default router;
