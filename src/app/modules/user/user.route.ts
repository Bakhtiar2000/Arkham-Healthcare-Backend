import { userControllers } from "./user.controller";
import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middleWears/auth";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  userControllers.createAdmin
);

export const userRoutes = router;
