import { TAuthUser } from "../../interfaces/authUser.type";
import prisma from "../../shared/prisma";

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

export const doctorScheduleServices = {
  createDoctorScheduleIntoDB,
};
