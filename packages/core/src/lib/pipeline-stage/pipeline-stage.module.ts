import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineStage } from './pipeline-stage.entity';
import { StageService } from './pipeline-stage.service';
import { TypeOrmPipelineStageRepository } from './repository';

@Module({
	imports: [TypeOrmModule.forFeature([PipelineStage])],
	providers: [StageService, TypeOrmPipelineStageRepository],
	exports: [TypeOrmModule, StageService, TypeOrmPipelineStageRepository]
})
export class StageModule { }
