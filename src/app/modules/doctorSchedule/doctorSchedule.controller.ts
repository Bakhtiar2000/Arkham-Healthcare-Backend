import { Request, RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { doctorScheduleServices } from "./doctorSchedule.service";

const createDoctorSchedule: RequestHandler = catchAsync(
  async (req: Request & { user?: any }, res) => {
    const result = await doctorScheduleServices.createDoctorScheduleIntoDB(
      req.user,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor Schedule created successfully",
      data: result,
    });
  }
);

export const doctorScheduleControllers = {
  createDoctorSchedule,
};
