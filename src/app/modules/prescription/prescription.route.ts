import express from "express";
import { prescriptionControllers } from "./prescription.controller";
import auth from "../../middleWears/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/my-prescription",
  auth(UserRole.PATIENT),
  prescriptionControllers.getMyPrescriptions
);

router.post(
  "/",
  auth(UserRole.DOCTOR),
  prescriptionControllers.createPrescription
);

export const prescriptionRoutes = router;
