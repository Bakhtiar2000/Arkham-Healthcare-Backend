import express from "express";
import { doctorControllers } from "./doctor.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middleWears/auth";
import validateRequest from "../../utils/validateRequest";
import { doctorValidations } from "./doctor.validation";

const router = express.Router();

// task 3
router.get("/", doctorControllers.getAllDoctors);

//task 4
router.get("/:id", doctorControllers.getDoctorById);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR),
  validateRequest(doctorValidations.updateDoctorValidationSchema),
  doctorControllers.updateDoctor
);

//task 5
router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  doctorControllers.deleteDoctor
);

// task 6
router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  doctorControllers.softDeleteDoctor
);

export const doctorRoutes = router;
