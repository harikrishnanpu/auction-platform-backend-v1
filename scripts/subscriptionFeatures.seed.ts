import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

export const seedSubscriptionFeatures = async () => {
    const features = await prisma.subscriptionPlanFeature.findMany();

    if (features.length > 0) {
        return;
    }

    const createdFeatures = await prisma.features.createMany({
        data: [
            {
                id: randomUUID(),
                feature: 'AUCTION_CREATION',
                description: 'Create an auction',
                type: 'NUMBER',
            },
            {
                id: randomUUID(),
                feature: 'AUCTION_BIDDING',
                description: 'Bid on an auction',
                type: 'NUMBER',
            },
        ],
    });

    console.log(createdFeatures);
};

// console.log(await prisma.features.findMany());

seedSubscriptionFeatures();
