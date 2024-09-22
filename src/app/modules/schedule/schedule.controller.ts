import { RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { scheduleServices } from "./schedule.service";

const createSchedule: RequestHandler = catchAsync(async (req, res) => {
  const result = await scheduleServices.createScheduleIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

export const scheduleControllers = {
  createSchedule,
};
