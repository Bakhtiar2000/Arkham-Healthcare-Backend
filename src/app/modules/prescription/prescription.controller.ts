import { Request, RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { prescriptionServices } from "./prescription.service";
import { TAuthUser } from "../../interfaces/authUser.type";
import pick from "../../shared/pick";

const createPrescription: RequestHandler = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const result = await prescriptionServices.ceratePrescriptionIntoDB(
      req.user as TAuthUser,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Prescription created successfully",
      data: result,
    });
  }
);

const getMyPrescriptions = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const user = req.user;
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await prescriptionServices.getMyPrescriptionsFromDB(
      user as TAuthUser,
      options
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Prescriptions are fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

export const prescriptionControllers = {
  createPrescription,
  getMyPrescriptions,
};
