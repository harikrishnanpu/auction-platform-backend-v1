import { ISubscriptionConfigService } from '@application/interfaces/services/ISubscriptionConfigService';
import { SubscriptionConfigService } from '@infrastructure/services/subscription/subscription-config.service';
import { ContainerModule } from 'inversify';
import { TYPES } from '../types.di';

export const subscriptionContainer = new ContainerModule(({ bind }) => {
    bind<ISubscriptionConfigService>(TYPES.ISubscriptionConfigService).to(
        SubscriptionConfigService,
    );
});
