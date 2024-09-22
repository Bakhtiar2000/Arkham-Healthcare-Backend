import express from "express";
import { doctorScheduleControllers } from "./doctorSchedule.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middleWears/auth";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.DOCTOR),
  doctorScheduleControllers.createDoctorSchedule
);

export const doctorScheduleRoutes = router;
