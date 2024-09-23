import express from "express";
import { scheduleControllers } from "./schedule.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", auth(UserRole.DOCTOR), scheduleControllers.getAllSchedules);

router.post("/", scheduleControllers.createSchedule);

export const scheduleRoutes = router;
