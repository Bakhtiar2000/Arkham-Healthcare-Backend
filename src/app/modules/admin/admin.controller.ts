import { Request, Response } from "express";
import { adminServices } from "./admin.service";
import pick from "../../shared/pick";
import { adminFIlterableFields } from "./admin.constant";

const getAllAdmins = async (req: Request, res: Response) => {
  try {
    // Searches on only adminFIlterableFields and ignores other query fields
    const filters = pick(req.query, adminFIlterableFields);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = await adminServices.getAllAdminsFromDB(filters, options);
    res.status(200).json({
      success: true,
      message: "Admin data fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong!",
      error: err,
    });
  }
};

export const adminControllers = {
  getAllAdmins,
};
