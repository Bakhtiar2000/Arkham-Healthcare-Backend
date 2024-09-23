import axios from "axios";
import prisma from "../../shared/prisma";
import { sslServices } from "../ssl/ssl.service";
import config from "../../config";
import { PaymentStatus } from "@prisma/client";

const initPayment = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirstOrThrow({
    where: {
      appointmentId,
    },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });

  const initPaymentData = {
    amount: paymentData?.amount,
    transactionId: paymentData?.transactionId,
    name: paymentData?.appointment.patient.name,
    email: paymentData?.appointment.patient.email,
    address: paymentData?.appointment.patient.address,
    phoneNumber: paymentData?.appointment.patient.contactNumber,
  };

  const result = await sslServices.initPayment(initPaymentData);
  return {
    paymentUrl: result.GatewayPageURL,
  };
};

//------------------------- EXAMPLE QUERY OF SLL-COMMERZ IPN LISTENER-------------------------
// amount=1150.00&bank_tran_id=151114130739MqCBNx5&card_brand=VISA&card_issuer=BRAC+BANK%2C+LTD.&card_issuer_country=Bangladesh&card_issuer_country_code=BD&card_no=432149XXXXXX0667&card_type=VISA-Brac+bank¤cy=BDT&status=VALID&store_amount=1104.00&store_id=progr66f0526ee0d22&tran_date=2015-11-14+13%3A07%3A12&tran_id=5646dd9d4b484&val_id=151114130742Bj94IBUk4uE5GRj&verify_sign=f3cf7eda2aab7828293fa65ac718820c&verify_key=amount%2Cbank_tran_id%2Ccard_brand%2Ccard_issuer%2Ccard_issuer_country%2Ccard_issuer_country_code%2Ccard_no%2Ccard_type%2Ccurrency%2Cstatus%2Cstore_amount%2Cstore_id%2Ctran_date%2Ctran_id%2Cval_id

const validatePayment = async (query: any) => {
  // IMPORTANT: LINE NO. 42 - 53 CANNOT BE APPLICABLE IN LOCALHOST. IT WILL WORK ON ONLY A VALID PRODUCTION SITE.

  // if (!query || !query.status || query.status !== "VALID") {
  //   return {
  //     message: "Invalid Payment",
  //   };
  // }

  // const response = await sslServices.validatePayment(query);
  // if (response?.status !== "VALID") {
  //   return {
  //     message: "Invalid Payment",
  //   };
  // }

  const response = query; // THIS LINE IS TO BE COMMENTED ON PRODUCTION SITE

  await prisma.$transaction(async (tx) => {
    //------------------ Transaction-1: Update Payment status to paid ------------------
    const updatedPaymentData = await tx.payment.update({
      where: {
        transactionId: response.tran_id,
      },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: response,
      },
    });

    //------------------ Transaction-2: Update Appointment paymentStatus to paid ------------------
    await tx.appointment.update({
      where: {
        id: updatedPaymentData.appointmentId,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });
  });

  return {
    message: "Payment successful!",
  };
};

export const paymentServices = {
  initPayment,
  validatePayment,
};
