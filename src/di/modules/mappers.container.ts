import { TYPES } from '@di/types.di';
import { AuctionParticipantMapper } from '@infrastructure/mappers/auction/auction-particpants.mapper';
import { AuctionMapper } from '@infrastructure/mappers/auction/auction.mapper';
import { AuctionCategoryMapper } from '@infrastructure/mappers/auction/auctionCategory.mapper';
import { AuctionChatMessageMapper } from '@infrastructure/mappers/auction/auctionChatMessage.mapper';
import { AuctionWinnerMapper } from '@infrastructure/mappers/auction/auctionWinner.mapper';
import { BidMapper } from '@infrastructure/mappers/auction/bid.mapper';
import { FallbackAuctionParticipantsMapper } from '@infrastructure/mappers/auction/fallbackAuctionParticipants.mapper';
import { FallbackPublicAuctionMapper } from '@infrastructure/mappers/auction/fallbackPublicAuction.mapper';
import { KycDocumentMapper } from '@infrastructure/mappers/kyc/kyc-document.mapper';
import { KycMapper } from '@infrastructure/mappers/kyc/kyc.mapper';
import { NotificationMapper } from '@infrastructure/mappers/notification/notification.mapper';
import { OtpMapper } from '@infrastructure/mappers/otp/otp.mapper';
import { PaymentsMapper } from '@infrastructure/mappers/payments/payments.mapper';
import { FraudReportMapper } from '@infrastructure/mappers/fraud/fraud-report.mapper';
import { UserSuspensionMapper } from '@infrastructure/mappers/fraud/user-suspension.mapper';
import { UserMapper } from '@infrastructure/mappers/user/user.mapper';
import { WalletMapper } from '@infrastructure/mappers/wallet/wallet.mapper';
import { WalletTransactionMapper } from '@infrastructure/mappers/wallet/wallet.transactions.mapper';
import { ContainerModule } from 'inversify';

export const dbMappersContainer = new ContainerModule(({ bind }) => {
    bind<AuctionCategoryMapper>(TYPES.AuctionCategoryMapper).to(
        AuctionCategoryMapper,
    );
    bind<FallbackPublicAuctionMapper>(TYPES.FallbackPublicAuctionMapper).to(
        FallbackPublicAuctionMapper,
    );
    bind<FallbackAuctionParticipantsMapper>(
        TYPES.FallbackAuctionParticipantsMapper,
    ).to(FallbackAuctionParticipantsMapper);
    bind<BidMapper>(TYPES.BidMapper).to(BidMapper);
    bind<AuctionMapper>(TYPES.AuctionMapper).to(AuctionMapper);
    bind<AuctionParticipantMapper>(TYPES.AuctionParticipantMapper).to(
        AuctionParticipantMapper,
    );
    bind<AuctionChatMessageMapper>(TYPES.AuctionChatMessageMapper).to(
        AuctionChatMessageMapper,
    );
    bind<AuctionWinnerMapper>(TYPES.AuctionWinnerMapper).to(
        AuctionWinnerMapper,
    );
    bind<KycMapper>(TYPES.KycMapper).to(KycMapper);
    bind<KycDocumentMapper>(TYPES.KycDocumentMapper).to(KycDocumentMapper);
    bind<NotificationMapper>(TYPES.NotificationMapper).to(NotificationMapper);
    bind<OtpMapper>(TYPES.OtpMapper).to(OtpMapper);
    bind<PaymentsMapper>(TYPES.PaymentsMapper).to(PaymentsMapper);
    bind<UserMapper>(TYPES.UserMapper).to(UserMapper);
    bind<WalletMapper>(TYPES.WalletMapper).to(WalletMapper);
    bind<WalletTransactionMapper>(TYPES.WalletTransactionMapper).to(
        WalletTransactionMapper,
    );
    bind<FraudReportMapper>(TYPES.FraudReportMapper).to(FraudReportMapper);
    bind<UserSuspensionMapper>(TYPES.UserSuspensionMapper).to(
        UserSuspensionMapper,
    );
});
