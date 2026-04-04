// import { IBaseRepository } from "@domain/repositories/base/base.Repo";
// import { Result } from "@domain/shared/result";
// import { PrismaClient } from "@prisma/client";

// export class BaseRepo<TSave, TResponse> implements IBaseRepository<TSave, TResponse> {

//     private readonly _model: PrismaClient[keyof PrismaClient];

//     constructor(prisma: PrismaClient, modelName: keyof PrismaClient) {
//         this._model = prisma[modelName] as PrismaClient[keyof PrismaClient];
//       }

//     async save(data: TSave): Promise<Result<TResponse>> {

//         const result = await this._model.upsert({
//             where: { id: data.id },
//             create: data,
//             update: data,
//         });

//         return Result.ok(result);
//     }

// }
