import express from "express";
import { scheduleControllers } from "./schedule.controller";

const router = express.Router();

router.post("/", scheduleControllers.createSchedule);

export const scheduleRoutes = router;
