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
import { PlaceBidPolicyService } from '@domain/policies/place-bid-policy.service';

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
});
