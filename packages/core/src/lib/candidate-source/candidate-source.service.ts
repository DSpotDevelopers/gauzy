import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICandidateSource } from '@gauzy/contracts';
import { TenantAwareCrudService } from './../core/crud';
import { TypeOrmCandidateSourceRepository } from './repository';
import { CandidateSource } from './candidate-source.entity';

@Injectable()
export class CandidateSourceService extends TenantAwareCrudService<CandidateSource> {
	constructor(
		@InjectRepository(CandidateSource)
		private readonly typeOrmCandidateSourceRepository: TypeOrmCandidateSourceRepository
	) {
		super(typeOrmCandidateSourceRepository);
	}

	/**
	 *
	 * @param sources
	 * @returns
	 */
	async createBulk(sources: ICandidateSource[]): Promise<ICandidateSource[]> {
		const candidateSources: ICandidateSource[] = [];
		if (sources) {
			for await (const source of sources) {
				candidateSources.push(await this.create(source));
			}
		}
		return candidateSources;
	}
}
