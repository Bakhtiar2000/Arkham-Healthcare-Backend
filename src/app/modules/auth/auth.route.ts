import express from "express";
import { authControllers } from "./auth.controller";
import auth from "../../middleWears/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/login", authControllers.loginUser);

router.post("/refresh-token", authControllers.refreshToken);

router.post(
  "/change-password",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  authControllers.changePassword
);

router.post("/forgot-password", authControllers.forgotPassword);

export const authRoutes = router;
