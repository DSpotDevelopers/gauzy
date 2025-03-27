import { ApiProperty } from '@nestjs/swagger';
import { DeepPartial, JoinTable } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { IEmployeeUpworkJobsSearchCriterion, IJobPresetUpworkJobSearchCriterion, IJobPreset } from '@gauzy/contracts';
import {
	Employee,
	TenantOrganizationBaseEntity,
	ColumnIndex,
	MultiORMColumn,
	MultiORMEntity,
	MultiORMManyToMany,
	MultiORMOneToMany
} from '@gauzy/core';
import { EmployeeUpworkJobsSearchCriterion } from './employee-upwork-jobs-search-criterion.entity';
import { JobPresetUpworkJobSearchCriterion } from './job-preset-upwork-job-search-criterion.entity';

@MultiORMEntity('job_preset')
export class JobPreset extends TenantOrganizationBaseEntity implements IJobPreset {
	constructor(input?: DeepPartial<JobPreset>) {
		super(input);
	}

	@ApiProperty({ type: () => String })
	@IsString()
	@IsNotEmpty()
	@ColumnIndex()
	@MultiORMColumn()
	name?: string;

	/*
	|--------------------------------------------------------------------------
	| @OneToMany
	|--------------------------------------------------------------------------
	*/
	/**
	 * Employee Job Criterions
	 */
	@MultiORMOneToMany(() => EmployeeUpworkJobsSearchCriterion, (it) => it.jobPreset, {
		onDelete: 'CASCADE'
	})
	employeeCriterions?: IEmployeeUpworkJobsSearchCriterion[];

	/**
	 * Job Criterions
	 */
	@MultiORMOneToMany(() => JobPresetUpworkJobSearchCriterion, (it) => it.jobPreset, {
		onDelete: 'CASCADE'
	})
	jobPresetCriterions?: IJobPresetUpworkJobSearchCriterion[];

	/*
	|--------------------------------------------------------------------------
	| @ManyToMany
	|--------------------------------------------------------------------------
	*/

	/**
	 * Job Preset Employees
	 */
	@MultiORMManyToMany(() => Employee, {
		cascade: true,
		/** This column is a boolean flag indicating whether the current entity is the 'owning' side of a relationship.  */
	})
	@JoinTable({ name: 'employee_job_preset' })
	employees?: Employee[];
}
