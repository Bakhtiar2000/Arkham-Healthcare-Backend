import express from "express";
import { appointmentControllers } from "./appointment.controller";
import auth from "../../middleWears/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/my-appointments",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  appointmentControllers.getMyAppointments
);

router.post(
  "/",
  auth(UserRole.PATIENT),
  appointmentControllers.createAppointment
);

export const appointmentRoutes = router;
