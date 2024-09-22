import { addHours, addMinutes, format } from "date-fns";
import prisma from "../../shared/prisma";
import { Schedule } from "@prisma/client";
import { TSchedule } from "./schedule.interface";

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

      //   const existingSchedule = await prisma.schedule.findFirst({
      //     where: {
      //       startDateTime: scheduleData.startDateTime,
      //       endDateTime: scheduleData.endDateTime,
      //     },
      //   });

      //   if (!existingSchedule) {
      //     const result = await prisma.schedule.create({
      //       data: scheduleData,
      //     });
      //     schedules.push(result);
      //   }

      console.log(scheduleData);

      // INCREMENTING minutes of a day by 30  minutes
      startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime); // setMinutes, getMinutes are properties of Date
    }

    // INCREMENTING startDate
    formattedStartDate.setDate(formattedStartDate.getDate() + 1);
  }

  //   return schedules;
};

export const scheduleServices = {
  createScheduleIntoDB,
};
