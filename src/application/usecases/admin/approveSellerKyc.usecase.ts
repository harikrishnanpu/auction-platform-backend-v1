import {
  IApproveSellerKycInput,
  IApproveSellerKycOutput,
} from '@application/dtos/admin/approveSellerKyc.dto';
import { IApproveSellerKycUsecase } from '@application/interfaces/usecases/admin/IApproveSellerKycUsecase';
import { TYPES } from '@di/types.di';
import { KycFor } from '@domain/entities/kyc/kyc.entity';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class ApproveSellerKycUseCase implements IApproveSellerKycUsecase {
  constructor(
    @inject(TYPES.IKycRepository)
    private readonly _kycRepository: IKycRepository,
  ) {}

  async execute(
    data: IApproveSellerKycInput,
  ): Promise<Result<IApproveSellerKycOutput>> {
    const { sellerId } = data;

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

    await this._kycRepository.save(kyc);
    return Result.ok({ success: true });
  }
}
