import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { EmailHistory } from './email-history.entity';
import { EmailHistoryController } from './email-history.controller';
import { RolePermissionModule } from '../role-permission/role-permission.module';
import { EmailHistoryService } from './email-history.service';
import { CommandHandlers } from './commands/handler';
import { EmailSendModule } from './../email-send/email-send.module';
import { TypeOrmEmailHistoryRepository } from './repository';

@Module({
	imports: [
		RouterModule.register([{ path: '/email', module: EmailHistoryModule }]),
		TypeOrmModule.forFeature([EmailHistory]),
		forwardRef(() => RolePermissionModule),
		forwardRef(() => EmailSendModule),
		CqrsModule
	],
	controllers: [EmailHistoryController],
	providers: [EmailHistoryService, TypeOrmEmailHistoryRepository, ...CommandHandlers],
	exports: [TypeOrmModule, EmailHistoryService, TypeOrmEmailHistoryRepository]
})
export class EmailHistoryModule { }
