import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { CacheModule } from '@nestjs/cache-manager';
import { RolePermissionController } from './role-permission.controller';
import { RolePermission } from './role-permission.entity';
import { RolePermissionService } from './role-permission.service';
import { RoleModule } from './../role/role.module';
import { TypeOrmRolePermissionRepository } from './repository';

@Module({
	imports: [
		TypeOrmModule.forFeature([RolePermission]),
		forwardRef(() => RoleModule),
		CqrsModule,
		CacheModule.register({ isGlobal: true })
	],
	controllers: [RolePermissionController],
	providers: [RolePermissionService, TypeOrmRolePermissionRepository],
	exports: [TypeOrmModule, CacheModule, RolePermissionService, TypeOrmRolePermissionRepository]
})
export class RolePermissionModule { }
