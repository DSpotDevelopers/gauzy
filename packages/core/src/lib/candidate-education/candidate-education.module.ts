import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { CandidateEducationService } from './candidate-education.service';
import { CandidateEducation } from './candidate-education.entity';
import { CandidateEducationController } from './candidate-education.controller';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
	imports: [
		RouterModule.register([{ path: '/candidate-educations', module: CandidateEducationModule }]),
		TypeOrmModule.forFeature([CandidateEducation]),
		RolePermissionModule
	],
	controllers: [CandidateEducationController],
	providers: [CandidateEducationService],
	exports: [TypeOrmModule, CandidateEducationService]
})
export class CandidateEducationModule { }
