import { redisConfig } from '@config/redis.config';
import { EMAIL_QUEUE_CONSTANTS } from '@infrastructure/constants/queue/email.queue.constants';
import { EMAIL_TEMPLATES } from '@infrastructure/constants/template/email.template.constants';
import {
  TemplateService,
  TemplateServiceProps,
} from '@infrastructure/services/template/template.service';
import { Job, Worker } from 'bullmq';
import nodemailer from 'nodemailer';

interface EmailJobData {
  template: string;
  data: {
    email: string;
    otp: string;
  };
}

export class EmailWorker {
  constructor(
    private _worker: Worker,
    private _transporter: nodemailer.Transporter,
    private _templateService: TemplateService,
  ) {
    const MAIL_USER = process.env.MAIL_USER;
    const MAIL_PASS = process.env.MAIL_PASS;

    if (!MAIL_USER || !MAIL_PASS) {
      throw new Error('MAIL_USER or MAIL_PASS is not defined');
    }

    this._transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });

    this._worker = new Worker(
      EMAIL_QUEUE_CONSTANTS.EMAIL_QUEUE,
      this.processJob.bind(this),
      {
        connection: redisConfig,
      },
    );

    this._worker.on('completed', (job) => {
      console.log(`Email job ${job.id} completed`);
    });

    this._worker.on('failed', (job, err) => {
      console.error(`Email job ${job?.id} failed: ${err.message}`);
    });
  }

  private async processJob(job: Job<EmailJobData>): Promise<void> {
    const { data } = job.data;

    try {
      let templatePath: string | null = null;

      switch (job.data.template) {
        case EMAIL_TEMPLATES.VERIFY_EMAIL:
          templatePath = 'verify-email.template.html';
          break;

        case EMAIL_TEMPLATES.RESET_PASSWORD:
          templatePath = 'reset-password.template.html';
          break;

        default:
          throw new Error('Invalid template');
      }

      const templateProps: TemplateServiceProps = {
        templatePath,
        data,
      };

      const html = await this._templateService.render(templateProps);

      await this._transporter.sendMail({
        from: `"Auction Platform" ${process.env.MAIL_USER}`,
        to: data.email,
        subject: job.data.template,
        html: html,
      });
      console.log(`Email sent to ${data.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${data.email}:`, error);
      throw error;
    }
  }
}
