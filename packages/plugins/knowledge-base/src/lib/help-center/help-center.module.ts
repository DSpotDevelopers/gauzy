import { forwardRef, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolePermissionModule } from '@gauzy/core';
import { HelpCenterController } from './help-center.controller';
import { HelpCenter } from './help-center.entity';
import { HelpCenterService } from './help-center.service';
import { CommandHandlers } from './commands/handlers';
import { TypeOrmHelpCenterRepository } from './repository';

@Module({
	imports: [
		RouterModule.register([{ path: '/help-center', module: HelpCenterModule }]),
		forwardRef(() => TypeOrmModule.forFeature([HelpCenter])),
		RolePermissionModule,
		CqrsModule
	],
	controllers: [HelpCenterController],
	providers: [HelpCenterService, TypeOrmHelpCenterRepository, ...CommandHandlers],
	exports: [HelpCenterService, TypeOrmHelpCenterRepository]
})
export class HelpCenterModule { }
