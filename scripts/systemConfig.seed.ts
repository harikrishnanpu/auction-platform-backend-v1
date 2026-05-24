/// <reference types="node" />
import { PrismaClient, SystemConfigValueType } from '@prisma/client';

const prisma = new PrismaClient();

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const systemConfigs = [
    {
        key: 'FRAUD_SUSPENSION_THRESHOLD',
        value: '3',
        description:
            'Fraud level and daily report counts at or above this value trigger suspension',
        type: SystemConfigValueType.NUMBER,
    },
    {
        key: 'FRAUD_TEMPORARY_SUSPENSION_DURATION_MS',
        value: String(7 * MS_PER_DAY),
        description: 'Duration of the first fraud suspension',
        type: SystemConfigValueType.NUMBER,
    },
    {
        key: 'AUCTION_MIN_START_PRICE',
        value: '500',
        description: 'Minimum auction start price',
        type: SystemConfigValueType.NUMBER,
    },
    {
        key: 'AUCTION_MAX_MAX_EXTENSION_COUNT',
        value: '10',
        description: 'Maximum allowed maxExtensionCount on auction drafts',
        type: SystemConfigValueType.NUMBER,
    },
    {
        key: 'AUCTION_PAYMENT_DEPOSIT_DUE_MS',
        value: String(MS_PER_DAY),
        description: 'Ms after auction end that deposit payment is due',
        type: SystemConfigValueType.NUMBER,
    },
    {
        key: 'AUCTION_PAYMENT_BALANCE_DUE_MS',
        value: String(30 * MS_PER_DAY),
        description: 'Ms after auction end that balance payment is due',
        type: SystemConfigValueType.NUMBER,
    },
    {
        key: 'AUCTION_WINNER_DEPOSIT_SPLIT_RATIO',
        value: '0.25',
        description: 'Share of win amount taken as deposit (0–1)',
        type: SystemConfigValueType.NUMBER,
    },
    {
        key: 'AUCTION_PARTICIPANT_INITIAL_DEPOSIT_RATIO',
        value: '0.1',
        description: 'Participant hold: fraction of start price (0–1)',
        type: SystemConfigValueType.NUMBER,
    },
    {
        key: 'AUCTION_PUBLIC_FALLBACK_INITIAL_SPLIT_RATIO',
        value: '0.25',
        description: 'Public fallback: first instalment share (0–1)',
        type: SystemConfigValueType.NUMBER,
    },
    {
        key: 'AUCTION_PUBLIC_FALLBACK_REMAINING_SPLIT_RATIO',
        value: '0.75',
        description: 'Public fallback: remaining share (0–1)',
        type: SystemConfigValueType.NUMBER,
    },
    {
        key: 'AUCTION_WINNER_FALLBACK_MAX_RANK',
        value: '1',
        description: 'Max winner rank considered in fallback winner selection',
        type: SystemConfigValueType.NUMBER,
    },
];

async function seed(): Promise<void> {
    for (const row of systemConfigs) {
        await prisma.systemDbConfig.upsert({
            where: { key: row.key },
            create: row,
            update: {
                value: row.value,
                description: row.description,
                type: row.type,
            },
        });
    }
    console.log(`Seeded ${systemConfigs.length} system config rows`);
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
