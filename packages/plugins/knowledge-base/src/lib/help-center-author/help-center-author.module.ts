import { CqrsModule } from '@nestjs/cqrs';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { RolePermissionModule } from '@gauzy/core';
import { HelpCenterAuthorService } from './help-center-author.service';
import { HelpCenterAuthorController } from './help-center-author.controller';
import { HelpCenterAuthor } from './help-center-author.entity';
import { CommandHandlers } from './commands/handlers';
import { TypeOrmHelpCenterAuthorRepository } from './repository';

@Module({
	imports: [
		RouterModule.register([{ path: '/help-center-author', module: HelpCenterAuthorModule }]),
		forwardRef(() => TypeOrmModule.forFeature([HelpCenterAuthor])),
		RolePermissionModule,
		CqrsModule
	],
	controllers: [HelpCenterAuthorController],
	providers: [HelpCenterAuthorService, TypeOrmHelpCenterAuthorRepository, ...CommandHandlers],
	exports: [HelpCenterAuthorService, TypeOrmHelpCenterAuthorRepository]
})
export class HelpCenterAuthorModule { }
