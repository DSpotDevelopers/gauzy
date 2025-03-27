import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { Equipment } from './equipment.entity';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
	imports: [
		RouterModule.register([{ path: '/equipment', module: EquipmentModule }]),
		TypeOrmModule.forFeature([Equipment]),
		RolePermissionModule
	],
	controllers: [EquipmentController],
	providers: [EquipmentService],
	exports: [EquipmentService]
})
export class EquipmentModule { }
