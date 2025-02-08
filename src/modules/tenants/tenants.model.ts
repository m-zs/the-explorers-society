import { BaseModel } from '@core/database/models/base.model';

export class Tenant extends BaseModel {
  id!: number;
  name!: string;
  domain!: string;
}
