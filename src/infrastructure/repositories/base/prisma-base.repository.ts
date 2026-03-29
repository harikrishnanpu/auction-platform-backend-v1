import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Common Prisma wiring for infrastructure repos.
 * Extend this and pass `prisma` from the DI constructor into `super(prisma)`.
 */
export abstract class PrismaBaseRepository {
    protected constructor(protected readonly prisma: PrismaClient) {}

    /** Runs the callback inside a single database transaction. */
    protected transaction<T>(
        fn: (tx: Prisma.TransactionClient) => Promise<T>,
    ): Promise<T> {
        return this.prisma.$transaction(fn);
    }
}
