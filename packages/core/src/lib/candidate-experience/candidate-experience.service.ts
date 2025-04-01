import { IPagination } from '@gauzy/contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions } from 'typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { CandidateExperience } from './candidate-experience.entity';
import { TypeOrmCandidateExperienceRepository } from './repository';

@Injectable()
export class CandidateExperienceService extends TenantAwareCrudService<CandidateExperience> {
	constructor(
		@InjectRepository(CandidateExperience)
		private readonly typeOrmCandidateExperienceRepository: TypeOrmCandidateExperienceRepository
	) {
		super(typeOrmCandidateExperienceRepository);
	}

	/**
	 *
	 * @param filter
	 * @returns
	 */
	public async findAll(filter?: FindManyOptions<CandidateExperience>): Promise<IPagination<CandidateExperience>> {
		return await super.findAll({
			select: {
				organization: {
					id: true,
					name: true,
					officialName: true
				}
			},
			...filter
		});
	}
}
