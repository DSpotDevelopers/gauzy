import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { OrganizationAward } from './organization-award.entity';
import { TypeOrmOrganizationAwardRepository } from './repository';

@Injectable()
export class OrganizationAwardService extends TenantAwareCrudService<OrganizationAward> {
	constructor(
		@InjectRepository(OrganizationAward)
		private readonly typeOrmOrganizationAwardRepository: TypeOrmOrganizationAwardRepository
	) {
		super(typeOrmOrganizationAwardRepository);
	}
}
