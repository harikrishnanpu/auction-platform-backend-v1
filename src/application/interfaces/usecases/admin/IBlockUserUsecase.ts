import {
  IBlockUserInput,
  IBlockUserOutput,
} from '@application/dtos/admin/blockuser.dto';
import { Result } from '@domain/shared/result';

export interface IBlockUserUsecase {
  execute(data: IBlockUserInput): Promise<Result<IBlockUserOutput>>;
}
