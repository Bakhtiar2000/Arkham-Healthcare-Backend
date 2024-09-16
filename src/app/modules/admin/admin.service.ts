import { Prisma, PrismaClient } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";
const prisma = new PrismaClient();

const getAllAdminsFromDB = async (params: any, options: any) => {
  // All Individual conditions are to be in AND connection before query
  const andConditions: Prisma.AdminWhereInput[] = [];

  // Dividing params into two parts - searchTerm for applying partial match, filteredData for applying exact match
  const { searchTerm, ...filteredData } = params;
  const { limit, page } = options;
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
    skip: Number((page - 1) * limit),
    take: Number(limit),
  });
  return result;
};

export const adminServices = {
  getAllAdminsFromDB,
};
