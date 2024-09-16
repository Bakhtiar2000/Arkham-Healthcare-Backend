import { NextFunction, Request, RequestHandler, Response } from "express";
import { adminServices } from "./admin.service";
import pick from "../../shared/pick";
import { adminFIlterableFields } from "./admin.constant";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";

const getAllAdmins: RequestHandler = catchAsync(async (req, res) => {
  // Searches on only adminFIlterableFields and ignores other query fields
  const filters = pick(req.query, adminFIlterableFields);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await adminServices.getAllAdminsFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admins are fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleAdminById: RequestHandler = catchAsync(async (req, res) => {
  const result = await adminServices.getSingleAdminByIdFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin is fetched successfully",
    data: result,
  });
});

const updateAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await adminServices.updateIntoDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admins data updated successfully",
    data: result,
  });
});

const deleteAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await adminServices.deleteAdminFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

const softDeleteAdmin: RequestHandler = catchAsync(async (req, res) => {
  const result = await adminServices.softDeleteAdminFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

export const adminControllers = {
  getAllAdmins,
  getSingleAdminById,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
};
