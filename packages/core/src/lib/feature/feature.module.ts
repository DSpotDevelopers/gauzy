import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './feature.entity';
import { FeatureOrganization } from './feature-organization.entity';
import { FeatureToggleController } from './feature-toggle.controller';
import { FeatureService } from './feature.service';
import { FeatureOrganizationService } from './feature-organization.service';
import { RolePermissionModule } from '../role-permission/role-permission.module';
import { CommandHandlers } from './commands/handlers';
import { TypeOrmFeatureOrganizationRepository, TypeOrmFeatureRepository } from './repository';

@Module({
	imports: [
		RouterModule.register([{ path: '/feature/toggle', module: FeatureModule }]),
		TypeOrmModule.forFeature([Feature, FeatureOrganization]),
		forwardRef(() => RolePermissionModule),
		CqrsModule
	],
	controllers: [FeatureToggleController],
	providers: [FeatureService, FeatureOrganizationService, TypeOrmFeatureRepository, TypeOrmFeatureOrganizationRepository, ...CommandHandlers],
	exports: [TypeOrmModule, FeatureService, FeatureOrganizationService]
})
export class FeatureModule { }
