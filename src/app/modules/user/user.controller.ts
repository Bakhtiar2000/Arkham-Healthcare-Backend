import { Request, RequestHandler, Response } from "express";
import { userServices } from "./user.service";
import { IFile } from "../../interfaces/file.type";
import catchAsync from "../../utils/catchAsync";
import pick from "../../shared/pick";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { userFilterableFields } from "./user.constant";
import { IAuthUser } from "../../interfaces/authUser.type";

const createAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await userServices.createAdminIntoDB(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  }
);

const createDoctor: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await userServices.createDoctorIntoDB(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor created successfully",
      data: result,
    });
  }
);

const createPatient: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await userServices.createPatientIntoDB(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Patient created successfully",
      data: result,
    });
  }
);

const getAllUsers: RequestHandler = catchAsync(async (req, res) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await userServices.getAllUsersFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users are fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const changeProfileStatus: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await userServices.changeProfileStatusIntoDB(id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Users profile status changed!",
      data: result,
    });
  }
);
const getMyProfile: RequestHandler = catchAsync(
  async (req: Request & { user?: IAuthUser }, res) => {
    const result = await userServices.getMyProfileFromDB(req.user as IAuthUser);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile data retrieved successfully!",
      data: result,
    });
  }
);

const updateMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await userServices.updateMyProfileIntoDB(
      req.user as IAuthUser,
      req
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile updated successfully!",
      data: result,
    });
  }
);

export const userControllers = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllUsers,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
};
