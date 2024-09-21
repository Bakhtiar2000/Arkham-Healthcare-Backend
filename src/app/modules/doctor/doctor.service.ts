import { Doctor, Prisma, UserStatus } from "@prisma/client";
import { TDoctorFilterRequest, TDoctorUpdate } from "./doctor.interface";
import { doctorSearchableFields } from "./doctor.constants";
import calculatePagination from "../../utils/calculatePagination";
import prisma from "../../shared/prisma";
import { TPaginationOptions } from "../../interfaces/pagination.type";

const getAllDoctorsFromDB = async (
  filters: TDoctorFilterRequest,
  options: TPaginationOptions
) => {
  const { limit, page, skip } = calculatePagination(options);
  console.log(filters);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // doctor > doctorSpecialties > specialties -> title

  if (specialties && specialties.length > 0) {
    // If single value provided, it will return string, not array. So, we make it string
    const specialtiesArray = Array.isArray(specialties)
      ? specialties
      : [specialties];

    andConditions.push({
      doctorSpecialties: {
        // Suppose doctor nadim is medicine specialist. If we search specialty=cardiology&specialty=medicine, Mr nadim should appear. Because the user want to see doctors who have at least one of the specialties among cardiology and medicine. That's why we use 'some' here. This keyword finds at least one record that matches this condition. If we used 'every' keyword instead of 'some', the response would be of the doctors that have both specialty- medicine and cardiology.
        some: {
          specialties: {
            title: {
              in: specialtiesArray,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  andConditions.push({
    isDeleted: false,
  });

  const result = await prisma.doctor.findMany({
    where: {
      AND: andConditions,
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { averageRating: "desc" },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
      //   review: {
      //     select: {
      //       rating: true,
      //     },
      //   },
    },
  });

  const total = await prisma.doctor.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getDoctorByIdFromDB = async (id: string): Promise<Doctor | null> => {
  const result = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
      //   review: true,
    },
  });
  return result;
};

const updateDoctorIntoDB = async (id: string, payload: TDoctorUpdate) => {
  const { specialties, ...doctorData } = payload;

  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    //--------------- Task-1: Update data ----------------------
    if (doctorData) {
      await transactionClient.doctor.update({
        where: {
          id,
        },
        data: doctorData,
      });
    }

    // Check specialties array
    if (specialties && specialties.length > 0) {
      // delete specialties when isDeleted: true
      const deleteSpecialtiesIds = specialties.filter(
        (specialty) => specialty.isDeleted
      );
      for (const specialty of deleteSpecialtiesIds) {
        //------------------ Task-2: Delete doctorSpecialties (isDeleted: true) -------------------
        await transactionClient.doctorSpecialties.deleteMany({
          // Inside for loop, 'delete' gives error. So, we used 'deleteMany'. However, one data gets deleted in each loop even after using deleteMany.
          where: {
            doctorId: doctorInfo.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }

      // create specialties when isDeleted: false
      const createSpecialtiesIds = specialties.filter(
        (specialty) => !specialty.isDeleted
      );

      for (const specialty of createSpecialtiesIds) {
        //------------------ Task-3: Create doctorSpecialties (isDeleted: false)  -------------------
        await transactionClient.doctorSpecialties.create({
          data: {
            doctorId: doctorInfo.id,
            specialtiesId: specialty.specialtiesId,
          },
        });
      }
    }
  });

  // Formatting response
  const initialResult = await prisma.doctor.findUnique({
    where: {
      id: doctorInfo.id,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialties: true,
        },
      },
    },
  });

  const finalResult = {
    ...initialResult,
    doctorSpecialties: initialResult?.doctorSpecialties?.map(
      (specialty) => specialty.specialties.title
    ),
  };
  return finalResult;
};

const deleteDoctorFromDB = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.delete({
      where: {
        id,
      },
    });

    await transactionClient.user.delete({
      where: {
        email: deleteDoctor.email,
      },
    });

    return deleteDoctor;
  });
};

const softDeleteDoctor = async (id: string): Promise<Doctor> => {
  return await prisma.$transaction(async (transactionClient) => {
    const deleteDoctor = await transactionClient.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await transactionClient.user.update({
      where: {
        email: deleteDoctor.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deleteDoctor;
  });
};

export const DoctorService = {
  updateDoctorIntoDB,
  getAllDoctorsFromDB,
  getDoctorByIdFromDB,
  deleteDoctorFromDB,
  softDeleteDoctor,
};
