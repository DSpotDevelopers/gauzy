import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { RolePermissionModule, SeederModule } from '@gauzy/core';
import { Proposal } from './proposal.entity';
import { ProposalController } from './proposal.controller';
import { ProposalService } from './proposal.service';
import { CommandHandlers } from './commands/handlers';
import { ProposalSeederService } from './proposal-seeder.service';
import { TypeOrmProposalRepository } from './repository';

@Module({
	controllers: [ProposalController],
	imports: [
		TypeOrmModule.forFeature([Proposal]),
		RolePermissionModule,
		SeederModule,
		CqrsModule
	],
	providers: [ProposalService, ProposalSeederService, TypeOrmProposalRepository, ...CommandHandlers],
	exports: [ProposalSeederService]
})
export class ProposalModule { }
