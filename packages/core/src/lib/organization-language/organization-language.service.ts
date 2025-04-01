import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { OrganizationLanguage } from './organization-language.entity';
import { TypeOrmOrganizationLanguageRepository } from './repository';

@Injectable()
export class OrganizationLanguageService extends TenantAwareCrudService<OrganizationLanguage> {
	constructor(
		@InjectRepository(OrganizationLanguage)
		private readonly typeOrmOrganizationLanguageRepository: TypeOrmOrganizationLanguageRepository
	) {
		super(typeOrmOrganizationLanguageRepository);
	}
}
