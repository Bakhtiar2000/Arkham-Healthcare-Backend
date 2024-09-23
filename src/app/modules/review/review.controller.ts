import { Request, Response } from "express";
import httpStatus from "http-status";
import { reviewServices } from "./review.service";
import { TAuthUser } from "../../interfaces/authUser.type";
import pick from "../../shared/pick";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";

const createReview = catchAsync(
  async (req: Request & { user?: TAuthUser }, res: Response) => {
    const user = req.user;
    const result = await reviewServices.createReviewIntoDB(
      user as TAuthUser,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Review created successfully",
      data: result,
    });
  }
);

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["patientEmail", "doctorEmail"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await reviewServices.getAllReviewsFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews are retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const reviewControllers = {
  createReview,
  getAllReviews,
};
