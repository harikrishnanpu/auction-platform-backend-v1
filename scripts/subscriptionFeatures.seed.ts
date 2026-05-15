import {
    PrismaClient,
    SubscriptionPlanFeatureEnum,
    SubscriptionPlanFeatureType,
} from '@prisma/client';

const prisma = new PrismaClient();

const FEATURE_ROWS: {
    feature: SubscriptionPlanFeatureEnum;
    description: string;
    type: SubscriptionPlanFeatureType;
}[] = [
    {
        feature: SubscriptionPlanFeatureEnum.AUCTION_CREATION,
        description:
            'Maximum concurrent / lifetime auction creations (numeric cap)',
        type: SubscriptionPlanFeatureType.NUMBER,
    },
    {
        feature: SubscriptionPlanFeatureEnum.AUCTION_BIDDING,
        description: 'Maximum bids per auction for this plan (numeric cap)',
        type: SubscriptionPlanFeatureType.NUMBER,
    },
    {
        feature: SubscriptionPlanFeatureEnum.AI_AGENT,
        description: 'AI assistant access (1 = enabled, 0 = disabled)',
        type: SubscriptionPlanFeatureType.NUMBER,
    },
];

export async function seedSubscriptionFeatures(
    client: PrismaClient = prisma,
): Promise<void> {
    for (const row of FEATURE_ROWS) {
        await client.features.upsert({
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
}

async function main() {
    try {
        await seedSubscriptionFeatures();
    } catch (e) {
        console.log(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
