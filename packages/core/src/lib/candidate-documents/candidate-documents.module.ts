import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { CandidateDocumentsController } from './candidate-documents.controller';
import { CandidateDocument } from './candidate-documents.entity';
import { CandidateDocumentsService } from './candidate-documents.service';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
	imports: [
		RouterModule.register([{ path: '/candidate-documents', module: CandidateDocumentsModule }]),
		TypeOrmModule.forFeature([CandidateDocument]),
		RolePermissionModule
	],
	providers: [CandidateDocumentsService],
	controllers: [CandidateDocumentsController],
	exports: [CandidateDocumentsService]
})
export class CandidateDocumentsModule { }
