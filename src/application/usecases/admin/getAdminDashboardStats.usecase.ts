import { IGetAdminDashboardStatsOutputDto } from '@application/dtos/admin/getAdminDashboardStats.dto';
import { IGetAdminDashboardStatsUsecase } from '@application/interfaces/usecases/admin/IGetAdminDashboardStatsUsecase';
import { UserRoleType } from '@application/dtos/auth/loginUser.dto';
import { TYPES } from '@di/types.di';
import { KycFor, KycStatus } from '@domain/entities/kyc/kyc.entity';
import { UserStatus } from '@domain/entities/user/user.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IKycRepository } from '@domain/repositories/IKycRespository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetAdminDashboardStatsUsecase implements IGetAdminDashboardStatsUsecase {
    constructor(
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IKycRepository)
        private readonly _kycRepository: IKycRepository,
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
    ) {}

    async execute(): Promise<Result<IGetAdminDashboardStatsOutputDto>> {
        const [
            totalUsersResult,
            suspendedUsersResult,
            activeSellersResult,
            pendingKycResult,
            totalAuctionsResult,
            auctionStatsResult,
            buyerUsersResult,
            adminUsersResult,
        ] = await Promise.all([
            this._userRepository.count(),
            this._userRepository.count({ status: UserStatus.SUSPENDED }),
            this._userRepository.count({ role: UserRoleType.SELLER }),
            this._kycRepository.countByKycFor(KycFor.SELLER, KycStatus.PENDING),
            this._auctionRepository.countAdminVisibleAuctions(),
            this._auctionRepository.countAuctionStats(),
            this._userRepository.count({ role: UserRoleType.USER }),
            this._userRepository.count({ role: UserRoleType.ADMIN }),
        ]);

        const results = [
            totalUsersResult,
            suspendedUsersResult,
            activeSellersResult,
            pendingKycResult,
            totalAuctionsResult,
            auctionStatsResult,
            buyerUsersResult,
            adminUsersResult,
        ];

        const failed = results.find((result) => result.isFailure);
        if (failed) {
            return Result.fail(failed.getError());
        }

        const auctionStats = auctionStatsResult.getValue();
        return Result.ok({
            totalUsers: totalUsersResult.getValue(),
            suspendedUsers: suspendedUsersResult.getValue(),
            activeSellers: activeSellersResult.getValue(),
            pendingKyc: pendingKycResult.getValue(),
            totalAuctions: totalAuctionsResult.getValue(),
            liveAuctions: auctionStats.liveCount,
            upcomingAuctions: auctionStats.upcomingCount,
            endedAuctions: auctionStats.endedCount,
            buyerUsers: buyerUsersResult.getValue(),
            adminUsers: adminUsersResult.getValue(),
        });
    }
}
