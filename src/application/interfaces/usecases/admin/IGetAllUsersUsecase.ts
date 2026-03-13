import {
  IGetAllUsersInput,
  IGetAllUsersOutput,
} from '@application/dtos/admin/getAllusers.dto';
import { Result } from '@domain/shared/result';

export interface IGetAllUsersUsecase {
  execute(data: IGetAllUsersInput): Promise<Result<IGetAllUsersOutput>>;
}
