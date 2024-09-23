import express from "express";
import { appointmentControllers } from "./appointment.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../utils/validateRequest";
import { appointmentValidations } from "./appointment.validation";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  appointmentControllers.getAllAppointments
);

router.get(
  "/my-appointments",
  auth(UserRole.PATIENT, UserRole.DOCTOR),
  appointmentControllers.getMyAppointments
);

router.post(
  "/",
  auth(UserRole.PATIENT),
  validateRequest(appointmentValidations.createAppointmentValidationSchema),
  appointmentControllers.createAppointment
);

router.patch(
  "/status/:id",
  auth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  appointmentControllers.changeAppointmentStatus
);

export const appointmentRoutes = router;
