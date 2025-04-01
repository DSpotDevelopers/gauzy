import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from '../core/crud';
import { IntegrationMap } from './integration-map.entity';
import { TypeOrmIntegrationMapRepository } from './repository';

@Injectable()
export class IntegrationMapService extends TenantAwareCrudService<IntegrationMap> {
	constructor(
		@InjectRepository(IntegrationMap)
		private readonly typeOrmIntegrationMapRepository: TypeOrmIntegrationMapRepository
	) {
		super(typeOrmIntegrationMapRepository);
	}
}
