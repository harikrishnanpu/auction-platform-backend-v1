import {
  IApproveSellerKycInput,
  IApproveSellerKycOutput,
} from '@application/dtos/admin/approveSellerKyc.dto';
import { IApproveSellerKycUsecase } from '@application/interfaces/usecases/admin/IApproveSellerKycUsecase';
import { TYPES } from '@di/types.di';
import { KycFor } from '@domain/entities/kyc/kyc.entity';
import { UserStatus } from '@domain/entities/user/user.entity';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { UserRole } from '@domain/value-objects/user-roles.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class ApproveSellerKycUseCase implements IApproveSellerKycUsecase {
  constructor(
    @inject(TYPES.IKycRepository)
    private readonly _kycRepository: IKycRepository,
    @inject(TYPES.IUserRepository)
    private readonly _userRepository: IUserRepository,
  ) {}

  async execute(
    data: IApproveSellerKycInput,
  ): Promise<Result<IApproveSellerKycOutput>> {
    const { sellerId } = data;

    const userEntity = await this._userRepository.findById(sellerId);
    if (userEntity.isFailure) {
      return Result.fail(userEntity.getError());
    }

    const user = userEntity.getValue();

    if (!user || user.getStatus() !== UserStatus.ACTIVE) {
      return Result.fail('User not found');
    }

    if (user.getRoles().some((r) => r.equals(UserRole.SELLER))) {
      return Result.fail('User already has seller role');
    }

    const kycResult = await this._kycRepository.findByUserIdAndFor(
      sellerId,
      KycFor.SELLER,
    );

    if (kycResult.isFailure) {
      return Result.fail(kycResult.getError());
    }

    const kyc = kycResult.getValue();
    if (!kyc) {
      return Result.fail('KYC record not found for this seller');
    }

    const approveResult = kyc.approveKyc();
    if (approveResult.isFailure) {
      return Result.fail(approveResult.getError());
    }

    user.addRole(UserRole.SELLER);
    await this._userRepository.save(user);

    await this._kycRepository.save(kyc);
    return Result.ok({ success: true });
  }
}
