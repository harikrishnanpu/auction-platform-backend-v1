import { redisConfig } from '@config/redis.config';
import { EMAIL_QUEUE_CONSTANTS } from '@infrastructure/constants/queue/email.queue.constants';
import { EMAIL_TEMPLATES } from '@application/constants/template/email.template.constants';
import { Queue } from 'bullmq';

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

  async addEmailJob({
    email,
    otp,
    template,
  }: {
    email: string;
    otp: string;
    template: (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];
  }) {
    console.log('Adding verification email job');

    try {
      await this._queue.add(
        EMAIL_QUEUE_CONSTANTS.VERIFICATION_EMAIL_JOB,
        { email, otp, template },
        {
          removeOnComplete: EMAIL_QUEUE_CONSTANTS.QUEUE_REMOVE_ON_COMPLETE,
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
