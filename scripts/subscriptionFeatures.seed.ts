/// <reference types="node" />
import {
    PrismaClient,
    SubscriptionPlanFeatureEnum,
    SubscriptionPlanFeatureType,
} from '@prisma/client';

const prisma = new PrismaClient();

const featureRows: {
    feature: SubscriptionPlanFeatureEnum;
    description: string;
    type: SubscriptionPlanFeatureType;
}[] = [
    {
        feature: SubscriptionPlanFeatureEnum.AUCTION_CREATION,
        description: 'Maximum auction creations',
        type: SubscriptionPlanFeatureType.NUMBER,
    },
    {
        feature: SubscriptionPlanFeatureEnum.AUCTION_BIDDING,
        description: 'Maximum bids per auction for this plan',
        type: SubscriptionPlanFeatureType.NUMBER,
    },
    {
        feature: SubscriptionPlanFeatureEnum.AI_AGENT,
        description: 'AI assistant access',
        type: SubscriptionPlanFeatureType.NUMBER,
    },
];

async function seed(): Promise<void> {
    for (const row of featureRows) {
        await prisma.features.upsert({
            where: { feature: row.feature },
            create: {
                feature: row.feature,
                description: row.description,
                type: row.type,
            },
            update: {
                description: row.description,
                type: row.type,
            },
        });
    }
    console.log(`Seeded ${featureRows.length} subscription feature rows`);
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
