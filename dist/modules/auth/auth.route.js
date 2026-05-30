import { Router } from "express";
import { authController } from "./auth.controller";
const router = Router();
router.post("/signup", authController.registration);
router.post("/login", authController.login);
export const authRoute = router;
//# sourceMappingURL=auth.route.js.map