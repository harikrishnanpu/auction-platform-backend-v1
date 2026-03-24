import { ICreateNotificationInputDto } from '@application/dtos/notification/notification.dto';
import { Result } from '@domain/shared/result';

export interface ICreateNotificationUsecase {
    execute(data: ICreateNotificationInputDto): Promise<Result<void>>;
}
