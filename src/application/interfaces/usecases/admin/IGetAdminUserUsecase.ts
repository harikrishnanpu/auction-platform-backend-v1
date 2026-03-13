import {
  IGetUserInput,
  IGetUserOutput,
} from '@application/dtos/admin/getUser.dto';
import { Result } from '@domain/shared/result';

export interface IGetAdminUserUsecase {
  execute(data: IGetUserInput): Promise<Result<IGetUserOutput>>;
}
