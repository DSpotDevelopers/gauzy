import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsBoolean, IsNumber } from 'class-validator';
import { JoinColumn, RelationId } from 'typeorm';
import { EmployeeAppointmentStatus, ID, IEmployee, IEmployeeAppointment } from '@gauzy/contracts';
import { AppointmentEmployee, Employee, TenantOrganizationBaseEntity } from '../core/entities/internal';
import { MultiORMColumn, MultiORMEntity, MultiORMManyToOne, MultiORMOneToMany } from './../core/decorators/entity';

@MultiORMEntity('employee_appointment')
export class EmployeeAppointment extends TenantOrganizationBaseEntity implements IEmployeeAppointment {
	@ApiProperty({ type: () => String })
	@IsString()
	@IsNotEmpty()
	@MultiORMColumn()
	agenda: string;

	@ApiProperty({ type: () => String })
	@IsString()
	@IsNotEmpty()
	@MultiORMColumn({ nullable: true })
	description?: string;

	@ApiProperty({ type: () => String })
	@IsString()
	@IsNotEmpty()
	@MultiORMColumn({ nullable: true })
	location?: string;

	@ApiProperty({ type: () => Date })
	@IsDate()
	@MultiORMColumn()
	startDateTime: Date;

	@ApiProperty({ type: () => Date })
	@IsDate()
	@MultiORMColumn()
	endDateTime: Date;

	@ApiProperty({ type: () => Boolean })
	@IsBoolean()
	@MultiORMColumn({ nullable: true })
	bufferTimeStart?: boolean;

	@ApiProperty({ type: () => Boolean })
	@IsBoolean()
	@MultiORMColumn({ nullable: true })
	bufferTimeEnd?: boolean;

	@ApiProperty({ type: () => Number })
	@IsNumber()
	@MultiORMColumn({ nullable: true })
	bufferTimeInMins?: number;

	@ApiProperty({ type: () => Number })
	@IsNumber()
	@MultiORMColumn({ nullable: true })
	breakTimeInMins?: number;

	@ApiProperty({ type: () => Date })
	@IsDate()
	@MultiORMColumn({ nullable: true })
	breakStartTime?: Date;

	@ApiProperty({ type: () => String })
	@IsString()
	@MultiORMColumn({ nullable: true })
	emails?: string;

	@ApiProperty({ type: () => String })
	@IsString()
	@MultiORMColumn({ nullable: true })
	status?: EmployeeAppointmentStatus;

	/*
	|--------------------------------------------------------------------------
	| @ManyToOne
	|--------------------------------------------------------------------------
	*/

	/**
	 * Appointment Employee
	 */
	@MultiORMManyToOne(() => Employee, {
		/** Indicates if relation column value can be nullable or not. */
		nullable: true,

		/** Database cascade action on delete. */
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	employee?: IEmployee;

	@ApiProperty({ type: () => String })
	@RelationId((it: EmployeeAppointment) => it.employee)
	@MultiORMColumn({ nullable: true, relationId: true })
	employeeId?: ID;

	/*
	|--------------------------------------------------------------------------
	| @OneToMany
	|--------------------------------------------------------------------------
	*/
	/**
	 *
	 */
	@MultiORMOneToMany(() => AppointmentEmployee, (entity) => entity.employeeAppointment, {
		onDelete: 'SET NULL'
	})
	@JoinColumn()
	invitees?: AppointmentEmployee[];
}
