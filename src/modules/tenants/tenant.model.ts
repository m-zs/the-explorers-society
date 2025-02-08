import { BaseModel } from '@core/database/models/base.model';

export class TenantModel extends BaseModel {
  static tableName = 'tenants';
  id!: number;
  name!: string;
  domain!: string;
}
