import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from './../core/crud';
import { PipelineStage } from './pipeline-stage.entity';
import { TypeOrmPipelineStageRepository } from './repository';

@Injectable()
export class StageService extends TenantAwareCrudService<PipelineStage> {
	constructor(
		@InjectRepository(PipelineStage)
		private readonly typeOrmPipelineStageRepository: TypeOrmPipelineStageRepository
	) {
		super(typeOrmPipelineStageRepository);
	}
}
