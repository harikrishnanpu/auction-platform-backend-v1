/// <reference types="node" />
import {
    AuthProvider,
    PrismaClient,
    UserRoleType,
    UserStatus,
} from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    const email = process.env.ADMIN_EMAIL ?? 'admin@hm.com';
    const password = process.env.ADMIN_PASSWORD ?? 'admin123';
    const name = process.env.ADMIN_NAME ?? 'Admin';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`Admin already exists (${email}), skipping`);
        return;
    }

    const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
    });

    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            authProvider: AuthProvider.LOCAL,
            isVerified: true,
            status: UserStatus.ACTIVE,
            roles: {
                create: [
                    { role: UserRoleType.ADMIN },
                    { role: UserRoleType.USER },
                ],
            },
        },
    });

    console.log(`Admin created: ${email}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
