import { HttpException, HttpStatus, Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandBus } from '@nestjs/cqrs';
import { IIntegrationMapSyncRepository, IOrganizationGithubRepository } from '@gauzy/contracts';
import { TenantAwareCrudService, Logger } from '@gauzy/core';
import { OrganizationGithubRepository } from './github-repository.entity';
import { IntegrationSyncGithubRepositoryCommand } from '../commands/integration-sync-github-repository.command';
import { TypeOrmOrganizationGithubRepositoryRepository } from './repository';

@Injectable()
export class GithubRepositoryService extends TenantAwareCrudService<OrganizationGithubRepository> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(OrganizationGithubRepository)
		private readonly typeOrmOrganizationGithubRepositoryRepository: TypeOrmOrganizationGithubRepositoryRepository,

		private readonly _commandBus: CommandBus
	) {
		super(typeOrmOrganizationGithubRepositoryRepository);
	}

	/**
	 * Synchronize a GitHub repository with an integration.
	 *
	 * @param input - The input data for synchronization.
	 * @returns An object indicating success or failure of the synchronization.
	 */
	async syncGithubRepository(input: IIntegrationMapSyncRepository): Promise<IOrganizationGithubRepository> {
		try {
			return await this._commandBus.execute(new IntegrationSyncGithubRepositoryCommand(input));
		} catch (error) {
			// Handle errors and return an appropriate error response
			this.logger.error(`Error while sync github integration repository: ${error}`);
			throw new HttpException(`Failed to sync GitHub repository: ${error.message}`, HttpStatus.BAD_REQUEST);
		}
	}
}
