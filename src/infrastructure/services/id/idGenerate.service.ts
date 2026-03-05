import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { v4 as uuidv4 } from 'uuid';

export class IDGeneratingService implements IIdGeneratingService {
  generateId(): string {
    return uuidv4();
  }
}
