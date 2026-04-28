import { PublicSubscriptionPlanDto } from '@application/dtos/user/publicSubscriptionPlan.dto';
import { IGetPublicSubscriptionPlansUsecase } from '@application/interfaces/usecases/subscription/IGetPublicSubscriptionPlansUsecase';
import { TYPES } from '@di/types.di';
import { ISubscriptionPlanRepository } from '@domain/repositories/ISubscriptionPlanRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetPublicSubscriptionPlansUsecase implements IGetPublicSubscriptionPlansUsecase {
    constructor(
        @inject(TYPES.ISubscriptionPlanRepository)
        private readonly _subscriptionPlanRepository: ISubscriptionPlanRepository,
    ) {}

    async execute(): Promise<Result<PublicSubscriptionPlanDto[]>> {
        const allRes = await this._subscriptionPlanRepository.findAll();
        if (allRes.isFailure) {
            return Result.fail(allRes.getError());
        }

        const plans = allRes
            .getValue()
            .filter(
                (p) =>
                    p.getIsActive() &&
                    !p.getIsDefault() &&
                    p.getPrice() > 0 &&
                    !!p.getRazorpayPlanId()?.trim(),
            )
            .map((p) => ({
                id: p.getId(),
                name: p.getName(),
                description: p.getDescription(),
                price: p.getPrice(),
                durationDays: p.getDurationDays(),
            }));

        return Result.ok(plans);
    }
}
