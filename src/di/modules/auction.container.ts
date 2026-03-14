import { ICreateAuctionUsecase } from '@application/interfaces/usecases/auction/ICreateAuctionUsecase';
import { IGetSellerAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetSellerAuctionsUsecase';
import { IGetAuctionByIdUsecase } from '@application/interfaces/usecases/auction/IGetAuctionByIdUsecase';
import { IGetBrowseAuctionsUsecase } from '@application/interfaces/usecases/auction/IGetBrowseAuctionsUsecase';
import { IGenerateAuctionUploadUrlUsecase } from '@application/interfaces/usecases/auction/IGenerateAuctionUploadUrlUsecase';
import { IUpdateAuctionUsecase } from '@application/interfaces/usecases/auction/IUpdateAuctionUsecase';
import { IPublishAuctionUsecase } from '@application/interfaces/usecases/auction/IPublishAuctionUsecase';
import { IEndAuctionUsecase } from '@application/interfaces/usecases/auction/IEndAuctionUsecase';
import { IPlaceBidUsecase } from '@application/interfaces/usecases/auction/IPlaceBidUsecase';
import { IGetAuctionRoomUsecase } from '@application/interfaces/usecases/auction/IGetAuctionRoomUsecase';
import { CreateAuctionUsecase } from '@application/usecases/auction/createAuction.usecase';
import { GetSellerAuctionsUsecase } from '@application/usecases/auction/getSellerAuctions.usecase';
import { GetAuctionByIdUsecase } from '@application/usecases/auction/getAuctionById.usecase';
import { GetBrowseAuctionsUsecase } from '@application/usecases/auction/getBrowseAuctions.usecase';
import { GenerateAuctionUploadUrlUsecase } from '@application/usecases/auction/generateAuctionUploadUrl.usecase';
import { UpdateAuctionUsecase } from '@application/usecases/auction/updateAuction.usecase';
import { PublishAuctionUsecase } from '@application/usecases/auction/publishAuction.usecase';
import { EndAuctionUsecase } from '@application/usecases/auction/endAuction.usecase';
import { PlaceBidUsecase } from '@application/usecases/auction/placeBid.usecase';
import { GetAuctionRoomUsecase } from '@application/usecases/auction/getAuctionRoom.usecase';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IBidRepository } from '@domain/repositories/IBidRepository';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { PrismaAuctionRepo } from '@infrastructure/repositories/auction/auction.repo';
import { PrismaBidRepo } from '@infrastructure/repositories/auction/bid.repo';
import { PrismaAuctionParticipantRepo } from '@infrastructure/repositories/auction/auction-participant.repo';
import { ContainerModule } from 'inversify';

export const auctionContainer = new ContainerModule(({ bind }) => {
  bind<IAuctionRepository>(TYPES.IAuctionRepository).to(PrismaAuctionRepo);
  bind<IBidRepository>(TYPES.IBidRepository).to(PrismaBidRepo);
  bind<IAuctionParticipantRepository>(TYPES.IAuctionParticipantRepository).to(
    PrismaAuctionParticipantRepo,
  );
  bind<ICreateAuctionUsecase>(TYPES.ICreateAuctionUsecase).to(
    CreateAuctionUsecase,
  );
  bind<IGetSellerAuctionsUsecase>(TYPES.IGetSellerAuctionsUsecase).to(
    GetSellerAuctionsUsecase,
  );
  bind<IGetAuctionByIdUsecase>(TYPES.IGetAuctionByIdUsecase).to(
    GetAuctionByIdUsecase,
  );
  bind<IGenerateAuctionUploadUrlUsecase>(
    TYPES.IGenerateAuctionUploadUrlUsecase,
  ).to(GenerateAuctionUploadUrlUsecase);
  bind<IUpdateAuctionUsecase>(TYPES.IUpdateAuctionUsecase).to(
    UpdateAuctionUsecase,
  );
  bind<IGetBrowseAuctionsUsecase>(TYPES.IGetBrowseAuctionsUsecase).to(
    GetBrowseAuctionsUsecase,
  );
  bind<IPublishAuctionUsecase>(TYPES.IPublishAuctionUsecase).to(
    PublishAuctionUsecase,
  );
  bind<IEndAuctionUsecase>(TYPES.IEndAuctionUsecase).to(EndAuctionUsecase);
  bind<IPlaceBidUsecase>(TYPES.IPlaceBidUsecase).to(PlaceBidUsecase);
  bind<IGetAuctionRoomUsecase>(TYPES.IGetAuctionRoomUsecase).to(
    GetAuctionRoomUsecase,
  );
});
