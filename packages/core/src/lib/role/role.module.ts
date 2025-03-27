import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Role } from './role.entity';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { RolePermissionModule } from './../role-permission/role-permission.module';
import { CommandHandlers } from './commands/handlers';
import { TypeOrmRoleRepository } from './repository';

@Module({
	imports: [
		forwardRef(() => TypeOrmModule.forFeature([Role])),
		forwardRef(() => RolePermissionModule),
		CqrsModule
	],
	controllers: [RoleController],
	providers: [...CommandHandlers, RoleService, TypeOrmRoleRepository],
	exports: [TypeOrmModule, RoleService, TypeOrmRoleRepository]
})
export class RoleModule { }
