import {
  ISubmitKycInput,
  ISubmitKycOutput,
} from '@application/dtos/kyc/submit-kyc.dto';
import { ISubmitKycUsecase } from '@application/interfaces/usecases/kyc/ISubmitKycUsecase';
import { TYPES } from '@di/types.di';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class SubmitKycUsecase implements ISubmitKycUsecase {
  constructor(
    @inject(TYPES.IKycRepository)
    private readonly _kycRepository: IKycRepository,
  ) {}

  async execute(data: ISubmitKycInput): Promise<Result<ISubmitKycOutput>> {
    try {
      const kycEntity = await this._kycRepository.findByUserIdAndFor(
        data.userId,
        data.kycFor,
      );

      if (kycEntity.isFailure) {
        return Result.fail(kycEntity.getError());
      }

      const submit = kycEntity.getValue().submitKyc();

      if (submit.isFailure) {
        return Result.fail(submit.getError());
      }

      await this._kycRepository.save(kycEntity.getValue());

      const output: ISubmitKycOutput = {
        status: kycEntity.getValue().getKycStatus(),
      };

      return Result.ok(output);
    } catch (error) {
      console.log(error);
      return Result.fail('UNEXPECTED ERROR FROM SUBMIT KYC USECASE');
    }
  }
}
