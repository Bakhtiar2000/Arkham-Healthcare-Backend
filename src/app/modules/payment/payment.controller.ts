import { RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { paymentServices } from "./payment.service";

const initPayment: RequestHandler = catchAsync(async (req, res) => {
  const result = await paymentServices.initPayment(req.params.appointmentId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "payment Initiated successfully",
    data: result,
  });
});

export const paymentControllers = {
  initPayment,
};
