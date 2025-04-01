import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICandidatePersonalQualities, ICandidatePersonalQualitiesCreateInput } from '@gauzy/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmCandidatePersonalQualitiesRepository } from './repository';
import { CandidatePersonalQualities } from './candidate-personal-qualities.entity';

@Injectable()
export class CandidatePersonalQualitiesService extends TenantAwareCrudService<CandidatePersonalQualities> {
	constructor(
		@InjectRepository(CandidatePersonalQualities)
		private readonly typeOrmCandidatePersonalQualitiesRepository: TypeOrmCandidatePersonalQualitiesRepository
	) {
		super(typeOrmCandidatePersonalQualitiesRepository);
	}

	/**
	 *
	 * @param createInput
	 * @returns
	 */
	async createBulk(createInput: ICandidatePersonalQualitiesCreateInput[]) {
		return await this.typeOrmRepository.save(createInput);
	}

	/**
	 *
	 * @param interviewId
	 * @returns
	 */
	async getPersonalQualitiesByInterviewId(interviewId: string): Promise<ICandidatePersonalQualities[]> {
		return await this.typeOrmRepository
			.createQueryBuilder('candidate_personal_quality')
			.where('candidate_personal_quality.interviewId = :interviewId', {
				interviewId
			})
			.getMany();
	}

	/**
	 *
	 * @param ids
	 * @returns
	 */
	async deleteBulk(ids: string[]) {
		return await this.typeOrmRepository.delete(ids);
	}
}
