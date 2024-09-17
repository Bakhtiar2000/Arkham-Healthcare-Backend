import { Admin, Prisma, UserStatus } from "@prisma/client";
import { adminSearchableFields } from "./admin.constant";
import calculatePagination from "../../utils/calculatePagination";
import prisma from "../../shared/prisma";
import { TAdminFilterRequest } from "./admin.interface";
import { TPaginationOptions } from "../../interfaces/pagination";

const getAllAdminsFromDB = async (
  params: TAdminFilterRequest,
  options: TPaginationOptions
) => {
  // All Individual conditions are to be in AND connection before query
  const andConditions: Prisma.AdminWhereInput[] = [];

  // Dividing params into two parts - searchTerm for applying partial match, filteredData for applying exact match
  const { searchTerm, ...filteredData } = params;
  const { page, limit, skip } = calculatePagination(options);

  //   OR: [
  //     {
  //       name: {
  //         contains: params.searchTerm,
  //         mode: "insensitive",
  //       },
  //     },
  //     {
  //       email: {
  //         contains: params.searchTerm,
  //         mode: "insensitive",
  //       },
  //     },
  //   ],

  // For searchTerm query
  if (params.searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive", // implies case insensitivity
        },
      })),
    });
  }

  // For filteredData query
  if (Object.keys(filteredData).length > 0) {
    andConditions.push({
      AND: Object.keys(filteredData).map((key) => ({
        [key]: {
          equals: (filteredData as any)[key],
        },
      })),
    });
  }

  // If isDeleted: true, do not show data
  andConditions.push({
    isDeleted: false,
  });

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
  const total = await prisma.admin.count({
    where: {
      AND: andConditions,
    },
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleAdminByIdFromDB = async (id: string): Promise<Admin | null> => {
  // Check if user with the given id exist or not
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });
  const result = prisma.admin.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateIntoDB = async (
  id: string,
  data: Partial<Admin>
): Promise<Admin> => {
  // Check if user with the given id exist or not
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.admin.update({
    where: {
      id,
    },
    data,
  });
  return result;
};

const deleteAdminFromDB = async (id: string): Promise<Admin> => {
  // Check if user with the given id exist or not
  // Do not check soft delete ( isDeleted: false ) on this because admin may hard delete data that has been soft deleted
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const adminDeletedData = await transactionClient.admin.delete({
      where: {
        id,
      },
    });

    await transactionClient.user.delete({
      where: {
        email: adminDeletedData.email,
      },
    });

    return adminDeletedData;
  });
  return result;
};

const softDeleteAdminFromDB = async (id: string): Promise<Admin> => {
  // Check if user with the given id exist or not
  await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const adminDeletedData = await transactionClient.admin.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: adminDeletedData.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return adminDeletedData;
  });
  return result;
};

export const adminServices = {
  getAllAdminsFromDB,
  getSingleAdminByIdFromDB,
  updateIntoDB,
  deleteAdminFromDB,
  softDeleteAdminFromDB,
};
