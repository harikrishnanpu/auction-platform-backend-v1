import { redisConfig } from '@config/redis.config';
import { EMAIL_QUEUE_CONSTANTS } from '@infrastructure/constants/queue/email.queue.constants';
import { Queue } from 'bullmq';
import { EmailTemplate } from '@infrastructure/services/email/email.service';

export class EmailQueue {
    private _queue: Queue;

    constructor() {
        this._queue = new Queue(EMAIL_QUEUE_CONSTANTS.EMAIL_QUEUE, {
            connection: {
                host: redisConfig.host,
                port: redisConfig.port,
            },
        });
    }

    async addVerificationEmailJob({
        email,
        otp,
        template,
    }: {
        email: string;
        otp: string;
        template: EmailTemplate;
    }) {
        console.log('Adding verification email job');

        try {
            await this._queue.add(
                EMAIL_QUEUE_CONSTANTS.VERIFICATION_EMAIL_JOB,
                { email, otp, template },
                {
                    removeOnComplete:
                        EMAIL_QUEUE_CONSTANTS.QUEUE_REMOVE_ON_COMPLETE,
                    removeOnFail: EMAIL_QUEUE_CONSTANTS.QUEUE_REMOVE_ON_FAIL,
                    attempts: EMAIL_QUEUE_CONSTANTS.QUEUE_RETRY_ATTEMPTS,
                    backoff: {
                        type: EMAIL_QUEUE_CONSTANTS.QUEUE_RETRY_TYPE,
                        delay: EMAIL_QUEUE_CONSTANTS.QUEUE_RETRY_DELAY,
                    },
                },
            );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async addNotificationEmailJob({
        email,
        template,
        subject,
        message,
    }: {
        email: string;
        template: EmailTemplate;
        subject: string;
        message: string;
    }) {
        console.log('Adding email job');
        try {
            await this._queue.add(
                EMAIL_QUEUE_CONSTANTS.EMAIL_QUEUE,
                { email, template, subject, message },
                {
                    removeOnComplete:
                        EMAIL_QUEUE_CONSTANTS.QUEUE_REMOVE_ON_COMPLETE,
                    removeOnFail: EMAIL_QUEUE_CONSTANTS.QUEUE_REMOVE_ON_FAIL,
                    attempts: EMAIL_QUEUE_CONSTANTS.QUEUE_RETRY_ATTEMPTS,
                    backoff: {
                        type: EMAIL_QUEUE_CONSTANTS.QUEUE_RETRY_TYPE,
                        delay: EMAIL_QUEUE_CONSTANTS.QUEUE_RETRY_DELAY,
                    },
                },
            );
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
}
