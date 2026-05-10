import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { Router } from "express";
import { TrackingController } from "./tracking.controller";

const router = Router({ mergeParams: true });

router.use(AuthMiddleware)

router.post('/track', TrackingController.trackHabit);
router.get('/history', TrackingController.getHistory);

export default router;