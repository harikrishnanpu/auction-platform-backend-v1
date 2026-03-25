import { EMAIL_TEMPLATES } from '@application/constants/template/email.template.constants';
import { IEmailService } from '@application/interfaces/services/IEmailService';
import { TYPES } from '@di/types.di';
import { NotificationCreated } from '@domain/events/notitificationCreated.event';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Email } from '@domain/value-objects/email.vo';
import { inject, injectable } from 'inversify';

@injectable()
export class OnNotificationCreatedHandler {
    constructor(
        @inject(TYPES.IEmailService)
        private readonly _emailService: IEmailService,
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
    ) {}

    async handle(event: NotificationCreated): Promise<void> {
        console.log('OnNotificationCreatedHandler', event);

        try {
            const user = await this._userRepository.findById(event.userId);

            if (user.isFailure) {
                console.log(user.getError());
                return;
            }

            const email = Email.create(user.getValue().getEmail().getValue());

            if (email.isFailure) {
                console.log(email.getError());
                return;
            }

            await this._emailService.sendNotificationEmail(
                email.getValue(),
                EMAIL_TEMPLATES.AUCTION,
                event.title,
                event.message,
            );
        } catch (error) {
            console.log('error', error);
        }
    }
}
