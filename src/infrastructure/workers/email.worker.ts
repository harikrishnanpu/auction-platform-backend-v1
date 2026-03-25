import { redisConfig } from '@config/redis.config';
import { EMAIL_QUEUE_CONSTANTS } from '@infrastructure/constants/queue/email.queue.constants';
import { EMAIL_TEMPLATES } from '@application/constants/template/email.template.constants';
import {
    TemplateService,
    TemplateServiceProps,
} from '@infrastructure/services/template/template.service';
import { Job, Worker } from 'bullmq';
import nodemailer from 'nodemailer';

// --change need --
interface EmailJobData {
    template: string;
    email: string;
    otp: string;
    subject?: string;
    message?: string;
}

export class EmailWorker {
    private _worker: Worker;
    private _transporter: nodemailer.Transporter;

    constructor(private _templateService: TemplateService) {
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
        const { email, otp, template, subject, message } = job.data;

        try {
            let templatePath: string | null = null;

            switch (job.data.template) {
                case EMAIL_TEMPLATES.VERIFY_EMAIL:
                    templatePath = '/email/verify-email.template.html';
                    break;

                case EMAIL_TEMPLATES.RESET_PASSWORD:
                    templatePath = '/email/reset-password.template.html';
                    break;

                case EMAIL_TEMPLATES.CHANGE_PROFILE_PASSWORD:
                    templatePath =
                        '/email/change-profile-passwors.template.html';
                    break;

                case EMAIL_TEMPLATES.AUCTION:
                    templatePath = '/auction/auction.html';
                    break;

                default:
                    throw new Error('Invalid template');
            }

            const templateProps: TemplateServiceProps = {
                templatePath,
                data: { email, otp, subject, message },
            };

            const html = await this._templateService.render(templateProps);

            await this._transporter.sendMail({
                from: `"Auction Platform" ${process.env.MAIL_USER}`,
                to: email,
                subject: template,
                html: html,
            });

            console.log(`Email sent to ${email}`);
        } catch (error) {
            console.log(`Failed to send email to ${email}:`, error);
        }
    }
}
