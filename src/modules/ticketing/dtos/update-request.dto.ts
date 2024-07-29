import { IsEnum } from 'class-validator';
import { RequestStatus } from '../entities';

export class UpdateRequestServiceDto {
  @IsEnum([RequestStatus.ABSENT, RequestStatus.ATTENDED])
  status: RequestStatus.ABSENT | RequestStatus.ATTENDED;
}
