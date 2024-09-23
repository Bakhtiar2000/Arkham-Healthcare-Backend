import { PaymentStatus, UserRole } from "@prisma/client";
import { TAuthUser } from "../../interfaces/authUser.type";
import prisma from "../../shared/prisma";

const fetchDashboardMetaDataFromDB = async (user: TAuthUser) => {
  let metaData;
  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      metaData = getSuperAdminMetaData();
      break;
    case UserRole.ADMIN:
      metaData = getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      metaData = getDoctorMetaData(user as TAuthUser);
      break;
    case UserRole.PATIENT:
      metaData = getPatientMetaData(user as TAuthUser);
      break;

    default:
      throw new Error("Invalid User Role");
  }

  return metaData;
};

// ____________SUPER_ADMIN____________
const getSuperAdminMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const adminCount = await prisma.admin.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenueCount = (
    await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: PaymentStatus.PAID,
      },
    })
  )._sum.amount;
  // Original data: totalRevenueCount: { _sum : { amount : 500 } } }
  // Formatted data: totalRevenueCount : 500

  return {
    appointmentCount,
    patientCount,
    doctorCount,
    adminCount,
    paymentCount,
    totalRevenueCount,
  };
};

// ____________ADMIN____________
const getAdminMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenueCount = (
    await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: PaymentStatus.PAID,
      },
    })
  )._sum.amount;
  // Original data: totalRevenueCount: { _sum : { amount : 500 } } }
  // Formatted data: totalRevenueCount : 500

  return {
    appointmentCount,
    patientCount,
    doctorCount,
    paymentCount,
    totalRevenueCount,
  };
};

// ____________DOCTOR____________
const getDoctorMetaData = async (user: TAuthUser) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctorData.id,
    },
  });
  const patientCount = (
    await prisma.appointment.groupBy({
      by: ["patientId"],
      _count: {
        id: true,
      },
    })
  ).length;

  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  const totalRevenueCount = (
    await prisma.payment.aggregate({
      where: {
        appointment: {
          doctorId: doctorData.id,
          paymentStatus: PaymentStatus.PAID,
        },
      },
      _sum: {
        amount: true,
      },
    })
  )._sum.amount;

  const statusBasedAppointmentCount = (
    await prisma.appointment.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
      where: {
        doctorId: doctorData.id,
      },
    })
  ) // Original data:
    //[{ count: {id: 5}, status: "COMPLETED" },{ count: {id: 3}, status: "SCHEDULED" }]
    .map(({ status, _count }) => ({
      status: status,
      count: Number(_count.id),
    })); // Formatted data:
  //[{ status: "COMPLETED", count: 5 }, { status: "SCHEDULED", count: 3 }]

  return {
    appointmentCount,
    patientCount,
    reviewCount,
    totalRevenueCount,
    statusBasedAppointmentCount,
  };
};

// ____________PATIENT____________
const getPatientMetaData = async (user: TAuthUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      patientId: patientData.id,
    },
  });
  const prescriptionCount = await prisma.prescription.count({
    where: {
      patientId: patientData.id,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      patientId: patientData.id,
    },
  });

  const totalDoctorFeeSpentCount = (
    await prisma.payment.aggregate({
      where: {
        appointment: {
          patientId: patientData.id,
          paymentStatus: PaymentStatus.PAID,
        },
      },
      _sum: {
        amount: true,
      },
    })
  )._sum.amount;

  const statusBasedAppointmentCount = (
    await prisma.appointment.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
      where: {
        patientId: patientData.id,
      },
    })
  ).map(({ status, _count }) => ({
    status: status,
    count: Number(_count.id),
  }));

  return {
    appointmentCount,
    prescriptionCount,
    reviewCount,
    totalDoctorFeeSpentCount,
    statusBasedAppointmentCount,
  };
};

export const metaServices = {
  fetchDashboardMetaDataFromDB,
};
