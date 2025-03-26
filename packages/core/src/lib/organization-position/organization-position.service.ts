import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { OrganizationPosition } from './organization-position.entity';
import { TypeOrmOrganizationPositionRepository } from './repository';

@Injectable()
export class OrganizationPositionService extends TenantAwareCrudService<OrganizationPosition> {
	constructor(
		@InjectRepository(OrganizationPosition)
		private readonly typeOrmOrganizationPositionRepository: TypeOrmOrganizationPositionRepository
	) {
		super(typeOrmOrganizationPositionRepository);
	}
}
