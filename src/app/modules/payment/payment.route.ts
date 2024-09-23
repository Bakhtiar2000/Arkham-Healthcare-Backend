import express from "express";
import { paymentControllers } from "./payment.controller";

const router = express.Router();

router.get("/ipn", paymentControllers.validatePayment);
router.post("/init-payment/:appointmentId", paymentControllers.initPayment);

export const paymentRoutes = router;
