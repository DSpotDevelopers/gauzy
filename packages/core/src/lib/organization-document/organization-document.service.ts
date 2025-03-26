import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from '../core/crud';
import { TypeOrmOrganizationDocumentRepository } from './repository';
import { OrganizationDocument } from './organization-document.entity';

@Injectable()
export class OrganizationDocumentService extends TenantAwareCrudService<OrganizationDocument> {
	constructor(
		@InjectRepository(OrganizationDocument)
		private readonly typeOrmOrganizationDocumentRepository: TypeOrmOrganizationDocumentRepository
	) {
		super(typeOrmOrganizationDocumentRepository);
	}
}
