import { Result } from '@domain/shared/result';

export interface IBaseRepository<TSave, TResponse> {
    save(data: TSave): Promise<Result<TResponse>>;
}
