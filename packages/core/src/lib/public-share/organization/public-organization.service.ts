import { IOrganization, IOrganizationContact, IPagination } from '@gauzy/contracts';
import { Injectable, NotFoundException, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere } from 'typeorm';
import { Organization, OrganizationContact, OrganizationProject } from './../../core/entities/internal';
import { TypeOrmOrganizationRepository } from '../../organization/repository';
import { TypeOrmOrganizationContactRepository } from '../../organization-contact/repository';
import { TypeOrmOrganizationProjectRepository } from '../../organization-project/repository';
import { Logger } from '../../logger';

@Injectable()
export class PublicOrganizationService {
	@Logger()
	private readonly logger: NestLogger;

	constructor(
		@InjectRepository(Organization)
		private readonly typeOrmOrganizationRepository: TypeOrmOrganizationRepository,

		@InjectRepository(OrganizationContact)
		private readonly typeOrmOrganizationContactRepository: TypeOrmOrganizationContactRepository,

		@InjectRepository(OrganizationProject)
		private readonly typeOrmOrganizationProjectRepository: TypeOrmOrganizationProjectRepository
	) {}

	/**
	 * GET organization by profile link
	 *
	 * @param options
	 * @param relations
	 * @returns
	 */
	async findOneByProfileLink(where: FindOptionsWhere<Organization>, relations: string[]): Promise<IOrganization> {
		try {
			return await this.typeOrmOrganizationRepository.findOneOrFail({
				where,
				relations
			});
		} catch (error) {
			this.logger.error(`Error while finding organization by profile link: ${error}`);
			throw new NotFoundException(`The requested record was not found`);
		}
	}

	/**
	 * GET all public clients by organization condition
	 *
	 * @param options
	 * @returns
	 */
	async findPublicClientsByOrganization(
		options: FindOptionsWhere<OrganizationContact>
	): Promise<IPagination<IOrganizationContact>> {
		try {
			const [items = [], total = 0] = await this.typeOrmOrganizationContactRepository.findAndCountBy(options);
			return { items, total };
		} catch (error) {
			this.logger.error(`Error while finding public clients by organization: ${error}`);
			throw new NotFoundException(`The requested public clients was not found`);
		}
	}

	/**
	 * GET all public client counts by organization condition
	 *
	 * @param options
	 * @returns
	 */
	async findPublicClientCountsByOrganization(options: FindOptionsWhere<OrganizationContact>): Promise<number> {
		try {
			return await this.typeOrmOrganizationContactRepository.countBy(options);
		} catch (error) {
			this.logger.error(`Error while finding public client counts by organization: ${error}`);
			throw new NotFoundException(`The requested client counts was not found`);
		}
	}

	/**
	 * GET all public project counts by organization condition
	 *
	 * @param options
	 * @returns
	 */
	async findPublicProjectCountsByOrganization(options: FindOptionsWhere<OrganizationProject>): Promise<number> {
		try {
			return await this.typeOrmOrganizationProjectRepository.countBy(options);
		} catch (error) {
			this.logger.error(`Error while finding public project counts by organization: ${error}`);
			throw new NotFoundException(`The requested project counts was not found`);
		}
	}
}
