import { IRazorpaySubscriptionWebhookHandlerUsecase } from '@application/interfaces/usecases/webhooks/IRazpSubscriptionWebhookhandlerUsecase';
import { TYPES } from '@di/types.di';
import { WEBHOOKS_CONSTANTS } from '@presentation/constants/webhooks/webhooks.constants';
import { AppError } from '@presentation/http/error/app.error';
import { ResponseHelper } from '@presentation/http/helpers/response.helper';
import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { inject, injectable } from 'inversify';

@injectable()
export class WebhookController {
    constructor(
        @inject(TYPES.IRazorpaySubscriptionWebhookHandlerUsecase)
        private readonly _razorpaySubscriptionWebhookHandlerUsecase: IRazorpaySubscriptionWebhookHandlerUsecase,
    ) {}

    /**
     * Validates Razorpay subscription webhook signature headers and processes the event body.
     *
     * @param req - Express request; `body` is Razorpay payload, headers carry signature and event id
     * @param res - Express response for JSON output
     * @returns Promise that settles after acknowledgement is sent
     * @throws {AppError} When signature verification or downstream handling fails
     */
    razorpaySubscriptionWebhook = expressAsyncHandler(
        async (req: Request, res: Response) => {
            console.log(req.headers);
            console.log('webhook RRZPAYY =---', req.body);
            // return;

            const result =
                await this._razorpaySubscriptionWebhookHandlerUsecase.execute(
                    req.body,
                    {
                        signature: req.headers[
                            'x-razorpay-signature'
                        ] as string,
                        eventId: req.headers['x-razorpay-event-id'] as string,
                    },
                );

            console.log('webhoook usecase res:', result);
            // return;

            if (result.isFailure) {
                throw new AppError(result.getError(), 400);
            }

            ResponseHelper.success<null>(
                res,
                null,
                WEBHOOKS_CONSTANTS.MESSAGES
                    .RAZORPAY_WEBHOOK_HANDLED_SUCCESSFULLY,
                WEBHOOKS_CONSTANTS.CODES.OK,
            );
        },
    );
}
