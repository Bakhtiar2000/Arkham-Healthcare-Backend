import { UserRole } from "@prisma/client";
import prisma from "../src/app/shared/prisma";

const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });
    if (isSuperAdminExists) {
      console.log("Super Admin Already exists");
      return;
    }

    const superAdminData = await prisma.user.create({
      data: {
        email: "superAdmin@arkham.com",
        password: "superAdmin12345",
        role: UserRole.SUPER_ADMIN,
        admin: {
          create: {
            name: "Super Admin",
            contactNumber: "01888888888",
          },
        },
      },
    });

    console.log("Super Admin crated automatically", superAdminData);
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};

seedSuperAdmin();
