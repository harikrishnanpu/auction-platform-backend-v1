import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function main() {
  prisma.$connect().then(async () => {
    const admin = await prisma.user.create({
      data: {
        id: '1',
        authProvider: 'LOCAL',
        isVerified: true,
        status: 'ACTIVE',
        name: 'Admin',
        email: 'admin@hm.com',
        password: 'admin123',
        roles: {
          create: ['ADMIN', 'USER'].map((role) => ({ role })),
        },
      },
    });
    console.log('admin created', admin);
  });
}

main();
