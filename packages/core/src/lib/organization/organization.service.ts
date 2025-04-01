import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { Organization } from './organization.entity';
import { TypeOrmOrganizationRepository } from './repository';
import { prepareSQLQuery as p } from './../database/database.helper';

@Injectable()
export class OrganizationService extends TenantAwareCrudService<Organization> {
	constructor(
		@InjectRepository(Organization)
		private readonly typeOrmOrganizationRepository: TypeOrmOrganizationRepository
	) {
		super(typeOrmOrganizationRepository);
	}

	async findByEmailDomain(emailDomain: string): Promise<Organization> {
		const query = this.typeOrmRepository.createQueryBuilder(this.tableName);
		query.setFindOptions({
			select: {
				id: true,
				tenantId: true
			}
		});
		query.where(p(`"${query.alias}"."emailDomain" = :emailDomain`), { emailDomain });
		return await query.getOne();
	}
}
