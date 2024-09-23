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
const validatePayment: RequestHandler = catchAsync(async (req, res) => {
  const result = await paymentServices.validatePayment(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "payment Validated successfully",
    data: result,
  });
});

export const paymentControllers = {
  initPayment,
  validatePayment,
};
