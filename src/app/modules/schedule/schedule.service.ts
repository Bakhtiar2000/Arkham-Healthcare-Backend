import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../shared/prisma";
import { Prisma, Schedule } from "@prisma/client";
import { TFilterRequest, TSchedule } from "./schedule.interface";
import { TPaginationOptions } from "../../interfaces/pagination.type";
import calculatePagination from "../../utils/calculatePagination";
import { TAuthUser } from "../../interfaces/authUser.type";

const createScheduleIntoDB = async (
  payload: TSchedule
): Promise<Schedule[]> => {
  const { startDate, endDate, startTime, endTime } = payload;
  const intervalTime = 30;
  const schedules = [];

  const formattedStartDate = new Date(startDate);
  const formattedEndDate = new Date(endDate);

  while (formattedStartDate <= formattedEndDate) {
    // start date-time of startDate
    const startDateTime = new Date(
      addMinutes(
        addHours(
          format(formattedStartDate, "yyyy-MM-dd"),
          Number(startTime.split(":")[0]) // If startTime = '09.30', after split and first index, its 09 [start hour value in number]
        ),
        Number(startTime.split(":")[1]) // start minute value in number (30)
      )
    );

    // end date-time of startDate
    const endDateTime = new Date(
      addMinutes(
        addHours(
          format(formattedStartDate, "yyyy-MM-dd"),
          Number(endTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );

    while (startDateTime < endDateTime) {
      const scheduleData = {
        startDateTime: startDateTime,
        endDateTime: addMinutes(startDateTime, intervalTime),
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }

      // INCREMENTING minutes of a day by 30  minutes
      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime); // setMinutes, getMinutes are properties of Date
    }

    // INCREMENTING startDate
    formattedStartDate.setDate(formattedStartDate.getDate() + 1);
  }

  return schedules;
};

const getAllSchedulesFromDB = async (
  filters: TFilterRequest,
  options: TPaginationOptions,
  user: TAuthUser
) => {
  const { limit, page, skip } = calculatePagination(options);
  const { start, end, ...filterData } = filters;
  console.log(filters);

  const andConditions = [];

  // Filtering schedule from given start time to end time
  if (start && end) {
    andConditions.push({
      AND: [
        {
          startDateTime: {
            gte: start,
          },
        },
        {
          endDateTime: {
            lte: end,
          },
        },
      ],
    });
  }

  if (Object.keys(filterData).length > 0) {
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

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const doctorSchedules = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user?.email,
      },
    },
  });

  // Result will not contain the schedules that the doctor have previously assigned in. Other schedules will be shown
  const doctorScheduleIds = doctorSchedules.map(
    (schedule) => schedule.scheduleId
  );

  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds, // notIn operator Finds data without the doctorScheduleIds array
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
  });
  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorScheduleIds,
      },
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

export const scheduleServices = {
  createScheduleIntoDB,
  getAllSchedulesFromDB,
};
