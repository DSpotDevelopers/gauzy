import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from '@gauzy/core';
import { OrganizationGithubRepositoryIssue } from './github-repository-issue.entity';
import { TypeOrmOrganizationGithubRepositoryIssueRepository } from './repository';

@Injectable()
export class GithubRepositoryIssueService extends TenantAwareCrudService<OrganizationGithubRepositoryIssue> {
	constructor(
		@InjectRepository(OrganizationGithubRepositoryIssue)
		private readonly typeOrmOrganizationGithubRepositoryIssueRepository: TypeOrmOrganizationGithubRepositoryIssueRepository
	) {
		super(typeOrmOrganizationGithubRepositoryIssueRepository);
	}
}
