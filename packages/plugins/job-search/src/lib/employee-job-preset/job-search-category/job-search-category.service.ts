import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from '@gauzy/core';
import { JobSearchCategory } from './job-search-category.entity';
import { TypeOrmJobSearchCategoryRepository } from './repository';

@Injectable()
export class JobSearchCategoryService extends TenantAwareCrudService<JobSearchCategory> {
	constructor(
		@InjectRepository(JobSearchCategory)
		private readonly typeOrmJobSearchCategoryRepository: TypeOrmJobSearchCategoryRepository
	) {
		super(typeOrmJobSearchCategoryRepository);
	}
}
