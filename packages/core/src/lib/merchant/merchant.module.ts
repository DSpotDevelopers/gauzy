import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './merchant.entity';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
	imports: [
		RouterModule.register([{ path: '/merchants', module: MerchantModule }]),
		TypeOrmModule.forFeature([Merchant]),
		RolePermissionModule
	],
	controllers: [MerchantController],
	providers: [MerchantService],
	exports: [MerchantService]
})
export class MerchantModule { }
