import { userControllers } from "./user.controller";
import express, { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middleWears/auth";
import { fileUploader } from "../../utils/fileUploader";
import { userValidations } from "./user.validation";

const router = express.Router();

router.get("/", userControllers.getAllUsers);

router.post(
  "/create-admin",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidations.createAdminValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return userControllers.createAdmin(req, res, next);
  }
);

router.post(
  "/create-doctor",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidations.createDoctorValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return userControllers.createDoctor(req, res, next);
  }
);

router.post(
  "/create-patient",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = userValidations.createPatientValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return userControllers.createPatient(req, res, next);
  }
);

export const userRoutes = router;
