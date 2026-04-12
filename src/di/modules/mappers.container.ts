import { TYPES } from '@di/types.di';
import { AuctionCategoryMapper } from '@infrastructure/mappers/auction/auctionCategory.mapper';
import { ContainerModule } from 'inversify';

export const DbMappers = new ContainerModule(({ bind }) => {
    bind<AuctionCategoryMapper>(TYPES.AuctionCategoryMapper).to(
        AuctionCategoryMapper,
    );
});
