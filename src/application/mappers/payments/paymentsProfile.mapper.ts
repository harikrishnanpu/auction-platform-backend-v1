import {
    IGetUserPaymentsInputDto,
    IUserPaymentDto,
    IVerifyPaymentInputDto,
} from '@application/dtos/payments/payment.dto';
import { IValidatedGetUserPaymentsInput } from '@application/interfaces/usecases/payments/IGetUserPaymentsUsecase';
import { Payments } from '@domain/entities/payments/payments.entity';
import { ZodVerifyPaymentInputType } from '@presentation/validators/schemas/payments/verifyPayment.schema';

export class PaymentsMapperProfile {
    public static toGetUserPaymentsInput(
        data: IValidatedGetUserPaymentsInput,
    ): IGetUserPaymentsInputDto {
        return {
            userId: data.userId,
            status: data.status ?? 'ALL',
            page: data.page,
            limit: data.limit,
        };
    }

    public static toGetUserPaymentsOutputDto(data: Payments): IUserPaymentDto {
        return {
            id: data.getId(),
            amount: data.getAmount(),
            currency: data.getCurrency(),
            status: data.getStatus(),
            referenceId: data.getReferenceId(),
            phase: data.getPhase(),
            dueAt: data.getDueAt(),
            createdAt: data.getCreatedAt(),
        };
    }

    public static toVerifyPaymentInput(
        data: ZodVerifyPaymentInputType,
    ): IVerifyPaymentInputDto {
        return {
            userId: data.userId,
            paymentId: data.paymentId,
            orderId: data.orderId,
            gatewayPaymentId: data.gatewayPaymentId,
            signature: data.signature,
        };
    }
}
