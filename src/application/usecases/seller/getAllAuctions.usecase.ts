import {
  IGetAllAuctionsInputDto,
  IGetAllAuctionsOutputDto,
} from '@application/dtos/auction/getAllAuction.dto';
import { IGetAllSellerAuctionsUsecase } from '@application/interfaces/usecases/seller/IGetallAuctionsUsecase';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { TYPES } from '@di/types.di';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { inject } from 'inversify';

export class GetAllSellerAuctionsUsecase implements IGetAllSellerAuctionsUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
  ) {}

  async execute(
    input: IGetAllAuctionsInputDto,
  ): Promise<Result<IGetAllAuctionsOutputDto>> {
    const auctions = await this._auctionRepository.findAll({
      sellerId: input.userId,
    });

    if (auctions.isFailure) {
      return Result.fail(auctions.getError());
    }

    const auctionsResult = auctions.getValue().map((a) => {
      return AuctionMapperProrfile.toAuctionOutputDto(a);
    });

    return Result.ok({ auctions: auctionsResult });
  }
}
