import { Request, RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { scheduleServices } from "./schedule.service";
import pick from "../../shared/pick";
import { TAuthUser } from "../../interfaces/authUser.type";

const createSchedule: RequestHandler = catchAsync(async (req, res) => {
  const result = await scheduleServices.createScheduleIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

const getAllSchedules = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const filters = pick(req.query, ["start", "end"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await scheduleServices.getAllSchedulesFromDB(
      filters,
      options,
      req.user as TAuthUser
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Schedules are fetched successfully",
      data: result,
    });
  }
);

export const scheduleControllers = {
  createSchedule,
  getAllSchedules,
};
