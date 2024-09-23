import { userControllers } from "./user.controller";
import express, { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../utils/fileUploader";
import { userValidations } from "./user.validation";
import validateRequest from "../../utils/validateRequest";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  userControllers.getAllUsers
);

router.get(
  "/me",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.PATIENT, UserRole.DOCTOR),
  userControllers.getMyProfile
);

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

router.patch(
  "/:id/status",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(userValidations.updateStatusValidationSchema),
  userControllers.changeProfileStatus
);

router.patch(
  "/update-my-profile",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return userControllers.updateMyProfile(req, res, next);
  }
);

export const userRoutes = router;
