import { Injectable } from '@nestjs/common';
import { TenantAwareCrudService } from './../core/crud';
import { OrganizationEmploymentType } from './organization-employment-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmOrganizationEmploymentTypeRepository } from './repository';

@Injectable()
export class OrganizationEmploymentTypeService extends TenantAwareCrudService<OrganizationEmploymentType> {
	constructor(
		@InjectRepository(OrganizationEmploymentType)
		private readonly typeOrmOrganizationEmploymentTypeRepository: TypeOrmOrganizationEmploymentTypeRepository
	) {
		super(typeOrmOrganizationEmploymentTypeRepository);
	}
}
