import express from "express";
import { doctorScheduleControllers } from "./doctorSchedule.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middleWears/auth";

const router = express.Router();

router.get(
  "/my-schedule",
  auth(UserRole.DOCTOR),
  doctorScheduleControllers.getMySchedule
);

router.post(
  "/",
  auth(UserRole.DOCTOR),
  doctorScheduleControllers.createDoctorSchedule
);

router.delete(
  "/:id",
  auth(UserRole.DOCTOR),
  doctorScheduleControllers.deleteMySchedule
);

export const doctorScheduleRoutes = router;
