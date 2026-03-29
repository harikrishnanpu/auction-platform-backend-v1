import {
    IGetUserPaymentsInputDto,
    IUserPaymentDto,
} from '@application/dtos/payments/payment.dto';
import { Payments } from '@domain/entities/payments/payments.entity';
import { ZodGetUsersPaymentsInputType } from '@presentation/validators/schemas/payments/getUsersPayments.schema';

export class PaymentsMapperProfile {
    public static toGetUserPaymentsInputDto(
        data: ZodGetUsersPaymentsInputType,
        userId: string,
    ): IGetUserPaymentsInputDto {
        return {
            userId: userId,
            status: data.status ?? 'ALL',
            page: data.page,
            limit: data.limit,
        };
    }

    public static toGetUserPaymentsOutputDto(data: Payments): IUserPaymentDto {
        return {
            id: data.getId(),
            amount: data.getAmount() / 100,
            currency: data.getCurrency(),
            status: data.getStatus(),
            referenceId: data.getReferenceId(),
            phase: data.getPhase(),
            dueAt: data.getDueAt(),
            createdAt: data.getCreatedAt(),
        };
    }
}
