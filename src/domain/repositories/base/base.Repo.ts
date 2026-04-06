import { Result } from '@domain/shared/result';

export interface IWrite<T> {
    create(data: T): Promise<Result<void>>;
    update(id: string, data: T): Promise<Result<void>>;
    delete(id: string): Promise<Result<void>>;
}

export interface IRead<T, IReadFiltersInput> {
    findAll(data: IReadFiltersInput): Promise<Result<T[]>>;
    findById(id: string): Promise<Result<T>>;
}
