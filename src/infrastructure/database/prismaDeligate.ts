export interface PrismaDelegate<Persistence, Filters> {
    create(args: { data: Persistence }): Promise<Persistence>;
    update(args: {
        where: { id: string };
        data: Persistence;
    }): Promise<Persistence>;
    upsert(args: {
        where: { id: string };
        create: Persistence;
        update: Persistence;
    }): Promise<Persistence>;

    findUnique(args: { where: { id: string } }): Promise<Persistence | null>;
    findMany(args: { where?: Filters }): Promise<Persistence[]>;

    delete(args: { where: { id: string } }): Promise<Persistence>;
}
