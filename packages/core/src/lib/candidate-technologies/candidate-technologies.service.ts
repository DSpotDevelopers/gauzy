import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICandidateTechnologies, ICandidateTechnologiesCreateInput } from '@gauzy/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { CandidateTechnologies } from './candidate-technologies.entity';
import { TypeOrmCandidateTechnologiesRepository } from './repository';

@Injectable()
export class CandidateTechnologiesService extends TenantAwareCrudService<CandidateTechnologies> {
	constructor(
		@InjectRepository(CandidateTechnologies)
		private readonly typeOrmCandidateTechnologiesRepository: TypeOrmCandidateTechnologiesRepository
	) {
		super(typeOrmCandidateTechnologiesRepository);
	}

	/**
	 *
	 * @param createInput
	 * @returns
	 */
	async createBulk(createInput: ICandidateTechnologiesCreateInput[]) {
		return await this.typeOrmRepository.save(createInput);
	}

	/**
	 *
	 * @param interviewId
	 * @returns
	 */
	async getTechnologiesByInterviewId(interviewId: string): Promise<ICandidateTechnologies[]> {
		return await this.typeOrmRepository
			.createQueryBuilder('candidate_technology')
			.where('candidate_technology.interviewId = :interviewId', {
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
