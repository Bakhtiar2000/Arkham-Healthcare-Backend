import { Request, RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { metaServices } from "./meta.service";
import { TAuthUser } from "../../interfaces/authUser.type";

const fetchDashboardMetaData: RequestHandler = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const result = await metaServices.fetchDashboardMetaDataFromDB(
      req.user as TAuthUser
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Meta data fetched successfully",
      data: result,
    });
  }
);

export const metaControllers = {
  fetchDashboardMetaData,
};
