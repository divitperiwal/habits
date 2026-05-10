import { Router } from "express"
import { HabitsController } from "./habits.controller";
import { AuthMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.use(AuthMiddleware);

router.post('/', HabitsController.createHabit);

router.get('/', HabitsController.getAllHabits);
router.get('/:id', HabitsController.getHabit);

router.put('/:id', HabitsController.updateHabit);
router.delete('/:id', HabitsController.deleteHabit);





export default router;