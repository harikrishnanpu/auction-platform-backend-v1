import { ICreateNotificationInputDto } from '@application/dtos/notification/notification.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { ICreateNotificationUsecase } from '@application/interfaces/usecases/notification/ICreateNotificationUsecase';
import { TYPES } from '@di/types.di';
import { Notification } from '@domain/entities/notifications/notification.entity';
import { INotificationRepository } from '@domain/repositories/INotificationRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class CreateNotificationUsecase implements ICreateNotificationUsecase {
    constructor(
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.INotificationRepository)
        private readonly _notificationRepository: INotificationRepository,
    ) {}

    async execute(data: ICreateNotificationInputDto): Promise<Result<void>> {
        const notification = Notification.create({
            id: this._idGeneratingService.generateId(),
            title: data.title,
            message: data.message,
            userId: data.userId,
        });

        if (notification.isFailure) return Result.fail(notification.getError());

        await this._notificationRepository.save(notification.getValue());

        return Result.ok();
    }
}
