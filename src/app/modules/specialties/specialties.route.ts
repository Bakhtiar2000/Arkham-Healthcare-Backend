import express, { NextFunction, Request, Response } from "express";
import { specialtiesControllers } from "./specialties.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../utils/fileUploader";
import { SpecialtiesValidations } from "./specialties.validation";

const router = express.Router();

router.get("/", specialtiesControllers.getAllSpecialties);

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialtiesValidations.createSpecialtiesValidationSchema.parse(
      JSON.parse(req.body.data)
    );
    return specialtiesControllers.createSpecialties(req, res, next);
  }
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  specialtiesControllers.deleteSpecialty
);

export const specialtiesRoutes = router;
