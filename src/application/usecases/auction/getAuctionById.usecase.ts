import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { Result } from '@domain/shared/result';
import { TYPES } from '@di/types.di';
import { inject, injectable } from 'inversify';
import { AuctionMapperProrfile } from '@application/mappers/auction/auction.mapperProfile';
import { IAuctionDto } from '@application/dtos/auction/auction.dto';
import type {
  IGetAuctionByIdInputDto,
  IGetAuctionByIdUsecase,
} from '@application/interfaces/usecases/auction/IGetAuctionByIdUsecase';
import { AUCTION_MESSAGES } from '@application/constants/auction/auction.constants';

@injectable()
export class GetAuctionByIdUsecase implements IGetAuctionByIdUsecase {
  constructor(
    @inject(TYPES.IAuctionRepository)
    private readonly _auctionRepository: IAuctionRepository,
  ) {}

  async execute(input: IGetAuctionByIdInputDto): Promise<Result<IAuctionDto>> {
    const existing = await this._auctionRepository.findById(input.auctionId);
    if (existing.isFailure) {
      return Result.fail(existing.getError());
    }

    const auction = existing.getValue();
    if (auction.getSellerId() !== input.userId) {
      return Result.fail(AUCTION_MESSAGES.NOT_AUTHORIZED_TO_VIEW_AUCTION);
    }

    const output = AuctionMapperProrfile.toAuctionOutputDto(auction);
    return Result.ok(output);
  }
}
