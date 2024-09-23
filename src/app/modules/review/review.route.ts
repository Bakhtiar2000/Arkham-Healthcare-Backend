import express from "express";
import { UserRole } from "@prisma/client";
import { reviewValidations } from "./review.validation";
import { reviewControllers } from "./review.controller";
import auth from "../../middlewares/auth";
import validateRequest from "../../utils/validateRequest";

const router = express.Router();

router.get("/", reviewControllers.getAllReviews);

router.post(
  "/",
  auth(UserRole.PATIENT),
  validateRequest(reviewValidations.createReviewValidationSchema),
  reviewControllers.createReview
);

export const reviewRoutes = router;
