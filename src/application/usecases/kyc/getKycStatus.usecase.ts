import {
  IGetKycStatusInput,
  IGetKycStatusOutput,
} from '@application/dtos/kyc/get-kyc-status.usecase';
import { IGetKycStatusUsecase } from '@application/interfaces/usecases/kyc/IGetKycStatusUsecase';
import { TYPES } from '@di/types.di';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetKycStatusUseCase implements IGetKycStatusUsecase {
  constructor(
    @inject(TYPES.IKycRepository)
    private readonly _kycRepository: IKycRepository,
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}

  async execute(
    data: IGetKycStatusInput,
  ): Promise<Result<IGetKycStatusOutput>> {
    const userEntity = await this._userRepository.findById(data.userId);

    if (userEntity.isFailure) return Result.fail(userEntity.getError());

    const user = userEntity.getValue();

    const kycEntity = await this._kycRepository.findByUserIdAndFor(
      user.getId(),
      data.kycFor,
    );

    if (kycEntity.isFailure) return Result.fail(kycEntity.getError());

    const kyc = kycEntity.getValue();

    if (!kyc) return Result.fail('No KYC found');

    return Result.ok({
      status: kyc.getStatus(),
    });
  }
}
