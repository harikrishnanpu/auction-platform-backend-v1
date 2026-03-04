import { redisConfig } from '@config/redis.config';
import { EMAIL_QUEUE_CONSTANTS } from '@infrastructure/constants/queue/email.queue.constants';
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

  async addVerificationEmailJob(email: string, otp: string) {
    await this._queue.add(
      EMAIL_QUEUE_CONSTANTS.VERIFICATION_EMAIL_JOB,
      { email, otp },
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
  }
}
