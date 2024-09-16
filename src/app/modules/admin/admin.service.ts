import { Prisma } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";
import calculatePagination from "../../utils/calculatePagination";
import prisma from "../../shared/prisma";

const getAllAdminsFromDB = async (params: any, options: any) => {
  // All Individual conditions are to be in AND connection before query
  const andConditions: Prisma.AdminWhereInput[] = [];

  // Dividing params into two parts - searchTerm for applying partial match, filteredData for applying exact match
  const { searchTerm, ...filteredData } = params;
  const { page, limit, skip } = calculatePagination(options);
  //   OR: [
  //     {
  //       name: {
  //         contains: params.searchTerm,
  //         mode: "insensitive", // implies case insensitivity
  //       },
  //     },
  //     {
  //       email: {
  //         contains: params.searchTerm,
  //         mode: "insensitive",
  //       },
  //     },
  //   ],

  if (params.searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filteredData).length > 0) {
    andConditions.push({
      AND: Object.keys(filteredData).map((key) => ({
        [key]: {
          equals: filteredData[key],
        },
      })),
    });
  }

  const result = await prisma.admin.findMany({
    where: {
      AND: andConditions,
    },
    skip: skip,
    take: limit,
    orderBy: options.sortBy
      ? options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            [options.sortBy]: "asc",
          }
      : {
          createdAt: "desc",
        },
  });
  return result;
};

export const adminServices = {
  getAllAdminsFromDB,
};
