import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailSendModule } from './../../email-send/email-send.module';
import { RolePermissionModule } from '../../role-permission/role-permission.module';
import { EmployeeModule } from './../../employee/employee.module';
import { TimeSlotModule } from './../time-slot/time-slot.module';
import { CommandHandlers } from './commands/handlers';
import { TimeSheetController } from './timesheet.controller';
import { TimeSheetService } from './timesheet.service';
import { Timesheet } from './timesheet.entity';
import { TypeOrmTimesheetRepository } from './repository';

@Module({
	controllers: [TimeSheetController],
	imports: [
		TypeOrmModule.forFeature([Timesheet]),
		CqrsModule,
		EmailSendModule,
		RolePermissionModule,
		TimeSlotModule,
		EmployeeModule
	],
	providers: [TimeSheetService, TypeOrmTimesheetRepository, ...CommandHandlers],
	exports: [TypeOrmModule, TimeSheetService, TypeOrmTimesheetRepository]
})
export class TimesheetModule { }
