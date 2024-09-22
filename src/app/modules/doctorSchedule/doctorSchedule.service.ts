import { Prisma } from "@prisma/client";
import { TAuthUser } from "../../interfaces/authUser.type";
import prisma from "../../shared/prisma";
import { TPaginationOptions } from "../../interfaces/pagination.type";
import calculatePagination from "../../utils/calculatePagination";

const createDoctorScheduleIntoDB = async (
  user: TAuthUser,
  payload: { scheduleIds: string[] }
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const doctorSCheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  const result = await prisma.doctorSchedules.createMany({
    data: doctorSCheduleData,
  });
  return result;
};

const getMyScheduleFromDB = async (
  filters: any,
  options: TPaginationOptions,
  user: TAuthUser
) => {
  const { limit, page, skip } = calculatePagination(options);
  const { start, end, ...filterData } = filters;
  console.log(filters);

  const andConditions = [];

  // Filtering schedule from given start time to end time. We move from doctorSchedule to schedule database to find startDateTime and end1DateTime
  if (start && end) {
    andConditions.push({
      AND: [
        {
          schedule: {
            startDateTime: {
              gte: start,
            },
          },
        },
        {
          schedule: {
            endDateTime: {
              lte: end,
            },
          },
        },
      ],
    });
  }

  // isBooked is received as string by default. So we check it and convert it to boolean
  if (Object.keys(filterData).length > 0) {
    if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "true"
    ) {
      filterData.isBooked = true;
    } else if (
      typeof filterData.isBooked === "string" &&
      filterData.isBooked === "false"
    ) {
      filterData.isBooked = false;
    }

    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }

  andConditions.push({
    doctor: {
      email: user?.email,
    },
  });

  const whereConditions: Prisma.DoctorSchedulesWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctorSchedules.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { isBooked: "desc" },
  });
  const total = await prisma.doctorSchedules.count({
    where: whereConditions,
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

const deleteMyScheduleFromDB = async (user: TAuthUser, id: string) => {};

export const doctorScheduleServices = {
  createDoctorScheduleIntoDB,
  getMyScheduleFromDB,
  deleteMyScheduleFromDB,
};
