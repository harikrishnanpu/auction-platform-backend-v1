import { ICreateAuctionUsecase } from '@application/interfaces/usecases/auction/ICreateAuctionUsecase';
import { IGenerateAuctionUploadUrlUsecase } from '@application/interfaces/usecases/auction/IGenerateAuctionUploadUrlUsecase';
import { IUpdateAuctionUsecase } from '@application/interfaces/usecases/auction/IUpdateAuctionUsecase';
import { IPublishAuctionUsecase } from '@application/interfaces/usecases/auction/IPublishAuctionUsecase';
import { IEndAuctionUsecase } from '@application/interfaces/usecases/auction/IEndAuctionUsecase';
import { IPlaceBidUsecase } from '@application/interfaces/usecases/auction/IPlaceBidUsecase';
import { CreateAuctionUsecase } from '@application/usecases/auction/createAuction.usecase';
import { GenerateAuctionUploadUrlUsecase } from '@application/usecases/auction/generateAuctionUploadUrl.usecase';
import { GetAuctionByIdUsecase } from '@application/usecases/auction/getAuctionById.usecase';
import { UpdateAuctionUsecase } from '@application/usecases/auction/updateAuction.usecase';
import { PublishAuctionUsecase } from '@application/usecases/auction/publishAuction.usecase';
import { EndAuctionUsecase } from '@application/usecases/auction/endAuction.usecase';
import { PlaceBidUsecase } from '@application/usecases/auction/placeBid.usecase';
import { GetAuctionRoomUsecase } from '@application/usecases/auction/getAuctionRoom.usecase';
import { GetBrowseAuctionsUsecase } from '@application/usecases/auction/getBrowseAuctions.usecase';
import { PauseAuctionUsecase } from '@application/usecases/auction/pauseAuction.usecase';
import { ResumeAuctionUsecase } from '@application/usecases/auction/resumeAuction.usecase';
import { IGetAuctionByIdUsecase } from '@application/interfaces/usecases/auction/IGetAuctionByIdUsecase';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { PrismaAuctionRepo } from '@infrastructure/repositories/auction/auction.repo';
import { PrismaBidRepo } from '@infrastructure/repositories/auction/bid.repo';
import { PrismaAuctionParticipantRepo } from '@infrastructure/repositories/auction/auction-participant.repo';
import { ContainerModule } from 'inversify';
import { IAuctionCategoryRepository } from '@domain/repositories/IAuctionCategoryRepo';
import { PrismaAuctionCategoryRepository } from '@infrastructure/repositories/auction/auction-category.repo';
import { ISlugGeneratorService } from '@application/interfaces/services/ISlugGeneratorService';
import { SlugGeneratorService } from '@infrastructure/services/slug/SlugGenerator.service';
import { IGetAllAuctionCategoriesUsecase } from '@application/interfaces/usecases/auction/IGetAllAuctionCategoriesUsecase';
import { GetAllAuctionCategoryUsecase } from '@application/usecases/auction/getAllAuctionCategory.usecase';
import { IAuctionChatMessageRepository } from '@domain/repositories/IAuctionChatMessageRepository';
import { PrismaAuctionChatMessageRepo } from '@infrastructure/repositories/auction/auction-chat-message.repo';
import { SendAuctionChatMessageUsecase } from '@application/usecases/auction/sendAuctionChatMessage.usecase';
import { ISendAuctionChatMessageUsecase } from '@application/interfaces/usecases/auction/ISendAuctionChatMessageUsecase';
import { GetAuctionChatMessagesUsecase } from '@application/usecases/auction/getAuctionChatMessages.usecase';
import { IGetAuctionChatMessagesUsecase } from '@application/interfaces/usecases/auction/IGetAuctionChatMessagesUsecase';
import { IGetAuctionRoomUsecase } from '@application/interfaces/usecases/auction/IGetAuctionRoomUsecase';
import { IGetBrowseAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetBrowseAuctionsUsecase';
import { IPauseAuctionUsecase } from '@application/interfaces/usecases/auction/IPauseAuctionUsecase';
import { IResumeAuctionUsecase } from '@application/interfaces/usecases/auction/IResumeAuctionUsecase';
import { PlaceBidPolicyService } from '@domain/policies/auction/place-bid-policy.service';
import { IGetUserParticipatedAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetUserParticipatedAuctionsUsecase';
import { GetUserParticipatedAuctionsUsecase } from '@application/usecases/auction/getUserParticipatedAuctions.usecase';
import { IAuctionWinnerStrategy } from '@domain/strategies/IAuctionWinnerStrategy';
import { LongAuctionWinnerStrategy } from '@application/strategies/auction/long-auction-winner.strategy';
import { SealedAuctionWinnerStrategy } from '@application/strategies/auction/sealed-auction-winner.strategy';
import { AuctionWinnerStrategyFactory } from '@application/factories/auction-winner-policy.factory';
import { IAuctionBidLeaderboardService } from '@application/interfaces/services/IAuctionBidLeaderboardService';
import { AuctionBidLeaderboardService } from '@infrastructure/services/auction/auction-bid-leaderboard.service';
import { ProcessAuctionEndNotificationUsecase } from '@application/usecases/auction/processAuctionEnd.usecase';
import { IProcessAuctionEndNotificationUsecase } from '@application/interfaces/usecases/auction/IProcessAuctionEndUsecase';
import { IAuctionPaymentsStrategy } from '@application/interfaces/strategies/payments/IAuctionPaymentsStrategy';
import { AuctionPaymentStrategy } from '@application/strategies/payments/auctionPaymentStartegy';
import { PlaceBidStartegyFactory } from '@application/factories/placeBidStartegy.factory';
import { LongAuctionPlaceBidStrategy } from '@application/strategies/auction/long-auction.placeBid.strategy';
import { SealedAuctionPlaceBidStartegy } from '@application/strategies/auction/sealedAuction.placeBid.startegy';
import { LongAuctionCreatePolicy } from '@domain/policies/auction/longAuction.create.policy';
import { SealedAuctionCreatePolicy } from '@domain/policies/auction/sealedAuction.create.policy';
import { IPlaceBidStrategy } from '@domain/strategies/IPlaceBidStrategy';
import { AuctionCreatePolicyFactory } from '@application/factories/auctionCreatePolicy.factory';

export const auctionContainer = new ContainerModule(({ bind }) => {
    bind<IAuctionRepository>(TYPES.IAuctionRepository).to(PrismaAuctionRepo);
    bind<IBidRepository>(TYPES.IBidRepository).to(PrismaBidRepo);
    bind<IAuctionParticipantRepository>(TYPES.IAuctionParticipantRepository).to(
        PrismaAuctionParticipantRepo,
    );
    bind<ICreateAuctionUsecase>(TYPES.ICreateAuctionUsecase).to(
        CreateAuctionUsecase,
    );

    bind<IGenerateAuctionUploadUrlUsecase>(
        TYPES.IGenerateAuctionUploadUrlUsecase,
    ).to(GenerateAuctionUploadUrlUsecase);
    bind<IUpdateAuctionUsecase>(TYPES.IUpdateAuctionUsecase).to(
        UpdateAuctionUsecase,
    );
    bind<IPublishAuctionUsecase>(TYPES.IPublishAuctionUsecase).to(
        PublishAuctionUsecase,
    );
    bind<IEndAuctionUsecase>(TYPES.IEndAuctionUsecase).to(EndAuctionUsecase);
    bind<IPlaceBidUsecase>(TYPES.IPlaceBidUsecase).to(PlaceBidUsecase);
    bind<IGetAuctionByIdUsecase>(TYPES.IGetAuctionByIdUsecase).to(
        GetAuctionByIdUsecase,
    );
    bind<IAuctionCategoryRepository>(TYPES.IAuctionCategoryRepository).to(
        PrismaAuctionCategoryRepository,
    );
    bind<ISlugGeneratorService>(TYPES.ISlugGeneratorService).to(
        SlugGeneratorService,
    );

    bind<IGetAllAuctionCategoriesUsecase>(
        TYPES.IGetAllAuctionCategoriesUsecase,
    ).to(GetAllAuctionCategoryUsecase);

    bind<IGetAuctionRoomUsecase>(TYPES.IGetAuctionRoomUsecase).to(
        GetAuctionRoomUsecase,
    );

    bind<IGetBrowseAuctionsUsecase>(TYPES.IGetBrowseAuctionsUsecase).to(
        GetBrowseAuctionsUsecase,
    );

    bind<IGetUserParticipatedAuctionsUsecase>(
        TYPES.IGetUserParticipatedAuctionsUsecase,
    ).to(GetUserParticipatedAuctionsUsecase);

    bind<IPauseAuctionUsecase>(TYPES.IPauseAuctionUsecase).to(
        PauseAuctionUsecase,
    );

    bind<IResumeAuctionUsecase>(TYPES.IResumeAuctionUsecase).to(
        ResumeAuctionUsecase,
    );

    bind<IAuctionChatMessageRepository>(TYPES.IAuctionChatMessageRepository).to(
        PrismaAuctionChatMessageRepo,
    );

    bind<ISendAuctionChatMessageUsecase>(
        TYPES.ISendAuctionChatMessageUsecase,
    ).to(SendAuctionChatMessageUsecase);

    bind<IGetAuctionChatMessagesUsecase>(
        TYPES.IGetAuctionChatMessagesUsecase,
    ).to(GetAuctionChatMessagesUsecase);
    bind<PlaceBidPolicyService>(TYPES.PlaceBidPolicyService).to(
        PlaceBidPolicyService,
    );
    bind<IAuctionWinnerStrategy>(TYPES.LongAuctionWinnerStrategy).to(
        LongAuctionWinnerStrategy,
    );
    bind<IAuctionWinnerStrategy>(TYPES.SealedAuctionWinnerStrategy).to(
        SealedAuctionWinnerStrategy,
    );
    bind<AuctionWinnerStrategyFactory>(TYPES.AuctionWinnerStrategyFactory).to(
        AuctionWinnerStrategyFactory,
    );
    bind<IAuctionBidLeaderboardService>(TYPES.IAuctionBidLeaderboardService).to(
        AuctionBidLeaderboardService,
    );
    bind<IProcessAuctionEndNotificationUsecase>(
        TYPES.IProcessAuctionEndNotificationUsecase,
    ).to(ProcessAuctionEndNotificationUsecase);
    bind<IAuctionPaymentsStrategy>(TYPES.IAuctionPaymentsStrategy).to(
        AuctionPaymentStrategy,
    );
    bind<PlaceBidStartegyFactory>(TYPES.PlaceBidStartegyFactory).to(
        PlaceBidStartegyFactory,
    );

    bind<LongAuctionCreatePolicy>(TYPES.LongAuctionCreatePolicy).to(
        LongAuctionCreatePolicy,
    );

    bind<SealedAuctionCreatePolicy>(TYPES.SealedAuctionCreatePolicy).to(
        SealedAuctionCreatePolicy,
    );

    bind<IPlaceBidStrategy>(TYPES.LongAuctionPlaceBidStrategy).to(
        LongAuctionPlaceBidStrategy,
    );
    bind<IPlaceBidStrategy>(TYPES.SealedAuctionPlaceBidStartegy).to(
        SealedAuctionPlaceBidStartegy,
    );

    bind<AuctionCreatePolicyFactory>(TYPES.AuctionCreatePolicyFactory).to(
        AuctionCreatePolicyFactory,
    );
});
