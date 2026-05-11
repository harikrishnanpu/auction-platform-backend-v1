import { PrismaClient, SystemConfigValueType } from '@prisma/client';

const prisma = new PrismaClient();

const systemConfigs = [
    {
        key: 'FRAUD_SUSPENSION_THRESHOLD',
        value: '10',
        description: 'The threshold for fraud suspension',
        type: SystemConfigValueType.NUMBER,
    },
    {
        key: 'FRAUD_TEMPORARY_SUSPENSION_DURATION_MS',
        value: '10000',
        description: 'The duration for fraud temporary suspension',
        type: SystemConfigValueType.NUMBER,
    },
];

const seed = async () => {
    const result = await prisma.systemDbConfig.createMany({
        data: systemConfigs,
    });

    console.log(result);
};

seed();
