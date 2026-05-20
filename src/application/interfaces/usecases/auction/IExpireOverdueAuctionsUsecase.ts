import { Result } from '@domain/shared/result';

export interface IExpireOverdueAuctionsOutput {
    processed: number;
    ended: number;
    failed: number;
}

export interface IExpireOverdueAuctionsUsecase {
    execute(): Promise<Result<IExpireOverdueAuctionsOutput>>;
}
