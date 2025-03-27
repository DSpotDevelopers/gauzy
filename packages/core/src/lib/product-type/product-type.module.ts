import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ProductType } from './product-type.entity';
import { ProductTypeController } from './product-type.controller';
import { ProductTypeService } from './product-type.service';
import { ProductTypeTranslation } from './product-type-translation.entity';
import { RolePermissionModule } from '../role-permission/role-permission.module';
import { CommandHandlers } from './commands/handlers';

@Module({
	imports: [
		RouterModule.register([{ path: '/product-types', module: ProductTypeModule }]),
		TypeOrmModule.forFeature([ProductType, ProductTypeTranslation]),
		RolePermissionModule,
		CqrsModule
	],
	controllers: [ProductTypeController],
	providers: [ProductTypeService, ...CommandHandlers],
	exports: [TypeOrmModule, ProductTypeService]
})
export class ProductTypeModule { }
