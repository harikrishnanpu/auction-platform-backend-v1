import { Result } from '@domain/shared/result';

export interface IBaseRepository<TSave, TResponse> {
    save(data: TSave): Promise<Result<TResponse>>;
    findById(id: string): Promise<Result<TResponse>>;
    findAll(): Promise<Result<TResponse[]>>;
}
