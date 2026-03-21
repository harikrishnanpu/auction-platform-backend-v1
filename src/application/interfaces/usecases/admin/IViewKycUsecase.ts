import {
  IViewKycInputDto,
  IViewKycOutputDto,
} from '@application/dtos/admin/viewKyc.dto';
import { Result } from '@domain/shared/result';

export interface IViewKycUsecase {
  execute(data: IViewKycInputDto): Promise<Result<IViewKycOutputDto>>; // stream file to client
}
